# RateMyNUS Firebase Backend

Backend service for RateMyNUS built with Firebase Cloud Functions (Python 3.13) and Firestore.

**Base URL**: `https://asia-southeast1-ratemynus.cloudfunctions.net`

## Features

- ✅ Entity management (Canteens, Dorms, Classrooms, Professors, Toilets)
- ✅ Review system with ratings and subratings
- ✅ Automatic rating aggregation
- ✅ AI-powered review summaries (OpenAI GPT-4o-mini)
- ✅ Scheduled summary updates (2x daily)
- ✅ Vote system for reviews
- ✅ CORS support for web clients

## Tech Stack

- **Runtime**: Python 3.13
- **Framework**: Firebase Functions for Python
- **Database**: Firestore
- **Region**: asia-southeast1 (Singapore)

## Project Structure

```
backend/
├── data/                  # Seed data JSON files
│   ├── canteen.json          # 16 canteens
│   ├── dorm.json             # 16 dorms
│   ├── classroom.json        # 39 classrooms
│   ├── professor.json        # 100 professors
│   ├── toilet.json           # 11 toilets
│   ├── professor-reviews.json # 30 professor reviews
│   └── toilet-reviews.json    # 30 toilet reviews
├── scripts/               # Data seeding scripts
└── functions/
    ├── api/              # API endpoints
    │   ├── health.py
    │   ├── entities.py       # Get entities
    │   ├── create_entity.py  # Create entity
    │   ├── delete_entity.py  # Delete entity
    │   ├── reviews.py        # Create review
    │   ├── get_reviews.py    # Get reviews
    │   ├── delete_review.py  # Delete review
    │   ├── vote_review.py    # Vote on review
    │   └── trigger_summaries.py # Manual summary generation
    ├── scheduled/        # Scheduled functions
    │   └── generate_summaries.py # Auto summary generation (2x daily)
    ├── triggers/         # Background triggers
    │   └── update_rating.py  # Auto-update entity ratings
    ├── config/           # Configuration
    │   └── prompts.py        # AI prompt templates
    └── utils/
        ├── logger.py         # Logging utility
        └── summarizer.py     # OpenAI summary generation
```

## Database Overview

**Total Entities**: 182

### Entity Types & ID Formats
- **CANTEEN**: C01 - C16 (16 items)
- **DORM**: D01 - D16 (16 items)
- **CLASSROOM**: CR001 - CR039 (39 items)
- **PROFESSOR**: P001 - P100 (100 items)
- **TOILET**: T001 - T011 (11 items)

### Entity Schema
```typescript
{
  id: string;              // Auto-generated (e.g., P001, T001, C01)
  name: string;
  type: 'CANTEEN' | 'DORM' | 'CLASSROOM' | 'PROFESSOR' | 'TOILET';
  avgRating: number;       // 0-5, auto-calculated
  ratingCount: number;     // Auto-calculated
  description?: string;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  reviewSummary?: string;  // AI-generated summary (updated 2x daily)
  createdAt: string;       // ISO 8601 timestamp
}
```

### Review Schema
```typescript
{
  id: string;              // Auto-generated document ID
  uuid: string;            // UUID v4
  entityId: string;        // Entity ID (e.g., P001, C01)
  authorName: string;
  rating: number;          // 0-5
  description: string;
  tags?: string[];
  subratings?: {           // Type-specific ratings (0-5 each)
    // CANTEEN: taste, valueForMoney, portionSize, hygiene, waitingTime
    // DORM: roomCondition, cleanliness, facilities, community, valueForMoney
    // CLASSROOM: comfort, visibility, audioClarity, ventilation, powerAndWifi
    // PROFESSOR: clarity, engagement, approachability, fairness, organisation
    // TOILET: cleanliness, smell, maintainence, privacy, accessibility
  };
  voteCount: number;       // Upvotes count
  createdAt: string;       // ISO 8601 timestamp
}
```

## API Endpoints

All endpoints support CORS and return JSON responses.

### Health Check

```
GET /healthcheck
```

**Response (200):**
```json
{
  "status": "healthy",
  "message": "RateMyNUS API is running",
  "timestamp": "2026-01-18T10:00:00.000Z"
}
```

---

### Get Entities

```
GET /get_entities
GET /get_entities?id=C01
GET /get_entities?type=PROFESSOR
GET /get_entities?limit=50
```

**Query Parameters:**
- `id` (optional): Get specific entity by ID
- `type` (optional): Filter by entity type
- `limit` (optional): Max results (default: 300)

**Response (200):**
```json
{
  "count": 182,
  "entities": [
    {
      "id": "P001",
      "name": "Dr. Sarah Chen",
      "type": "PROFESSOR",
      "avgRating": 4.5,
      "ratingCount": 12,
      "description": "Teaches algorithms and data structures",
      "tags": ["CS2040S", "CS3230"],
      "location": {
        "latitude": 1.2947,
        "longitude": 103.7734
      },
      "createdAt": "2026-01-17T10:00:00.000Z"
    }
  ]
}
```

---

### Create Entity

```
POST /create_entity
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Dr. John Tan",
  "type": "PROFESSOR",
  "description": "Teaches software engineering",
  "tags": ["CS2103T", "CS3219"],
  "location": {
    "latitude": 1.2947,
    "longitude": 103.7734
  }
}
```

**Required Fields:**
- `name` (string)
- `type` (string): CANTEEN | DORM | CLASSROOM | PROFESSOR | TOILET

**Optional Fields:**
- `description` (string)
- `tags` (string[])
- `location` (object with latitude/longitude)

**ID Auto-Generation:**
- PROFESSOR → P001, P002, P003...
- TOILET → T001, T002, T003...
- CANTEEN → C01, C02, C03...
- DORM → D01, D02, D03...
- CLASSROOM → CR001, CR002, CR003...

**Response (201):**
```json
{
  "id": "P101",
  "name": "Dr. John Tan",
  "type": "PROFESSOR",
  "avgRating": 0.0,
  "ratingCount": 0,
  "createdAt": "2026-01-18T10:00:00.000Z"
}
```

---

### Delete Entity

```
DELETE /delete_entity?id=P025
```

**Query Parameters:**
- `id` (required): Entity ID to delete

**Response (200):**
```json
{
  "message": "Entity deleted successfully",
  "id": "P025",
  "name": "Dr. Sarah Chen",
  "type": "PROFESSOR"
}
```

**Error (404):**
```json
{
  "error": "Entity with ID 'P025' not found"
}
```

---

### Create Review

```
POST /create_review
Content-Type: application/json
```

**Request Body:**
```json
{
  "entityId": "P001",
  "authorName": "Anonymous",
  "rating": 5,
  "description": "Excellent professor! Clear explanations.",
  "tags": ["engaging", "helpful"],
  "subratings": {
    "clarity": 5,
    "engagement": 5,
    "approachability": 4,
    "fairness": 5,
    "organisation": 4
  }
}
```

**Required Fields:**
- `entityId` (string): Entity ID
- `authorName` (string)
- `rating` (number): 0-5
- `description` (string)

**Optional Fields:**
- `tags` (string[])
- `subratings` (object): Type-specific ratings (0-5)

**Subratings by Type:**
- **CANTEEN**: taste, valueForMoney, portionSize, hygiene, waitingTime
- **DORM**: roomCondition, cleanliness, facilities, community, valueForMoney
- **CLASSROOM**: comfort, visibility, audioClarity, ventilation, powerAndWifi
- **PROFESSOR**: clarity, engagement, approachability, fairness, organisation
- **TOILET**: cleanliness, smell, maintainence, privacy, accessibility

**Response (201):**
```json
{
  "message": "Review created successfully",
  "review": {
    "id": "abc123xyz",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "entityId": "P001",
    "authorName": "Anonymous",
    "rating": 5,
    "description": "Excellent professor!",
    "tags": ["engaging", "helpful"],
    "subratings": { "clarity": 5, "engagement": 5 },
    "voteCount": 0,
    "createdAt": "2026-01-18T10:00:00.000Z"
  }
}
```

**Note**: Entity's avgRating and ratingCount are automatically updated via Firestore trigger.

---

### Get Reviews

```
GET /get_reviews?entityId=P001
```

**Query Parameters:**
- `entityId` (required): Entity ID

**Response (200):**
```json
{
  "entityId": "P001",
  "count": 5,
  "reviews": [
    {
      "id": "abc123",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "entityId": "P001",
      "authorName": "Anonymous",
      "rating": 5,
      "description": "Great professor!",
      "tags": ["clear", "helpful"],
      "subratings": { "clarity": 5 },
      "voteCount": 3,
      "createdAt": "2026-01-18T10:00:00.000Z"
    }
  ]
}
```

Reviews are sorted by newest first (createdAt descending).

---

### Vote on Review

```
POST /vote_review?id=review_doc_id
```

**Query Parameters:**
- `id` (required): Review document ID

**Response (200):**
```json
{
  "message": "Vote added successfully",
  "review": {
    "id": "abc123",
    "voteCount": 4
  }
}
```

---

### Delete Review

```
DELETE /delete_review?id=review_doc_id
```

**Query Parameters:**
- `id` (required): Review document ID

**Response (200):**
```json
{
  "message": "Review deleted successfully",
  "id": "abc123"
}
```

**Note**: Entity ratings are automatically recalculated when a review is deleted.

---

### Generate Review Summaries

```
GET /trigger_summaries
GET /trigger_summaries?limit=10
```

**Query Parameters:**
- `limit` (optional): Max entities to process

**Description:**
Manually triggers AI-generated summary generation for all entity reviews using OpenAI's GPT-4o-mini. Summaries are stored in the `reviewSummary` field of each entity.

**Note:** Summaries are also automatically generated twice daily (6 AM & 6 PM SGT) via scheduled function.

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

**Example Entity with Summary:**
```json
{
  "id": "P001",
  "name": "Dr. Sarah Chen",
  "type": "PROFESSOR",
  "avgRating": 4.5,
  "ratingCount": 12,
  "reviewSummary": "Students appreciate the clear teaching style and well-organized lectures. The professor is noted for being approachable during office hours and providing helpful feedback on assignments.",
  ...
}
```

**Setup Required:**
See `SUMMARY_FEATURE.md` for OpenAI API key configuration.

---

## Error Responses

All endpoints return consistent error formats:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (entity/review doesn't exist)
- `405` - Method Not Allowed
- `409` - Conflict (entity already exists)
- `500` - Internal Server Error

---

## CORS

All endpoints support CORS with these headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

OPTIONS preflight requests are handled automatically.

---

## Rate Limiting

Functions are configured with:
- **Max Instances**: 10 concurrent
- **Memory**: 256MB per instance
- **Timeout**: 60 seconds

---

## Data Seeding

Scripts are available in `/backend/scripts/` for populating test data. See scripts directory for usage.

---

## Support

For API issues or questions, contact the development team or check the Firebase Console logs.
```
GET /get_entities?type=CANTEEN
GET /get_entities?type=DORM
GET /get_entities?type=CLASSROOM
GET /get_entities?type=PROFESSOR
GET /get_entities?type=TOILET
```

**Limit results (default: 300):**
```
GET /get_entities?limit=50
```

**Response format:**
```json
{
  "count": 182,
  "entities": [
    {
      "id": "C01",
      "name": "The Deck",
      "type": "CANTEEN",
      "avgRating": 4.2,
      "ratingCount": 15,
      "description": "Popular canteen in FASS with diverse food options",
      "tags": ["No Aircon", "FASS", "Halal Options"],
      "location": {
        "latitude": 1.295053,
        "longitude": 103.771760
      },
      "createdAt": "2026-01-17T16:17:38+08:00"
    }
  ]
}
```

#### Create Entity

**Create a new entity with auto-generated ID:**
```
POST /create_entity
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "Dr. Sarah Chen",
  "type": "PROFESSOR",
  "description": "Teaches advanced algorithms and machine learning",
  "tags": ["CS3230", "CS4242", "algorithms"],
  "location": {
    "latitude": 1.2947,
    "longitude": 103.7734
  }
}
```

**Required fields:**
- `name` (string) - Entity name
- `type` (string) - Entity type: CANTEEN, DORM, CLASSROOM, PROFESSOR, TOILET

**Optional fields:**
- `description` (string) - Entity description
- `tags` (array) - Tags for the entity
- `location` (object) - GeoPoint with latitude and longitude

**ID Generation:**
IDs are automatically generated based on type:
- PROFESSOR: P001, P002, P003...
- TOILET: T001, T002, T003...
- CANTEEN: C01, C02, C03...
- DORM: D01, D02, D03...
- CLASSROOM: CR001, CR002, CR003...

**Success Response (201):**
```json
{
  "id": "P101",
  "name": "Dr. Sarah Chen",
  "type": "PROFESSOR",
  "description": "Teaches advanced algorithms and machine learning",
  "tags": ["CS3230", "CS4242"],
  "location": {
    "latitude": 1.2947,
    "longitude": 103.7734
  },
  "avgRating": 0.0,
  "ratingCount": 0,
  "createdAt": "2026-01-18T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Missing required fields or invalid entity type
- `500` - Server error

#### Delete Entity

**Delete an entity:**
```
DELETE /delete_entity?id=P025
```

**Query parameters:**
- `id` (required) - Entity ID to delete

**Success Response (200):**
```json
{
  "message": "Entity deleted successfully",
  "id": "P025",
  "name": "Dr. John Doe",
  "type": "PROFESSOR"
}
```

**Error Responses:**
- `400` - Missing ID parameter
- `404` - Entity not found
- `500` - Server error

### Reviews

#### Create Review

**Create a new review:**
```
POST /create_review
Content-Type: application/json
```

**Request body:**
```json
{
  "authorName": "Bob",
  "description": "Very nice and tasty! The chicken rice is excellent.",
  "entityId": "C01",
  "rating": 4,
  "tags": ["halal", "affordable"],
  "subratings": {
    "taste": 5,
    "valueForMoney": 4,
    "portionSize": 4,
    "hygiene": 5,
    "waitingTime": 3
  }
}
```

**Required fields:**
- `authorName` (string) - Name of the review author
- `description` (string) - Review text
- `entityId` (string) - ID of the entity being reviewed (e.g., C01, D05, CR012)
- `rating` (integer, 0-5) - Rating value between 0 and 5

**Optional fields:**
- `tags` (array of strings) - Tags for the review
- `subratings` (object) - Entity-type-specific subratings (0-5 each)
- `moduleCode` (string) - Required for PROFESSOR reviews (e.g., "CS2040S")

**Subratings by Entity Type:**
- **CANTEEN/FOOD_PLACE**: taste, valueForMoney, portionSize, hygiene, waitingTime
- **DORM**: roomCondition, cleanliness, facilities, community, valueForMoney
- **CLASSROOM**: comfort, visibility, audioClarity, ventilation, powerAndWifi
- **PROFESSOR**: clarity, engagement, approachability, fairness, organisation
- **TOILET**: cleanliness, smell, maintenance, privacy, accessibility

**Success Response (201):**
```json
{
  "message": "Review created successfully",
  "review": {
    "id": "abc123xyz",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "authorName": "Bob",
    "description": "Very nice and tasty!",
    "entityId": "C01",
    "rating": 4,
    "tags": ["halal", "affordable"],
    "subratings": {
      "taste": 5,
      "valueForMoney": 4
    },
    "voteCount": 0,
    "createdAt": "2026-01-17T00:00:00+08:00"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid data
- `404` - Entity with specified ID not found
- `405` - Method not allowed (use POST)
- `500` - Server error

#### Get Reviews

**Get reviews for an entity:**
```
GET /get_reviews?entityId=C01
```

**Query parameters:**
- `entityId` (required) - The entity ID to get reviews for


### Export Entities

Export all entities to a JSON file:
```bash
cd backend/scripts
source ../.venv/bin/activate
GOOGLE_CLOUD_PROJECT=ratemynus python export_entities.py
```

Output will be saved to `backend/data/entities_export_<timestamp>.json`
**Response:**
```json
{
  "entityId": "C01",
  "count": 3,
  "reviews": [
    {
      "id": "abc123",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "authorName": "Bob",
      "description": "Very nice and tasty!",
      "entityId": "C01",
      "rating": 4,
      "tags": ["halal", "affordable"],
      "subratings": {
        "taste": 5,
        "valueForMoney": 4
      },
      "voteCount": 5,
      "createdAt": "2026-01-17T12:30:45.123Z"
    }
  ]
}
```

Reviews are ordered by newest first (createdAt descending).

#### Vote on Review

**Add a vote to a review:**
```
POST /vote_review?id=review_doc_id
```

**Query parameters:**
- `id` (required) - The review document ID to vote on

**No request body needed.**

**Response:**
```json
{
  "message": "Vote added successfully",
  "review": {
    "id": "abc123",
    "voteCount": 6,
    ...
  }
}
```

#### Delete Review

**Delete a review:**
```
DELETE /delete_review?id=review_doc_id
```

**Query parameters:**
- `id` (required) - The review document ID to delete

**Response:**
```json
{
  "message": "Review deleted successfully",
  "id": "abc123"
}
```

### CORS Support

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *` (configurable)
- `Access-Control-Allow-Methods: GET, POS
- `500` - Server error

### CORS Support

All endpoints support CORS with the following headers:
## Firestore Triggers

### Auto-Update Entity Ratings

**Function**: `update_entity_rating`  
**Trigger**: Firestore document write (create/update/delete) on `reviews/{reviewId}`

This background function automatically recalculates entity ratings whenever a review is created, updated, or deleted:

1. Extracts `entityId` from the review document
2. Queries all reviews for that entity
3. Calculates average rating and review count
4. Updates the entity document with `avgRating` and `ratingCount`

**Deployment:**
```bash
firebase deploy --only functions:update_entity_rating
```

**First-Time Setup:**

When deploying Firestore triggers for the first time, you may encounter an Eventarc permission error. Wait 5-10 minutes for permissions to propagate, then redeploy.

If the error persists, manually grant permissions:

```bash
# Get your project number
gcloud projects describe ratemynus --format="value(projectNumber)"

# Grant Eventarc Service Agent role (replace PROJECT_NUMBER)
gcloud projects add-iam-policy-binding ratemynus \
  --member="serviceAccount:service-PROJECT_NUMBER@gcp-sa-eventarc.iam.gserviceaccount.com" \
  --role="roles/eventarc.serviceAgent"

# Enable required APIs
gcloud services enable eventarc.googleapis.com
gcloud services enable eventarcpublishing.googleapis.com
```

**Monitoring:**

View trigger logs:
```bash
firebase functions:log --only update_entity_rating
```

The function logs:
- Review creation/update/deletion events
- Entity rating calculations
- Update confirmations with new avgRating and ratingCount- `Access-Control-Allow-Origin: *` (configurable)
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Data Seeding

The project includes seed scripts to populate Firestore with initial data.

### Entity ID Prefixes
- **Canteens**: `C01` - `C16` (16 canteens)
- **Dorms**: `D01` - `D16` (16 dormitories)
- **Classrooms**: `CR001` - `CR039` (39 classrooms)
- **Professors**: `P001` - `P100` (100 professors)
- **Toilets**: `T001` - `T011` (11 toilets)

**Total Entities**: 182

### Seed Entities

**Seed Canteens:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/seed_canteen.py
```

**Seed Dorms:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/seed_dorm.py
```

**Seed Classrooms:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/seed_classroom.py
```

**Seed Professors:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/seed_professor.py
```

**Seed Toilets:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/seed_toilet.py
```

### Seed Reviews

**Seed Professor Reviews (30 reviews):**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/seed_professor_reviews.py
```

**Seed Toilet Reviews (30 reviews):**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/seed_toilet_reviews.py
```

### Delete Operations

**Delete All Entities:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/delete_entities.py
```
⚠️ **Warning**: Requires typing "DELETE" to confirm.

**Delete Professors Only:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/delete_professors.py
```

**Delete Toilets Only:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/delete_toilets.py
```

**Delete Toilet Reviews:**
```bash
cd functions
GOOGLE_CLOUD_PROJECT=ratemynus python ../scripts/delete_toilet_reviews.py
```

## Logging

The backend uses structured logging that integrates with Google Cloud Logging.

### Usage in Code

```python
from utils.logger import logger

# Basic logging
logger.info("Message", key="value")
logger.warning("Warning message")
logger.error("Error occurred", error=exception)

# HTTP request/response logging
logger.log_request("GET", "/api/entities", user_id="123")
loggFirestore Indexes

The project requires a composite index for querying reviews. Deploy it with:

```bash
firebase deploy --only firestore:indexes
```

**Configured indexes** (in `firestore.indexes.json`):
- `reviews` collection: `entityId` (ASCENDING) + `createdAt` (DESCENDING)

### er.log_response("GET", "/api/entities", 200, duration_ms=45.2)

# Firestore operations
logger.log_firestore_operation("query", "entities", limit=10)
```

### Log Levels
- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARNING**: Warning messages
- **ERROR**: Error messages with exception details
- **CRITICAL**: Critical issues

### View Logs

**Firebase Console:**
```bash
firebase functions:log
firebase functions:log --only get_entities
firebase functions:log --follow
```

**Google Cloud Console:**
Navigate to Cloud Functions → Select function → Logs tab

## Writing Cloud Functions

Functions are organized in the `functions/api/` directory by feature.

### Adding a New Endpoint

1. **Create a new file** in `functions/api/`:
```python
# functions/api/reviews.py
from firebase_functions import https_fn
from firebase_admin import firestore
import json
from utils.logger import logger

def get_cors_headers():
    """Return CORS headers"""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    }

@https_fn.on_request()
def get_reviews(req: https_fn.Request) -> https_fn.Response:
    """Get reviews from Firestore"""
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204, headers=get_cors_headers())
    
    logger.log_request(req.method, req.path)
    
    # Your logic here
    
    return https_fn.Response(
        json.dumps({"reviews": []}),
        status=200,
        headers=get_cors_hwritten(document="reviews/{reviewId}")
def on_review_written(event: firestore_fn.Event):
    """Trigger when a review is created, updated, or deleted"""
    before = event.data.before  # Document before change
    after = event.data.after    # Document after change
    
    if after and after.exists:
        # Document was created or updated
        review_data = after.to_dict()
        entity_id = review_data.get('entityId')
        # Process the review
    elif before and before.exists:
        # Document was deleted
        review_data = before.to_dict()
        entity_id = review_data.get('entityId')
        # Handle deletion
```

**Available Firestore Triggers:**
- `@firestore_fn.on_document_created()` - Only on creation
- `@firestore_fn.on_document_updated()` - Only on updates
- `@firestore_fn.on_document_deleted()` - Only on deletion
- `@firestore_fn.on_document_written()` - All operations (create/update/delete)unctions/main.py
from api.reviews import get_reviews
```

3. **Deploy**:
```bash
firebase deploy --only functions:get_reviews
```

### Basic HTTP Function Example

```python
from firebase_functions import https_fn
from firebase_admin import initialize_app

initialize_app()

@https_fn.on_request()
def hello_world(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello from RateMyNUS!")
```

### Firestore Query Example

```python
from firebase_admin import firestore

db = firestore.client()
docs = db.collection('entities').where('type', '==', 'Canteen').limit(10).stream()

entities = []
for doc in docs:
    data = doc.to_dict()
    data['id'] = doc.id
    entities.append(data)
```

### Firestore Trigger Example

```python
from firebase_functions import firestore_fn
from firebase_admin import firestore

@firestore_fn.on_document_created(document="reviews/{reviewId}")
def on_review_created(event: firestore_fn.Event):
    # Handle new review creation
    review_data = event.data.to_dict()
    # Process the review
    pass
```

## Configuration

### Global Options

The project uses global options configured in `functions/main.py`:

```python
from firebase_functions.options import set_global_options

set_global_options(
    max_instances=10,           # Max concurrent instances for cost control
    region="asia-southeast1",   # Singapore region for low latency in SEA
    memory=256,                 # Memory per instance (MB)
    timeout_sec=60,             # Function timeout in seconds
    min_instances=0,            # Scale to zero when not in use (cost-effective)
)
```

### Function-specific Options

You can override global settings per function:

```python
@https_fn.on_request(
    max_instances=5,
    memory=512,
    region="asia-southeast1"
)
def resource_intensive_function(req):
    # Function code
    pass
```

### Region Configuration

Functions are deployed to **asia-southeast1** (Singapore) for optimal performance in Southeast Asia.

**Available regions:**
- `asia-southeast1` (Singapore)
- `asia-southeast2` (Jakarta)
- `asia-east1` (Taiwan)
- `asia-northeast1` (Tokyo)

### Firebase Project

Set your active Firebase project:
```bash
firebase use ratemynus
```

View current project:
```bash
firebase use
```

## Testing

### Manual Testing with curl

**Health check:**
```bash
curl https://asia-southeast1-ratemynus.cloudfunctions.net/healthcheck
```

**Get all entities:**
```bash
curl https://asia-southeast1-ratemynus.cloudfunctions.net/get_entities
```

**Get specific entity:**
```bash
curl https://asia-southeast1-ratemynus.cloudfunctions.net/get_entities?id=C01
```

**Filter by type:**
```bash
curl "https://asia-southeast1-ratemynus.cloudfunctions.net/get_entities?type=Canteen"
```

### Local Testing with Emulator

```bash
# Start emulator
firebase emulators:start

# Test locally (replace PROJECT_ID with your project)
curl http://localhost:5001/PROJECT_ID/asia-southeast1/healthcheck
curl http://localhost:5001/PROJECT_ID/asia-southeast1/get_entities
```

### Unit Tests

```bash
cd functions
python -m pytest tests/
```

8. **Eventarc Permission Errors**: When deploying Firestore triggers
   - Wait 5-10 minutes for automatic permission propagation
   - Or manually grant Eventarc Service Agent role (see Firestore Triggers section)
   - Enable required APIs: eventarc.googleapis.com, eventarcpublishing.googleapis.com

### Integration Tests

Use the Firebase Emulator Suite for integration testing:

```bash
firebase emulators:exec --only functions "pytest tests/integration"
```

## Monitoring and Logs

### View Logs in Firebase Console
```bash
firebase functions:log
```

### View Specific Function Logs
```bash
firebase functions:log --only <function_name>
```

### Real-time Logs
```bash
firebase functions:log --follow
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
   ```bash
   cd functions
   uv pip install -r requirements.txt
   ```

2. **Permission Errors**: Check Firebase project permissions and authentication
   ```bash
   firebase login --reauth
   ```

3. **Deployment Failures**: Check logs with `--debug` flag
   ```bash
   firebase deploy --only functions --debug
   ```

4. **Python Version Mismatch**: Verify Python version matches `firebase.json`
   ```bash
   python3 --version  # Should be 3.13+
   ```

5. **CORS Errors**: Ensure CORS headers are properly set in responses
   - Check `get_cors_headers()` function in API files
   - Handle OPTIONS preflight requests

6. **Firestore Connection Issues**: Set GOOGLE_CLOUD_PROJECT environment variable
   ```bash
   export GOOGLE_CLOUD_PROJECT=ratemynus
   ```

7. **Seed Script Errors**: Run from the functions directory with project ID
   ```bash
   cd functions
   GOOGLE_CLOUD_PROJECT=ratemynus uv run python ../scripts/seed_canteen.py
   ```

### Delete All Functions

To remove all deployed functions:
```bash
firebase functions:delete healthcheck get_entities --force
```

### View Function URLs

```bash
firebase functions:list
```

## Environment Variables

Set environment variables using Firebase configuration:

```bash
firebase functions:config:set someservice.key="THE API KEY"
```

Access in code:
```python
import os
api_key = os.environ.get('SOMESERVICE_KEY')
```

## Security

- Never commit sensitive data (API keys, credentials)
- Use Firebase Functions Config for secrets
- Implement proper authentication and authorization
- Follow least privilege principle for Firebase Admin SDK

## Performance Tips

1. **Minimize Cold Starts**: Keep functions warm with scheduled pings
2. **Optimize Dependencies**: Only include necessary packages
3. **Use Connection Pooling**: Reuse database connections
4. **Set Appropriate Timeouts**: Configure based on function needs
5. **Monitor Memory Usage**: Adjust memory allocation as needed

## Resources

- [Firebase Functions Python Documentation](https://firebase.google.com/docs/functions/python)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Cloud Functions Best Practices](https://cloud.google.com/functions/docs/bestpractices)

## Support

For issues or questions:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review project issues on GitHub
3. Contact the development team

## License

[Add your license information here]
