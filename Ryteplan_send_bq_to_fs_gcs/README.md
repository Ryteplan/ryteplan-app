# PROJECT RYTEPLAN: PETERSONS RAW DATABASE GOOGLE CLOUD PIPELINE

## CLOUD FUNCTION: SEND-BQ-TO-FS-GCS
  - This is the third function in the pipeline. 
  - Detects the instance of a new Firestore document named 'new_uploads_ug_uf_YYYYMMDD' in 'processed_bq_datasets'.
  - Transfers the BigQuery table 'institutions_petersons_processed_YYYYMDD' with matching date to a Google Cloud storage bucket and to Firestore as a collection.

## TRIGGER: bq-export-trigger-v1
  - Event Provider: Cloud Firestore
  - Event Type: google.cloud.firestore.document.v1.created
  - Receive Events From: nam5 (us-central regions)
  - Service Account: Default Compute Service Account

## RESPONSIBILITIES
  - Creates a backup file of the table being processed.
  - Writes data to Firestore in batches of 400 documents to avoid exceeding the batch write limit.
  - Uses a thread pool executor to write these batches concurrently for speed.
  - Creates fields within the 'new_uploads_ug_uf_YYYYMMDD' in the 'processed_bq_datasets' collection to log export status.

## WHEN MAKING UPDATES TO AN EXISTING DATASET (EX: ADDING COLUMNS)
  - *REFER TO THE README_DATA_PIPELINE_INSTRUCTIONS FILE IN THE CLOUD-FUNCTIONS-V1 BRANCH OF THE REPO.*

## CONFIGURATION
  - Environment Variables/Constants
    - project_id: Derived and authenticated using the service account tied to the event trigger and imported google storage methods.
    - BACKUP_BUCKET_NAME(placeholder used in code): The desired cloud storage bucket for backups.

  - requirements.txt
    - Necessary for importing libraries into your cloud function source code.

  - *CONFIG NOTES*
    - *EACH CLOUD FUNCTION HAS ITS OWN SOURCE CODE PAGE IN THE GOOGLE CLOU RUN UI. USE 'MAIN.PY' WHEN DEPLOYING INSTEAD OF 'FUNCTION_NAME.PY' OR 'MAIN_V1.PY*

## KNOWN ISSUES / CAVEATS:
  - A batch write may time out or need more memory in the function container depending on the size. The cloud function will retry batch writes or revert to single writes automatically.

## RELATED FUNCTIONS:
  - gcs-to-bq
  - bq-query-process
  - add-to-merge-candidates

## VERSION NOTES:
  - main_v1.py "Initial version used in Beta"