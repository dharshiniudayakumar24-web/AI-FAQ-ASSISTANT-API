# AI FAQ Assistant API — Thunder Client Testing Guide

Base URL for every request:

```
http://localhost:5000
```

The server must be running first (`npm run dev`). You should see:

```
MongoDB connected
Server running on http://localhost:5000
```

## How to use this guide in Thunder Client

1. Open the Thunder Client extension in VS Code.
2. Click **New Request**.
3. Set the method (GET / POST / PUT / DELETE) and paste the URL.
4. For POST/PUT, open the **Body** tab -> choose **JSON** -> paste the JSON body.
5. For protected routes, open the **Headers** tab and add:
   - `Content-Type` -> `application/json` (for POST/PUT)
   - `Authorization` -> `Bearer <TOKEN>` (replace `<TOKEN>` with the token from login)
6. Click **Send**.
7. Save each request into a collection (e.g. "AI FAQ Assistant") so you can reuse tokens.

> Tip: In Thunder Client you can create an Environment and store `{{token}}` and `{{adminToken}}`, then use `Bearer {{token}}` in the header. See the "Variables" section at the end.

---

# PART A — Public endpoints (no token needed)

## Step 1 — Root route

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/` |

Expected response `200`:

```json
{
  "success": true,
  "message": "AI FAQ Assistant API is running",
  "version": "1.0.0",
  "health": "/health",
  "baseUrl": "/api"
}
```

## Step 2 — Health check

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/health` |

Expected response `200`:

```json
{
  "success": true,
  "message": "AI FAQ Assistant API is running"
}
```

## Step 3 — List public FAQs (empty at first)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/faqs` |

Expected response `200`:

```json
{
  "success": true,
  "count": 0,
  "faqs": []
}
```

## Step 4 — Search FAQs (empty query is allowed)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/faqs/search?q=python` |

Expected response `200`:

```json
{
  "success": true,
  "query": "python",
  "count": 0,
  "results": []
}
```

## Step 5 — List categories (empty at first)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/categories` |

Expected response `200`:

```json
{
  "success": true,
  "count": 0,
  "categories": []
}
```

---

# PART B — Authentication

## Step 6 — Register a normal user

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/auth/register` |
| Header | `Content-Type: application/json` |

Body (JSON):

```json
{
  "name": "Priya Sharma",
  "email": "priya@writeflow.com",
  "password": "securepassword123"
}
```

Expected response `201` (save the `token` value):

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "user": {
    "id": "6ab4cce94a45c8ab3f9fb67f",
    "name": "Priya Sharma",
    "email": "priya@writeflow.com",
    "role": "user"
  }
}
```

> Note: public registration always creates the `user` role.

Validation errors to expect if you send bad data (`400`): name < 2 chars, invalid email, password < 6 chars.

## Step 7 — Login as that user

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/auth/login` |
| Header | `Content-Type: application/json` |

Body (JSON):

```json
{
  "email": "priya@writeflow.com",
  "password": "securepassword123"
}
```

Expected response `200` (copy the `token` -> this is your **USER TOKEN**):

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "user": {
    "id": "6ab4cce94a45c8ab3f9fb67f",
    "name": "Priya Sharma",
    "email": "priya@writeflow.com",
    "role": "user"
  }
}
```

Wrong password returns `401` with `{"success":false,"message":"Invalid email or password"}`.

## Step 8 — Get own profile (protected)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/auth/profile` |
| Header | `Authorization: Bearer <USER TOKEN>` |

Expected response `200` with the user object (without password).

If you omit the header you get `401`:

```json
{ "success": false, "message": "Authentication token required" }
```

---

# PART C — Create the first admin (terminal, one time)

## Step 9 — Seed the admin account

In the VS Code terminal run:

```bash
npm run seed-admin
```

It uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`:
- email: `admin@example.com`
- password: `change_this_admin_password`

Expected output:

```
Admin account created.
```

(Running it again promotes/updates the existing account.)

## Step 10 — Login as admin

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/auth/login` |
| Header | `Content-Type: application/json` |

Body (JSON):

```json
{
  "email": "admin@example.com",
  "password": "change_this_admin_password"
}
```

Expected response `200`. Copy the `token` -> this is your **ADMIN TOKEN** (role will be `admin`).

---

# PART D — Admin setup (admin token required)

## Step 11 — List all users (admin)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/users` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

Expected response `200` with a `users` array. Copy Priya's `_id` for the next step.

## Step 12 — Promote Priya to content_creator (admin)

| Field | Value |
|-------|-------|
| Method | `PUT` |
| URL | `http://localhost:5000/api/users/<PRIYA_USER_ID>` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

Body (JSON):

```json
{
  "name": "Priya Sharma",
  "email": "priya@writeflow.com",
  "role": "content_creator"
}
```

Expected response `200`:

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": { "...": "...", "role": "content_creator" }
}
```

## Step 13 — Log in again as Priya to get a content_creator token

Repeat **Step 7**. The new token now carries `role: "content_creator"`. Copy it -> this is your **CREATOR TOKEN**.

## Step 14 — Create a category (admin)

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/categories` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

Body (JSON):

```json
{
  "name": "Configuration",
  "description": "Frequently asked questions about configuration"
}
```

Expected response `201`:

```json
{
  "success": true,
  "category": {
    "_id": "6ab4....",
    "name": "Configuration",
    "description": "Frequently asked questions about configuration"
  }
}
```

Copy the category `_id` -> this is your **CATEGORY_ID** (needed for FAQ creation and AI save).

## Step 15 — Update a category (admin)

| Field | Value |
|-------|-------|
| Method | `PUT` |
| URL | `http://localhost:5000/api/categories/<CATEGORY_ID>` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

Body (JSON):

```json
{
  "name": "Configuration & Setup",
  "description": "Setup and configuration guides"
}
```

Expected response `200` with the updated category.

---

# PART E — FAQ CRUD (content_creator or admin)

## Step 16 — Create a FAQ (content creator)

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/faqs` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <CREATOR TOKEN>` |

Body (JSON):

```json
{
  "question": "How do I configure custom category tags?",
  "answer": "Navigate to the settings panel, append keyword tags to the arrays, and save the schema.",
  "categoryId": "<CATEGORY_ID>",
  "tags": ["configuration", "tags", "setup"],
  "isPublic": true
}
```

Expected response `201` with `faq`. Copy the FAQ `_id` -> this is your **FAQ_ID**.

> Setting `isPublic: true` makes it visible to anonymous users. `false` keeps it visible only to the owner and admins.

## Step 17 — Get all public FAQs (no token)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/faqs` |

Now returns the FAQ you created (public ones).

## Step 18 — Get your own FAQs (protected)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/faqs/mine` |
| Header | `Authorization: Bearer <CREATOR TOKEN>` |

Returns only FAQs created by the logged-in user.

## Step 19 — Get one FAQ by id (public)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/faqs/<FAQ_ID>` |

Returns the FAQ and increments its `views` counter.

## Step 20 — Search FAQs

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/faqs/search?q=configure` |

Expected response `200` with matching results.

## Step 21 — Update a FAQ (owner or admin)

| Field | Value |
|-------|-------|
| Method | `PUT` |
| URL | `http://localhost:5000/api/faqs/<FAQ_ID>` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <CREATOR TOKEN>` |

Body (JSON) — all fields optional:

```json
{
  "answer": "Updated: go to Settings, add tag keywords, then save.",
  "tags": ["configuration", "tags"],
  "isPublic": true
}
```

Expected response `200` with the updated FAQ.

## Step 22 — Delete a FAQ (owner or admin)

| Field | Value |
|-------|-------|
| Method | `DELETE` |
| URL | `http://localhost:5000/api/faqs/<FAQ_ID>` |
| Header | `Authorization: Bearer <CREATOR TOKEN>` |

Expected response `200`:

```json
{
  "success": true,
  "message": "FAQ deleted successfully"
}
```

> Create a fresh FAQ (Step 16) if you want to keep one for the AI save test below.

---

# PART F — AI endpoints (protected)

## Step 23 — Generate a FAQ with Gemini (admin / content_creator)

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/ai/generate-faq` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <CREATOR TOKEN>` |

Body (JSON):

```json
{
  "prompt": "Explain Mongoose schema indexing for beginners"
}
```

Expected response `201` with a stored `generatedFAQ`. Copy its `_id` -> this is your **GENERATED_ID**.

## Step 24 — List AI-generated FAQs (admin / content_creator)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/ai/generated` |
| Header | `Authorization: Bearer <CREATOR TOKEN>` |

Returns your generated FAQs (admins see all).

## Step 25 — Save a generated FAQ into the FAQ collection

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/ai/generated/<GENERATED_ID>/save` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <CREATOR TOKEN>` |

Body (JSON):

```json
{
  "categoryId": "<CATEGORY_ID>",
  "tags": ["mongoose", "indexing"],
  "isPublic": true
}
```

Expected response `201` with the new `faq` and the updated `generatedFAQ` (status `saved`).

## Step 26 — Ask the AI a question (any authenticated user)

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/ai/answer` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <USER TOKEN or CREATOR TOKEN or ADMIN TOKEN>` |

Body (JSON):

```json
{
  "question": "What is a REST API?"
}
```

Expected response `200`:

```json
{
  "success": true,
  "question": "What is a REST API?",
  "answer": "A REST API is ...",
  "contextUsed": 0
}
```

> `contextUsed` is the number of public FAQs used as context. It is higher when your question matches existing FAQs.

---

# PART G — Feedback

## Step 27 — Submit feedback on a FAQ (authenticated)

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/api/feedback` |
| Header | `Content-Type: application/json` |
| Header | `Authorization: Bearer <USER TOKEN>` |

Body (JSON):

```json
{
  "faqId": "<FAQ_ID>",
  "helpful": true,
  "comment": "This answered my question."
}
```

Expected response `201` with the `feedback` document.

## Step 28 — View all feedback (admin)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/feedback` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

Expected response `200` with a `feedback` array.

---

# PART H — Admin-only extras & cleanup

## Step 29 — Get all FAQs including private (admin)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:5000/api/faqs/admin/all` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

Returns every FAQ regardless of `isPublic`.

## Step 30 — Delete a user (admin)

| Field | Value |
|-------|-------|
| Method | `DELETE` |
| URL | `http://localhost:5000/api/users/<USER_ID>` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

> You cannot delete the currently logged-in admin account (`400`).

## Step 31 — Delete a category (admin)

| Field | Value |
|-------|-------|
| Method | `DELETE` |
| URL | `http://localhost:5000/api/categories/<CATEGORY_ID>` |
| Header | `Authorization: Bearer <ADMIN TOKEN>` |

Expected response `200`.

---

# Error responses to expect

| Status | When |
|--------|------|
| `400` | Validation failed (missing/invalid fields) |
| `401` | Missing/invalid/expired token, wrong login |
| `403` | Valid token but wrong role, or viewing a private FAQ you don't own |
| `404` | Route or resource not found |
| `409` | Duplicate email or category name |
| `429` | Rate limit exceeded (200 requests / 15 min) |
| `500` | Server/database error |

---

# Thunder Client variables (optional, recommended)

1. Open Thunder Client -> **Env** -> **New Environment** (e.g. `local`).
2. Add variables:

```
baseUrl        http://localhost:5000
token          <paste USER TOKEN here>
adminToken     <paste ADMIN TOKEN here>
creatorToken   <paste CREATOR TOKEN here>
categoryId     <paste CATEGORY_ID here>
faqId          <paste FAQ_ID here>
generatedId    <paste GENERATED_ID here>
```

3. Switch the active environment to `local` (top-right environment selector).
4. Now requests look like:

```
GET  {{baseUrl}}/api/faqs
POST {{baseUrl}}/api/faqs        Header: Authorization: Bearer {{creatorToken}}
PUT  {{baseUrl}}/api/users/<id>  Header: Authorization: Bearer {{adminToken}}
```

This lets you paste a token once and reuse it everywhere.

---

# Quick reference (all endpoints)

| # | Method | Endpoint | Access | Body |
|---|--------|----------|--------|------|
| 1 | GET | `/` | Public | – |
| 2 | GET | `/health` | Public | – |
| 3 | GET | `/api/faqs` | Public (optional auth) | – |
| 4 | GET | `/api/faqs/search?q=` | Public (optional auth) | – |
| 5 | GET | `/api/categories` | Public | – |
| 6 | POST | `/api/auth/register` | Public | name, email, password |
| 7 | POST | `/api/auth/login` | Public | email, password |
| 8 | GET | `/api/auth/profile` | Auth | – |
| 9 | GET | `/api/users` | Admin | – |
| 10 | PUT | `/api/users/:id` | Admin | name, email, role |
| 11 | DELETE | `/api/users/:id` | Admin | – |
| 12 | POST | `/api/categories` | Admin | name, description |
| 13 | PUT | `/api/categories/:id` | Admin | name, description |
| 14 | DELETE | `/api/categories/:id` | Admin | – |
| 15 | POST | `/api/faqs` | Admin / Creator | question, answer, categoryId, tags[], isPublic |
| 16 | GET | `/api/faqs/mine` | Auth | – |
| 17 | GET | `/api/faqs/:id` | Public (optional auth) | – |
| 18 | PUT | `/api/faqs/:id` | Owner / Admin | question, answer, categoryId, tags[], isPublic |
| 19 | DELETE | `/api/faqs/:id` | Owner / Admin | – |
| 20 | GET | `/api/faqs/admin/all` | Admin | – |
| 21 | POST | `/api/ai/generate-faq` | Admin / Creator | prompt |
| 22 | POST | `/api/ai/generated/:id/save` | Admin / Creator | categoryId, tags[], isPublic |
| 23 | GET | `/api/ai/generated` | Admin / Creator | – |
| 24 | POST | `/api/ai/answer` | Auth | question |
| 25 | POST | `/api/feedback` | Auth | faqId, helpful, comment |
| 26 | GET | `/api/feedback` | Admin | – |