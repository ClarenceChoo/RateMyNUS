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
def get_reviews(req: https_fn.Request) -> https_fn.Response:
    """
    Get reviews for an entity
    GET /get_reviews?entityId=C01
    
    Query parameters:
    - entityId (required): The entity ID to get reviews for
    """
    # Handle CORS preflight request
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers=get_cors_headers()
        )
    
    # Only accept GET requests
    if req.method != "GET":
        return https_fn.Response(
            json.dumps({"error": "Method not allowed. Use GET."}),
            status=405,
            headers=get_cors_headers()
        )
    
    start_time = time.time()
    
    try:
        logger.log_request(req.method, req.path)
        
        # Get query parameters
        entity_id = req.args.get('entityId', None)
        
        if not entity_id:
            return https_fn.Response(
                json.dumps({"error": "entityId parameter is required"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Query Firestore
        db = firestore.client()
        reviews_ref = db.collection('reviews')
        
        # Filter by entityId and order by createdAt descending
        query = reviews_ref.where('entityId', '==', entity_id).order_by('createdAt', direction=firestore.Query.DESCENDING)
        
        logger.log_firestore_operation(
            "query",
            "reviews",
            None,
            entity_id=entity_id
        )
        
        # Get results
        results = query.stream()
        reviews = []
        
        for doc in results:
            review_data = doc.to_dict()
            review_data['id'] = doc.id
            
            # Convert timestamp to ISO format
            if 'createdAt' in review_data and review_data['createdAt']:
                review_data['createdAt'] = review_data['createdAt'].isoformat()
            
            reviews.append(review_data)
        
        duration = (time.time() - start_time) * 1000
        logger.log_response(req.method, req.path, 200, duration)
        logger.info(
            "Reviews retrieved successfully",
            entity_id=entity_id,
            count=len(reviews)
        )
        
        return https_fn.Response(
            json.dumps({
                "entityId": entity_id,
                "count": len(reviews),
                "reviews": reviews
            }),
            status=200,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error retrieving reviews",
            error=e,
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
