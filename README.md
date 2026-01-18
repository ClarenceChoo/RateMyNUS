# RateMyNUS

> A student-driven rating platform for NUS professors, hostels, classrooms, canteens, and toilets.

[![Frontend Screenshot](./assets/frontend-screenshot.png)](https://ratemynus.com)

## Inspiration and Motivation

RateMyNUS takes inspiration from Rate My Professors. We recognise that both current and incoming students often have questions about different aspects of university life — and while NUS provides official descriptions (for example, of each hostel), students are often looking for more grounded insights from people with real experience. RateMyNUS is a student-driven rating platform where users can review and rate key parts of campus life. The five main categories are professors, classrooms, hostels, canteens, and as a fun bonus… toilets!

---

## What it does

RateMyNUS is a campus review platform that allows students to share ratings and written feedback across five main categories: **professors, classrooms, hostels, canteens, and toilets**.

Users can:
- Browse ratings and reviews to get a clearer picture of what to expect in different parts of NUS life  
- Search and filter entries to quickly find relevant information (e.g., a specific professor or hostel)  
- Submit their own reviews, rating multiple aspects and leaving comments based on personal experience  
- Compare options (such as different hostels or canteens) using community feedback rather than only official descriptions  

By collecting real student opinions in one place, RateMyNUS helps students make more informed decisions and feel more confident navigating university life.

---

## How we built it

### Professor reviews scraping + processing pipeline
We scraped module reviews from NUSMods using a Playwright-based scraper that navigates to each module page, opens the Reviews section, and extracts review text (including handling lazy-loading and cases where reviews are rendered inside an iframe).

These scraped reviews are then passed into an LLM pipeline, where the model’s job is to:
- extract the professor’s name (ignoring prefixes like “Prof.” / “Dr.”), and  
- summarise their teaching based on the review content.

Afterwards, we run a Python cleanup script to remove duplicate professor names, resolve misspellings, and reduce false positives using fuzzy matching. The cleaned output is written into a final JSON file for seeding and use in the application.

---

### Frontend
We built the frontend as a modern single-page application using **React 19 + TypeScript**, bundled with **Vite**, styled with **Tailwind CSS**, and routed using **React Router v7**. Authentication and backend integration are handled through **Firebase**.

The frontend supports 5 entity types:
**PROFESSOR, DORM, CLASSROOM, FOOD_PLACE, TOILET**, allowing users to explore categories, view entity pages, and submit reviews.

Core features include:
- browsing and filtering entities
- writing reviews with tags + subratings
- creating new entities
- upvoting helpful reviews
- responsive UI for mobile users

---

### Backend

A modern, AI-powered serverless backend built on Firebase Cloud Functions (Python 3.13) for rating and reviewing NUS entities including professors, canteens, dormitories, classrooms, and facilities.

🤖 AI-Powered Review Summarization

Integrates OpenAI's GPT-4o-mini to automatically generate intelligent summaries from student reviews
Runs twice daily via Cloud Scheduler (6 AM & 6 PM SGT) to keep summaries fresh
Manual API trigger available for on-demand processing

🔧 Smart Entity Management

Auto-generated entity IDs with type-specific prefixes (P001 for professors, T001 for toilets, etc.)
Intelligent indexing system that finds the next available ID
Comprehensive CRUD operations with proper validation

🔐 Production-Ready Architecture

Firebase Secret Manager integration for secure API key storage
2nd generation Cloud Functions with optimized memory allocation (512MB for AI tasks)
Region-optimized deployment (asia-southeast1) for low latency
Structured codebase with separation of concerns (api/, scheduled/, utils/, config/)

Tech Stack: Python 3.13, Firebase Functions, Firestore, OpenAI API, Cloud Scheduler

---

## Challenges we ran into

### Data processing
Professor names appear in many different formats (partial names, typos, titles, or inconsistent ordering), which made reliable name extraction difficult. We went through multiple iterations of our parsing and cleanup scripts—especially around fuzzy matching and name-variant handling—to minimise duplicates and wrongly identified names.

---

### Deployment and infrastructure issues
Because our backend relies on Firestore triggers, we ran into deployment friction such as Eventarc permission issues during first-time trigger setup. This required waiting for permission propagation or manually granting the correct Eventarc service roles before redeploying successfully.

We also had to be careful about common backend integration pitfalls such as:
- CORS handling for browser requests
- correct Firebase project configuration (`GOOGLE_CLOUD_PROJECT`)
- matching Python runtime versions during deployment

---

## Accomplishments that we're proud of
- **Built a complete end-to-end platform**: from data scraping + processing, to a full frontend experience and a deployed backend API.
- **Successfully extracted and cleaned professor data at scale**, turning messy, unstructured NUSMods review text into usable professor entries with summaries and deduplicated names.
- **Implemented a fully functional review ecosystem**, including:
  - creating entities (professors, dorms, classrooms, canteens, toilets)
  - submitting reviews with subratings + tags
  - upvoting helpful reviews
- **Designed a clean, responsive UI** that supports browsing, searching, and filtering across all 5 categories.
- **Automated rating updates** using Firestore triggers so entity average ratings and counts stay consistent whenever reviews change.

---

## What we learned
- **Data cleaning is harder than scraping**: extracting professor names reliably required multiple iterations due to inconsistent naming formats, typos, and false positives.
- **Backend design matters for UX**: having well-defined schemas for entities/reviews (with tags + subratings) made the frontend experience much smoother.
- **Firebase Cloud Functions deployment has real-world gotchas**, especially around:
  - CORS + preflight handling
  - permissions / Eventarc issues for Firestore triggers
  - keeping runtime + environment configs consistent
- **Frontend-backend integration requires careful coordination**, from route structure to API endpoint consistency.

---

## What's next for RateMyNUS
- **Improve professor matching accuracy** by linking professors to module codes more reliably and reducing remaining duplicate identities.
- **Add moderation + reporting tools** to prevent spam, abuse, and low-quality reviews.
- **Enhance discovery features**, such as:
  - better sorting (most helpful / highest rated / trending)
  - smarter filters (faculty, location, building)
  - personalized recommendations
- **Expand beyond ratings** with richer content like photos, tips, and “things to know before you choose this dorm/classroom”.
- **Stronger authentication and user profiles**, enabling review history, saved entities, and trusted reviewer badges.
