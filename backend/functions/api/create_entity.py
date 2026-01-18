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


def generate_entity_id(db, entity_type):
    """Generate next available ID for entity type"""
    # Define prefix for each type
    prefix_map = {
        'CANTEEN': 'C',
        'DORM': 'D',
        'CLASSROOM': 'CR',
        'PROFESSOR': 'P',
        'TOILET': 'T'
    }
    
    prefix = prefix_map[entity_type]
    entities_ref = db.collection('entities')
    
    # Query all entities of this type to find the highest index
    query = entities_ref.where('type', '==', entity_type).stream()
    
    max_index = 0
    for doc in query:
        doc_id = doc.id
        # Extract numeric part from ID
        if doc_id.startswith(prefix):
            try:
                # For CLASSROOM (CR001), remove 'CR' and parse the rest
                # For others (P001, T001, etc.), remove single letter prefix
                numeric_part = doc_id[len(prefix):]
                index = int(numeric_part)
                max_index = max(max_index, index)
            except ValueError:
                continue
    
    # Generate next ID
    next_index = max_index + 1
    
    # Format with appropriate padding
    if entity_type == 'CLASSROOM':
        # CR001, CR002, etc.
        return f"{prefix}{next_index:03d}"
    elif entity_type in ['PROFESSOR', 'TOILET']:
        # P001, T001, etc.
        return f"{prefix}{next_index:03d}"
    else:
        # C01, D01, etc.
        return f"{prefix}{next_index:02d}"


@https_fn.on_request()
def create_entity(req: https_fn.Request) -> https_fn.Response:
    """
    Create a new entity in Firestore with auto-generated ID
    Request body:
        - name: Entity name (required)
        - type: Entity type (required - CANTEEN, DORM, CLASSROOM, PROFESSOR, TOILET)
        - description: Description text (optional)
        - tags: Array of tags (optional)
        - location: Object with latitude and longitude (optional)
    
    ID is automatically generated based on type:
        - PROFESSOR: P001, P002, ...
        - TOILET: T001, T002, ...
        - CANTEEN: C01, C02, ...
        - DORM: D01, D02, ...
        - CLASSROOM: CR001, CR002, ...
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
        
        # Validate required fields (removed 'id' from required)
        required_fields = ['name', 'type']
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
        
        # Generate entity ID automatically
        entity_id = generate_entity_id(db, data['type'])
        
        # Check if generated ID already exists (shouldn't happen, but safety check)
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
