# Cloudinary Setup Guide

## Free Tier Benefits ✨
- **10GB bandwidth/month**
- **Unlimited storage**
- **Fast CDN delivery**
- **Automatic image optimization**

## 5-Minute Setup

### Step 1: Sign Up
1. Go to https://cloudinary.com/users/register/free
2. Create free account with email
3. Verify email

### Step 2: Get Cloud Name
1. Go to https://cloudinary.com/console
2. Find "Cloud Name" at the top of dashboard
3. Copy it (looks like: `abc123def`)

### Step 3: Create Upload Preset
1. In Dashboard, click **Settings** (gear icon)
2. Go to **Upload** tab
3. Scroll to **Upload presets** section
4. Click **Add upload preset**
5. Fill in:
   - **Preset name**: `autocard-bills`
   - **Unsigned**: Toggle ON
   - **Allowed formats**: jpg, png, jpeg
   - Save
6. Copy the preset name

### Step 4: Configure App
Edit `src/config/cloudinary.js`:
```javascript
export const cloudinaryConfig = {
  cloudName: 'YOUR_CLOUD_NAME',      // Paste your cloud name here
  uploadPreset: 'autocard-bills',     // Your upload preset name
  uploadUrl: 'https://api.cloudinary.com/v1_1',
};
```

### Step 5: Done! 🎉
Your app can now:
- Upload bill images to Cloudinary
- Store URLs in Firebase Firestore
- Access images from anywhere
- See all images in your Cloudinary dashboard

## FAQ

**Q: Is my data secure?**
A: Yes! Using unsigned uploads is secure because:
- Upload preset has restrictions
- Only allows jpg/png formats
- Can't modify other uploads
- Rate limiting available

**Q: Can users see my cloud name?**
A: Yes, and that's fine! It's not a secret - it's your unique identifier.

**Q: Where do I see uploaded bills?**
A: Cloudinary Dashboard > Media Library > autocard-bills folder

**Q: How much storage can I upload?**
A: Unlimited storage, 10GB bandwidth/month free tier

---

Once configured, bill uploads will work immediately! 🚀
