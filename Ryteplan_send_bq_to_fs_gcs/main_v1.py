# rp_send_bq_to_fs_gcs_production_v2

import functions_framework
from google.cloud import bigquery
from google.cloud import storage
from google.cloud import firestore
import time
import math
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

# init Clients
bq_client = bigquery.Client()
fs_client = firestore.Client()
storage_client = storage.Client()

BACKUP_BUCKET_NAME = "institutions_processed_firestore_backups_bucket" # GCS bucket name where backup tables are stored

def to_camel_case(snake_str):
    snake_str = snake_str.strip().lower()
    components = snake_str.split('_')
    return components[0] + ''.join(word[0].upper() + word[1:].lower() for word in components[1:] if word)


# CloudEvent function to be triggered by an Eventarc Cloud Audit Logging trigger
# Note: this is NOT designed for second-party (Cloud Audit Logs -> Pub/Sub) triggers!
@functions_framework.cloud_event
def hello_firestore_event(cloudevent):
    """Triggered when a Firestore document is created or updated in processed_bq_datasets."""
    
    # Firestore resource path: 
    # projects/{project_id}/databases/(default)/documents/processed_bq_datasets/{document_id}
    resource_name = cloudevent.get("subject", "")
    print(f"Triggered by: {resource_name}")
    
    try:
        doc_id = resource_name.split("/")[-1]  # e.g., new_uploads_ug_uf_20250425
        dataset_date = doc_id.split("_")[-1]   # Extract 20250425
    except Exception as e:
        print(f"Could not parse dataset_date from resource: {resource_name} | Error: {e}")
        return
    
    flag_ref = fs_client.collection("processed_bq_datasets").document(doc_id)
    flag_doc = flag_ref.get()

    if flag_doc.exists:
        flag_data = flag_doc.to_dict()

        if flag_data.get("export_started", False) or flag_data.get("export_completed", False):
            print("Export already started or completed. Exiting.")
            return
    
    # Mark flag_ref as started
    flag_ref.update({
        "export_started": True,
        "export_timestamp": firestore.SERVER_TIMESTAMP,
        "export_completed": False
    })

    project_id = bq_client.project

    export_final_to_gcs(project_id, dataset_date, BACKUP_BUCKET_NAME)
    export_final_to_firestore(project_id, dataset_date)

    # Mark as completed
    flag_ref.update({
        "export_completed": True
    })
    return


def export_final_to_gcs(project_id, dataset_date, bucket_name):
    """Exports the final table to GCS."""

    table_id = f"{project_id}.institutions_petersons_processed.institutions_petersons_processed_{dataset_date}"
    destination_uri = f"gs://{bucket_name}/institutions_petersons_processed_{dataset_date}.csv"

    try:
        job_config = bigquery.ExtractJobConfig(
            destination_format="CSV",
            print_header=True,
        )

        extract_job = bq_client.extract_table(
            table_id,
            destination_uri,
            job_config=job_config,
        )
        extract_job.result()  # Wait for the job to complete
        print(f"Exported BigQuery table {table_id} to GCS Bucket: {destination_uri}.")

    except Exception as e:
        print(f"Error exporting table {table_id} to GCS: {e}")


def export_final_to_firestore(project_id: str, dataset_date: str, collection_override: str = None):

    print(f"Starting export of institutions_petersons_processed_{dataset_date} to Firestore...")
    # Define table and collection
    table_id = f"{project_id}.institutions_petersons_processed.institutions_petersons_processed_{dataset_date}"
    collection_name = collection_override or f"institutions_petersons_processed_{dataset_date}"
    
    # Fetch all rows
    try:
        query = f"SELECT * FROM `{table_id}`"
        rows = list(bq_client.query(query).result())

    except Exception as e:
        print(f"Error fetching data from BigQuery: {e}")
        return
    
    if not rows:
        print("No data to export. Exiting.")
        return

    # Convert to list of dicts
    data_list = [dict(row) for row in rows]

    # Deduplicate by INUN_ID and convert field names to camelCase
    seen_ids = set()
    filtered_data = []
    for row in data_list:
        inun_id = row.get("INUN_ID")
        if not inun_id:
            print("Skipping row without INUN_ID.")
            continue
        if inun_id in seen_ids:
            continue
        seen_ids.add(inun_id)

        camel_row = {to_camel_case(k): v for k, v in row.items()}
        filtered_data.append(camel_row)

    # Constants
    BATCH_SIZE = 400
    num_batches = math.ceil(len(filtered_data) / BATCH_SIZE)

    print(f"{len(filtered_data)} unique documents | {num_batches} batches of {BATCH_SIZE}")

    def retry_with_backoff(func, max_retries=3, initial_delay=1):
        for attempt in range(max_retries):
            try:
                return func()
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                delay = initial_delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"Retrying in {delay:.2f} seconds...")
                time.sleep(delay)

    def process_batch(batch_data, batch_num, total_batches):
        def commit_batch():
            batch = fs_client.batch()
            for row in batch_data:
                doc_id = str(row["inunId"])
                doc_ref = fs_client.collection(collection_name).document(doc_id)
                batch.set(doc_ref, row)
            batch.commit()

        try:
            retry_with_backoff(commit_batch)
            print(f"Batch {batch_num}/{total_batches} committed ({len(batch_data)} docs)")
        except Exception as e:
            print(f"Error in batch {batch_num}: {e}. Falling back to single writes.")
            for row in batch_data:
                try:
                    doc_id = str(row["inunId"])
                    fs_client.collection(collection_name).document(doc_id).set(row)
                except Exception as doc_err:
                    print(f"Failed to write doc {doc_id}: {doc_err}")

    # Threaded batch commits
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = []
        for i in range(num_batches):
            chunk = filtered_data[i * BATCH_SIZE : (i + 1) * BATCH_SIZE]
            futures.append(executor.submit(process_batch, chunk, i + 1, num_batches))

        for future in as_completed(futures):
            future.result()

    print(f"Export complete. Data written to Firestore collection: {collection_name}")
    return
 