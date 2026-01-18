"""
Scheduled function to generate review summaries twice per day
Runs at 6 AM and 6 PM SGT (UTC+8)
"""
from firebase_functions import scheduler_fn
from utils.summarizer import generate_summaries_for_all_entities
from utils.logger import logger


@scheduler_fn.on_schedule(
    schedule="0 6,18 * * *",  # Runs at 6 AM and 6 PM daily (cron format)
    timezone="Asia/Singapore",
    secrets=["OPENAI_API_KEY"],  # Secret access declaration
    memory=512,  # Increased memory for processing multiple entities
    timeout_sec=540,  # 9 minutes (max is 540 for scheduled functions)
)
def generate_summaries(event: scheduler_fn.ScheduledEvent) -> None:
    """
    Scheduled function to generate summaries for all entities
    Runs twice daily at 6 AM and 6 PM Singapore time
    """
    logger.info("Starting scheduled summary generation")
    
    try:
        # Process all entities (no limit for scheduled runs)
        stats = generate_summaries_for_all_entities(limit=None)
        
        logger.info(
            "Scheduled summary generation completed",
            success_count=stats['success_count'],
            error_count=stats['error_count'],
            skipped_count=stats['skipped_count']
        )
        
    except Exception as e:
        logger.error(
            "Error in scheduled summary generation",
            error=str(e)
        )
        raise
