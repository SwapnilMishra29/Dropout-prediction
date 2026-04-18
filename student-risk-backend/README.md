# Student Risk Backend

A production-ready Node.js backend for Student Risk Intelligence System.

## Features

- MVC Architecture
- MongoDB with Mongoose
- Integration with Flask ML API via Axios
- Environment variables support
- Security middleware (Helmet, CORS)
- Logging with Morgan
- Compression

## Installation

1. Clone the repo
2. Run `npm install`
3. Set up .env file
4. Run `npm start`

## API Endpoints

- GET /api/students - Get all students
- POST /api/students - Create student
- POST /api/risks/assess - Assess risk