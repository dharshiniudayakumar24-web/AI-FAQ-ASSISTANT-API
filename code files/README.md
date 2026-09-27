# AI FAQ Assistant API

Backend-only REST API for an AI FAQ Assistant.

## Architecture

Client -> API Gateway/Express -> Middleware -> Controllers -> Services -> MongoDB

Gemini is called from the AI service layer.

The design follows the supplied ER diagram:
- User -> FAQ = 1:N
- Category -> FAQ = 1:N
- FAQ -> FAQTag = 1:N
- Tag -> FAQTag = 1:N
- User -> AI Generated FAQ = 1:N
- FAQ -> Answer Feedback = 1:N
- Search results are a logical result of FAQ search, not a separate collection.

## Roles

- admin: full system access
- content_creator: create/edit/delete owned FAQs and generate/save AI FAQs
- user: view/search public FAQs, generate AI-assisted answers, view own profile
- public user: view/search public FAQs only

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env`.

Set:
- MONGO_URI
- JWT_SECRET
- GEMINI_API_KEY

A MongoDB local database can use:
`mongodb://127.0.0.1:27017/ai_faq_assistant`

## 3. Start

```bash
npm run dev
```

or

```bash
npm start
```

## 4. Main endpoints

### Public
GET `/health`
POST `/api/auth/register`
POST `/api/auth/login`
GET `/api/faqs/mine` (authenticated user's own FAQs)
GET `/api/faqs/admin/all` (admin only)
GET `/api/faqs`
GET `/api/faqs/search?q=python`
GET `/api/faqs/:id`
GET `/api/categories`

### Authenticated
GET `/api/auth/profile`
POST `/api/ai/answer`
POST `/api/feedback`

### Admin
GET `/api/users`
PUT `/api/users/:id`
DELETE `/api/users/:id`
POST `/api/categories`
PUT `/api/categories/:id`
DELETE `/api/categories/:id`
GET `/api/feedback`
GET `/api/ai/generated`

### Admin / Content Creator
POST `/api/faqs`
PUT `/api/faqs/:id`
DELETE `/api/faqs/:id`
POST `/api/ai/generate-faq`
POST `/api/ai/generated/:id/save`
GET `/api/ai/generated`

## Example register body

```json
{
  "name": "Jaya Sri",
  "email": "jaya@example.com",
  "password": "12345678",
  "role": "content_creator"
}
```

Public registration always creates the `user` role. To create the first admin, put
`ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and run:

```bash
npm run seed-admin
```

Content creators can be assigned by an admin through `PUT /api/users/:id`.

## Example create category

```json
{
  "name": "Python",
  "description": "Frequently asked questions about Python programming"
}
```

## Example create FAQ

Use:

Authorization: `Bearer YOUR_JWT_TOKEN`

```json
{
  "question": "What is Python?",
  "answer": "Python is a high-level programming language known for readable syntax.",
  "categoryId": "CATEGORY_ID",
  "tags": ["python", "programming"],
  "isPublic": true
}
```

## Example AI FAQ generation

POST `/api/ai/generate-faq`

```json
{
  "prompt": "Explain Python lists for beginners"
}
```

## Example save generated FAQ

POST `/api/ai/generated/GENERATED_ID/save`

```json
{
  "categoryId": "CATEGORY_ID",
  "tags": ["python", "lists", "beginner"],
  "isPublic": true
}
```

## Search

GET `/api/faqs/search?q=python list`

This version uses keyword-based relevance over question, answer and tags. It is intentionally simple and offline-friendly apart from the Gemini API call.

For a later advanced version, MongoDB Atlas Vector Search + embeddings can be added for true semantic similarity.

## Important

Do not upload `.env` or your Gemini API key to GitHub.


# API Flow

The system is now:

Postman / Thunder Client / any HTTP client
        ↓
Express REST API
        ↓
JWT / Validation / Authorization
        ↓
Controllers
        ↓
Services
        ↓
MongoDB + Gemini AI
