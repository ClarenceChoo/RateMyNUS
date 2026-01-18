# OpenAI Review Summary Prompt Template

# System prompt for the AI to follow
SYSTEM_PROMPT = """You are a helpful assistant that summarizes student reviews for university entities.
Your summaries should be:
- Concise (2-3 sentences maximum)
- Balanced (mention both positives and negatives)
- Factual (based only on the reviews provided)
- Neutral in tone
"""

# Main prompt template for review summarization
REVIEW_SUMMARY_PROMPT = """Summarize the following reviews for {entity_name} ({entity_type}).

Entity Details:
- Name: {entity_name}
- Type: {entity_type}
- Average Rating: {avg_rating}/5
- Total Reviews: {review_count}

Reviews:
{reviews_text}

Provide a concise 2-3 sentence summary that captures the main sentiment and common themes from these reviews. Focus on the most frequently mentioned aspects."""

# Template for formatting individual reviews
REVIEW_FORMAT = """Review {index} (Rating: {rating}/5):
{description}
Tags: {tags}
"""

# Fallback summary when no reviews exist
NO_REVIEWS_SUMMARY = "No reviews available yet."

# Fallback summary when API fails
ERROR_SUMMARY = "Summary temporarily unavailable."
