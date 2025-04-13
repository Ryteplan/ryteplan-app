# PROJECT RYTEPLAN: PETERSONS RAW DATABASE GOOGLE CLOUD PIPELINE

## CLOUD FUNCTION: ADD-TO-MERGE-CANDIDATES
  - This is the fourth and last function in the pipeline.
  - The function was deployed using the Firebase CLI in order to use Google Cloud Gen2 functionality. The function can be re-deployed using Firebase or gcloud CLI. main.py is located inside the functions directory and must stay named as main.py. Create new versions outside of the functions folder, then replace main.py with desired version.
  - Detects the instance of a new Firestore collection named 'institutions_petersons_processed_YYYYMMDD'.
  - Adds a reference of this collection as a document to the collection 'merge_candidates'.
  - This provides an iterable of collections for the frontend codebase.

## TRIGGER: add-to-merge-candidates-398817
  - Event Provider: Cloud Firestore
  - Event Type: google.cloud.firestore.document.v1.created
  - Receive Events From: nam5 (us-central regions)
  - Service Account: Default Compute Service Account

## RESPONSIBILITIES
  - Generate a Firestore style document ID like "4u2lmk0jz3fc6zbrluxc".
  - Store the document ID in the merge_candidates collection.
  - Give the document a createdAt field with timestamp value.
  - Give the document a mergeCandidateId field with the name of the collection we are referencing 'institutions_petersons_processed_YYYYMMDD'.

## CONFIGURATION
  - Environment Variables/Constants
    - COOLDOWN_PERIOD: designated time frame to skip processing and avoid unnecessary writes/logs per document being uploaded by the 'send-bq-to-fs-gcs' function.

  - Install Firebase CLI or use gcloud CLI in the browser.
  - Firebase CLI Deployment
    - ~bash~
        - *firebase login* "Will prompt a Google sign-in page on your web browser."
        - *firebase use --add* "This will let you choose the project_id you want to deploy to."
        - *firebase deploy -only functions* "This is why the deployment code must stay as main.py in the functions directory."

## KNOWN ISSUES / CAVEATS:
  - Firestore triggers cannot communicate the instance of just a new collection. The function is triggered by the creation of a document with file path "institutions_petersons_processed_*/{pushId}". This means the function will execute for each new document written to our new institutions_petersons_processed collection(4k+ documents).
    - To prevent this, COOLDOWN_PERIOD is used to skip processing and avoid writing multiple merge_candidate documents. This ensures only one merge_candidate document is created.

## RELATED FUNCTIONS:
  - gcs-to-bq
  - bq-query-process
  - send-bq-to-fs-gcs

## VERSION NOTES:
  - main_v1.py "Initial version used in Beta"