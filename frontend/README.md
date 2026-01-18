# RateMyNUS Frontend

React-based frontend for RateMyNUS – a platform to rate and review NUS facilities, professors, and more.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **Auth & Backend**: Firebase

## Project Structure

```
frontend/
├── public/                # Static assets
└── src/
    ├── assets/            # Images, icons, etc.
    ├── components/        # Reusable UI components
    │   ├── ui/               # Base components (Button, Card, Input)
    │   ├── CategoryGrid.tsx
    │   ├── EntityFilters.tsx
    │   ├── Navbar.tsx
    │   ├── RatingStars.tsx
    │   └── SearchBar.tsx
    ├── config/            # App configuration
    │   ├── env.ts            # API endpoints & Firebase config
    │   ├── subratings.ts     # Subrating definitions by entity type
    │   └── tags.ts           # Tag definitions by entity type
    ├── data/              # Static seed data
    ├── features/          # Feature-based modules
    │   ├── entities/         # Entity listing, details, creation
    │   ├── modules/          # NUSMods integration
    │   └── reviews/          # Review form, list, voting
    ├── layouts/           # Page layouts
    │   ├── DashboardLayout.tsx
    │   └── RootLayout.tsx
    ├── lib/               # Utilities
    │   ├── firebase.ts       # Firebase initialization
    │   └── utils.ts          # Helper functions (cn, etc.)
    ├── pages/             # Route pages
    │   ├── Category.tsx      # Entity listing by type
    │   ├── CreateEntity.tsx  # Add new entity form
    │   ├── Entity.tsx        # Entity detail + reviews
    │   ├── Explore.tsx       # Browse all categories
    │   ├── Landing.tsx       # Home page
    │   └── WriteReview.tsx   # Review submission
    ├── providers/         # React context providers
    │   └── AuthProvider.tsx
    ├── routes/            # Router configuration
    │   └── router.tsx
    ├── styles/            # Global styles
    └── types/             # TypeScript type definitions
        └── index.ts
```

## Entity Types

The app supports 5 entity types:

| Type | Icon | Description |
|------|------|-------------|
| `PROFESSOR` | 👨‍🏫 | NUS professors and lecturers |
| `DORM` | 🏠 | Residential colleges and halls |
| `CLASSROOM` | 🏫 | Lecture theatres and tutorial rooms |
| `FOOD_PLACE` | 🍜 | Canteens and food stalls |
| `TOILET` | 🚻 | Campus toilets |

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Home page with top-rated entities |
| `/explore` | Explore | Browse all categories |
| `/c/:type` | Category | List entities by type (e.g., `/c/professor`) |
| `/entity/:entityId` | Entity | Entity details and reviews |
| `/create` | CreateEntity | Add a new entity |
| `/write/:id` | WriteReview | Write a review for an entity |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Opens at http://localhost:5173

### Build

```bash
npm run build
```

Output in `dist/` directory.

### Lint

```bash
npm run lint
```

## API Integration

The frontend connects to Firebase Cloud Functions:

| Endpoint | Description |
|----------|-------------|
| `GET /get-entities` | Fetch all entities |
| `POST /create-entity` | Create a new entity |
| `POST /create-review` | Submit a review |
| `GET /get-reviews` | Fetch reviews for an entity |
| `POST /vote-review` | Upvote a review |

See [backend README](../backend/README.md) for full API documentation.

## Features

- **Browse & Search**: Filter entities by type, zone, and search terms
- **Reviews**: Submit ratings with subratings and tags
- **Create Entities**: Add new professors, dorms, classrooms, etc.
- **Voting**: Upvote helpful reviews
- **Responsive**: Mobile-friendly design with Tailwind CSS

