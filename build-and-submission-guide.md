# YouFirst Tracker: TestFlight Build & Submission Guide

This guide will walk you through the complete process of building the YouFirst Tracker app and submitting it to TestFlight for testing.

## Prerequisites

1. Make sure you have:
   - An active Apple Developer account ($99/year)
   - Xcode installed on your Mac
   - Node.js and npm installed

2. Check your environment:
   - Update your environment variables for production in `.env` file
   - Ensure your backend services (Supabase) are properly configured

## Step 1: Prepare Your Environment

Run the verification script to check app assets:

```bash
./verify-app-assets.sh
```

Fix any issues reported by the verification script before proceeding.

## Step 2: Update Configuration for Production

The `capacitor.config.ts` file has been updated to disable the development server configuration.

## Step 3: Build the App

Run the build script:

```bash
./build-for-testflight.sh
```

This script will:
1. Set the environment to production
2. Build the web app
3. Sync the web build with native platforms
4. Open Xcode for iOS build

## Step 4: Archive in Xcode

Once Xcode opens:

1. Select the "App" scheme
2. Select "Any iOS Device" as the build target
3. Go to Product > Archive
4. Wait for the archiving process to complete

## Step 5: Upload to TestFlight

After the archive is created:

1. The Xcode Organizer will open automatically
2. Select your most recent archive
3. Click "Distribute App"
4. Choose "App Store Connect" and click "Next"
5. Select "Upload" and continue with the wizard
6. Fill in the compliance information when prompted
7. Click "Upload" to start the submission process

## Step 6: Configure TestFlight in App Store Connect

After uploading:

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to "Apps" > "YouFirst Tracker" > "TestFlight"
3. Wait for the build to finish processing (usually 15-30 minutes)
4. Once processed, add testers:

### Internal Testing
- Add team members as internal testers (up to 25)
- They'll receive an email with instructions to install

### External Testing (Optional)
- Create an external testing group
- Add external testers by email
- Provide beta app description, feedback contact email
- Submit for review (external testing requires Apple review)

## Step 7: Manage Your TestFlight Builds

As you make changes:

1. Update your app version or build number
2. Rebuild and upload new versions
3. Test thoroughly and gather feedback
4. Fix issues and repeat the process

## Common Issues and Solutions

### Build Failures
- Check for any Xcode warnings or errors
- Verify all native dependencies are properly installed
- Check bundle identifier and team settings

### Upload Failures
- Ensure you have proper signing certificates
- Check that all required app icons are included
- Verify version and build numbers are not duplicates

### TestFlight Processing Failures
- Check App Store Connect for specific error messages
- Common issues include missing privacy declarations or export compliance info
- Fix the issues and upload a new build

## Getting Ready for App Store

Once your app is thoroughly tested:

1. Complete all App Store metadata in App Store Connect
2. Add screenshots and app preview videos
3. Prepare marketing materials and keywords
4. Submit for App Store Review

Good luck with your TestFlight submission!
