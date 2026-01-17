from firebase_functions import https_fn
from firebase_admin import firestore
import json
import time
from utils.logger import logger


def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "3600",
        "Content-Type": "application/json"
    }


@https_fn.on_request()
def delete_review(req: https_fn.Request) -> https_fn.Response:
    """
    Delete a review by ID
    DELETE /delete_review?id=review_doc_id
    
    Query parameters:
    - id (required): The review document ID to delete
    """
    # Handle CORS preflight request
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers=get_cors_headers()
        )
    
    # Only accept DELETE requests
    if req.method != "DELETE":
        return https_fn.Response(
            json.dumps({"error": "Method not allowed. Use DELETE."}),
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
        
        # Delete from Firestore
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
        
        # Get review data before deletion for logging
        review_data = review_doc.to_dict()
        entity_id = review_data.get('entityId', 'unknown')
        
        # Delete the review
        review_ref.delete()
        
        logger.log_firestore_operation(
            "delete",
            "reviews",
            review_id,
            entity_id=entity_id
        )
        
        duration = (time.time() - start_time) * 1000
        logger.log_response(req.method, req.path, 200, duration)
        logger.info(
            "Review deleted successfully",
            review_id=review_id,
            entity_id=entity_id
        )
        
        return https_fn.Response(
            json.dumps({
                "message": "Review deleted successfully",
                "id": review_id
            }),
            status=200,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error deleting review",
            error=e,
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
