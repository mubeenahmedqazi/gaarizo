# Gaarizo - DevOps cheat sheet

## Build and run

```bash
# build the image
docker build -t gaarizo-app:1.0 .

# run only the app container (needs a reachable DATABASE_URL in .env)
docker run -d --name gaarizo-app --env-file .env -p 80:3000 gaarizo-app:1.0

# app + PostgreSQL together (recommended)
docker compose up -d --build
```

`.env` must contain `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (see `.env.example`). Compose points the app at the `db` container, overriding any Neon `DATABASE_URL`.

## Inspect

```bash
docker compose ps                 # container status / health
docker compose logs -f app        # follow app logs (migrations, seed, server)
docker compose logs db
docker images                     # list images
docker volume ls                  # list volumes (pgdata)
docker volume inspect gaarizo_pgdata
curl http://localhost/api/health
```

## Database shell

```bash
docker exec -it gaarizo-db psql -U gaarizo -d gaarizo
# inside psql:  \dt    SELECT email, role FROM "User";    \q
```

## Stop

```bash
docker compose down        # stops and removes containers, KEEPS the database volume
```

> **Never use `docker compose down -v`** - it deletes the `pgdata` volume and all data.

## Selenium test

```bash
pip install -r selenium-tests/requirements.txt
python selenium-tests/test_app.py http://localhost          # or: APP_URL=http://<ec2-ip> python ...
```

Watch it run in a visible browser (1.5s pause between checks):

```bash
python test_app.py http://<url> --headed
```

Prints PASS/FAIL per check, saves `home.png` and `cars.png`, exits 1 if anything fails.
