# QUICK START GUIDE

## 🚀 Getting Started (5 minutes)

### Step 1: Firebase Setup

1. Go to https://console.firebase.google.com
2. Click "Add project" → Name it "AutoCard" → Continue
3. Disable Google Analytics (optional) → Create project

### Step 2: Enable Firebase Services

**Authentication:**
1. Click "Authentication" → Get Started
2. Select "Email/Password" → Enable → Save

**Firestore Database:**
1. Click "Firestore Database" → Create database
2. Start in **test mode** → Next
3. Choose closest location → Enable

**Storage:**
1. Click "Storage" → Get Started
2. Start in **test mode** → Done

### Step 3: Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" → Click web icon (</>)
3. Register app: "AutoCard" → Register app
4. Copy the firebaseConfig object

### Step 4: Configure App

Open `src/config/firebase.js` and replace with your config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // ← Paste your values
  authDomain: "autocard-xxx.firebaseapp.com",
  projectId: "autocard-xxx",
  storageBucket: "autocard-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 5: Run the App

```bash
npm start
```

Then:
- **Android**: Press `a` or scan QR with Expo Go
- **iOS**: Press `i` or scan QR with Camera app

## 📱 Testing the App

### Create Test Account
1. Open app → "Sign Up"
2. Enter:
   - Name: "Test User"
   - Student ID: "123456"
   - Email: "test@agu.edu.tr"
   - Password: "test123"
3. Click "Sign Up"

### Upload Test Bill
1. Click "Upload New Bill"
2. Take photo or choose from gallery
3. Enter:
   - Restaurant: "Cafe Istanbul"
   - Amount: "100"
4. Click "Upload Bill"
5. See stats update on home screen!

## 🔧 Common Issues

### "Command not found: expo"
```bash
npm install -g expo-cli
```

### "Unable to resolve module"
```bash
rm -rf node_modules
npm install
```

### Camera not working
- Make sure you're testing on a physical device
- Camera doesn't work on emulators/simulators
- Use "Choose from Gallery" for testing

### Firebase errors
- Double-check your firebase.js config
- Make sure all services are enabled
- Check Firestore rules are in test mode

## 📊 Firestore Security Rules (Production)

Before deploying, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /bills/{billId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId 
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🎨 Customization

### Change Brand Color
Edit `src/theme/themes.js`:
```javascript
sub: 'text-[#YOUR_COLOR]'
```

### Add New Screens
1. Create file in `src/screens/`
2. Import in `App.js`
3. Add to navigation stack

### Modify Discount Rate
Edit `src/services/billService.js`:
```javascript
updateUserStats(userId, amount, restaurantName, 0.15) // 15% discount
```

## 📞 Need Help?

Check the main README.md for detailed documentation.

Happy coding! 🚗✨
