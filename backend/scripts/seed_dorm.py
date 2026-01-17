"""
Script to seed dorm data into Firestore
Reads from data/dorm.json and uploads to the 'entities' collection
"""

import json
import firebase_admin
from firebase_admin import firestore
from google.cloud.firestore_v1 import GeoPoint
from datetime import datetime
import os
import sys

# Add parent directory to path for utils import
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from functions.utils.logger import logger


def parse_location(location_str: str) -> GeoPoint:
    """
    Parse location string to GeoPoint
    Format: "latitude longitude"
    """
    parts = location_str.strip().split()
    latitude = float(parts[0])
    longitude = float(parts[1])
    return GeoPoint(latitude, longitude)


def parse_timestamp(timestamp_str: str) -> datetime:
    """
    Parse ISO format timestamp string to datetime
    """
    return datetime.fromisoformat(timestamp_str)


def seed_dorm_data():
    """
    Read dorm.json and upload data to Firestore
    """
    # Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    
    db = firestore.client()
    
    # Read dorm data
    data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'dorm.json')
    logger.info("Reading dorm data", file=data_file)
    
    with open(data_file, 'r') as f:
        dorms = json.load(f)
    
    logger.info(f"Found {len(dorms)} dorms to upload")
    
    # Upload each dorm to Firestore
    batch = db.batch()
    batch_count = 0
    total_uploaded = 0
    
    for index, dorm in enumerate(dorms, start=1):
        try:
            # Create a reference with custom ID (D01, D02, D03, etc.)
            doc_id = f"D{index:02d}"
            doc_ref = db.collection('entities').document(doc_id)
            
            # Prepare data with proper types
            entity_data = {
                'name': dorm['name'],
                'type': dorm['type'],
                'location': parse_location(dorm['location']),
                'avgRating': dorm['avgRating'],
                'ratingCount': dorm['ratingCount'],
                'createdAt': parse_timestamp(dorm['createdAt']),
                'tags': dorm['tags']
            }
            
            # Add optional fields if they exist
            if 'description' in dorm:
                entity_data['description'] = dorm['description']
            
            if 'zone' in dorm:
                entity_data['zone'] = dorm['zone']
            
            # Add to batch
            batch.set(doc_ref, entity_data)
            batch_count += 1
            
            logger.info(
                f"Added to batch: {dorm['name']} (ID: {doc_id})",
                entity_name=dorm['name'],
                entity_type=dorm['type'],
                document_id=doc_id
            )
            
            # Firestore batch limit is 500 operations
            if batch_count >= 500:
                batch.commit()
                total_uploaded += batch_count
                logger.info(f"Committed batch of {batch_count} documents")
                batch = db.batch()
                batch_count = 0
        
        except Exception as e:
            logger.error(
                f"Error processing {dorm['name']}",
                error=e,
                entity_name=dorm['name']
            )
            continue
    
    # Commit remaining documents
    if batch_count > 0:
        batch.commit()
        total_uploaded += batch_count
        logger.info(f"Committed final batch of {batch_count} documents")
    
    logger.info(
        "Data seeding completed",
        total_entities=total_uploaded,
        collection="entities"
    )
    
    return total_uploaded


if __name__ == "__main__":
    try:
        logger.info("Starting dorm data seeding process")
        count = seed_dorm_data()
        logger.info(f"Successfully seeded {count} entities!")
        print(f"\n✅ Successfully seeded {count} dorm entities to Firestore!")
    except Exception as e:
        logger.error("Seeding failed", error=e)
        print(f"\n❌ Error seeding data: {e}")
        sys.exit(1)
