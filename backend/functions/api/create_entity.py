from firebase_functions import https_fn
from firebase_admin import firestore
from google.cloud.firestore import GeoPoint
from datetime import datetime
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
def create_entity(req: https_fn.Request) -> https_fn.Response:
    """
    Create a new entity in Firestore
    Request body:
        - id: Entity ID (required)
        - name: Entity name (required)
        - type: Entity type (required - CANTEEN, DORM, CLASSROOM, PROFESSOR, TOILET)
        - description: Description text (optional)
        - tags: Array of tags (optional)
        - location: Object with latitude and longitude (optional)
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
        logger.log_request(req.method, req.path)
        
        # Parse request body
        try:
            data = req.get_json()
        except Exception as e:
            logger.warning("Invalid JSON in request body", error=str(e))
            return https_fn.Response(
                json.dumps({"error": "Invalid JSON in request body"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate required fields
        required_fields = ['id', 'name', 'type']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            logger.warning("Missing required fields", fields=missing_fields)
            return https_fn.Response(
                json.dumps({
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate entity type
        valid_types = ['CANTEEN', 'DORM', 'CLASSROOM', 'PROFESSOR', 'TOILET']
        if data['type'] not in valid_types:
            logger.warning("Invalid entity type", type=data['type'])
            return https_fn.Response(
                json.dumps({
                    "error": f"Invalid entity type. Must be one of: {', '.join(valid_types)}"
                }),
                status=400,
                headers=get_cors_headers()
            )
        
        db = firestore.client()
        entities_ref = db.collection('entities')
        
        # Check if entity already exists
        entity_id = data['id']
        existing_doc = entities_ref.document(entity_id).get()
        
        if existing_doc.exists:
            logger.warning("Entity already exists", entity_id=entity_id)
            return https_fn.Response(
                json.dumps({"error": f"Entity with ID '{entity_id}' already exists"}),
                status=409,
                headers=get_cors_headers()
            )
        
        # Build entity document
        entity_doc = {
            'name': data['name'],
            'type': data['type'],
            'avgRating': 0.0,
            'ratingCount': 0,
            'createdAt': datetime.now()
        }
        
        # Add optional fields
        if 'description' in data and data['description']:
            entity_doc['description'] = data['description']
        
        if 'tags' in data and data['tags']:
            entity_doc['tags'] = data['tags']
        
        if 'location' in data and data['location']:
            # Convert location dict to GeoPoint
            if isinstance(data['location'], dict):
                if 'latitude' in data['location'] and 'longitude' in data['location']:
                    entity_doc['location'] = GeoPoint(
                        data['location']['latitude'],
                        data['location']['longitude']
                    )
            elif isinstance(data['location'], GeoPoint):
                entity_doc['location'] = data['location']
        
        # Create entity in Firestore
        logger.log_firestore_operation("create", "entities", entity_id)
        entities_ref.document(entity_id).set(entity_doc)
        
        # Prepare response
        response_data = entity_doc.copy()
        response_data['id'] = entity_id
        
        # Convert timestamp to ISO format
        if 'createdAt' in response_data:
            response_data['createdAt'] = response_data['createdAt'].isoformat()
        
        # Convert GeoPoint to dict
        if 'location' in response_data and isinstance(response_data['location'], GeoPoint):
            response_data['location'] = {
                'latitude': response_data['location'].latitude,
                'longitude': response_data['location'].longitude
            }
        
        duration = (time.time() - start_time) * 1000
        logger.info(
            "Entity created successfully",
            entity_id=entity_id,
            entity_type=data['type']
        )
        logger.log_response(req.method, req.path, 201, duration)
        
        return https_fn.Response(
            json.dumps(response_data),
            status=201,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error creating entity",
            error=e,
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
