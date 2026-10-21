# ENTMS - Employee and Task Management System

ENTMS is a MERN-stack application for maintaining employee records and assigning, tracking, and managing tasks. It provides a React/Vite frontend and an Express/Mongoose backend backed by MongoDB.

> Deployment status: **not verified**. Read the [Known limitations and deployment blockers](#known-limitations-and-deployment-blockers) section before deploying.

## Implemented features

- Employee creation, listing, viewing, editing, and deletion.
- Unique employee IDs and email addresses, department/status validation, and leave-date validation.
- Task creation, listing, viewing, editing, status updates, and deletion.
- Task IDs generated in the form `TSK-001`.
- Assignment eligibility checks for inactive employees, leave periods, and a maximum of three active tasks.
- Task status transitions and backend-generated completion dates.
- Task searching, filters, sorting, pagination, and URL query-string persistence.
- Dashboard totals for employees, tasks, task statuses, and overdue tasks.
- Employee information snapshots on tasks so task history can still display employee details after an eligible employee is deleted.

CSV export is not implemented. Although `json2csv` is listed in the backend dependencies, no export route is present.

## Technology stack

| Area | Technology found in this repository |
|---|---|
| Frontend | React 19, React Router, Vite, Axios |
| Backend | Node.js, Express 5, dotenv, cors |
| Database | MongoDB with Mongoose 9 |
| Development tools | ESLint, Nodemon |

## Project structure

```text
ENTMS/
+-- backend/
|   +-- config/db.js                 # MongoDB connection
|   +-- middleware/errorHandler.js   # Express error responses
|   +-- models/Employee.js
|   +-- models/Task.js
|   +-- routes/
|   |   +-- employeeRoutes.js
|   |   +-- taskRoutes.js
|   |   `-- dashboardRoutes.js
|   +-- utils/wrapAsync.js
|   +-- .env.example
|   +-- package.json
|   `-- server.js
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- services/api.js
|   |   `-- main.jsx
|   +-- .env.example
|   +-- package.json
|   `-- vite.config.js
`-- README.md
```

## Prerequisites

- Node.js and npm.
- A reachable MongoDB deployment or local MongoDB server.
- A MongoDB connection string for the backend.

The repository does not specify an exact Node.js version, so use a Node.js version compatible with the dependency versions declared in each `package.json`.

## Installation

Install dependencies separately in the backend and frontend directories:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

`npm install` is the normal setup command inferred from the checked-in `package.json` and lockfiles; it was not run as part of this documentation review.

## Backend setup

1. Create `backend/.env` based on `backend/.env.example`.
2. Set the required values without committing credentials.

```dotenv
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

### Backend environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `MONGO_URI` | Yes | MongoDB/Mongoose connection string. |
| `CLIENT_URL` | Recommended | The single frontend origin permitted by the configured CORS middleware. Defaults to `http://localhost:5173` if unset. |
| `PORT` | Optional | Express listener port. The server defaults to `8000` when this is unset. |

Start the backend:

```bash
cd backend
npm run dev
```

For a non-watch process:

```bash
cd backend
npm start
```

The available backend scripts are `start`, `dev`, and `test`. The current `test` script intentionally exits with an error and does not run a test suite.

## MongoDB configuration

The backend connects through `mongoose.connect(process.env.MONGO_URI)`. Supply a connection string that is reachable from the backend process and has permission to create/read/update/delete the application collections.

For managed MongoDB, ensure the deployment platform's outbound network address is permitted by the database network rules. Keep the connection string private by configuring `MONGO_URI` in the deployment platform's environment settings rather than in source control.

## Frontend setup

1. Create `frontend/.env` based on `frontend/.env.example`.
2. Configure the API base URL.

```dotenv
VITE_API_URL=http://localhost:8000/api
```

The shown local value matches the backend's default port and route prefix. If `PORT` is changed, update this value to use the same port. `VITE_API_URL` must include the `/api` suffix because frontend requests use paths such as `/tasks` and `/employee`.

Start the frontend:

```bash
cd frontend
npm run dev
```

Other available frontend scripts:

```bash
npm run lint
npm run build
npm run preview
```

`build` creates the Vite production output in `frontend/dist`; `preview` serves that output locally. The frontend has no configured development proxy.

## Run locally

Use two terminals.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open the URL printed by Vite. With the supplied backend CORS fallback, the frontend origin must be `http://localhost:5173` unless `CLIENT_URL` is set to the actual Vite origin.

## API reference

All API routes are mounted below `/api`. The employee route uses the singular path `/employee` as implemented.

### Employees

| Method | Endpoint | Behavior |
|---|---|---|
| `GET` | `/api/employee` | List all employees. |
| `GET` | `/api/employee/:id` | Return an employee by MongoDB ObjectId. |
| `POST` | `/api/employee` | Create an employee. |
| `PUT` | `/api/employee/:id` | Update an employee. |
| `DELETE` | `/api/employee/:id` | Delete an employee only when they have no `Todo` or `In Progress` tasks. |

Employee fields include `employeeId`, `fullname`, `email`, `phone`, `department`, `role`, `joining_date`, `status`, `skills`, `leave_start`, and `leave_end`.

### Tasks

| Method | Endpoint | Behavior |
|---|---|---|
| `GET` | `/api/tasks` | Return filtered, sorted, paginated tasks. |
| `GET` | `/api/tasks/:id` | Return a task by MongoDB ObjectId. |
| `POST` | `/api/tasks` | Create a task. The backend sets status to `Todo`. |
| `PUT` | `/api/tasks/:id` | Edit permitted task fields on a non-final task. |
| `PUT` | `/api/tasks/:id/status` | Apply a valid status transition. |
| `DELETE` | `/api/tasks/:id` | Delete a task. The current API permits deletion regardless of task status. |

Task creation requires `title`, `assignedEmployee`, `priority`, `startDate`, and `dueDate`; `description` is optional. The backend determines `department` from the assigned employee and records an employee snapshot.

#### Task list query parameters

| Parameter | Purpose |
|---|---|
| `page` | One-based page number; defaults to `1`. |
| `limit` | Items per page; defaults to `10`, maximum `100`. |
| `search` | Searches task title and employee name. |
| `department` | Filter by task department. |
| `priority` | Filter by priority. |
| `status` | Filter by task status. |
| `dueFrom` / `dueTo` | Inclusive due-date range. Invalid date values return `400`. |
| `sort` | `createdAt`, `dueDate`, `priority`, or `title`. |

### Dashboard

| Method | Endpoint | Behavior |
|---|---|---|
| `GET` | `/api/dashboard` | Return employee totals/by-status and task totals/by-status/overdue count. |

## Business rules and validation

### Employees

- Employee ID and email are unique.
- Email values are trimmed and lowercased by the schema.
- Valid departments are `Development`, `Design`, `QA`, `HR`, and `Sales`.
- Valid employee statuses are `Active`, `Inactive`, and `On Leave`.
- Leave start/end dates are required when status is `On Leave`.
- Leave start cannot be before joining date; leave end cannot be before leave start.
- Changing away from `On Leave` clears the stored leave dates.
- Deletion is blocked when the employee has an active (`Todo` or `In Progress`) task.

### Tasks

- Valid priorities are `Low`, `Medium`, `High`, and `Critical`.
- Valid task statuses are `Todo`, `In Progress`, `Completed`, and `Cancelled`.
- Due date cannot be earlier than start date.
- The assigned employee must exist. The task department is derived from that employee.
- Inactive employees cannot receive tasks.
- An employee on leave cannot receive a task whose start date is within their leave period, including the first and last leave dates.
- A maximum of three active (`Todo` or `In Progress`) tasks is checked for an employee. Task edits exclude the task being edited from that count.
- Completed and cancelled tasks cannot be edited through the task edit endpoint.

### Status transitions

| Current status | Permitted next status |
|---|---|
| `Todo` | `In Progress`, `Cancelled` |
| `In Progress` | `Completed`, `Cancelled` |
| `Completed` | None - terminal |
| `Cancelled` | None - terminal |

Status changes must use `PUT /api/tasks/:id/status`. When a task becomes `Completed`, the backend assigns `completedDate`; the frontend does not submit it.

### Overdue tasks

A task is considered overdue when its due date is earlier than the current date and its status is neither `Completed` nor `Cancelled`.

## Deployment considerations

### Backend

- Configure `MONGO_URI`, `CLIENT_URL`, and, if required by the host, `PORT` in the backend deployment environment.
- Start the backend with `npm start`.
- The configured CORS middleware accepts one origin only: `CLIENT_URL` (or its local fallback). Set it to the exact deployed frontend origin, including protocol.

### Frontend

- Configure `VITE_API_URL` at build time to the deployed backend API root, including `/api`; for example, `https://your-backend.example/api`.
- Build using `npm run build` and deploy the generated `frontend/dist` directory to a static host that supports the desired SPA routing behavior.
- Deployment-specific SPA rewrite rules are not present in this repository and must be verified/configured on the selected hosting platform.

### MongoDB

- Provision a reachable MongoDB instance and set its connection string as `MONGO_URI`.
- Configure database networking/firewall access for the backend host.
- Do not place credentials in `.env.example`, frontend build files, or the repository.

## Known limitations and deployment blockers

1. **The checked-in frontend environment example leaves `VITE_API_URL` empty.** There is no Vite proxy, so the frontend cannot reach the separately hosted backend until the value is configured.
2. **Port documentation is inconsistent.** `backend/.env.example` shows `PORT=5000`, while `backend/server.js` defaults to `8000` when `PORT` is absent. Choose one local/deployed port and configure both `PORT` and `VITE_API_URL` consistently.
3. **Deployment configuration has not been verified.** No platform configuration, production URL, DNS, MongoDB deployment, build output deployment, or production smoke test is included in the repository.
4. **Task ID generation and active-task counting are not atomic.** Concurrent task creation could produce a duplicate task ID or allow more than three active tasks before requests observe each other.
5. **Employee updates do not re-check existing active assignments.** Setting an employee inactive or changing leave dates can leave existing tasks inconsistent with assignment eligibility.
6. **Task reassignment is supported by the API but is not offered by the current task edit form.**
7. **No automated test suite is implemented.** The backend `test` script exits with an error.

## Verification performed for this README

This README was based on inspection of the checked-in backend/frontend `package.json` files, both `.env.example` files, Vite configuration, Express route files, Mongoose models, and the API client. No deployment, dependency installation, application code changes, configuration changes, or database operations were performed.
