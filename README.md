# TaskFlow - JWT Authentication Demo

This project is a demonstration of a robust, secure, and modern JWT (JSON Web Token) authentication system for a SaaS application, built as a response to a system design and live coding interview prompt.

It features a **React/Redux frontend** and a **Node.js/Express backend**, orchestrated with **Docker Compose** for easy, one-command setup. The implementation focuses on security best practices, including `httpOnly` cookies, refresh token rotation, and graceful session management in a Single-Page Application (SPA).

## 1. How to Run the Project

This project is fully containerized, ensuring a consistent and simple setup process.

**Prerequisites:**

- Docker
- Docker Compose

if you don't want to use docker then it's fine just follow the same steps for copying env files then go to server run `npm install` then `npm run prisma:generate` `npm run prisma:migrate` then `npm run dev`
for web `cd web` `npm install` `npm run dev`

### Step 1: Clone the Repository

### Step 2: Create Environment File

Copy the example environment file for the backend. The default values are configured to work with Docker Compose out of the box.

```bash
cp server/.env.example server/.env
cp web/.env.example web/.env
```

### Step 3: Build and Run with Docker Compose

This single command will build the Docker images, start all services, and automatically run the database migrations and seeds.

```bash
docker-compose up --build
```

### Step 4: Access the Application

Once the containers are running, the application will be available:

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 2. Core Features & Implementation Choices

- **Stateless Access Tokens, Stateful Refresh Tokens:** Short-lived JWT Access Tokens (30 min) for API requests and long-lived, stateful Refresh Tokens (7 days) to maintain sessions.
- **Secure Cookie Storage:** Tokens are stored in `httpOnly`, `Secure`, `SameSite=Lax` cookies, providing robust protection against XSS and CSRF attacks.
- **Refresh Token Rotation & Reuse Detection:** On every refresh, the used token is invalidated and a new one is issued. If a used token is ever presented again, the system detects it as a breach and revokes all active sessions for that user.
- **Seamless SPA Session Management:** The React frontend uses RTK Query with a custom `baseQuery` to automatically handle `401 Unauthorized` errors by transparently refreshing the session and retrying the original request.
- **Persistent Login State:** A central `AuthLayout` component verifies the user's session on initial app load, ensuring a smooth user experience across page refreshes.

---

## 3. Answering the System Design Questions

This implementation directly answers the key design questions from the interview prompt.

### Token Format & Claims

- **Access Token:** Contains minimal claims (`sub`, `iat`, `exp`).
- **Refresh Token:** Includes a crucial `jti` (JWT ID) claim, which is stored in our PostgreSQL database to track validity and enable stateful revocation.

### Secure Cookies

- We set `httpOnly`, `Secure`, and `SameSite=Lax` on all auth cookies.
- **Native app support** would be added by allowing the API to accept `Authorization: Bearer` tokens and return them in the JSON body.

### Refresh Flow & Security

- The entire flow is orchestrated by our RTK Query middleware.
- **Theft protection** is achieved via **Refresh Token Rotation** and **Reuse Detection**.

### Logout & Revocation

- **Logout:** Deletes the specific refresh token `jti` from the database.
- **Global Logout / Password Change:** Deletes **all** refresh tokens for a given `user_id`, invalidating all active sessions.

### Scaling Considerations

- The centralized PostgreSQL database for refresh tokens is essential for horizontal scaling. At very high scale, this could be migrated to **Redis** for better performance.

### CSRF Protection

- Our use of `SameSite=Lax` cookies provides sufficient, modern CSRF protection.

### Token Rotation

- We **rotate the refresh token on every use**. The security benefits far outweigh the minor overhead.

---

## 4. Addressing SPA Challenges

### Problem: Session Persistence Across Refreshes

Initially, refreshing the page would clear the Redux store and log the user out, despite a valid refresh token cookie.

### Solution: Declarative Authentication Layout

We solved this with a smart `AuthLayout` component that wraps all routes. On app load, this component:

1.  Attempts to fetch the user's profile.
2.  Shows a "Verifying session..." message while the request is in flight.
3.  If the fetch succeeds (or an auto-refresh succeeds), it renders the requested page.
4.  If the fetch fails completely, it renders the login page.

This declarative pattern eliminates race conditions and provides a robust, seamless user experience.
