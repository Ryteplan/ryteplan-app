# PROJECT RYTEPLAN: PETERSONS RAW DATABASE GOOGLE CLOUD PIPELINE

## CLOUD FUNCTION: GCS_TO_BQ
  - This is the first function in the pipeline. 
  - Detects the instance of a new folder named 'new_uploads_ug_uf_YYYYMMDD' in a defined storage bucket. Only csv files in this folder are uploaded into BigQuery with dataset name to match the folder name.

## TRIGGER: gcs-to-bq-trigger-v1
  - Event Provider: Cloud Storage
  - Event Type: google.cloud.storage.object.v1.finalized
  - Receive Events From: 'designated storage bucket'
  - Service Account: Default Compute Service Account


## RESPONSIBILITIES
  - To avoid re-uploading old data deliveries, the function only processes the folder with the most recent YYYYMMDD tag. (to update old deliveries and push them to Firestore, refer to the 'send-bq-to-fs-gcs' README file.)
  - Designates a us-central1(Iowa) data region for the new database
  - Uploads each csv file as its own table in BigQuery.
  - Infers schema types for each table.

## CONFIGURATION
  - Environment Variables/Constants
    - PROJECT_ID: Derived and authenticated using the service account tied to the event trigger and imported google storage methods.
    - FOLDER_NAME_PATTERN: Regex pattern used to detect valid folders in the designated storage bucket.
    - GCS_BUCKET_NAME(placeholder displayed in code): The bucket used to store raw data deliveries.
    - PROCESSED_COLLECTION(placeholder displayed in code): The firestore collection used to track data deliveries that have been successfully uploaded into BigQuery.

  - requirements.txt
    - Necessary for importing libraries into your cloud function source code.

  - *CONFIG NOTES*
    - *EACH CLOUD FUNCTION HAS ITS OWN SOURCE CODE PAGE IN THE GOOGLE CLOU RUN UI. 'MAIN.PY' IS USED HERE INSTEAD OF 'FUNCTION_NAME.PY'*

## KNOWN ISSUES / CAVEATS:
  - Requires files to be in 'UG Files' and 'UF Files' folders.
  - Will not run if FOLDER_NAME_PATTERN is mismatched.

## RELATED FUNCTIONS:
  - bq-query-process
  - send-bq-to-fs-gcs
  - add-to-merge-candidates

## VERSION NOTES:
  - main.py "Initial version used in Beta"
