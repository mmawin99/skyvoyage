# SkyVoyage
A Final Project of CPE241 Database Systems course.
> SkyVoyage is a flight reservation platform with coverage more than 190 countries, over 280 airlines.
## Development
### Pre-requisites
- [Bun](https://bun.sh/)
- [Next.js](https://nextjs.org)
- [Elysia.js](https://elysiajs.com)
- MySQL
### Development
> We combine both frontend and backend in the same repository.

First You need to install dependencies with
```bash
bun install
```

And there you go, it installed successful.

Next, install prisma client **(If using my aiven database, you can skip the schema push process)**

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