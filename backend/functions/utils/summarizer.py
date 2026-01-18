"""
Utility functions for generating review summaries using OpenAI
"""
import os
from openai import OpenAI
from firebase_admin import firestore
from config.prompts import (
    SYSTEM_PROMPT,
    REVIEW_SUMMARY_PROMPT,
    REVIEW_FORMAT,
    NO_REVIEWS_SUMMARY,
    ERROR_SUMMARY
)
from utils.logger import logger


def get_openai_client():
    """Initialize OpenAI client with API key from environment"""
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set")
    return OpenAI(api_key=api_key)


def format_reviews_for_prompt(reviews):
    """Format reviews into a readable text for the LLM"""
    formatted_reviews = []
    
    for idx, review in enumerate(reviews, 1):
        tags_str = ", ".join(review.get('tags', [])) if review.get('tags') else "None"
        formatted_review = REVIEW_FORMAT.format(
            index=idx,
            rating=review.get('rating', 0),
            description=review.get('description', ''),
            tags=tags_str
        )
        formatted_reviews.append(formatted_review)
    
    return "\n".join(formatted_reviews)


def generate_summary_with_openai(entity_data, reviews):
    """
    Generate a summary of reviews using OpenAI API
    
    Args:
        entity_data: Entity document data (dict)
        reviews: List of review documents (list of dicts)
    
    Returns:
        str: Generated summary text
    """
    if not reviews or len(reviews) == 0:
        return NO_REVIEWS_SUMMARY
    
    try:
        client = get_openai_client()
        
        # Model configuration (hardcoded for simplicity)
        model = 'gpt-4o-mini'
        max_tokens = 200
        temperature = 0.3
        
        # Format reviews for the prompt
        reviews_text = format_reviews_for_prompt(reviews)
        
        # Build the prompt
        prompt = REVIEW_SUMMARY_PROMPT.format(
            entity_name=entity_data.get('name', 'Unknown'),
            entity_type=entity_data.get('type', 'Unknown'),
            avg_rating=entity_data.get('avgRating', 0),
            review_count=len(reviews),
            reviews_text=reviews_text
        )
        
        logger.info(
            "Generating summary with OpenAI",
            entity_id=entity_data.get('id'),
            review_count=len(reviews),
            model=model
        )
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        summary = response.choices[0].message.content.strip()
        
        logger.info(
            "Summary generated successfully",
            entity_id=entity_data.get('id'),
            summary_length=len(summary)
        )
        
        return summary
        
    except Exception as e:
        logger.error(
            "Error generating summary with OpenAI",
            entity_id=entity_data.get('id'),
            error=str(e)
        )
        return ERROR_SUMMARY


def update_entity_summary(db, entity_id, summary):
    """
    Update entity document with generated summary
    
    Args:
        db: Firestore client
        entity_id: Entity document ID
        summary: Generated summary text
    """
    try:
        entities_ref = db.collection('entities')
        entities_ref.document(entity_id).update({
            'reviewSummary': summary
        })
        
        logger.info(
            "Entity summary updated",
            entity_id=entity_id
        )
        
    except Exception as e:
        logger.error(
            "Error updating entity summary",
            entity_id=entity_id,
            error=str(e)
        )
        raise


def generate_summaries_for_all_entities(limit=None):
    """
    Generate summaries for all entities in the database
    
    Args:
        limit: Optional maximum number of entities to process
    
    Returns:
        dict: Summary statistics (success_count, error_count, skipped_count)
    """
    db = firestore.client()
    entities_ref = db.collection('entities')
    reviews_ref = db.collection('reviews')
    
    # Get all entities
    query = entities_ref
    if limit:
        query = query.limit(limit)
    
    entities = query.stream()
    
    stats = {
        'success_count': 0,
        'error_count': 0,
        'skipped_count': 0
    }
    
    for entity_doc in entities:
        try:
            entity_id = entity_doc.id
            entity_data = entity_doc.to_dict()
            entity_data['id'] = entity_id
            
            # Get reviews for this entity
            reviews_query = reviews_ref.where('entityId', '==', entity_id).stream()
            reviews = [review.to_dict() for review in reviews_query]
            
            # Skip if no reviews
            if not reviews or len(reviews) == 0:
                logger.info("No reviews found, skipping", entity_id=entity_id)
                update_entity_summary(db, entity_id, NO_REVIEWS_SUMMARY)
                stats['skipped_count'] += 1
                continue
            
            # Generate summary
            summary = generate_summary_with_openai(entity_data, reviews)
            
            # Update entity
            update_entity_summary(db, entity_id, summary)
            
            stats['success_count'] += 1
            
        except Exception as e:
            logger.error(
                "Error processing entity",
                entity_id=entity_id if 'entity_id' in locals() else 'unknown',
                error=str(e)
            )
            stats['error_count'] += 1
            continue
    
    logger.info(
        "Summary generation completed",
        **stats
    )
    
    return stats
