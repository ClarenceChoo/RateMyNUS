import json
import os
import sys
from datetime import datetime
from google.cloud.firestore_v1 import GeoPoint

# Add the parent directory to the path to import firebase_admin
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.cloud import firestore

def seed_professors():
    """
    Seed professor data from professor.json into Firestore
    Each professor will have an ID starting with P followed by 3-digit index (P001, P002, etc.)
    """
    # Initialize Firestore client
    # Make sure GOOGLE_CLOUD_PROJECT environment variable is set
    project_id = os.environ.get('GOOGLE_CLOUD_PROJECT', 'ratemynus')
    db = firestore.Client(project=project_id)
    
    # Read the professor data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(script_dir, '..', 'data', 'professor.json')
    
    print(f"Reading professor data from {data_file}...")
    
    with open(data_file, 'r', encoding='utf-8') as f:
        professors = json.load(f)
    
    print(f"Found {len(professors)} professors to seed")
    
    # Reference to entities collection
    entities_ref = db.collection('entities')
    
    # Upload each professor
    for index, professor in enumerate(professors, start=1):
        # Generate ID with P prefix and 3-digit index
        professor_id = f"P{index:03d}"
        
        # Convert tags from object to array
        tags = []
        if 'tags' in professor and isinstance(professor['tags'], dict):
            # Extract values from the numeric keys
            tags = list(professor['tags'].values())
        
        # Prepare professor document
        professor_doc = {
            'name': professor.get('name', ''),
            'type': 'PROFESSOR',  # Use uppercase for consistency
            'avgRating': professor.get('avgRating', 0),
            'ratingCount': professor.get('ratingCount', 0),
            'tags': tags,  # Convert to array
            'description': professor.get('description', ''),  # Include description field
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        # Add location if present
        if 'location' in professor and professor['location']:
            location = professor['location']
            if 'latitude' in location and 'longitude' in location:
                professor_doc['location'] = GeoPoint(
                    location['latitude'],
                    location['longitude']
                )
        
        # Upload to Firestore
        entities_ref.document(professor_id).set(professor_doc)
        print(f"✓ Uploaded {professor_id}: {professor['name']} (Tags: {', '.join(tags)})")
    
    print(f"\n✅ Successfully seeded {len(professors)} professors!")
    print(f"IDs range from P001 to P{len(professors):03d}")

if __name__ == '__main__':
    try:
        seed_professors()
    except Exception as e:
        print(f"❌ Error seeding professors: {e}")
        sys.exit(1)
