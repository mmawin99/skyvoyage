# SkyVoyage
A Final Project of CPE241 Database Systems course.
> SkyVoyage is a flight reservation platform with coverage more than 190 countries, over 280 airlines.
## Development
### Pre-requisites
- [Bun](https://bun.sh/)
- [Next.js](https://nextjs.org)
- [Elysia.js](https://elysiajs.com)
- MySQL
### Start Development
> Now, We combine both frontend and backend into the same repository (not split folder for both anymore).

First You need to install dependencies with
```bash
bun install
```

And there you go, it installed successful.

> **Before you go to next step**, Create new `.env` file (at the same place as `.env.example` file, or just copy `.env.eaxmple` and renamed the copied file to `.env`) (For local testing, Latest environment variable is posted on our Discord, just copy and paste it at `.env` file.)

```env
BACKEND_URL="SET_BACKEND_URL_HERE"
DATABASE_URL="PUT_YOUR_DATABASE_URL_HERE"
JWT_SECRET="PUT_SECRET_KEY_HERE"
NEXTAUTH_SECRET="PUT_NEXTAUTH_SECRET_HERE"
```

> Next, install prisma client **(If using my aiven database, you can skip the schema push process)**

Before you install prisma client, you need to push schema to the database

```bash
bun prisma db push
```

next you need to generate prisma client

```bash
bun prisma generate
```

and Finally,

Run a development server.

```bash
bun dev
```