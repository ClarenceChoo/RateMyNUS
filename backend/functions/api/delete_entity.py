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
def delete_entity(req: https_fn.Request) -> https_fn.Response:
    """
    Delete an entity from Firestore
    Query params:
        - id: Entity ID to delete (required)
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
        logger.log_request(req.method, req.path, query_params=dict(req.args))
        
        # Get entity ID from query params
        entity_id = req.args.get('id')
        
        if not entity_id:
            logger.warning("Missing entity ID parameter")
            return https_fn.Response(
                json.dumps({"error": "Missing required parameter: id"}),
                status=400,
                headers=get_cors_headers()
            )
        
        db = firestore.client()
        entities_ref = db.collection('entities')
        
        # Check if entity exists
        entity_doc = entities_ref.document(entity_id).get()
        
        if not entity_doc.exists:
            logger.warning("Entity not found", entity_id=entity_id)
            return https_fn.Response(
                json.dumps({"error": f"Entity with ID '{entity_id}' not found"}),
                status=404,
                headers=get_cors_headers()
            )
        
        # Get entity data before deletion for logging
        entity_data = entity_doc.to_dict()
        entity_type = entity_data.get('type', 'UNKNOWN')
        entity_name = entity_data.get('name', 'Unknown')
        
        # Delete the entity
        logger.log_firestore_operation("delete", "entities", entity_id)
        entities_ref.document(entity_id).delete()
        
        duration = (time.time() - start_time) * 1000
        logger.info(
            "Entity deleted successfully",
            entity_id=entity_id,
            entity_type=entity_type,
            entity_name=entity_name
        )
        logger.log_response(req.method, req.path, 200, duration)
        
        return https_fn.Response(
            json.dumps({
                "message": "Entity deleted successfully",
                "id": entity_id,
                "name": entity_name,
                "type": entity_type
            }),
            status=200,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error deleting entity",
            error=e,
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
