# TestFlight Submission Guide

This guide will walk you through the process of submitting your YouFirst Tracker app to TestFlight for testing.

## Apple Developer Account Setup

### 1. Ensure Active Apple Developer Membership
- You need an active Apple Developer Program membership ($99/year)
- Go to [developer.apple.com](https://developer.apple.com) and sign in
- If you don't have a membership, enroll in the Apple Developer Program
- Ensure your membership is active and not expired

### 2. Create App Record in App Store Connect

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to "Apps" section
3. Click the "+" button to add a new app
4. Fill in the required information:
   - Platform: iOS
   - App Name: YouFirst Tracker
   - Bundle ID: com.youfirst.tracker (must match your Capacitor config)
   - SKU: youfirst-tracker (or any unique identifier)
   - Primary Language: English (or your preferred language)
5. Click "Create"

### 3. Configure App Information

After creating your app record, you'll need to add the following information:

#### App Information Tab
- Fill out all required metadata:
  - Privacy Policy URL
  - Support URL
  - App category
  - Age rating

#### TestFlight Tab Setup
1. Internal Testing:
   - Add internal testers (Apple ID emails)
   - These can be developers on your team (up to 25 people)

2. External Testing (Optional):
   - Set up an external testing group
   - Provide a beta app description, feedback email, etc.
   - This will require Apple review before testers can access

## Xcode Configuration

### 1. Signing & Capabilities
- Open your project in Xcode (using the build script or manually)
- Select the App target
- Go to "Signing & Capabilities" tab
- Ensure "Automatically manage signing" is checked
- Select your Team (associated with your Apple Developer account)
- Verify the Bundle Identifier matches what you entered in App Store Connect

### 2. App Icons and Launch Screens
- Ensure all required app icons are present in the Assets catalog
- Check that the launch screen is configured properly

### 3. Version and Build Numbers
- Set the Version number (e.g., 1.0.0) 
- Set the Build number (start with 1, increment for each TestFlight submission)

## Build and Submit Process

### 1. Run the Build Script
```bash
./build-for-testflight.sh
```

### 2. Archive the Build in Xcode
- Follow the instructions provided by the script
- Select "Product > Archive" in Xcode
- Wait for the archiving process to complete

### 3. Upload to TestFlight
- Once archiving is complete, the Xcode Organizer will open
- Select your archive and click "Distribute App"
- Choose "App Store Connect" and click "Next"
- Select "Upload" and follow the prompts
- Complete the compliance information when requested
- Click "Upload" to submit your build

### 4. Wait for Processing
- After uploading, wait for Apple to process your build
- This usually takes 15-30 minutes but can sometimes take longer
- You'll receive an email when your build is ready for testing

### 5. Add Testers in App Store Connect
- Go back to App Store Connect > TestFlight
- Add internal testers if you haven't already
- Once your build is processed, you can assign it to testers
- Testers will receive an email with instructions to install the app

## Common Issues and Solutions

### If Signing Fails
- Ensure your Apple Developer account is active
- Check that your provisioning profile is valid
- Try regenerating provisioning profiles in Xcode

### If Upload Fails
- Check that your bundle ID is unique and registered
- Ensure all required app icons are included
- Verify your version and build numbers are correct

### If Build Processing Fails
- Check App Store Connect for specific error messages
- Common issues include missing privacy declarations or export compliance info
- Fix the issues and upload a new build

## Next Steps After TestFlight

Once your app is successfully tested in TestFlight:
1. Fix any bugs or issues reported by testers
2. Complete all required metadata in App Store Connect
3. Submit for App Store Review when ready for public release

Good luck with your TestFlight submission!
