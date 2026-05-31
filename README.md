# Code Notes frontend

## Run with code-notes.net db
- make sure to setup the backend according to it's README.md
- create a `docker-compose.dev.override.yml` with
```services:
  frontend:
    build:
      args:
        BACKEND_PORT: 1111
    ports:
      - 1112:1112
```
- `docker compose -f 'docker-compose.dev.yml' -f 'docker-compose.dev.override.yml' up --build -d`

### Service repositories
- backend: <a href="https://github.com/flobbe9/code_notes_backend" target="_blank">https://github.com/flobbe9/code_notes_backend</a>
- gateway: <a href="https://github.com/flobbe9/code_notes_gateway" target="_blank">https://github.com/flobbe9/code_notes_gateway</a>