# REST API Endpoints Documentation

## Overview
This document outlines the REST API endpoints for the Kindly application, organized by role (Help Seeker and Volunteer) following best practices for clean, maintainable API design.

---

## Base URL Structure
```
/api/v1/auth/...           # Authentication (common)
/api/v1/common/...         # Shared resources
/api/v1/help-seeker/...    # Help seeker specific
/api/v1/volunteer/...      # Volunteer specific
```

---

## 1. Authentication Endpoints (Common)

All authentication endpoints are accessible to both roles.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user (help_seeker or volunteer) | No |
| POST | `/api/v1/auth/login` | Login with email and password | No |
| POST | `/api/v1/auth/logout` | Logout current user | Yes |

### Request/Response Examples

#### POST `/api/v1/auth/register`
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "date_of_birth": "1990-05-15",
  "about_me": "I love helping my community",
  "is_volunteer": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "is_volunteer": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### POST `/api/v1/auth/login`
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "is_volunteer": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    // "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Common Endpoints (Both Roles)

These endpoints are accessible to both help seekers and volunteers.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/common/profile` | Get current user profile | Yes |
| PUT | `/api/v1/common/profile` | Update current user profile | Yes |
| GET | `/api/v1/common/users/:id` | Get public user profile | Yes |
| GET | `/api/v1/common/request-types` | List all request types | Yes |

### Request/Response Examples

#### GET `/api/v1/common/profile`
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "date_of_birth": "1990-05-15",
    "about_me": "I love helping my community",
    "is_volunteer": true,
    "avg_rating": 4.5,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

#### GET `/api/v1/common/request-types`
**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Grocery Shopping"
    },
    {
      "id": 2,
      "name": "Transportation"
    },
    {
      "id": 3,
      "name": "Home Repair"
    }
  ]
}
```

---

## 3. Help Seeker Endpoints

These endpoints are only accessible to users with `is_volunteer = false`.

### 3.1 Request Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/help-seeker/requests` | Create new help request | Yes (Help Seeker) |
| GET | `/api/v1/help-seeker/requests` | List my requests | Yes (Help Seeker) |
| GET | `/api/v1/help-seeker/requests/:id` | Get my request details | Yes (Help Seeker) |
| PUT | `/api/v1/help-seeker/requests/:id` | Update my request | Yes (Help Seeker) |
| DELETE | `/api/v1/help-seeker/requests/:id` | Delete my request | Yes (Help Seeker) |
| PATCH | `/api/v1/help-seeker/requests/:id/complete` | Mark request as completed | Yes (Help Seeker) |

#### POST `/api/v1/help-seeker/requests`
**Request Body:**
```json
{
  "name": "Need help with grocery shopping",
  "description": "I need someone to help me carry groceries from the store to my apartment",
  "longitude": -122.4194,
  "latitude": 37.7749,
  "start": "2024-02-15T14:00:00Z",
  "end": "2024-02-15T16:00:00Z",
  "reward": 20,
  "request_type_ids": [1]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Need help with grocery shopping",
    "description": "I need someone to help me carry groceries from the store to my apartment",
    "longitude": -122.4194,
    "latitude": 37.7749,
    "start": "2024-02-15T14:00:00Z",
    "end": "2024-02-15T16:00:00Z",
    "reward": 20,
    "creator_id": 1,
    "is_completed": false,
    "request_types": [
      {
        "id": 1,
        "name": "Grocery Shopping"
      }
    ],
    "created_at": "2024-02-10T10:30:00Z",
    "updated_at": "2024-02-10T10:30:00Z"
  },
  "message": "Request created successfully"
}
```

#### GET `/api/v1/help-seeker/requests`
Can only view own

**Query Parameters:**
- `status` - Filter by status: `open`, `completed`, `all` (default: `all`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort by: `created_at`, `start`, `reward` (default: `created_at`)
- `order` - Sort order: `asc`, `desc` (default: `desc`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Need help with grocery shopping",
      "description": "I need someone to help me carry groceries...",
      "start": "2024-02-15T14:00:00Z",
      "end": "2024-02-15T16:00:00Z",
      "reward": 20,
      "is_completed": false,
      "applications_count": 3,
      "accepted_volunteer": null,
      "created_at": "2024-02-10T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### POST /api/v1/help-seeker/requests/suggest-type
**Request Body:**
```json
{
  "name": "Need help with grocery shopping",
  "description": "I need someone to help me carry groceries from the store to my apartment"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Grocery Shopping",
      "confidence": 0.95,
      "reasoning": "Request explicitly mentions grocery shopping"
    },
    {
      "id": 4,
      "name": "Heavy Lifting",
      "confidence": 0.72,
      "reasoning": "Request mentions carrying items"
    }
  ]
}
```

### 3.2 Application Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/help-seeker/requests/:id/applications` | View all applications for my request | Yes (Help Seeker) |
| PATCH | `/api/v1/help-seeker/requests/:id/applications/:user_id/accept` | Accept volunteer application | Yes (Help Seeker) |

#### GET `/api/v1/help-seeker/requests/:id/applications`
**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "id": 5,
        "name": "Jane Smith",
        "avg_rating": 4.8,
      },
      "is_accepted": false,
      "applied_at": "2024-02-11T09:15:00Z"
    },
    {
      "user": {
        "id": 7,
        "name": "Bob Johnson",
        "avg_rating": 4.2,
      },
      "is_accepted": false,
      "applied_at": "2024-02-11T11:30:00Z"
    }
  ]
}
```

#### PATCH `/api/v1/help-seeker/requests/:id/applications/:user_id/accept`
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "request_id": 1,
    "user_id": 5,
    "is_accepted": true
  },
  "message": "Application accepted successfully"
}
```

### 3.3 Rating

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/help-seeker/requests/:id/rate-volunteer` | Rate volunteer after completion | Yes (Help Seeker) |
TODO: Ezt lehet at kene beszelni!
#### POST `/api/v1/help-seeker/requests/:id/rate-volunteer`
**Request Body:**
```json
{
  "rating": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "request_id": 1,
    "volunteer_rating": 5,
  },
  "message": "Volunteer rated successfully"
}
```

---

## 4. Volunteer Endpoints

These endpoints are only accessible to users with `is_volunteer = true`.

### 4.1 Browse Requests

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/volunteer/requests` | Browse available requests | Yes (Volunteer) |
| GET | `/api/v1/volunteer/requests/:id` | View request details | Yes (Volunteer) |

#### GET `/api/v1/volunteer/requests`
**Query Parameters:**
- `status` - Filter by status: `open`, `completed`, `applied`, `all` (default: `open`)
- `type` - Filter by request type ID
- `location_lat` - Latitude for location-based search
- `location_lng` - Longitude for location-based search
- `radius` - Search radius in kilometers (default: 10)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort by: `start`, `reward` (default: `start`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Need help with grocery shopping",
      "description": "I need someone to help me carry groceries...",
      "longitude": -122.4194,
      "latitude": 37.7749,
      "start": "2024-02-15T14:00:00Z",
      "end": "2024-02-15T16:00:00Z",
      "reward": 20,
      "creator": {
        "id": 1,
        "name": "John Doe",
        "avg_rating": 4.5
      },
      "request_types": [
        {
          "id": 1,
          "name": "Grocery Shopping"
        }
      ],
      "applications_count": 3,
      "has_applied": false,
      "created_at": "2024-02-10T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 4.2 Application Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/volunteer/applications` | Apply to a request | Yes (Volunteer) |
| DELETE | `/api/v1/volunteer/applications/:id` | Withdraw application | Yes (Volunteer) |

#### POST `/api/v1/volunteer/applications`
**Request Body:**
```json
{
  "request_id": 1,
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "request_id": 1,
    "user_id": 5,
    "is_accepted": false,
    "applied_at": "2024-02-11T09:15:00Z"
  },
  "message": "Application submitted successfully"
}
```

### 4.4 Rating

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/volunteer/requests/:id/rate-seeker` | Rate help seeker after completion | Yes (Volunteer) |

#### POST `/api/v1/volunteer/requests/:id/rate-seeker`
**Request Body:**
```json
{
  "rating": 5,
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "request_id": 1,
    "help_seeker_rating": 5,
    "rated_at": "2024-02-15T17:00:00Z"
  },
  "message": "Help seeker rated successfully"
}
```

---

## HTTP Status Codes

The API uses standard HTTP status codes:

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST request creating a resource |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission for this action |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., already applied) |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server-side error |

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "field_name",
        "message": "Specific field error"
      }
    ]
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `ALREADY_APPLIED` - Already applied to this request
- `REQUEST_COMPLETED` - Cannot modify completed request
- `INVALID_CREDENTIALS` - Invalid email or password
- `TOKEN_EXPIRED` - JWT token has expired
- `INTERNAL_ERROR` - Server error

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Headers Required
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Lifecycle
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Use `/api/v1/auth/refresh-token` to get a new access token

---

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Pagination

List endpoints support pagination with these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Pagination info is included in the response:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Best Practices

1. **Always use HTTPS** in production
2. **Validate input** on both client and server
3. **Handle errors gracefully** with proper error messages
4. **Use appropriate HTTP methods** (GET for reading, POST for creating, etc.)
5. **Include authentication tokens** in the Authorization header
6. **Implement rate limiting** to prevent abuse
7. **Version your API** (currently v1)
8. **Log all requests** for debugging and monitoring
9. **Use pagination** for list endpoints
10. **Cache responses** where appropriate

---

## Future Considerations

- refresh token
- rate limit
