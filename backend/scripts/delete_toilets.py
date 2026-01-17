import os
import sys
from google.cloud import firestore

def delete_all_toilets():
    """
    Delete all toilet entities from Firestore
    Toilets have IDs starting with T (T001, T002, etc.)
    """
    # Initialize Firestore client
    project_id = os.environ.get('GOOGLE_CLOUD_PROJECT', 'ratemynus')
    db = firestore.Client(project=project_id)
    
    # Reference to entities collection
    entities_ref = db.collection('entities')
    
    # Query for all documents with IDs starting with T
    print("Fetching all toilet entities...")
    
    # Get all entities and filter by ID prefix
    all_entities = entities_ref.stream()
    
    toilets_to_delete = []
    for entity in all_entities:
        if entity.id.startswith('T'):
            toilets_to_delete.append(entity.id)
    
    if not toilets_to_delete:
        print("No toilets found to delete.")
        return
    
    print(f"Found {len(toilets_to_delete)} toilets to delete")
    print(f"IDs: {', '.join(sorted(toilets_to_delete))}")
    
    # Confirm deletion
    confirm = input(f"\n⚠️  Are you sure you want to delete {len(toilets_to_delete)} toilets? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Deletion cancelled.")
        return
    
    # Delete toilets in batches
    batch_size = 500  # Firestore batch limit
    deleted_count = 0
    
    for i in range(0, len(toilets_to_delete), batch_size):
        batch = db.batch()
        batch_ids = toilets_to_delete[i:i + batch_size]
        
        for toilet_id in batch_ids:
            doc_ref = entities_ref.document(toilet_id)
            batch.delete(doc_ref)
        
        batch.commit()
        deleted_count += len(batch_ids)
        print(f"✓ Deleted {deleted_count}/{len(toilets_to_delete)} toilets...")
    
    print(f"\n✅ Successfully deleted {deleted_count} toilets!")

if __name__ == '__main__':
    try:
        delete_all_toilets()
    except Exception as e:
        print(f"❌ Error deleting toilets: {e}")
        sys.exit(1)
