# **PROJECT RYTEPLAN: PETERSONS RAW DATABASE GOOGLE CLOUD PIPELINE**

## **General Overview**

 - This data pipeline establishes an automated transformation process of raw data deliveries into a final data table. The final table is what the website uses for its main functionality.
 - The main components used are Google Cloud Functions, BigQuery, Firestore, Google Cloud Storage
 - The code base is hosted in four different Google Cloud Functions.
 - There are README, main, and requirements files for each function.

# **Instructions to Handle Data**

## **Upload New Petersons Deliveries to Firestore Database**

1. Download new delivery as a local folder.

2. There are duplicate reference tables shared between UG and UF folders. The UG files are more reliably up-to-date.
    - *UX_INST* 
    - *CEN_STATE_TYPES*
    - *CEN_MET_AREA_TYPES*
    - *CEN_DONMINATION_TYPES*
    - *CEN_CURRENCY_TYPES*
    - *CEN_COUNTRY_TYPES*
    - *CEN_AFFILIATION_TYPES*

3. Move duplicate reference tables from the UF folder to another folder 'petersons_discarded_YYYYMMDD'.

4. Rename UG folder to 'UG Files'.

5. Rename UF folder to 'UF Files'.

6. Rename the whole delivery folder to 'new_uploads_ug_uf_YYYYMMDD'.

7. Upload this folder to the 'raw_uploads_to_bq_bucket' in Google Cloud Console to initiate the cloud function pipeline.
    - *IN THE 'bq_query_process' CLOUD FUNCTION, the queries dynamically name the database and names for output tables based on delivery date. The BigQuery database name will be identical to the folder upload, 'new_uploads_ug_uf_YYYYMMDD'*

8. Refer to the Cloud Function README files and data pipeline flow chart.
    - *GCS_TO_BQ*
    - *BQ_QUERY_PROCESS*
    - *SEND_BQ_TO_FS_GCS* 
    - *ADD_TO_MERGE_CANDIDATES*


## **Make Edits to An Existing Delivery**

1. Edit and test queries on desired database 'new_uploads_ug_uf_YYYYMMDD' in BigQuery studio (via Google Cloud Console).
    - *IN BIGQUERY, the saved queries CREATE OR REPLACE test tables (admissions_test, enrollment_test, institutions_petersons_processed_test, etc...)*
    - *The 'RP_FINAL' query uses the TEST tables to query on.*

2. Re-route the 'RP_Final' query to create a new table like 'institutions_petersons_processed_YYYYMMDDV2' in the 'institutions_petersons_processed' database.

3. We will bypass the first half of the pipeline so we do not re-process old deliveries into BigQuery.

4. Go to the 'processed_bq_datasets' collection in the college-counselor Firestore database.
    - *Create a document with name like 'new_uploads_ug_uf_YYYYMMDDV2'.*
    - *Add a field 'Processed' with a boolean value as 'True'.*
    - *Add another field 'Timestamp' with a timestamp value as the current date and time.*
    - *Add another field 'DESC' as a string value describing the changes you made to the queries in order to output this version of the database.*
    - *Finalize document creation to trigger the transfer of 'institutions_petersons_processed_YYYYMMDDV2' to Firestore as a collection.*

5. Refer to Cloud Function READMEs and data pipelone flow chart.
    - *SEND_BQ_TO_FS_GCS* 
    - *ADD_TO_MERGE_CANDIDATES*
