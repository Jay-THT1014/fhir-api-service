# Tia Asset Backend

A Node.js backend built with Express and PostgreSQL.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.x or higher)
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (ensure you have a `.env` file with your database credentials).

### Running the Application

- **Development Mode:** `npm run dev` (uses nodemon for hot-reloading)
- **Production Mode:** `npm start`

---

## 🏛️ Project Architecture

This application strictly enforces a **Layered Architecture**. To maintain a clean codebase, ensure that logic is placed in the correct layer:

1. **Routes (`/routes`)**: Defines the HTTP endpoints and maps them to controllers. _No business logic belongs here._
2. **Controllers (`/controllers`)**: Acts as the "traffic cop." Extracts data from the HTTP Request (`req.body`), passes it to the Service layer, and returns the HTTP Response. _No business or database logic belongs here._
3. **Services (`/services`)**: The heart of the application. All business logic, hashing, and third-party API integrations live here. _Services should know nothing about HTTP objects (req/res) or raw SQL._
4. **Repositories (`/repositories`)**: The database layer. All raw SQL queries and database connection logic live here. _Services call Repositories to fetch or save data._

---

## 📂 Folder Structure

```text
Tia-asset-backend/
├── config/             # Configuration files (e.g., db.js for Postgres pool)
├── controllers/        # HTTP Request/Response handlers
├── middleware/         # Express middlewares (e.g., auth, error handling)
├── repositories/       # Database access layer (Raw SQL queries)
├── routes/             # API Route definitions
├── services/           # Core business logic
├── tests/              # Test suites
│   ├── integration/    # HTTP route integration tests
│   └── unit/           # Isolated unit tests for services/repositories
├── utils/              # Reusable helper functions (logger, mailer, AppError)
├── app.js              # Express application setup & middleware configuration
└── index.js            # Server entry point (starts the server)
```

---

## 🧪 Testing

The project is scaffolded for both Unit and Integration testing.

- **Unit Tests** (`tests/unit/`): Test specific functions in isolation (e.g., mocking the database to test a service).
- **Integration Tests** (`tests/integration/`): Test the full HTTP request lifecycle by interacting with the Express `app` directly.

Run the full test suite with:

```bash
npm test
```

For coverage reports:

```bash
npm run test:cov
```
