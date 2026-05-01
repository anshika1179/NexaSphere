# NexaSphere — GL Bajaj Group of Institutions, Mathura

Official website and community platform for NexaSphere.

**Live:** https://nexasphere-glbajaj.vercel.app
**Email:** nexasphere@glbajajgroup.org

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Primary API | Java 17 + Spring Boot 3 |
| Forms Service | Python 3.11 + FastAPI |
| Database | PostgreSQL (prod) / H2 (dev) |
| Hosting | Vercel (frontend), Railway/Render (backend) |
| Fonts | Orbitron · Rajdhani · Space Mono |

## Project Structure

- `src/`: React frontend
- `server-java/`: Spring Boot API
- `server-python/`: FastAPI forms service

## Local Development

### Prerequisites
- Node.js 20+
- Java 17+
- Python 3.11+

### Frontend
- `npm install`
- `npm run dev`

### Java API Server
- `cd server-java`
- `mvn spring-boot:run`

### Python Forms Server
- `cd server-python`
- `pip install -r requirements.txt`
- `uvicorn main:app --reload --port 8000`

## Environment Variables

### Java
- ADMIN_EMAIL
- ADMIN_PASSWORD
- DB_URL
- CORS_ORIGIN

### Python
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY
- GOOGLE_SHEET_ID
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Admin Dashboard

Access `/admin` to manage events, activity events, and core team members.

## Deployment

Deploy frontend on Vercel and backend services on Railway/Render/Fly.

## Contributing

Internal project — GL Bajaj NexaSphere core team only.
