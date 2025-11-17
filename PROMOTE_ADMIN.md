# How to Promote a User to Admin

## Method 1: Using the API Endpoint (Recommended)

I've added a secure endpoint that allows promoting a user to admin using a master key.

### Step 1: Set the Master Key (Optional)
The endpoint uses `ADMIN_MASTER_KEY` environment variable. If not set, it defaults to `'beatcrest-admin-2024'`.

To set it in Firebase Functions:
```bash
firebase functions:config:set admin.master_key="your-secure-master-key-here"
```

### Step 2: Call the Endpoint
```bash
curl -X POST https://YOUR_FIREBASE_PROJECT.cloudfunctions.net/api/auth/promote-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "onyedika.akoma@gmail.com",
    "masterKey": "beatcrest-admin-2024"
  }'
```

Or using the deployed URL:
```bash
curl -X POST https://YOUR_DEPLOYED_URL/api/auth/promote-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "onyedika.akoma@gmail.com",
    "masterKey": "beatcrest-admin-2024"
  }'
```

### Response:
```json
{
  "message": "User promoted to admin successfully",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "onyedika.akoma@gmail.com",
    "account_type": "admin"
  }
}
```

## Method 2: Direct Firestore Update

1. Go to Firebase Console → Firestore Database
2. Navigate to the `users` collection
3. Find the user document with email `onyedika.akoma@gmail.com`
4. Edit the document and set the `accountType` field to `Admin` (capital A)
5. Save the document

## Method 3: Using the Script (For Local Development)

If you have Firebase Admin SDK set up locally:

```bash
cd functions
node scripts/promoteToAdmin.js onyedika.akoma@gmail.com
```

## Verification

After promoting the user:

1. **Login** with the credentials:
   ```
   POST /api/auth/login
   {
     "email": "onyedika.akoma@gmail.com",
     "password": "dikaoliver2660"
   }
   ```

2. **Check the response** - it should show:
   ```json
   {
     "user": {
       "account_type": "admin"
     }
   }
   ```

3. **Test admin endpoint**:
   ```
   GET /api/admin/stats
   Authorization: Bearer <your-jwt-token>
   ```

If you get a 403 Forbidden error, the accountType might not be set correctly. Make sure it's exactly `Admin` (capital A) in Firestore.

## Security Note

After promoting the first admin, consider:
1. Changing the default master key to a secure random string
2. Restricting access to the `/promote-admin` endpoint
3. Adding rate limiting to prevent abuse

