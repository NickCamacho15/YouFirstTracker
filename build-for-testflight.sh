#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building YouFirst Tracker for TestFlight...${NC}"

# Step 1: Set environment to production
echo -e "${GREEN}Setting environment to production...${NC}"
export NODE_ENV=production

# Step 2: Build the web app
echo -e "${GREEN}Building web application...${NC}"
npm run build

# Step 3: Update native projects with latest web build
echo -e "${GREEN}Updating iOS and Android projects...${NC}"
npx cap sync

# Step 4: Open Xcode to prepare the archive
echo -e "${YELLOW}Opening Xcode...${NC}"
echo -e "${YELLOW}Please follow these steps in Xcode:${NC}"
echo -e "1. Select 'App' target"
echo -e "2. Set device to 'Any iOS Device'"
echo -e "3. Ensure bundle ID is set to 'com.youfirst.tracker'"
echo -e "4. Ensure signing is set up with your Apple Developer Account"
echo -e "5. Select Product > Archive to create an archive"
echo -e "6. When the archive is complete, use the Xcode Organizer to upload to TestFlight"

npx cap open ios

echo -e "${GREEN}Build script completed.${NC}"
echo -e "${YELLOW}After uploading to TestFlight, it may take some time for Apple to process the build.${NC}"
