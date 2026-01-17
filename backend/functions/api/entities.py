from firebase_functions import https_fn
from firebase_admin import firestore
import json
import time
from utils.logger import logger


def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        "Access-Control-Allow-Origin": "*",  # Allow all origins (change to specific domain in production)
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "3600",
        "Content-Type": "application/json"
    }


@https_fn.on_request()
def get_entities(req: https_fn.Request) -> https_fn.Response:
    """
    Get entities from Firestore
    Query params:
        - id: Get specific entity by ID
        - type: Filter entities by type (e.g., "Canteen")
        - limit: Maximum number of entities to return (default: 100)
    """
    # Handle CORS preflight request
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers=get_cors_headers()
        )
    
    start_time = time.time()
    
    try:
        logger.log_request(
            req.method, 
            req.path,
            query_params=dict(req.args)
        )
        
        db = firestore.client()
        entities_ref = db.collection('entities')
        
        # Get specific entity by ID
        entity_id = req.args.get('id')
        if entity_id:
            logger.log_firestore_operation("read", "entities", entity_id)
            
            doc = entities_ref.document(entity_id).get()
            if not doc.exists:
                logger.warning(
                    "Entity not found",
                    entity_id=entity_id
                )
                return https_fn.Response(
                    json.dumps({"error": "Entity not found"}),
                    status=404,
                    headers=get_cors_headers()
                )
            
            entity_data = doc.to_dict()
            entity_data['id'] = doc.id
            
            # Convert timestamp to ISO format
            if 'createdAt' in entity_data and entity_data['createdAt']:
                entity_data['createdAt'] = entity_data['createdAt'].isoformat()
            
            # Convert geopoint to dict (if it's a GeoPoint object)
            if 'location' in entity_data and entity_data['location']:
                if hasattr(entity_data['location'], 'latitude'):
                    entity_data['location'] = {
                        'latitude': entity_data['location'].latitude,
                        'longitude': entity_data['location'].longitude
                    }
                # If location is already a dict, leave it as-is
            
            duration = (time.time() - start_time) * 1000
            logger.log_response(req.method, req.path, 200, duration)
            
            return https_fn.Response(
                json.dumps(entity_data),
                status=200,
                headers=get_cors_headers()
            )
        
        # Build query with optional filters
        query = entities_ref
        
        # Filter by type
        entity_type = req.args.get('type')
        if entity_type:
            query = query.where('type', '==', entity_type)
            logger.info("Filtering entities by type", entity_type=entity_type)
        
        # Get limit from query params (default: 300)
        limit = int(req.args.get('limit', 500))
        query = query.limit(limit)
        
        logger.log_firestore_operation("query", "entities", limit=limit)
        
        # Execute query
        docs = query.stream()
        
        entities = []
        for doc in docs:
            entity_data = doc.to_dict()
            entity_data['id'] = doc.id
            
            # Convert timestamp to ISO format
            if 'createdAt' in entity_data and entity_data['createdAt']:
                entity_data['createdAt'] = entity_data['createdAt'].isoformat()
            
            # Convert geopoint to dict (if it's a GeoPoint object)
            if 'location' in entity_data and entity_data['location']:
                if hasattr(entity_data['location'], 'latitude'):
                    entity_data['location'] = {
                        'latitude': entity_data['location'].latitude,
                        'longitude': entity_data['location'].longitude
                    }
                # If location is already a dict, leave it as-is
            
            entities.append(entity_data)
        
        duration = (time.time() - start_time) * 1000
        logger.log_response(
            req.method, 
            req.path, 
            200, 
            duration,
            entities_count=len(entities)
        )
        
        return https_fn.Response(
            json.dumps({
                "count": len(entities),
                "entities": entities
            }),
            status=200,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error fetching entities",
            error=e,
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
