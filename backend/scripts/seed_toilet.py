import json
import os
import sys
from datetime import datetime
from google.cloud.firestore_v1 import GeoPoint

# Add the parent directory to the path to import firebase_admin
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.cloud import firestore

def seed_toilets():
    """
    Seed toilet data from toilet.json into Firestore
    Each toilet will have an ID starting with T followed by 3-digit index (T001, T002, etc.)
    """
    # Initialize Firestore client
    # Make sure GOOGLE_CLOUD_PROJECT environment variable is set
    project_id = os.environ.get('GOOGLE_CLOUD_PROJECT', 'ratemynus')
    db = firestore.Client(project=project_id)
    
    # Read the toilet data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(script_dir, '..', 'data', 'toilet.json')
    
    print(f"Reading toilet data from {data_file}...")
    
    with open(data_file, 'r', encoding='utf-8') as f:
        toilets = json.load(f)
    
    print(f"Found {len(toilets)} toilets to seed")
    
    # Reference to entities collection
    entities_ref = db.collection('entities')
    
    # Upload each toilet
    for index, toilet in enumerate(toilets, start=1):
        # Generate ID with T prefix and 3-digit index
        toilet_id = f"T{index:03d}"
        
        # Prepare toilet document
        toilet_doc = {
            'name': toilet.get('name', ''),
            'type': 'TOILET',  # Use uppercase for consistency
            'avgRating': toilet.get('avgRating', 0),
            'ratingCount': toilet.get('ratingCount', 0),
            'description': toilet.get('description', ''),  # Include description field
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        # Add location if present
        if 'location' in toilet and toilet['location']:
            location = toilet['location']
            if 'latitude' in location and 'longitude' in location:
                toilet_doc['location'] = GeoPoint(
                    location['latitude'],
                    location['longitude']
                )
        
        # Add tags if present (convert to array if needed)
        if 'tags' in toilet:
            if isinstance(toilet['tags'], dict):
                toilet_doc['tags'] = list(toilet['tags'].values())
            elif isinstance(toilet['tags'], list):
                toilet_doc['tags'] = toilet['tags']
        
        # Upload to Firestore
        entities_ref.document(toilet_id).set(toilet_doc)
        print(f"✓ Uploaded {toilet_id}: {toilet['name']}")
    
    print(f"\n✅ Successfully seeded {len(toilets)} toilets!")
    print(f"IDs range from T001 to T{len(toilets):03d}")

if __name__ == '__main__':
    try:
        seed_toilets()
    except Exception as e:
        print(f"❌ Error seeding toilets: {e}")
        sys.exit(1)
