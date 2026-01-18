# OpenAI Review Summary Feature

## Overview

Automatically generates concise summaries of entity reviews using OpenAI's GPT-4o-mini model. Summaries are stored in the `reviewSummary` field of each entity document.

## Features

1. **Scheduled Generation**: Automatically runs twice daily (6 AM & 6 PM SGT)
2. **Manual Trigger**: API endpoint for on-demand generation
3. **Configurable Prompts**: Template-based prompt management
4. **Secure Secrets**: Firebase Secret Manager integration
5. **Cost Control**: Configurable entity limits per run

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
pip install -r requirements.txt
```

This installs `openai==1.59.5` (compatible with existing dependencies).

### 2. Set Up OpenAI API Key

**Using Firebase CLI (Production):**
```bash
firebase functions:secrets:set OPENAI_API_KEY
# Paste your OpenAI API key when prompted
```

**For Local Development:**
```bash
# Copy example file
cp functions/.env.example functions/.env

# Edit .env and add your key
# OPENAI_API_KEY=sk-your-key-here
```

### 3. Configure Environment Variables

Edit `.env` or set via Firebase config:

```bash
OPENAI_MODEL=gpt-4o-mini           # Model to use
OPENAI_MAX_TOKENS=200              # Max tokens per summary
OPENAI_TEMPERATURE=0.3             # Creativity (0-2)
MAX_ENTITIES_PER_RUN=50            # Limit for cost control
```

### 4. Update Function Declarations

Add secret access to both functions in `scheduled/generate_summaries.py` and `api/trigger_summaries.py`:

```python
@scheduler_fn.on_schedule(
    schedule="0 6,18 * * *",
    secrets=["OPENAI_API_KEY"],  # Add this line
    # ... other config
)
```

```python
@https_fn.on_request(
    secrets=["OPENAI_API_KEY"],  # Add this line
    # ... other config
)
```

### 5. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:generate_summaries,trigger_summaries
```

## API Endpoints

### Manual Trigger

**Endpoint:** `/trigger_summaries`  
**Method:** GET/POST  
**Auth:** None (add authentication in production)

**Query Parameters:**
- `limit` (optional): Max entities to process

**Examples:**

```bash
# Process all entities
curl https://asia-southeast1-ratemynus.cloudfunctions.net/trigger_summaries

# Process first 10 entities
curl "https://asia-southeast1-ratemynus.cloudfunctions.net/trigger_summaries?limit=10"
```

**Response (200):**
```json
{
  "message": "Summary generation completed",
  "stats": {
    "success_count": 150,
    "error_count": 2,
    "skipped_count": 30
  },
  "duration_ms": 45230.5
}
```

## Scheduled Function

**Function:** `generate_summaries`  
**Schedule:** Twice daily at 6 AM and 6 PM Singapore Time  
**Cron:** `0 6,18 * * *`  
**Timezone:** Asia/Singapore

Automatically processes all entities (or up to `MAX_ENTITIES_PER_RUN` limit).

**View Logs:**
```bash
firebase functions:log --only generate_summaries
```

## Database Schema

### Entity Document (Updated)

```typescript
{
  id: string;
  name: string;
  type: string;
  avgRating: number;
  ratingCount: number;
  // ... other fields
  reviewSummary?: string;  // NEW: AI-generated summary
}
```

**Example Summary:**
```
"Students appreciate the clear teaching style and well-organized lectures, though 
some find the pace challenging. The professor is noted for being approachable 
during office hours and providing helpful feedback on assignments."
```

## Prompt Management

Prompts are configured in `functions/config/prompts.py`:

```python
SYSTEM_PROMPT = """You are a helpful assistant..."""

REVIEW_SUMMARY_PROMPT = """Summarize the following reviews for {entity_name}..."""

REVIEW_FORMAT = """Review {index} (Rating: {rating}/5):
{description}
Tags: {tags}
"""
```

**Customization:**
- Edit prompts without redeploying code
- Maintain consistency across summaries
- A/B test different prompt styles

## Model Selection

**Current Model:** `gpt-4o-mini`

**Why gpt-4o-mini?**
- Cost-effective: ~80% cheaper than GPT-4
- Fast: Lower latency
- Capable: Excellent for summarization tasks
- Token limit: 128K context window

**Cost Estimate (as of Jan 2026):**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- ~$0.002 per entity summary (200 tokens output)
- 182 entities = ~$0.36 per run
- 2 runs/day = ~$0.72/day = ~$22/month

**Alternative Models:**
- `gpt-3.5-turbo`: Cheaper but less capable
- `gpt-4o`: More expensive but higher quality

## Cost Control

### Per-Run Limits

Set `MAX_ENTITIES_PER_RUN` to limit processing:

```bash
# Via .env
MAX_ENTITIES_PER_RUN=50

# Via Firebase config
firebase functions:config:set limits.max_entities="50"
```

### Manual Trigger Limits

```bash
# Process only 10 entities
curl "https://[FUNCTION_URL]/trigger_summaries?limit=10"
```

### Monitoring Costs

1. Check OpenAI dashboard: https://platform.openai.com/usage
2. Set spending limits in OpenAI account
3. Monitor Cloud Functions logs for API call counts

## Error Handling

### No Reviews
- Returns: `"No reviews available yet."`
- No API call made

### API Failure
- Returns: `"Summary temporarily unavailable."`
- Error logged to Cloud Functions
- Entity processing continues

### Rate Limits
- OpenAI: 10,000 requests/min (Tier 1)
- Consider adding retry logic if needed

## Monitoring & Logs

### View Scheduled Function Logs
```bash
firebase functions:log --only generate_summaries --follow
```

### View API Trigger Logs
```bash
firebase functions:log --only trigger_summaries
```

### Key Log Events
- `Starting scheduled summary generation`
- `Summary generated successfully` (per entity)
- `Entity summary updated` (per entity)
- `Summary generation completed` (with stats)

### Check Summary Quality

Query entity with summary:
```bash
curl "https://asia-southeast1-ratemynus.cloudfunctions.net/get_entities?id=P001"
```

## Testing

### Local Testing

1. Set up `.env` file
2. Start emulator:
```bash
firebase emulators:start
```

3. Trigger manually:
```bash
curl "http://localhost:5001/ratemynus/asia-southeast1/trigger_summaries?limit=5"
```

### Production Testing

```bash
# Test with small limit first
curl "https://asia-southeast1-ratemynus.cloudfunctions.net/trigger_summaries?limit=1"

# Check entity was updated
curl "https://asia-southeast1-ratemynus.cloudfunctions.net/get_entities?id=P001"
```

## Troubleshooting

### Secret Not Found
```
Error: Secret OPENAI_API_KEY not found
```
**Solution:**
```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions
```

### OpenAI API Error
```
Error: Invalid API key
```
**Solution:** Verify key is correct and has credits

### Import Errors
```
ModuleNotFoundError: No module named 'openai'
```
**Solution:**
```bash
cd functions
pip install -r requirements.txt
```

### Timeout Errors
```
Function execution took too long
```
**Solution:** Reduce `MAX_ENTITIES_PER_RUN` or increase `timeout_sec`

## Best Practices

1. **Rate Limiting**: Set `MAX_ENTITIES_PER_RUN` to avoid timeouts
2. **Monitoring**: Regularly check OpenAI usage dashboard
3. **Prompt Updates**: Test prompt changes with small batches first
4. **Error Recovery**: Failed entities don't block others
5. **Cost Control**: Monitor spending, set OpenAI billing limits

## Security Considerations

1. ✅ API keys stored in Secret Manager
2. ✅ Never logged or exposed in responses
3. ✅ `.env` files gitignored
4. ⚠️ Add authentication to manual trigger endpoint
5. ⚠️ Consider rate limiting on trigger endpoint

## Future Enhancements

- [ ] Add authentication to manual trigger
- [ ] Implement retry logic for API failures
- [ ] Support for different summary lengths
- [ ] Multi-language summary generation
- [ ] Incremental updates (only changed entities)
- [ ] Summary quality metrics/monitoring
- [ ] A/B testing different prompts
- [ ] Batch processing optimization

## Support

For issues:
1. Check logs: `firebase functions:log`
2. Verify secrets: `firebase functions:secrets:access OPENAI_API_KEY`
3. Test with limit=1 first
4. Check OpenAI API status
5. Review SECRETS_MANAGEMENT.md for setup help
