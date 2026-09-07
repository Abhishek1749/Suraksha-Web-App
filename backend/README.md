# SURAKSHA backend (Spring Boot)

Java REST service that powers the SURAKSHA app: safety reports, emergency
contacts, risk zones, SOS incidents and the AI safety assistant.

- Spring Boot 3.4 · Java 21 · Maven
- Spring Data JPA + MySQL Connector/J (works with MySQL 8 and TiDB / TiDB Cloud)
- Runs on port `8081` by default

## Run it

```bash
cd backend

export MYSQL_URL="jdbc:mysql://localhost:3306/suraksha?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export MYSQL_USER="root"
export MYSQL_PASSWORD="yourpassword"
export LOVABLE_API_KEY="..."     # only needed for the AI assistant

mvn spring-boot:run
```

Tables are created automatically (`ddl-auto: update`) and helplines + risk
zones are seeded on first start.

### TiDB / TiDB Cloud

Same driver, only the URL changes:

```bash
export MYSQL_URL="jdbc:mysql://gateway01.<region>.prod.aws.tidbcloud.com:4000/suraksha?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3"
export MYSQL_USER="<prefix>.root"
export MYSQL_PASSWORD="<password>"
```

## Connect the frontend

In the project root, set the backend address and restart the dev server:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8081
```

Without this variable the app runs exactly as before (built-in data and the
JavaScript AI route), so nothing breaks when the Java service is not running.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/reports` | latest 50 crowd-sourced reports |
| POST | `/api/reports` | submit a report (`kind`, `risk`, `location`, `notes`, `attachments[]`) |
| GET | `/api/reports/stats` | reports in the last 30 days + total |
| GET | `/api/contacts` | helplines and trusted contacts |
| POST | `/api/contacts` | add / update a contact |
| DELETE | `/api/contacts/{id}` | remove a contact |
| GET | `/api/zones` | risk zones for the map |
| POST | `/api/sos` | trigger SOS, returns the incident with its timeline |
| GET | `/api/incidents/latest` | most recent incident + timeline |
| GET | `/api/incidents/{reference}` | one incident by reference |
| POST | `/api/assistant/chat` | AI safety assistant (`messages[{role, content}]`) |
| GET | `/actuator/health` | health check |

Allowed browser origins come from `CORS_ORIGINS` (comma separated).
