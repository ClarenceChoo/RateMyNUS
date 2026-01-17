#!/usr/bin/env python3
"""
Export toilet entities from Firestore to JSON
"""
import json
import os
from datetime import datetime
from google.cloud import firestore

def main():
    # Initialize Firestore client
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project_id:
        print("Error: GOOGLE_CLOUD_PROJECT environment variable not set")
        return
    
    db = firestore.Client(project=project_id)
    
    print("Fetching toilet entities from Firestore...")
    
    # Query for toilet entities
    entities_ref = db.collection("entities")
    query = entities_ref.where("type", "==", "TOILET")
    
    docs = query.stream()
    
    toilets = []
    for doc in docs:
        entity_data = doc.to_dict()
        entity_data["id"] = doc.id
        
        # Convert datetime to ISO format string
        if "createdAt" in entity_data and entity_data["createdAt"]:
            entity_data["createdAt"] = entity_data["createdAt"].isoformat()
        
        # Convert GeoPoint to dict
        if "location" in entity_data and entity_data["location"]:
            if hasattr(entity_data["location"], "latitude"):
                entity_data["location"] = {
                    "latitude": entity_data["location"].latitude,
                    "longitude": entity_data["location"].longitude
                }
        
        toilets.append(entity_data)
    
    print(f"Found {len(toilets)} toilet entities")
    
    # Sort by ID for consistency
    toilets.sort(key=lambda x: x["id"])
    
    # Export to JSON file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, "../data/toilet_export.json")
    
    with open(output_file, "w") as f:
        json.dump(toilets, f, indent=2)
    
    print(f"Successfully exported to {output_file}")
    
    # Print summary
    print("\nToilet IDs:")
    for toilet in toilets:
        print(f"  - {toilet['id']}: {toilet['name']}")

if __name__ == "__main__":
    main()
