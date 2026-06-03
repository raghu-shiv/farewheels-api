# FareWheels API

FareWheels is a robust Node.js backend application built using the Express.js framework and MongoDB (via Mongoose). It serves as a car rental management system where administrators can manage car fleets, companies, and customer records, and handle transactional car rentals with automatic stock checks.

---

## Live API

The FareWheels API is deployed and publicly accessible via Render.

- **Production URL**: [https://www.farewheels.run.place](https://www.farewheels.run.place)
- **API Base URL**: [https://www.farewheels.run.place/api](https://www.farewheels.run.place/api)

**Example:**

```http
GET https://www.farewheels.run.place/api/cars
```

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Features & Design Patterns](#features--design-patterns)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Installation & Setup](#installation--setup)
5. [Deployment](#deployment)
6. [API Documentation](#api-documentation)
   - [Authentication & Users](#authentication--users)
   - [Companies](#companies)
   - [Customers](#customers)
   - [Cars](#cars)
   - [Rentals](#rentals)
7. [Logging & Monitoring](#logging--monitoring)
8. [Security Features](#security-features)
9. [Architecture Highlights](#architecture-highlights)
10. [Testing](#testing)
11. [Project Status](#project-status)
12. [License](#license)

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Object Data Modeling via Mongoose)
- **Validation**: Joi, Joi-ObjectId
- **Security & Optimization**: Helmet, Gzip compression (`compression`), bcrypt (password hashing), JSON Web Tokens (`jsonwebtoken`)
- **Logging & Error Handling**: Winston (with Winston MongoDB transport), `express-async-errors`
- **Configuration**: `config` (node-config)

---

## Project Structure

```text
FareWheels/
├── config/
│   ├── custom-environment-variables.json  # Maps config properties to env vars
│   ├── default.json                       # Default application configurations
│   └── production.json                    # Production-specific configs
├── initialize/
│   ├── config.js                          # Validates config environment variables
│   ├── db.js                              # Establishes MongoDB connection
│   ├── gzip.js                            # Adds compression middleware
│   ├── helmet.js                          # Sets up security headers using Helmet
│   ├── logging.js                         # Configures Winston file, console, and DB logging
│   ├── routes.js                          # Bundles and mounts all API routes
│   ├── server.js                          # Starts the Express HTTP server
│   └── validation.js                      # Initializes Joi ObjectID validations
├── middleware/
│   ├── admin.js                           # Restricts access to admin-only routes
│   ├── async.js                           # Custom helper to wrap async route handlers
│   ├── auth.js                            # Decodes JWT tokens and populates req.user
│   └── error.js                           # Global central express error handler
├── models/
│   ├── car.js                             # Car Schema and Joi validation
│   ├── company.js                         # Company Schema and Joi validation
│   ├── customer.js                        # Customer Schema and Joi validation
│   ├── rental.js                          # Rental Schema and Joi validation
│   └── user.js                            # User Schema, JWT helper, and validation
├── routes/
│   ├── auth.js                            # Login authentication endpoint
│   ├── cars.js                            # Car management routes
│   ├── companies.js                       # Company management routes
│   ├── customers.js                       # Customer management routes
│   ├── rentals.js                         # Rental transaction routes
│   └── users.js                           # User registration and profile routes
├── index.js                               # Application bootstrap file
├── package.json                           # Dependencies and scripts metadata
└── .env                                   # Local development environment secrets
```

---

## Features & Design Patterns

### 1. Robust Winston Logging

Centralized logging captures all errors, unhandled exceptions, and unhandled promise rejections:

- **Errors**: Written to `error.log` in JSON format (with timestamps) and logged to a MongoDB collection specified in `MONGO_URI`.
- **Exceptions**: Uncaught exceptions are caught and logged to `exceptions.log` and the Console.
- **Rejections**: Unhandled promise rejections are handled and logged to `rejections.log`.

### 2. ACID Transactions for Rentals

When a rental is created, two database actions must succeed atomically:

1. Saving the new `Rental` document.
2. Decrementing the `numberInStock` on the selected `Car` document.

FareWheels uses **Mongoose/MongoDB Sessions and Transactions** (`startSession()`, `startTransaction()`, `commitTransaction()`, `abortTransaction()`) to guarantee consistency and rollback on failure.

### 3. JWT-based Authentication & RBAC

- **User Registration**: Password hashed with a salt factor of 10 using `bcrypt`.
- **JWT Generation**: Encapsulated in the User model (`user.generateAuthToken()`). It embeds user ID and their `isAdmin` flag.
- **Role-Based Access Control (RBAC)**: Custom middlewares enforce access:
  - `auth`: Rejects request if JWT token is missing (`x-auth-token`) or invalid.
  - `admin`: Verifies `req.user.isAdmin === true` to allow modifications (e.g. deleting a company).

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a running local MongoDB instance.

### Environment Variables

Configure the following in your `.env` file at the root directory:

```env
NODE_ENV="production"
PORT=3000
farewheels_jwtSecretKey="yourSecureSecretKey"
MONGO_URI="mongodb+srv://..."
```

### Installation & Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run the Server**:
   ```bash
   npm start
   ```

---

## Deployment

FareWheels is deployed on Render and configured for production workloads.

- **Environment**: Production
- **Hosting**: Render
- **Database**: MongoDB Atlas
- **Security**: HTTPS Enabled
- **Configuration**: Environment-Based
- **Logging**: Centralized Error Logging
- **CI/CD**: Automatic Deployments

### Verify Deployment

Health check using any browser or API client:

```http
GET https://www.farewheels.run.place/api/cars
```

---

## API Documentation

All request bodies must be JSON, and API payloads require appropriate headers where authenticated.

### Authentication Flow

#### Step 1: Register

```http
POST /api/users
```

**Response Headers**: Receive JWT token in `x-auth-token`.

#### Step 2: Login

```http
POST /api/auth
```

**Response**: JWT Token String.

#### Step 3: Access Protected Routes

Include JWT token in headers:

```http
x-auth-token: <jwt_token>
```

### Authentication & Users

#### 1. Register User

- **Method & Path**: `POST /api/users`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response Headers**: Returns JWT token in `x-auth-token` header.
- **Response Body**:
  ```json
  {
    "id": "user_mongodb_id",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```

#### 2. User Authentication (Login)

- **Method & Path**: `POST /api/auth`
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response Body**: Raw JWT string (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

#### 3. Fetch Current Profile

- **Method & Path**: `GET /api/users/me`
- **Headers**: `x-auth-token: <your_jwt_token>`
- **Response Body**:
  ```json
  {
    "_id": "user_mongodb_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "isAdmin": false
  }
  ```

---

### Companies

- **List Companies**: `GET /api/companies`
- **Get Company by ID**: `GET /api/companies/:id`
- **Create Company**: `POST /api/companies` (Requires auth)
  ```json
  {
    "name": "Toyota Motors"
  }
  ```
- **Update Company**: `PUT /api/companies/:id` (Requires auth)
- **Delete Company (Admin-only)**: `DELETE /api/companies/:id` (Requires admin auth)

---

### Customers

- **List Customers**: `GET /api/customers`
- **Get Customer by ID**: `GET /api/customers/:id`
- **Create Customer**: `POST /api/customers`
  ```json
  {
    "name": "John Smith",
    "phone": "12345678901",
    "isPrime": true
  }
  ```
- **Update Customer**: `PUT /api/customers/:id`
- **Delete Customer**: `DELETE /api/customers/:id`

---

### Cars

- **List Cars**: `GET /api/cars`
- **Get Car by ID**: `GET /api/cars/:id`
- **Create Car**: `POST /api/cars`
  ```json
  {
    "modelName": "Corolla Altis",
    "companyId": "company_mongodb_id",
    "numberInStock": 10,
    "dailyRentalRate": 45.5
  }
  ```
- **Update Car**: `PUT /api/cars/:id`
- **Delete Car**: `DELETE /api/cars/:id`

---

### Rentals

- **List Rentals**: `GET /api/rentals`
- **Get Rental by ID**: `GET /api/rentals/:id`
- **Create Rental (Atomic Transaction)**: `POST /api/rentals`
  ```json
  {
    "customerId": "customer_mongodb_id",
    "carId": "car_mongodb_id"
  }
  ```

---

## Logging & Monitoring

FareWheels uses Winston for centralized logging and monitoring.

**Logged Events:**

- Application Errors
- Unhandled Exceptions
- Promise Rejections
- Runtime Failures

**Log Destinations:**

- `error.log`
- `exceptions.log`
- `rejections.log`
- MongoDB Logs Collection

This provides visibility into production issues and simplifies troubleshooting.

---

## Security Features

**Authentication:**

- JWT-based authentication
- Password hashing using bcrypt
- Protected route middleware

**Authorization:**

- Role-Based Access Control (RBAC)
- Admin-only route protection

**Validation:**

- Joi schema validation
- MongoDB ObjectId validation

**Security Headers:**

- Helmet middleware
- Gzip compression

---

## Architecture Highlights

**Modular Structure:**
The application follows a modular architecture with clear separation of concerns:

- Routes
- Middleware
- Models
- Configuration
- Initialization

**Transaction-Safe Rentals:**
Rental creation uses MongoDB transactions to ensure:

- Rental creation succeeds
- Vehicle inventory updates succeed
- Automatic rollback on failure

**Environment-Based Configuration:**
Node-config enables seamless switching between:

- Development
- Production
- Custom deployment environments

---

## Testing (Postman)

**Base URL**: `https://www.farewheels.run.place/api`

**Recommended API Testing Flow:**

1. Register User
2. Authenticate User
3. Copy JWT Token
4. Create Company
5. Create Customer
6. Create Car
7. Create Rental
8. Verify Inventory Reduction

---

## Project Status

**Feature Status:**

- [x] User Authentication
- [x] RBAC Authorization
- [x] Company Management
- [x] Customer Management
- [x] Car Management
- [x] Rental Transactions
- [x] MongoDB Transactions
- [x] Winston Logging
- [x] Render Deployment
- [x] MongoDB Atlas

---

## License

This project is intended for educational, portfolio, and demonstration purposes.
