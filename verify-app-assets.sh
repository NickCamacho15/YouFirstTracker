#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying app assets for App Store submission...${NC}"

# Check app icon
APP_ICON_PATH="ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"

if [ -f "$APP_ICON_PATH" ]; then
    echo -e "${GREEN}✓ App icon exists${NC}"
    
    # Check app icon dimensions
    DIMENSIONS=$(sips -g pixelWidth -g pixelHeight "$APP_ICON_PATH" | grep -E 'pixelWidth|pixelHeight' | awk '{print $2}')
    WIDTH=$(echo "$DIMENSIONS" | head -1)
    HEIGHT=$(echo "$DIMENSIONS" | tail -1)
    
    if [ "$WIDTH" = "1024" ] && [ "$HEIGHT" = "1024" ]; then
        echo -e "${GREEN}✓ App icon dimensions are correct (1024x1024)${NC}"
    else
        echo -e "${RED}✗ App icon dimensions are incorrect. Found ${WIDTH}x${HEIGHT}, but should be 1024x1024${NC}"
        echo -e "${YELLOW}Please provide a 1024x1024 app icon for App Store submission${NC}"
    fi
else
    echo -e "${RED}✗ App icon not found at $APP_ICON_PATH${NC}"
    echo -e "${YELLOW}Please add a 1024x1024 app icon for App Store submission${NC}"
fi

# Check launch screen
LAUNCH_SCREEN_PATH="ios/App/App/Assets.xcassets/Splash.imageset"

if [ -d "$LAUNCH_SCREEN_PATH" ]; then
    echo -e "${GREEN}✓ Launch screen assets exist${NC}"
else
    echo -e "${RED}✗ Launch screen assets not found at $LAUNCH_SCREEN_PATH${NC}"
    echo -e "${YELLOW}Please add launch screen assets for App Store submission${NC}"
fi

# Check Info.plist required keys
INFO_PLIST_PATH="ios/App/App/Info.plist"

if [ -f "$INFO_PLIST_PATH" ]; then
    echo -e "${GREEN}✓ Info.plist exists${NC}"
    
    # Check for required keys
    REQUIRED_KEYS=(
        "CFBundleDisplayName"
        "CFBundleIdentifier"
        "CFBundleShortVersionString"
        "CFBundleVersion"
        "LSRequiresIPhoneOS"
        "UILaunchStoryboardName"
    )
    
    MISSING_KEYS=()
    
    for KEY in "${REQUIRED_KEYS[@]}"; do
        if ! grep -q "<key>$KEY</key>" "$INFO_PLIST_PATH"; then
            MISSING_KEYS+=("$KEY")
        fi
    done
    
    if [ ${#MISSING_KEYS[@]} -eq 0 ]; then
        echo -e "${GREEN}✓ Info.plist contains all required keys${NC}"
    else
        echo -e "${RED}✗ Info.plist is missing required keys: ${MISSING_KEYS[@]}${NC}"
        echo -e "${YELLOW}Please add these keys to Info.plist for App Store submission${NC}"
    fi
else
    echo -e "${RED}✗ Info.plist not found at $INFO_PLIST_PATH${NC}"
    echo -e "${YELLOW}Please ensure Info.plist exists for App Store submission${NC}"
fi

echo -e "\n${YELLOW}App assets verification complete.${NC}"
echo -e "${YELLOW}If there are any issues reported above, fix them before submitting to TestFlight.${NC}"
