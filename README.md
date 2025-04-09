# SkyVoyage
A Final Project of CPE241 Database Systems course.
> SkyVoyage is a flight reservation platform with coverage more than 190 countries, over 500 airlines.
## Development
### Pre-requisites
- [Bun](https://bun.sh/)
- [Next.js](https://nextjs.org)
- [Elysia.js](https://elysiajs.com)
- MySQL
### Development

#### Frontend
First, you need to install dependencies for frontend.
`Windows Frontend`
```bash
cd frontend
bun install
cd ..
```
To run the frontend development server, Ensure that `.env` file on folder `frontend` contains your backend URL.
```env
BACKEND_URL="http://localhost:4000"
```

Run frontend
```bash
cd frontend
bun dev
```

#### Backend
`Windows Backend`
```bash
cd backend
bun install
cd ..
```
To run the backend development server, Ensure that `.env` file on folder `backend` contains your database URL.
If file `.env` isn't exist on your backend folder, Create new one.
Or you can copy file `.env.example` and rename it into `.env`.
```env
DATABASE_URL="mysql://<your_database_user>:<your_database_password>@<your_database_host>:<your_database_port>/skyvoyage"
JWT_SECRET="<SECRET_CODE_FOR_JWT_TOKEN_ENCRYPTION>"
```
Push your schema into mysql database.
```bash
cd backend
bun prisma db push
```

then you need to generate prisma client
```bash
cd backend
bun prisma generate
```

Run backend

```bash
cd backend
bun dev
```

#### Additional
To make SkyVoyage operate smoothly, please run the Backend before running the Frontend. 

By default, the Backend is set to run on port 4000. **No configuration is required on the Frontend.** Some parts of the Frontend are **hardcoded** for API routes (will be fixed later).

You need to create 2 terminals in VS Code to run the Frontend and Backend separately.