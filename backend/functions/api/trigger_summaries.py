from firebase_functions import https_fn
from utils.summarizer import generate_summaries_for_all_entities
from utils.logger import logger
import json
import time


def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "3600",
        "Content-Type": "application/json"
    }


@https_fn.on_request(
    secrets=["OPENAI_API_KEY"],  # Secret access declaration
    memory=512,  # Increased memory for processing
    timeout_sec=300  # 5 minutes timeout
)
def trigger_summaries(req: https_fn.Request) -> https_fn.Response:
    """
    Manually trigger review summary generation for all entities
    
    Query parameters:
        - limit: Optional maximum number of entities to process
    
    Example: GET /trigger_summaries?limit=10
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
        
        # Get limit from query params (optional)
        limit_param = req.args.get('limit')
        limit = None
        
        if limit_param:
            try:
                limit = int(limit_param)
            except ValueError:
                logger.warning("Invalid limit parameter", limit=limit_param)
                return https_fn.Response(
                    json.dumps({"error": "Invalid limit parameter, must be an integer"}),
                    status=400,
                    headers=get_cors_headers()
                )
        
        logger.info("Starting manual summary generation", limit=limit)
        
        # Generate summaries
        stats = generate_summaries_for_all_entities(limit=limit)
        
        duration = (time.time() - start_time) * 1000
        
        logger.info(
            "Manual summary generation completed",
            duration_ms=duration,
            **stats
        )
        logger.log_response(req.method, req.path, 200, duration)
        
        return https_fn.Response(
            json.dumps({
                "message": "Summary generation completed",
                "stats": stats,
                "duration_ms": duration
            }),
            status=200,
            headers=get_cors_headers()
        )
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "Error in manual summary generation",
            error=str(e),
            duration_ms=duration
        )
        logger.log_response(req.method, req.path, 500, duration)
        
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=get_cors_headers()
        )
