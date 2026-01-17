"""
Script to seed classroom data into Firestore
Reads from data/classroom.json and uploads to the 'entities' collection
"""

import json
import firebase_admin
from firebase_admin import credentials, firestore
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


def seed_classroom_data():
    """
    Read classroom.json and upload data to Firestore
    """
    # Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    
    db = firestore.client()
    
    # Read classroom data
    data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'classroom.json')
    logger.info("Reading classroom data", file=data_file)
    
    with open(data_file, 'r') as f:
        classrooms = json.load(f)
    
    logger.info(f"Found {len(classrooms)} classrooms to upload")
    
    # Upload each classroom to Firestore
    batch = db.batch()
    batch_count = 0
    total_uploaded = 0
    
    for index, classroom in enumerate(classrooms, start=1):
        try:
            # Create a reference with custom ID (CR001, CR002, CR003, etc.)
            doc_id = f"CR{index:03d}"
            doc_ref = db.collection('entities').document(doc_id)
            
            # Prepare data with proper types
            entity_data = {
                'name': classroom['name'],
                'type': classroom['type'],
                'avgRating': classroom['avgRating'],
                'ratingCount': classroom['ratingCount'],
                'createdAt': parse_timestamp(classroom['createdAt']),
                'tags': classroom['tags']
            }
            
            # Add optional fields if they exist
            if 'description' in classroom:
                entity_data['description'] = classroom['description']
            
            if 'building' in classroom:
                entity_data['building'] = classroom['building']
            
            if 'capacity' in classroom:
                entity_data['capacity'] = classroom['capacity']
            
            if 'zone' in classroom:
                entity_data['zone'] = classroom['zone']
            
            if 'floor' in classroom:
                entity_data['floor'] = classroom['floor']
            
            if 'features' in classroom:
                entity_data['features'] = classroom['features']
            
            # Handle location - can be either string or object
            if 'location' in classroom:
                if isinstance(classroom['location'], str):
                    entity_data['location'] = parse_location(classroom['location'])
                else:
                    # Store location object as-is
                    entity_data['location'] = classroom['location']
            
            # Add to batch
            batch.set(doc_ref, entity_data)
            batch_count += 1
            
            logger.info(
                f"Added to batch: {classroom['name']} (ID: {doc_id})",
                entity_name=classroom['name'],
                entity_type=classroom['type'],
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
                f"Error processing {classroom['name']}",
                error=e,
                entity_name=classroom['name']
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
        logger.info("Starting classroom data seeding process")
        count = seed_classroom_data()
        logger.info(f"Successfully seeded {count} entities!")
        print(f"\n✅ Successfully seeded {count} classroom entities to Firestore!")
    except Exception as e:
        logger.error("Seeding failed", error=e)
        print(f"\n❌ Error seeding data: {e}")
        sys.exit(1)
