# Blog API (Express + MongoDB + JWT)

## Quick start

1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. `npm run dev` (requires nodemon) or `npm start`

## Deploy
- Push to GitHub and use Render, Railway or similar.
- Set environment variables in hosting panel.
- Use MongoDB Atlas for database.
- Replace `utils/emailMock.js` with a real mailer in production.

API endpoints: `/api/auth`, `/api/users`, `/api/posts`, `/api/comments`
