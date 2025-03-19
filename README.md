# Popular Digital AI - Audit Management API

A Node.js based REST API for managing rooms, guest check-ins/check-outs, and room auditing functionality.

## Features

- Guest check-in and check-out functionality
- Room stay tracking
- Audit logging

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/keshavashiya/populardigitalai.git
   cd populardigitalai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=your_db_name
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   ```

4. Set up the database:
   - Create a PostgreSQL database
   - Run the schema.sql file to create the required tables:
     ```bash
     psql -U your_db_user -d your_db_name -f schema.sql
     ```

## Running the Application

1. Start the server:
   ```bash
   npm run start:dev
   ```

2. The API will be available at `http://localhost:3000`

## API Endpoints

### Rooms

#### Get All Rooms
- **GET** `/api/rooms`
- **Response**: List of all rooms with their current status
  ```json
  [
    {
      "id": 1,
      "number": "101",
      "status": "AVAILABLE",
      ...
    }
  ]
  ```

### Room Stays

#### Check-in Guest
- **POST** `/api/room-stay/check-in`
- **Request Body**:
  ```json
  {
    "roomId": 1,
    "guestName": "John Doe",
    "notes": "Special requests: Extra pillows"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Guest checked in successfully",
    "roomStayId": 1
  }
  ```

#### Check-out Guest
- **POST** `/api/room-stay/check-out/:roomStayId`
- **Response**:
  ```json
  {
    "message": "Check-out successful"
  }
  ```

### Audit Logs

### Audit Management

#### Create Check-in Audit
- **POST** `/api/audit/check-in`
- **Request Body**:
  ```json
  {
    "roomStayId": 1,
    "auditorName": "Jane Smith",
    "notes": "Initial room condition check",
    "items": [
      {
        "itemId": 1,
        "quantity": 2,
        "conditionStatus": "GOOD",
        "notes": "Fresh towels"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Check-in audit created successfully",
    "auditId": 1
  }
  ```

#### Create Check-out Audit
- **POST** `/api/audit/check-out`
- **Request Body**:
  ```json
  {
    "roomStayId": 1,
    "auditorName": "John Doe",
    "notes": "Final room inspection",
    "items": [
      {
        "itemId": 1,
        "quantity": 1,
        "conditionStatus": "DAMAGED",
        "notes": "One towel missing"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Check-out audit created successfully",
    "auditId": 2
  }
  ```

#### Compare Audits
- **GET** `/api/audit/compare/:roomStayId`
- **Description**: Compares check-in and check-out audits for a specific room stay to identify discrepancies
- **Response**:
  ```json
  {
    "roomStayId": 1,
    "differences": [
      {
        "itemName": "Bed",
        "checkIn": {
          "quantity": 1,
          "conditionStatus": "GOOD"
        },
        "checkOut": {
          "quantity": 1,
          "conditionStatus": "DAMAGED"
        },
        "quantityDifference": 0
      }
    ]
  }
  ```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

Error responses include a message describing the error:
```json
{
  "error": "Error message description"
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.