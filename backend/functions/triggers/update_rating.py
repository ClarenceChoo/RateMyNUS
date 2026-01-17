from firebase_functions import firestore_fn
from firebase_admin import firestore
from utils.logger import logger


@firestore_fn.on_document_written(
    document="reviews/{reviewId}",
    region="asia-southeast1"
)
def update_entity_rating(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]) -> None:
    """
    Recalculate entity's average rating when a review is created, updated, or deleted.
    
    Trigger: Firestore document write (create/update/delete) on reviews/{reviewId}
    
    This function:
    1. Gets the entityId from the review
    2. Queries all reviews for that entity
    3. Calculates the average rating and count
    4. Updates the entity document with new avgRating and ratingCount
    """
    # Initialize entity_id outside try block to avoid unbound variable error
    entity_id = None
    
    try:
        # Get the review data (before and after)
        before = event.data.before
        after = event.data.after
        
        # Determine the entityId from the review
        
        if after and after.exists:
            # Document was created or updated
            entity_id = after.get('entityId')
            logger.info(
                "Review written",
                review_id=event.params['reviewId'],
                entity_id=entity_id,
                operation="create/update"
            )
        elif before and before.exists:
            # Document was deleted
            entity_id = before.get('entityId')
            logger.info(
                "Review deleted",
                review_id=event.params['reviewId'],
                entity_id=entity_id,
                operation="delete"
            )
        
        if not entity_id:
            logger.warning("Could not determine entityId from review", review_id=event.params['reviewId'])
            return
        
        # Get all reviews for this entity
        db = firestore.client()
        reviews_ref = db.collection('reviews')
        reviews = reviews_ref.where('entityId', '==', entity_id).stream()
        
        # Calculate average rating and count
        total_rating = 0
        review_count = 0
        
        for review in reviews:
            review_data = review.to_dict()
            rating = review_data.get('rating', 0)
            if rating is not None:
                total_rating += rating
                review_count += 1
        
        # Calculate average (handle division by zero)
        avg_rating = round(total_rating / review_count, 2) if review_count > 0 else 0
        
        # Update the entity document
        entity_ref = db.collection('entities').document(entity_id)
        entity_ref.update({
            'avgRating': avg_rating,
            'ratingCount': review_count
        })
        
        logger.info(
            "Entity rating updated",
            entity_id=entity_id,
            avg_rating=avg_rating,
            rating_count=review_count,
            review_id=event.params['reviewId']
        )
        
    except Exception as e:
        logger.error(
            "Error updating entity rating",
            error=e,
            review_id=event.params.get('reviewId'),
            entity_id=entity_id
        )
        # Don't raise exception - we don't want to retry on permanent failures
        # The function will be marked as failed but won't retry indefinitely
