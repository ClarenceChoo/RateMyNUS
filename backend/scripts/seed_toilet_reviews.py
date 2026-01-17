#!/usr/bin/env python3
"""
Seed toilet reviews from toilet-reviews file to Firestore
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
    
    # Read toilet reviews data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(script_dir, "../data/toilet-reviews.json")
    
    with open(data_file, "r") as f:
        reviews = json.load(f)
    
    print(f"Found {len(reviews)} reviews to upload")
    
    # Upload each review
    reviews_ref = db.collection("reviews")
    
    uploaded_count = 0
    for review in reviews:
        try:
            # Use uuid as document ID
            review_id = review["uuid"]
            
            # Convert createdAt string to datetime
            created_at = datetime.fromisoformat(review["createdAt"].replace("+00:00", ""))
            
            # Prepare review document
            review_doc = {
                "entityId": review["entityId"],
                "authorName": review["authorName"],
                "rating": review["rating"],
                "voteCount": review.get("voteCount", 0),
                "tags": review.get("tags", []),
                "description": review.get("description", ""),
                "subratings": review.get("subratings", {}),
                "createdAt": created_at
            }
            
            # Upload to Firestore
            reviews_ref.document(review_id).set(review_doc)
            uploaded_count += 1
            
            if uploaded_count % 50 == 0:
                print(f"Uploaded {uploaded_count}/{len(reviews)} reviews...")
        
        except Exception as e:
            print(f"Error uploading review {review.get('uuid', 'unknown')}: {e}")
            continue
    
    print(f"\nSuccessfully seeded {uploaded_count} toilet reviews!")
    print(f"Review IDs use UUID format")

if __name__ == "__main__":
    main()
