# AutoCard - AGU Automotive Club

A membership and discount tracking mobile application for the Automotive Club at Abdullah Gül University.

## Features

- 🔐 User Authentication (Login/Register)
- 📸 Bill Upload with Camera/Gallery
- 📊 Real-time Analytics (Total Spent, Savings, Orders)
- 🏪 Favorite Restaurant Tracking
- 🌓 Dark/Light Theme Support
- 💾 Firebase Backend Integration
- ⚙️ Admin Panel (Bill Approval, Event Management, Newsletter Management)

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation 6

## Project Structure

```
AutomotiveClub/
├── App.js                      # Main app with navigation
├── src/
│   ├── config/
│   │   └── firebase.js         # Firebase configuration
│   ├── context/
│   │   └── AppContext.js       # Global state management
│   ├── services/
│   │   ├── authService.js      # Authentication logic
│   │   └── billService.js      # Bill upload & analytics
│   ├── screens/
│   │   ├── LoginScreen.js      # Login screen
│   │   ├── RegisterScreen.js   # Registration screen
│   │   ├── HomeScreen.js       # Dashboard with stats
│   │   └── BillingScreen.js    # Bill upload screen
│   └── theme/
│       └── themes.js           # Theme definitions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore Database
4. Enable Storage
5. Copy your Firebase config and update `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Database Structure

Create these collections in Firestore:

**users** collection:
```json
{
  "name": "string",
  "email": "string",
  "studentId": "string",
  "lifetimeSpend": "number",
  "lifetimeSavings": "number",
  "totalOrders": "number",
  "favoriteRestaurant": "string",
  "createdAt": "timestamp"
}
```

**bills** collection:
```json
{
  "userId": "string",
  "restaurantName": "string",
  "amount": "number",
  "imageUrl": "string",
  "status": "pending | approved",
  "date": "timestamp",
  "createdAt": "timestamp"
}
```

**restaurants** collection (optional):
```json
{
  "name": "string",
  "discountRate": "number",
  "location": "string"
}
```

### 4. Run the App

For Android:
```bash
npm run android
```

For iOS (requires Mac):
```bash
npm run ios
```

Using Expo Go:
```bash
npm start
```

Then scan the QR code with Expo Go app on your phone.

## Features Explained

### User Authentication
- Email/password registration with profile creation
- Secure login with Firebase Auth
- Auto-login on app restart

### Bill Upload
- Take photo with camera or select from gallery
- Enter restaurant name and amount
- Automatic image upload to Firebase Storage
- Bill record creation in Firestore

### Analytics
- **Total Orders**: Count of all uploaded bills
- **Total Spent**: Sum of all bill amounts
- **Total Saved**: 10% discount on all purchases
- **Favorite Restaurant**: Most frequently visited location

### Theme System
- Toggle between light and dark themes
- Blue-based color scheme matching AGU branding
- Persists across app sessions

## Development Notes

- Uses NativeWind for Tailwind CSS styling in React Native
- Firebase SDK v10+ for modern web/mobile compatibility
- Modular architecture for easy feature additions
- Context API for global state management

## Future Enhancements

- [x] Admin panel for bill approval
- [x] News and announcements feed (admin-managed)
- [ ] Push notifications for approved bills
- [ ] QR code scanning
- [ ] Partner restaurant directory
- [ ] Export transaction history

## License

AGU Automotive Club - Private Use

## Support

For issues or questions, contact the AGU Automotive Club development team.
