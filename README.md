# Incident Tracker Mini App

A full-stack web application designed for engineering teams to manage production incidents effectively. This project demonstrates a modern approach to building a robust incident management system with a focus on user experience and architectural simplicity.

## Project Structure

- **/backend**: Node.js + Express server with Prisma (SQLite). Located in `server/`.
- **/frontend**: React + Vite application with Tailwind CSS. Located in `client/`.

##  Setup & Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)

### 1. Backend Setup
The backend handles data persistence and API logic.

```bash
# Navigate to backend directory (named 'server')
cd server

# Install dependencies
npm install

# Initialize Database & Seed Data

npm run seed  # Custom script: "prisma migrate dev && node prisma/seed.js"
# OR manually:
# npx prisma migrate dev --name init
# node prisma/seed.js

# Start the Server
node index.js
```
The server will start on **http://localhost:3001**.
_Keep this terminal open._

### 2. Frontend Setup
The frontend provides the user interface.

```bash
# Open a new terminal and navigate to frontend directory (named 'client')
cd client

# Install dependencies
npm install

# Start Development Server
npm run dev
```
The application will be available at **http://localhost:5173**.

---

## API Overview

The backend provides a RESTful API for managing incidents.

### Endpoints

- **GET /api/incidents**
    - Fetches a paginated list of incidents.
    - **Query Params**:
        - `page`: Page number (default: 1)
        - `limit`: Items per page (default: 10)
        - `sort`: Field to sort by (default: 'createdAt')
        - `order`: 'asc' or 'desc'
        - `status`: Filter by status (OPEN, MITIGATED, RESOLVED)
        - `severity`: Filter by severity (SEV1-SEV4)
        - `search`: Search term for title/summary

- **POST /api/incidents**
    - Creates a new incident.
    - **Body**: `{ title, service, severity, status, owner, summary }`

- **GET /api/incidents/:id**
    - Retrieves details for a specific incident.

- **PATCH /api/incidents/:id**
    - Updates an existing incident.
    - **Body**: Partial incident object (e.g., `{ status: 'RESOLVED' }`).

---

## Design Decisions & Tradeoffs

### 1. Database: SQLite with Prisma
- **Decision**: Used SQLite instead of a cloud database (Postgres).
- **Reason**: Simplifies the review process. The reviewer can run the entire app locally without configuring external database credentials or Docker containers.
- **Tradeoff**: Not suitable for stateless cloud deployments (like Vercel) without persistent storage volume configuration.

### 2. Frontend Styling: Tailwind CSS
- **Decision**: Used Tailwind CSS for utility-first styling.
- **Reason**: Rapid development and consistent design system. It allows for a "Premium" look with easily adjustable color palettes (Dark/Light mode ready) without writing custom CSS files.
- **Tradeoff**: HTML classes can become verbose, though componentization in React mitigates this.

### 3. State Management: React Query (Mental Model)
- **Decision**: Used `useEffect` and local state for simplicity in this specific scope.
- **Tradeoff**: For a larger production app, I would use **TanStack Query** to handle caching, background refetching, and optimistic updates efficiently.

### 4. Validation: Zod
- **Decision**: Shared validation logic (potentially) and robust schema definition using Zod on both frontend (with React Hook Form) and backend.
- **Reason**: Ensures data integrity and type safety across the stack.

---

##  Future Improvements

If I had more time, I would implement the following:

1.  **Authentication & Authorization**: Integrate **Auth0** or **NextAuth** to track *who* created or resolved an incident.
2.  **Real-time Updates**: Use **Socket.io** to push updates to the dashboard instantly when a new incident is created, avoiding the need for manual refreshes.
3.  **Advanced Filtering**: Add date range pickers to filter incidents by occurrence time.
4.  **Audit Logs**: Create a history table to track every change made to an incident (e.g., "Status changed from OPEN to RESOLVED by Alice").
5.  **Interactive Charts**: Add a "Metrics" page using **Recharts** to visualize Mean Time to Resolution (MTTR) and incident volume by service.

---
**Author**: Aman Rao
