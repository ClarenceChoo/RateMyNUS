from firebase_functions import https_fn
from firebase_admin import firestore
import json
import time
from utils.logger import logger


def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "3600",
        "Content-Type": "application/json"
    }


@https_fn.on_request()
def vote_review(req: https_fn.Request) -> https_fn.Response:
    """
    Increment vote count for a review
    POST /vote_review?id=review_doc_id
    
    Query parameters:
    - id (required): The review document ID to vote on
    """
    # Handle CORS preflight request
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers=get_cors_headers()
        )
    
    # Only accept POST requests
    if req.method != "POST":
        return https_fn.Response(
            json.dumps({"error": "Method not allowed. Use POST."}),
            status=405,
            headers=get_cors_headers()
        )
    
    start_time = time.time()
    
    try:
        logger.log_request(req.method, req.path)
        
        # Get review ID from query parameters
        review_id = req.args.get('id', None)
        
        if not review_id:
            return https_fn.Response(
                json.dumps({"error": "id parameter is required"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Update vote count in Firestore
        db = firestore.client()
        review_ref = db.collection('reviews').document(review_id)
        
        # Check if review exists
        review_doc = review_ref.get()
        if not review_doc.exists:
            logger.warning("Review not found", review_id=review_id)
            return https_fn.Response(
                json.dumps({"error": f"Review with ID '{review_id}' not found"}),
                status=404,
                headers=get_cors_headers()
            )
        
        # Increment voteCount by 1
        review_ref.update({
            'voteCount': firestore.Increment(1)
        })
        
        logger.log_firestore_operation(
            operation="increment_vote",
            collection="reviews",
            document_id=review_id
        )
        
        # Get updated review
        updated_review = review_ref.get().to_dict()
        updated_review['id'] = review_id
        
        # Convert timestamp to ISO format
        if 'createdAt' in updated_review and updated_review['createdAt']:
            updated_review['createdAt'] = updated_review['createdAt'].isoformat()
        
        duration = (time.time() - start_time) * 1000
        logger.log_response(req.method, req.path, 200, duration)
        logger.info(
            "Vote added successfully",
            review_id=review_id,
            new_vote_count=updated_review.get('voteCount', 0)
        )
        
        return https_fn.Response(
            json.dumps({
                "message": "Vote added successfully",
                "review": updated_review
            }),
            status=200,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error adding vote",
            error=e,
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
