# Backend Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **MongoDB** (v6.0 or higher)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup MySQL Database

Create a MySQL database:

```sql
CREATE DATABASE neoori;
```

Or using MySQL command line:

```bash
mysql -u root -p
CREATE DATABASE neoori;
exit;
```

### 3. Setup MongoDB

Make sure MongoDB is running:

```bash
# On Windows (if installed as service, it should be running automatically)
# Or start manually:
mongod

# On macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# MySQL (Prisma)
DATABASE_URL="mysql://root:yourpassword@localhost:3306/neoori?schema=public"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/neoori"

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOADS_DIR=./uploads/documents
```

**Important:** Replace `yourpassword` with your MySQL root password.

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Run Database Migrations

```bash
npm run prisma:migrate
```

This will create all the tables in MySQL.

### 7. Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:3000`

## Verify Installation

1. Check health endpoint: `http://localhost:3000/health`
2. Should return: `{"success":true,"message":"Server is running",...}`

## Testing the API

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### MySQL Connection Error

- Check if MySQL is running
- Verify DATABASE_URL in `.env`
- Check MySQL user permissions

### MongoDB Connection Error

- Check if MongoDB is running: `mongosh` or `mongo`
- Verify MONGODB_URI in `.env`
- Check MongoDB logs

### Prisma Errors

- Run `npm run prisma:generate` again
- Check DATABASE_URL format
- Ensure database exists

## Next Steps

1. Update frontend `.env` with `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
2. Test the connection from the mobile app
3. Start developing!

