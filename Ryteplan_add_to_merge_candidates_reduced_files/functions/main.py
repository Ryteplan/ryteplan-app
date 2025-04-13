from firebase_functions import firestore_fn # the functions for Firebase SDK to create cloud functions and set up triggers
from firebase_admin import initialize_app, firestore # Firebase Admin SDK to access Cloud Firestore.
# import google.cloud.firestore
# For generating unique IDs 
import random
import string
#logging and error handling
import logging
from google.api_core import exceptions  # for cloud errors
from datetime import datetime, timedelta

app = initialize_app()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory cache for rate limiting
# Structure: {collection_name: last_processed_timestamp}
processed_collections = {}
COOLDOWN_PERIOD = timedelta(minutes=5)  # Adjust this value as needed

def generate_firestore_id():
    """Generates a Firestore style random ID"""
    chars = string.ascii_lowercase + string.digits  # a-z, 0-9
    return ''.join(random.choices(chars, k=20))

def get_unique_firestore_id(db, collection_name):
    """selects a unique ID that does not exist in the merge_candidates collection."""
    while True:
        new_id = generate_firestore_id()
        if not db.collection(collection_name).document(new_id).get().exists:
            return new_id  # Return unique ID


@firestore_fn.on_document_created(document="institutions_petersons_processed_*/{pushId}")
def add_to_merge_candidates(event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None]) -> None:
    try:
        if event.data is None:
            logger.warning("Event data is None, skipping processing")
            return
        
        # Get the collection name from the path
        full_path = event.data.reference.path
        collection_name = full_path.split('/')[0]

        # Validate collection name format
        if not collection_name.startswith('institutions_petersons_processed_'):
            logger.error(f"Invalid collection name format: {collection_name}")
            return
        
        # Check if we've recently processed this collection
        current_time = datetime.now()
        if collection_name in processed_collections:
            last_processed = processed_collections[collection_name]
            if current_time - last_processed < COOLDOWN_PERIOD:
                # Skip processing and logging if within cooldown period
                return
        
        # Update the last processed timestamp
        processed_collections[collection_name] = current_time
        
        # Log only when processing
        logger.info(f"Processing collection: {collection_name}")
        
        db = firestore.client()
        
        @firestore.transactional
        def create_if_not_exists(transaction, collection_name):
            try:
                existing_docs = db.collection('merge_candidates').where(
                    'mergeCandidateId', '==', collection_name
                ).limit(1).get(transaction=transaction)
                
                if len(existing_docs) > 0:
                    logger.info(f"Collection {collection_name} is already registered")
                    return False
                
                unique_id = get_unique_firestore_id(db, 'merge_candidates')
                merge_candidates_ref = db.collection('merge_candidates').document(unique_id)
                
                transaction.set(merge_candidates_ref, {
                    'mergeCandidateId': collection_name,
                    'createdAt': firestore.SERVER_TIMESTAMP,  # add timestamp field
                })
                
                logger.info(f"Added {collection_name} to merge_candidates as {unique_id}")
                return True
                
            except Exception as e:
                logger.error(f"Transaction error: {str(e)}")
                raise
        
        transaction = db.transaction()
        create_if_not_exists(transaction, collection_name)
        
    except exceptions.GoogleAPIError as api_error:
        logger.error(f"Firestore API error: {str(api_error)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
