from firebase_functions import https_fn
from firebase_admin import firestore
import json
import time
import uuid
from utils.logger import logger


# Subratings configuration by entity type
SUBRATINGS_BY_TYPE = {
    'DORM': ['roomCondition', 'cleanliness', 'facilities', 'community', 'valueForMoney'],
    'CLASSROOM': ['comfort', 'visibility', 'audioClarity', 'ventilation', 'powerAndWifi'],
    'PROFESSOR': ['clarity', 'engagement', 'approachability', 'fairness', 'organisation'],
    'CANTEEN': ['taste', 'valueForMoney', 'portionSize', 'hygiene', 'waitingTime'],
    'FOOD_PLACE': ['taste', 'valueForMoney', 'portionSize', 'hygiene', 'waitingTime'],
    'TOILET': ['cleanliness', 'smell', 'maintenance', 'privacy', 'accessibility'],
}


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
def create_review(req: https_fn.Request) -> https_fn.Response:
    """
    Create a new review
    POST /create_review
    
    Request body:
    {
        "authorName": "Bob",
        "description": "Very nice and tasty!",
        "entityId": "C01",
        "rating": 4.5,
        "tags": ["halal", "affordable"],
        "moduleCode": "CS2040S",  // Optional, for PROFESSOR reviews
        "subratings": {
            "taste": 5,
            "valueForMoney": 4,
            "portionSize": 4,
            "hygiene": 5,
            "waitingTime": 3
        }
    }
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
        
        # Parse request body
        try:
            data = req.get_json()
        except Exception as e:
            logger.error("Invalid JSON in request body", error=e)
            return https_fn.Response(
                json.dumps({"error": "Invalid JSON in request body"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate required fields
        required_fields = ["authorName", "description", "entityId", "rating"]
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            logger.warning("Missing required fields", fields=missing_fields)
            return https_fn.Response(
                json.dumps({
                    "error": "Missing required fields",
                    "missing": missing_fields
                }),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate entityId exists and get entity type
        db = firestore.client()
        entity_ref = db.collection('entities').document(data['entityId'])
        entity_doc = entity_ref.get()
        
        if not entity_doc.exists:
            logger.warning("Entity not found", entity_id=data['entityId'])
            return https_fn.Response(
                json.dumps({"error": f"Entity with ID '{data['entityId']}' not found"}),
                status=404,
                headers=get_cors_headers()
            )
        
        entity_data = entity_doc.to_dict()
        entity_type = entity_data.get('type', '').upper()
        
        # Validate rating (must be integer)
        try:
            rating = int(data['rating'])
            if rating < 0 or rating > 5:
                return https_fn.Response(
                    json.dumps({"error": "Rating must be between 0 and 5"}),
                    status=400,
                    headers=get_cors_headers()
                )
        except (ValueError, TypeError):
            return https_fn.Response(
                json.dumps({"error": "Rating must be an integer"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate tags (optional, but must be array if provided)
        tags = data.get('tags', [])
        if not isinstance(tags, list):
            return https_fn.Response(
                json.dumps({"error": "Tags must be an array of strings"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate all tags are strings
        if not all(isinstance(tag, str) for tag in tags):
            return https_fn.Response(
                json.dumps({"error": "All tags must be strings"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate moduleCode (required for PROFESSOR reviews)
        module_code = data.get('moduleCode', None)
        if entity_type == 'PROFESSOR' and not module_code:
            return https_fn.Response(
                json.dumps({"error": "moduleCode is required for professor reviews"}),
                status=400,
                headers=get_cors_headers()
            )
        
        # Validate subratings (optional, but must match entity type if provided)
        subratings = data.get('subratings', {})
        if subratings:
            if not isinstance(subratings, dict):
                return https_fn.Response(
                    json.dumps({"error": "Subratings must be a dictionary"}),
                    status=400,
                    headers=get_cors_headers()
                )
            
            # Get valid subratings for this entity type
            valid_subratings = SUBRATINGS_BY_TYPE.get(entity_type, [])
            
            # Validate subrating keys
            invalid_keys = [key for key in subratings.keys() if key not in valid_subratings]
            logger.debug("Invalid subrating keys found", invalid_keys=invalid_keys)
            if invalid_keys:
                return https_fn.Response(
                    json.dumps({
                        "error": f"Invalid subrating keys for {entity_type}",
                        "invalid_keys": invalid_keys,
                        "valid_keys": valid_subratings
                    }),
                    status=400,
                    headers=get_cors_headers()
                )
            
            # Validate subrating values (must be integers between 0 and 5)
            for key, value in subratings.items():
                try:
                    subrating_value = int(value)
                    if subrating_value < 0 or subrating_value > 5:
                        return https_fn.Response(
                            json.dumps({"error": f"Subrating '{key}' must be between 0 and 5"}),
                            status=400,
                            headers=get_cors_headers()
                        )
                    # Update with integer value
                    subratings[key] = subrating_value
                except (ValueError, TypeError):
                    return https_fn.Response(
                        json.dumps({"error": f"Subrating '{key}' must be an integer"}),
                        status=400,
                        headers=get_cors_headers()
                    )
        
        # Generate UUID for the review
        review_uuid = str(uuid.uuid4())
        
        # Create review document
        review_data = {
            'uuid': review_uuid,
            'authorName': data['authorName'],
            'description': data['description'],
            'entityId': data['entityId'],
            'rating': rating,
            'tags': tags,
            'subratings': subratings,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'voteCount': 0
        }
        
        # Add moduleCode if provided (for professor reviews)
        if module_code:
            review_data['moduleCode'] = module_code
        
        # Add review to Firestore
        review_ref = db.collection('reviews').document()
        review_ref.set(review_data)
        
        logger.log_firestore_operation(
            "create",
            "reviews",
            review_ref.id,
            entity_id=data['entityId']
        )
        
        # Get the created review with server timestamp
        created_review = review_ref.get().to_dict()
        created_review['id'] = review_ref.id
        
        # Convert timestamp to ISO format
        if 'createdAt' in created_review and created_review['createdAt']:
            created_review['createdAt'] = created_review['createdAt'].isoformat()
        
        duration = (time.time() - start_time) * 1000
        logger.log_response(req.method, req.path, 201, duration)
        logger.info(
            "Review created successfully",
            review_id=review_ref.id,
            entity_id=data['entityId']
        )
        
        return https_fn.Response(
            json.dumps({
                "message": "Review created successfully",
                "review": created_review
            }),
            status=201,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error creating review",
            error=e,
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
