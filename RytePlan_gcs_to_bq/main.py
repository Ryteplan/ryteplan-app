# gcs_to_bq_production

import functions_framework
import re
from google.cloud import storage
from google.cloud import bigquery
import pandas as pd
import pandas_gbq
from datetime import datetime
from firebase_admin import firestore # Firebase Admin SDK to access Cloud Firestore.

# Google Cloud setup
bq_client = bigquery.Client()
PROJECT_ID = bq_client.project
GCS_BUCKET_NAME = "new_data_delivery_bucket"

# Firestore setup for processed folder tracking
db = firestore.Client()
PROCESSED_COLLECTION = "firestore_collection_used_to_track_processed_folders"

# Regex pattern to match "new_uploads_ug_uf_YYYYMMDD"
FOLDER_NAME_PATTERN = r"^new_uploads_ug_uf_\d{8}$"

def is_folder_processed(folder_name):
    """Check if the folder is already processed in Firestore."""
    doc_ref = db.collection(PROCESSED_COLLECTION).document(folder_name)
    doc = doc_ref.get()
    return doc.exists

def mark_folder_as_processed(folder_name):
    """Mark folder as processed in Firestore."""
    doc_ref = db.collection(PROCESSED_COLLECTION).document(folder_name)
    doc_ref.set({"processed": True, "timestamp": datetime.utcnow()})
    print(f"Marked {folder_name} as processed in Firestore.")

def get_latest_folder(bucket_name):
    """Fetch the most recent folder from the GCS bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    folders = [blob.name.split('/')[0] for blob in bucket.list_blobs() if '/' in blob.name]
    valid_folders = [f for f in folders if re.match(FOLDER_NAME_PATTERN, f)]

    if not valid_folders:
        print("No valid folders found in bucket.")
        return None

    latest_folder = max(valid_folders, key=lambda x: int(x.split('_')[-1]))
    print(f"Latest folder detected: {latest_folder}")
    return latest_folder

@functions_framework.cloud_event
def hello_gcs(cloud_event):
    """Cloud Function entry point - Triggered when a new file is uploaded to GCS."""
    event_data = cloud_event.data
    bucket_name = event_data["bucket"]
    file_path = event_data["name"]

    # Ignore metadata update triggers
    if event_data.get("metageneration") and int(event_data["metageneration"]) > 1:
        print(f"Skipping metadata update event for: {file_path}")
        return

    folder_name = file_path.split("/")[0]

    # Check if folder was already processed
    if is_folder_processed(folder_name):
        print(f"Skipping already processed folder: {folder_name}")
        return

    latest_folder = get_latest_folder(bucket_name)

    if folder_name != latest_folder:
        print(f"Skipping old folder: {folder_name}. Only processing latest: {latest_folder}")
        return

    print(f"Detected valid folder in GCS: {folder_name}")
    process_folder(bucket_name, folder_name)

def get_dataset_name_from_folder(folder_name):
    """Generate a dataset name based on the detected folder name."""
    return folder_name.lower().replace("-", "_").replace(" ", "_")

def table_exists(dataset_id, table_id):
    """Check if a BigQuery table already exists before processing."""
    try:
        query = f"""
            SELECT table_name 
            FROM `{PROJECT_ID}.{dataset_id}.INFORMATION_SCHEMA.TABLES` 
            WHERE table_name = '{table_id}'
        """
        existing_tables = pandas_gbq.read_gbq(query)
        exists = not existing_tables.empty
        print(f"Table check: {dataset_id}.{table_id} {'exists' if exists else 'does NOT exist'}")
        return exists
    except Exception as e:
        print(f"Error checking table existence: {e}")
        return False

def list_all_csv_files(bucket_name, folder_name):
    """Retrieve all CSV file paths from UG and UF subdirectories in a GCS bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blobs = list(bucket.list_blobs(prefix=f"{folder_name}/"))
    csv_files = [blob.name for blob in blobs if blob.name.endswith(".csv")]
    print(f"Found {len(csv_files)} CSV files for processing in {folder_name}.")
    return csv_files

def infer_bq_schema(df):
    """Infer BigQuery schema explicitly from DataFrame dtypes to prevent INTs from being cast as FLOAT."""
    schema = []
    for col, dtype in df.dtypes.items():
        if dtype == 'int64' or dtype == 'Int64':
            schema.append({"name": col, "type": "INTEGER"})
        elif dtype == 'float64':
            schema.append({"name": col, "type": "FLOAT"})
        elif dtype == 'bool':
            schema.append({"name": col, "type": "BOOLEAN"})
        elif dtype == 'datetime64[ns]':
            schema.append({"name": col, "type": "TIMESTAMP"})
        else:
            schema.append({"name": col, "type": "STRING"})
    return schema

####################################################################################################

def process_folder(bucket_name, folder_name):
    """Processes CSV files and loads them into BigQuery, ensuring correct schema and replacing nulls."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        dataset_id = get_dataset_name_from_folder(folder_name)
        create_bq_dataset_if_not_exists(dataset_id, location="us-central1")
        csv_files = list_all_csv_files(bucket_name, folder_name)

        all_exist = all(table_exists(dataset_id, file_path.split("/")[-1].replace(".csv", "").lower()) for file_path in csv_files)

        if all_exist:
            print(f"All tables in {dataset_id} already exist. Exiting process.")
            mark_folder_as_processed(folder_name)
            return

        for file_path in csv_files:
            table_id = file_path.split("/")[-1].replace(".csv", "").lower()
            if table_exists(dataset_id, table_id):
                print(f"Skipping existing table: {table_id}")
                continue

            print(f"Processing new file: {file_path}")
            blob = bucket.blob(file_path)
            csv_data = blob.download_as_bytes().decode("utf-8")

            try:
                # Let Pandas infer types automatically
                df = pd.read_csv(pd.io.common.StringIO(csv_data))

                # Ensure object columns are correctly inferred
                df = df.infer_objects()

                # Ensure columns that appear as float but contain only whole numbers are cast as Int64
                for col in df.columns:
                    if df[col].dtype in ['float64', 'Float64'] and df[col].dropna().apply(float.is_integer).all():
                        df[col] = df[col].astype('Int64')  # Convert float columns with whole numbers to Int64

                # # Ensure only numeric columns get fillna(0), avoid affecting strings
                # for col in df.select_dtypes(include=['Int64', 'float64']):
                #     df[col].fillna(0, inplace=True)

                # # Ensure only string columns get fillna("-"), avoid affecting numbers
                # for col in df.select_dtypes(include=['object']):
                #     df[col].fillna("-", inplace=True)


                schema = infer_bq_schema(df)  # Explicit schema to prevent miscasting
                print(f"Schema inferred for {table_id}: {schema}")

                pandas_gbq.to_gbq(df, f"{dataset_id}.{table_id}", PROJECT_ID, if_exists="replace", table_schema=schema)
                print(f"Uploaded {len(df)} rows into {dataset_id}.{table_id}")

            except Exception as e:
                print(f"Failed to upload {file_path} to BigQuery: {e}")

    except Exception as e:
        print(f"Error processing folder {folder_name}: {e}")


def create_bq_dataset_if_not_exists(dataset_id, location="us-central1"):
    client = bigquery.Client(project=PROJECT_ID)

    full_dataset_id = f"{PROJECT_ID}.{dataset_id}"
    try:
        client.get_dataset(full_dataset_id)
        print(f"Dataset {full_dataset_id} already exists.")
    except Exception:
        dataset = bigquery.Dataset(full_dataset_id)
        dataset.location = location
        dataset = client.create_dataset(dataset)
        print(f"Created new dataset {full_dataset_id} in location {location}")