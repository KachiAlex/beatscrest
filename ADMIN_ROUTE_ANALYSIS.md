# Admin Route Analysis

## Overview
The `/admin` route provides administrative endpoints for managing the BeatCrest platform. All routes require admin authentication via JWT token.

## Authentication
- **Required**: All admin routes require `authenticateToken` and `requireAdmin` middleware
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Account Type**: User must have `account_type: 'admin'` in their profile
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User is not an admin

## Available Endpoints

### 1. Statistics & Analytics

#### GET `/admin/stats`
**Description**: Get comprehensive platform statistics

**Response**:
```json
{
  "userStats": {
    "total_users": number,
    "producers": number,
    "artists": number,
    "new_users_week": number,
    "new_users_month": number
  },
  "beatStats": {
    "total_beats": number,
    "new_beats_week": number,
    "new_beats_month": number,
    "avg_price": number,
    "total_likes": number,
    "total_plays": number
  },
  "salesStats": {
    "total_sales": number,
    "sales_week": number,
    "sales_month": number,
    "total_revenue": number,
    "total_platform_fees": number,
    "avg_sale_amount": number
  },
  "monthlyRevenue": Array<{
    "date": string,
    "monthly_revenue": number,
    "monthly_fees": number,
    "monthly_sales": number
  }>
}
```

---

### 2. User Management

#### GET `/admin/users`
**Description**: Get all users with pagination and filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by username
- `account_type` (optional): Filter by account type (producer, artist, buyer)

**Response**:
```json
{
  "users": Array<{
    "id": string,
    "username": string,
    "email": string,
    "account_type": string,
    "is_verified": boolean,
    "followers_count": number,
    "following_count": number,
    "created_at": string
  }>,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

#### PUT `/admin/users/:id/status`
**Description**: Update user status (account type, verification)

**Request Body**:
```json
{
  "is_verified": boolean (optional),
  "account_type": string (optional)
}
```

**Response**:
```json
{
  "message": "User status updated successfully",
  "user": {
    "id": string,
    "username": string,
    "email": string,
    "account_type": string,
    "is_verified": boolean
  }
}
```

---

### 3. Beat Management

#### GET `/admin/beats`
**Description**: Get all beats with pagination and filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by title/description
- `producer_id` (optional): Filter by producer ID

**Response**:
```json
{
  "beats": Array<{
    "id": string,
    "title": string,
    "description": string,
    "genre": string,
    "price": number,
    "producer_name": string,
    "created_at": string
  }>,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

#### PUT `/admin/beats/:id/status`
**Description**: Toggle beat active/inactive status (soft delete)

**Request Body**:
```json
{
  "is_active": boolean
}
```

**Response**:
```json
{
  "message": "Beat status updated successfully",
  "beat": {
    "id": string,
    "title": string,
    "is_active": boolean
  }
}
```

---

### 4. Purchase Management

#### GET `/admin/purchases`
**Description**: Get all purchases with pagination and filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by purchase status (pending, completed, failed)

**Response**:
```json
{
  "purchases": Array<{
    "id": string,
    "beat_title": string,
    "buyer_name": string,
    "producer_name": string,
    "amount": number,
    "payment_status": string,
    "created_at": string
  }>,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

---

### 5. Analytics & Reports

#### GET `/admin/top-producers`
**Description**: Get top producers by earnings

**Query Parameters**:
- `limit` (optional): Number of producers to return (default: 10)

**Response**:
```json
{
  "producers": Array<{
    "id": string,
    "username": string,
    "profile_picture": string,
    "beats_count": number,
    "total_likes": number,
    "total_plays": number,
    "total_earnings": number,
    "sales_count": number
  }>
}
```

#### GET `/admin/revenue`
**Description**: Get revenue breakdown by date

**Query Parameters**:
- `period` (optional): Number of days (default: 30)

**Response**:
```json
{
  "revenue": Array<{
    "date": string,
    "daily_revenue": number,
    "daily_fees": number,
    "daily_sales": number
  }>
}
```

---

### 6. Tenant Management

#### GET `/admin/tenants`
**Description**: Get all tenants with pagination and filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name/domain/description
- `isActive` (optional): Filter by active status (true/false)

**Response**:
```json
{
  "tenants": Array<{
    "id": string,
    "name": string,
    "domain": string,
    "description": string,
    "isActive": boolean,
    "adminIds": string[],
    "admins": Array<{
      "id": string,
      "username": string,
      "email": string
    }>,
    "created_at": string,
    "updated_at": string
  }>,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

#### POST `/admin/tenants`
**Description**: Create a new tenant

**Request Body**:
```json
{
  "name": string (required),
  "domain": string (optional),
  "description": string (optional),
  "adminIds": string[] (optional),
  "isActive": boolean (optional, default: true)
}
```

**Response**:
```json
{
  "message": "Tenant created successfully",
  "tenant": {
    "id": string,
    "name": string,
    "domain": string,
    "description": string,
    "isActive": boolean,
    "adminIds": string[],
    "created_at": string
  }
}
```

#### PUT `/admin/tenants/:id`
**Description**: Update tenant details

**Request Body**:
```json
{
  "name": string (optional),
  "domain": string (optional),
  "description": string (optional),
  "isActive": boolean (optional)
}
```

**Response**:
```json
{
  "message": "Tenant updated successfully",
  "tenant": {
    "id": string,
    "name": string,
    "domain": string,
    "description": string,
    "isActive": boolean,
    "adminIds": string[],
    "updated_at": string
  }
}
```

#### POST `/admin/tenants/:id/admins`
**Description**: Add a user as tenant admin

**Request Body**:
```json
{
  "userId": string (required)
}
```

**Response**:
```json
{
  "message": "Tenant admin added successfully",
  "tenant": {
    "id": string,
    "adminIds": string[]
  }
}
```

#### DELETE `/admin/tenants/:id/admins/:userId`
**Description**: Remove a user as tenant admin

**Response**:
```json
{
  "message": "Tenant admin removed successfully",
  "tenant": {
    "id": string,
    "adminIds": string[]
  }
}
```

#### DELETE `/admin/tenants/:id`
**Description**: Deactivate a tenant (soft delete)

**Response**:
```json
{
  "message": "Tenant deactivated successfully"
}
```

---

## Database Collections Used

- `users`: User accounts and profiles
- `beats`: Beat information and metadata
- `purchases`: Transaction records
- `tenants`: Tenant/organization management
- `notifications`: User notifications (indirect)

---

## Features

### 1. **Platform Statistics**
- Total users, producers, artists
- New users (week/month)
- Beat statistics (total, new, avg price, likes, plays)
- Sales statistics (total, revenue, platform fees)
- Monthly revenue breakdown

### 2. **User Management**
- List all users with pagination
- Search users by username
- Filter by account type
- Update user account type
- Update user verification status

### 3. **Beat Management**
- List all beats with pagination
- Search beats by title/description
- Filter by producer
- Toggle beat active/inactive status (soft delete)
- View beat details with producer info

### 4. **Purchase Management**
- List all purchases with pagination
- Filter by purchase status
- View purchase details (beat, buyer, seller, amount)
- Track payment status

### 5. **Analytics**
- Top producers by earnings
- Revenue breakdown by date
- Monthly revenue trends
- Sales analytics

### 6. **Tenant Management**
- Create/update/delete tenants
- Manage tenant admins
- Search and filter tenants
- Activate/deactivate tenants

---

## Security

### Authentication Flow
1. Client sends JWT token in `Authorization` header
2. `authenticateToken` middleware verifies token and loads user
3. `requireAdmin` middleware checks if user has admin account type
4. Request proceeds if user is admin, else returns 403

### Data Protection
- All routes protected by authentication
- Admin-only access enforced
- User data sanitized in responses
- Sensitive fields filtered out

---

## Potential Issues & Improvements

### Current Issues:
1. **No rate limiting**: Admin routes don't have rate limiting (could add)
2. **No audit logging**: Actions aren't logged for audit trail
3. **Date handling**: Some date comparisons might need timezone handling
4. **Pagination accuracy**: Total count might be approximate in some cases
5. **Error messages**: Could be more descriptive for debugging

### Suggested Improvements:
1. **Add rate limiting** to prevent abuse
2. **Add audit logging** for all admin actions
3. **Improve pagination** with proper count queries
4. **Add data export** (CSV/JSON) for reports
5. **Add batch operations** (bulk user/beat updates)
6. **Add admin activity feed** (show recent admin actions)
7. **Improve date handling** with timezone support
8. **Add caching** for statistics (refresh every X minutes)

---

## Frontend Integration

### Admin Dashboard Components:
- **Overview Tab**: Platform statistics and metrics
- **Users Tab**: User management with search/filter
- **Beats Tab**: Beat management with status toggles
- **Purchases Tab**: Purchase history and tracking
- **Tenants Tab**: Tenant management with CRUD operations

### API Service Methods:
- `getAdminStats()`: Get platform statistics
- `getAdminUsers()`: Get users with filters
- `updateUserStatus()`: Update user account type/verification
- `getAdminBeats()`: Get beats with filters
- `updateBeatStatus()`: Toggle beat active/inactive
- `getAdminPurchases()`: Get purchases with filters
- `getTopProducers()`: Get top producers
- `getAdminRevenue()`: Get revenue breakdown
- `getAdminTenants()`: Get tenants with filters
- `createTenant()`: Create new tenant
- `updateTenant()`: Update tenant details
- `addTenantAdmin()`: Add tenant admin
- `removeTenantAdmin()`: Remove tenant admin
- `deleteTenant()`: Deactivate tenant

---

## Testing

To test admin routes:
1. Create an admin user (account_type: 'admin')
2. Login to get JWT token
3. Use token in Authorization header
4. Test each endpoint with appropriate data

Example:
```bash
# Get admin stats
curl -X GET https://beatcrest.web.app/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get users
curl -X GET "https://beatcrest.web.app/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

