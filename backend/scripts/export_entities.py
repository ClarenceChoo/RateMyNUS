"""
Export all entities from Firestore to a JSON file
Usage: GOOGLE_CLOUD_PROJECT=your-project-id python export_entities.py
"""

import os
import json
import sys
from datetime import datetime
from google.cloud import firestore


def export_entities():
    """Export all entities from Firestore to JSON file"""
    
    # Check for required environment variable
    project_id = os.environ.get('GOOGLE_CLOUD_PROJECT')
    if not project_id:
        print("Error: GOOGLE_CLOUD_PROJECT environment variable is required")
        print("Usage: GOOGLE_CLOUD_PROJECT=your-project-id python export_entities.py")
        sys.exit(1)
    
    # Initialize Firestore client
    db = firestore.Client(project=project_id)
    
    print(f"Connecting to Firestore project: {project_id}")
    print("Fetching all entities...")
    
    # Get all entities
    entities_ref = db.collection('entities')
    docs = entities_ref.stream()
    
    entities = []
    count = 0
    
    for doc in docs:
        entity_data = doc.to_dict()
        entity_data['id'] = doc.id
        
        # Convert GeoPoint to string if present
        if 'location' in entity_data and hasattr(entity_data['location'], 'latitude'):
            location = entity_data['location']
            entity_data['location'] = f"{location.latitude} {location.longitude}"
        
        # Convert timestamp to ISO format if present
        if 'createdAt' in entity_data and entity_data['createdAt']:
            if hasattr(entity_data['createdAt'], 'isoformat'):
                entity_data['createdAt'] = entity_data['createdAt'].isoformat()
        
        entities.append(entity_data)
        count += 1
        print(f"Exported: {doc.id} - {entity_data.get('name', 'Unknown')}")
    
    # Create output filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f"entities_export_{timestamp}.json"
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', output_file)
    
    # Write to JSON file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(entities, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully exported {count} entities to {output_file}")
    print(f"File location: {output_path}")


if __name__ == "__main__":
    export_entities()
