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
cd skyvoyage_backend
bun install
cd ..
```
To run the backend development server, Ensure that `.env` file on folder `skyvoyage_backend` contains your database URL.
If file `.env` isn't exist on your backend folder, Create new one.
Or you can copy file `.env.example` and rename it into `.env`.
```env
DATABASE_URL="mysql://<your_database_user>:<your_database_password>@<your_database_host>:<your_database_port>/skyvoyage"
```
Push your schema into mysql database.
```bash
cd skyvoyage_backend
bun prisma db push
```

then you need to generate prisma client
```bash
cd skyvoyage_backend
bun prisma generate
```

Run backend

```bash
cd skyvoyage_backend
bun dev
```