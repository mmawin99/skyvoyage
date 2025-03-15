# SkyVoyage
A Final Project of CPE241 Database Systems course.
> SkyVoyage is a flight reservation platform with coverage more than 190 countries, over 500 airlines.
## Development
### Pre-requisites
- [Bun](https://bun.sh/)
- [Next.js](https://nextjs.org)
- MySQL
### Development
First, you need to install dependencies.
```bash
bun  install

```
> To run the development server, first ensure that you put the database URL in the `.env` file. Create `.env` or rename `.env.example` to `.env`, then configure your own database URL.
```env
DATABASE_URL=mysql://<your_database_user>:<your_database_password>@<your_database_host>:<your_database_port>/skyvoyage
```
Push your schema into mysql database.
```bash
bun prisma db push
```
then you need to generate prisma client
```bash
bun prisma generate
```

Finally, you can run project in development mode by typing these commands.

```bash
bun  dev
```

We're using Next.js as Frontend and Backend. so `bun dev` command will open a localhost server for both frontend and backend.