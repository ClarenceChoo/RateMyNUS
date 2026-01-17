# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions.options import set_global_options
from firebase_admin import initialize_app

# Import all API endpoints
from api.health import healthcheck
from api.entities import get_entities
from api.reviews import create_review
from api.get_reviews import get_reviews
from api.delete_review import delete_review
from api.vote_review import vote_review

# Import Firestore triggers
from triggers.update_rating import update_entity_rating

# For cost control, you can set the maximum number of containers that can be
# running at the same time. This helps mitigate the impact of unexpected
# traffic spikes by instead downgrading performance. This limit is a per-function
# limit. You can override the limit for each function using the max_instances
# parameter in the decorator, e.g. @https_fn.on_request(max_instances=5).
set_global_options(
    max_instances=10,           # Max concurrent instances for cost control
    region="asia-southeast1",   # Singapore region for low latency in SEA
    memory=256,                 # Memory per instance (MB) - adjust based on needs
    timeout_sec=60,             # Function timeout in seconds
    min_instances=0,            # Scale to zero when not in use (cost-effective)
)

initialize_app()
