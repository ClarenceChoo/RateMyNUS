from firebase_functions import https_fn
from utils.logger import logger


@https_fn.on_request()
def healthcheck(req: https_fn.Request) -> https_fn.Response:
    """Health check endpoint to verify API is running"""
    logger.log_request(req.method, req.path)
    logger.info("Health check successful", endpoint="healthcheck")
    
    return https_fn.Response("API is up and running", status=200)
