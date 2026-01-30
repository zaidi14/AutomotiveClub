# Firebase Collections Setup

## Required Collections

### 1. users
Auto-created when users register. Structure:

```javascript
{
  name: "string",              // User's full name
  email: "string",             // User's email
  studentId: "string",         // AGU Student ID
  lifetimeSpend: 0,           // Total amount spent (number)
  lifetimeSavings: 0,         // Total savings (number)
  totalOrders: 0,             // Number of bills uploaded (number)
  favoriteRestaurant: "",     // Most visited restaurant (string)
  createdAt: "ISO timestamp"  // Account creation date
}
```

### 2. bills
Auto-created when users upload bills. Structure:

```javascript
{
  userId: "string",           // User's UID from Firebase Auth
  restaurantName: "string",   // Name of the restaurant
  amount: 0,                 // Bill amount in TRY (number)
  imageUrl: "string",        // Firebase Storage URL
  status: "pending",         // "pending" or "approved"
  date: "ISO timestamp",     // Bill date
  createdAt: "ISO timestamp" // Upload date
}
```

### 3. restaurants (Optional - for future use)
Manually create this for partner restaurants:

```javascript
{
  name: "string",            // Restaurant name
  discountRate: 0.1,        // Discount percentage (0.1 = 10%)
  location: "string",       // Address/location
  category: "string",       // Type: "cafe", "restaurant", etc.
  isActive: true            // Whether accepting AutoCard
}
```

## Firestore Rules (Development)

For testing, use these rules (Firebase Console → Firestore → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 3, 1);
    }
  }
}
```

## Firestore Rules (Production)

For production deployment:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own data, write only their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Bills: users can create their own, admins can approve
    match /bills/{billId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId 
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Restaurants: everyone can read, only admins can write
    match /restaurants/{restaurantId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Storage Rules (Development)

Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2026, 3, 1);
    }
  }
}
```

## Storage Rules (Production)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Bill images: users can upload to their own folder
    match /bills/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Indexes (Optional - for better performance)

Create these indexes if queries are slow:

1. Collection: `bills`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

2. Collection: `bills`
   - Fields: `userId` (Ascending), `restaurantName` (Ascending)
   - Query scope: Collection

Firebase will prompt you to create these when needed via error messages.

## Sample Data for Testing

### Sample Restaurant (Optional)
```javascript
// Firestore → restaurants → Add document
{
  name: "Cafe Istanbul",
  discountRate: 0.1,
  location: "AGU Campus",
  category: "cafe",
  isActive: true
}
```

### Admin User (Optional)
After creating a user, manually add to Firestore:
```javascript
// Firestore → users → [user-id] → Edit
{
  ...existing fields,
  role: "admin"  // Add this field
}
```

## Quick Setup Checklist

- [ ] Enable Email/Password Authentication
- [ ] Create Firestore Database (test mode)
- [ ] Enable Storage (test mode)
- [ ] Copy Firebase config to `src/config/firebase.js`
- [ ] Test user registration
- [ ] Test bill upload
- [ ] Verify data appears in Firestore
- [ ] Check images appear in Storage
- [ ] Update rules before production deploy

## Need Help?

Check QUICKSTART.md for step-by-step Firebase setup instructions.
