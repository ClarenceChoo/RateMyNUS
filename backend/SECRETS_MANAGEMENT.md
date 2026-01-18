# Firebase Secrets Management Guide

## Setting Up OpenAI API Key in Firebase

Firebase provides secure secret management through Google Cloud Secret Manager. Follow these steps:

### 1. Using Firebase CLI (Recommended)

```bash
# Set the secret
firebase functions:secrets:set OPENAI_API_KEY

# You'll be prompted to enter the API key value
# Paste your OpenAI API key when prompted

# List all secrets
firebase functions:secrets:access OPENAI_API_KEY

# Grant access to the secret (if needed)
firebase functions:secrets:access OPENAI_API_KEY --project ratemynus
```

### 2. Using Google Cloud Console

1. Go to Google Cloud Console → Secret Manager
2. Create a new secret named `OPENAI_API_KEY`
3. Add your OpenAI API key as the secret value
4. Grant access to your Cloud Functions service account

### 3. Accessing Secrets in Functions

Secrets are accessed as environment variables in your functions:

```python
import os

api_key = os.environ.get('OPENAI_API_KEY')
```

### 4. Declaring Secrets in Functions

In your function definitions, declare which secrets they need:

```python
from firebase_functions import https_fn

@https_fn.on_request(
    secrets=["OPENAI_API_KEY"]
)
def my_function(req):
    api_key = os.environ.get('OPENAI_API_KEY')
    # Use the API key
```

For scheduled functions:

```python
from firebase_functions import scheduler_fn

@scheduler_fn.on_schedule(
    schedule="0 6,18 * * *",
    secrets=["OPENAI_API_KEY"]
)
def generate_summaries(event):
    # Secret is available via environment variable
    pass
```

### 5. Deploy with Secrets

```bash
# Deploy functions (secrets are automatically injected)
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:trigger_summaries
firebase deploy --only functions:generate_summaries
```

### 6. Local Development

For local testing, create a `.env` file (DO NOT commit to git):

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API key
# Then load it in your terminal
export $(cat .env | xargs)

# Run emulator
firebase emulators:start
```

Add `.env` to `.gitignore`:
```
.env
*.env
```

### 7. Verify Secret Access

Check if secret is accessible:

```bash
firebase functions:log --only trigger_summaries
```

### 8. Update Secret Value

```bash
# Update the secret value
firebase functions:secrets:set OPENAI_API_KEY

# The change will take effect after redeploying functions
firebase deploy --only functions
```

### 9. Security Best Practices

- ✅ Use Secret Manager for production
- ✅ Never commit API keys to version control
- ✅ Rotate keys periodically
- ✅ Use least privilege access
- ✅ Monitor secret access logs
- ❌ Don't hardcode secrets in code
- ❌ Don't log secret values
- ❌ Don't expose secrets in error messages

### 10. Cost Considerations

- Secret Manager has a free tier (6 active secret versions)
- Secret access charges: $0.03 per 10,000 accesses
- Monitor usage in Google Cloud Console

## Additional Environment Variables

Other non-sensitive configuration can use environment variables:

```bash
# Set environment config
firebase functions:config:set openai.model="gpt-4o-mini"
firebase functions:config:set openai.max_tokens="200"

# Get config
firebase functions:config:get

# Access in code
import os
model = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
```

## Troubleshooting

### Secret not found error
- Ensure secret exists: `firebase functions:secrets:access OPENAI_API_KEY`
- Check function has secret declared in decorator
- Redeploy function after creating secret

### Permission denied
```bash
# Grant permissions to service account
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Local emulator can't access secrets
- Use `.env` file for local development
- Load environment variables before starting emulator
