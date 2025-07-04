# User Profile API Documentation

## Overview
The User Profile API allows you to fetch and update user profile information using JWT authentication. This API is designed to work with N8n and other external platforms.

## Base URL
```
https://[your-supabase-project].supabase.co/functions/v1/user-profile
```

## Authentication
All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### GET - Fetch User Profile
Retrieves the profile information for the authenticated user or a specific user.

**URL:** `GET /user-profile`

**Query Parameters:**
- `user_id` (optional): Specific user ID to fetch. If not provided, returns the authenticated user's profile.

**Example Request:**
```bash
curl -X GET "https://[your-project].supabase.co/functions/v1/user-profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "Magnus Carlsen",
    "email": "magnus@example.com",
    "fide_id": "1503014",
    "fide_rating": 2830,
    "chess_title": "GM",
    "country": "Norway",
    "date_of_birth": "1990-11-30",
    "chess_club": "Offerspill Chess Club",
    "playing_style": "Positional",
    "favorite_opening": "Queen's Gambit",
    "bio": "World Chess Champion and highest-rated player in history.",
    "profile_picture_url": null,
    "onboarding_completed": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT - Update User Profile
Updates the profile information for the authenticated user.

**URL:** `PUT /user-profile`

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "fide_rating": 2000,
  "chess_title": "IM",
  "country": "United States",
  "bio": "Updated bio information"
}
```

**Example Request:**
```bash
curl -X PUT "https://[your-project].supabase.co/functions/v1/user-profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "fide_rating": 2000,
    "chess_title": "IM"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "Updated Name",
    "fide_rating": 2000,
    "chess_title": "IM",
    "updated_at": "2024-01-15T10:35:00.000Z"
  }
}
```

## Profile Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | User's unique identifier | Yes (auto-generated) |
| `full_name` | String | User's full name | Yes |
| `email` | String | User's email (from auth) | Yes (read-only) |
| `fide_id` | String | Official FIDE player ID | No |
| `fide_rating` | Integer | Current FIDE or estimated rating | No |
| `chess_title` | String | Chess title (GM, IM, FM, etc.) | No |
| `country` | String | User's country | No |
| `date_of_birth` | Date | Date of birth (YYYY-MM-DD) | No |
| `chess_club` | String | Chess club affiliation | No |
| `playing_style` | String | Playing style preference | No |
| `favorite_opening` | String | Favorite chess opening | No |
| `bio` | String | User biography | No |
| `profile_picture_url` | String | URL to profile picture | No |
| `onboarding_completed` | Boolean | Whether onboarding is complete | Yes |
| `created_at` | Timestamp | Account creation time | Yes (auto-generated) |
| `updated_at` | Timestamp | Last update time | Yes (auto-updated) |

## Chess Title Options
- `GM` - Grandmaster
- `IM` - International Master
- `FM` - FIDE Master
- `CM` - Candidate Master
- `WGM` - Woman Grandmaster
- `WIM` - Woman International Master
- `WFM` - Woman FIDE Master
- `WCM` - Woman Candidate Master
- `NM` - National Master
- `Expert` - Expert
- `Class A` - Class A
- `Class B` - Class B
- `Class C` - Class C
- `Class D` - Class D
- `Beginner` - Beginner

## Playing Style Options
- `Aggressive`
- `Positional`
- `Tactical`
- `Endgame Specialist`
- `Opening Specialist`
- `Balanced`

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Missing authorization header"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized to update this profile"
}
```

### 404 Not Found
```json
{
  "error": "Profile not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Specific error message"
}
```

## Usage with N8n

### HTTP Request Node Configuration
1. **Method:** GET or PUT
2. **URL:** `https://[your-project].supabase.co/functions/v1/user-profile`
3. **Headers:**
   - `Authorization`: `Bearer {{$json.jwt_token}}`
   - `Content-Type`: `application/json`
4. **Body:** (for PUT requests only)
   ```json
   {
     "full_name": "{{$json.full_name}}",
     "fide_rating": {{$json.fide_rating}},
     "chess_title": "{{$json.chess_title}}"
   }
   ```

### Example N8n Workflow
1. **Trigger:** Webhook or manual trigger
2. **HTTP Request:** Call the user profile API
3. **Process Data:** Transform the response as needed
4. **Output:** Send to another service or database

## Security Notes
- JWT tokens are validated on every request
- Users can only update their own profiles
- Service role access is available for admin operations
- All data is validated according to database constraints
- Row Level Security (RLS) is enforced at the database level