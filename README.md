# FareWheels API

FareWheels is a robust Node.js backend application built using the Express.js framework and MongoDB (via Mongoose). It serves as a car rental management system where administrators can manage car fleets, companies, and customer records, and handle transactional car rentals with automatic stock checks.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Features & Design Patterns](#features--design-patterns)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Installation & Setup](#installation--setup)
5. [API Documentation](#api-documentation)
   - [Authentication & Users](#authentication--users)
   - [Companies](#companies)
   - [Customers](#customers)
   - [Cars](#cars)
   - [Rentals](#rentals)
6. [Known Issues & Code Quality Notes](#known-issues--code-quality-notes)

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

## API Documentation

All request bodies must be JSON, and API payloads require appropriate headers where authenticated.

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

#### 1. List Companies

- **Method & Path**: `GET /api/companies`

#### 2. Get Company by ID

- **Method & Path**: `GET /api/companies/:id`

#### 3. Create Company

- **Method & Path**: `POST /api/companies`
- **Headers**: `x-auth-token: <your_jwt_token>`
- **Request Body**:
  ```json
  {
    "name": "Toyota Motors"
  }
  ```

#### 4. Update Company

- **Method & Path**: `PUT /api/companies/:id`
- **Request Body**: Same as POST.

#### 5. Delete Company (Admin-only)

- **Method & Path**: `DELETE /api/companies/:id`
- **Headers**: `x-auth-token: <admin_jwt_token>`

---

### Customers

#### 1. List Customers

- **Method & Path**: `GET /api/customers`

#### 2. Get Customer by ID

- **Method & Path**: `GET /api/customers/:id`

#### 3. Create Customer

- **Method & Path**: `POST /api/customers`
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "phone": "12345678901",
    "isPrime": true
  }
  ```

#### 4. Update Customer

- **Method & Path**: `PUT /api/customers/:id`
- **Request Body**: Same as POST.

#### 5. Delete Customer

- **Method & Path**: `DELETE /api/customers/:id`

---

### Cars

#### 1. List Cars (Note: See [Known Issues](#known-issues--code-quality-notes))

- **Method & Path**: `GET /api/cars`

#### 2. Get Car by ID

- **Method & Path**: `GET /api/cars/:id`

#### 3. Create Car

- **Method & Path**: `POST /api/cars`
- **Request Body**:
  ```json
  {
    "modelName": "Corolla Altis",
    "companyId": "company_mongodb_id",
    "numberInStock": 10,
    "dailyRentalRate": 45.5
  }
  ```

#### 4. Update Car

- **Method & Path**: `PUT /api/cars/:id`
- **Request Body**: Same as POST.

#### 5. Delete Car

- **Method & Path**: `DELETE /api/cars/:id`

---

### Rentals

#### 1. List Rentals

- **Method & Path**: `GET /api/rentals`

#### 2. Get Rental by ID

- **Method & Path**: `GET /api/rentals/:id`

#### 3. Create Rental (Atomic Transaction)

- **Method & Path**: `POST /api/rentals`
- **Request Body**:
  ```json
  {
    "customerId": "customer_mongodb_id",
    "carId": "car_mongodb_id"
  }
  ```

---
