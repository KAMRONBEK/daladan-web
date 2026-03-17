# Daladan Web

Daladan frontend built with React, TypeScript, and Vite.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file in project root:

```bash
VITE_API_BASE_URL=https://api.daladan.uz/api/v1
```

3. Start development server:

```bash
npm run dev
```

## API Documentation

- Swagger UI: [https://api.daladan.uz/api/documentation](https://api.daladan.uz/api/documentation)
- OpenAPI JSON: [https://api.daladan.uz/docs?api-docs.json](https://api.daladan.uz/docs?api-docs.json)

## Auth Integration

Base URL:

```text
https://api.daladan.uz/api/v1
```

Implemented auth endpoints:

- `POST /register?auth_type=password`
- `POST /login`

Register payload fields used by frontend:

- `phone` (string)
- `password` (string)
- `fname` (string)
- `lname` (string)
- `region_id` (number)
- `city_id` (number)
- `email` (optional string)
- `telegram` (optional string)

Login payload fields used by frontend:

- `phone` (string)
- `password` (string)

## Region and City Resources

Endpoints used for registration form selections:

- `GET /resources/regions`
- `GET /resources/cities`
- `GET /resources/cities?region_id={region_id}`

The registration form loads regions first, then loads cities for the selected region.
