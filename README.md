# Neoori Backend API

Backend API for Neoori mobile application.

## Tech Stack

- **Node.js** + **Express** - Server framework
- **TypeScript** - Type safety
- **Prisma** - MySQL/MariaDB ORM (for authentication and critical data)
- **Mongoose** - MongoDB ODM (for flexible profile data)
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configurations
│   ├── models/          # Data models (Prisma & Mongoose)
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, error handling
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Prisma schema (MySQL)
├── uploads/             # Local file storage
└── package.json
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

### 3. Setup MySQL/MariaDB Database

Create a MySQL or MariaDB database:

```sql
CREATE DATABASE neoori;
```

**Note:** Prisma works with both MySQL and MariaDB. Use the `mysql` provider in Prisma schema for both.

### 4. Setup MongoDB

Make sure MongoDB is running on your system.

### 5. Run Prisma Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/reset` - Reset password
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-email/resend` - Resend verification email

### User Profile
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `PATCH /api/users/profile/preferences` - Update preferences

### Education
- `POST /api/users/profile/education` - Add education
- `PATCH /api/users/profile/education/:id` - Update education
- `DELETE /api/users/profile/education/:id` - Delete education

### Experiences
- `POST /api/users/profile/experiences` - Add experience
- `PATCH /api/users/profile/experiences/:id` - Update experience
- `DELETE /api/users/profile/experiences/:id` - Delete experience

### Skills
- `POST /api/users/profile/skills` - Add skill
- `PATCH /api/users/profile/skills/:id` - Update skill
- `DELETE /api/users/profile/skills/:id` - Delete skill

### Documents
- `POST /api/users/profile/documents` - Upload document
- `DELETE /api/users/profile/documents/:id` - Delete document
- `GET /api/files/documents/:userId/:category/:filename` - Download document

## Database Schema

### MySQL/MariaDB (Prisma) - Critical Data
- Users (authentication, core info)
- Sessions
- RefreshTokens
- PasswordResetTokens

### MongoDB (Mongoose) - Flexible Data
- UserProfiles (bio, location, education, experiences, skills, documents, preferences)

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Open Prisma Studio
npm run prisma:studio
```

## Environment Variables

See `.env.example` for all required environment variables.

## Notes

- Make sure MySQL/MariaDB and MongoDB are running before starting the server
- Prisma uses the `mysql` provider which is compatible with both MySQL and MariaDB
- The `uploads/` directory is used for local file storage (can be migrated to cloud storage later)
- JWT tokens expire after 15 minutes (access) and 7 days (refresh)

