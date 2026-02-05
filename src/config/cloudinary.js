/**
 * Cloudinary Configuration
 * 
 * Sign up at https://cloudinary.com/users/register/free
 * Get your credentials from your Cloudinary Dashboard
 */

export const cloudinaryConfig = {
  // Your Cloudinary cloud name (required)
  cloudName: 'dg1sca6lt',
  
  // Unsigned upload preset (create in Cloudinary Dashboard)
  // Settings > Upload > Add upload preset > Unsigned mode
  uploadPreset: 'autocard-bills',
  
  // API endpoint (don't change)
  uploadUrl: 'https://api.cloudinary.com/v1_1',
};

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Sign up for FREE at: https://cloudinary.com/users/register/free
 * 2. Go to Dashboard to find your Cloud Name
 * 3. Create an Upload Preset:
 *    - Settings > Upload > Add upload preset
 *    - Name: autocard-bills (or any name)
 *    - Unsigned: ON
 *    - Allowed formats: jpg, png, jpeg
 *    - Save
 * 4. Copy the preset name and cloud name here
 * 5. Bill images will be automatically organized in 'autocard-bills' folder
 */
