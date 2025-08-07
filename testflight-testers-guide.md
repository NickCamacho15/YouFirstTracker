# Managing TestFlight Testers for YouFirst Tracker

This guide explains how to manage your testers in TestFlight after successfully uploading your app.

## Types of TestFlight Testers

### Internal Testers
- Limited to users who have roles in your App Store Connect account
- Maximum of 25 internal testers
- No review required for internal testing
- Fastest way to get feedback from your team

### External Testers
- Can be anyone with an email address or public link
- Up to 10,000 external testers
- Requires Apple review before testing can begin
- Can be organized into groups for targeted testing

## Adding Internal Testers

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to "Users and Access" in the sidebar
3. Add team members if they aren't already in your account
4. Assign them the "App Manager" or "Developer" role
5. Go to "Apps" > "YouFirst Tracker" > "TestFlight" > "Internal Testing"
6. Click "Add Testers" > "Add App Store Connect Users"
7. Select the users you want to add and click "Add"

### Testing Notes for Internal Testers
- Testers will receive an email invitation
- They need to install the TestFlight app from the App Store
- They can then redeem their invitation and install your app
- Updates will be available automatically in TestFlight
- Internal testers can test up to 30 days per build

## Setting Up External Testing

1. Go to "Apps" > "YouFirst Tracker" > "TestFlight" > "External Testing"
2. Click "Create Group" (if you want to organize testers)
3. Enter a group name (e.g., "Beta Testers," "Friends & Family")
4. Click "Create"

### Adding External Testers to Groups

1. Select your external testing group
2. Click "Add Testers" > "Add New Testers"
3. Enter email addresses (one per line)
4. Optionally add first and last names
5. Click "Next" and then "Add"

### Enabling Public Link for External Testing

For broader testing:

1. Select your external testing group
2. Turn on "Public Link"
3. Set the maximum number of testers
4. Copy the public link to share with potential testers

### Submitting for External Testing Review

Before external testers can access your app:

1. Complete the "Test Information" section:
   - Add beta app description
   - Enter feedback email
   - Provide marketing URL (optional)
   - Enter privacy policy URL (required)
2. Select which build(s) to test
3. Click "Submit for Review"
4. Wait for Apple's review (typically 1-2 days)
5. Once approved, invitations will be sent to your testers

## Managing Tester Feedback

### Automatic Feedback
- TestFlight includes automatic crash reports
- View crash reports in App Store Connect under TestFlight > Builds

### Collecting Feedback
- Create a simple feedback form using Google Forms or similar
- Include the link in your TestFlight app description
- Ask testers to report bugs and suggestions

### Best Practices
- Clearly communicate what to test
- Give testers specific tasks or scenarios
- Set expectations for feedback format
- Follow up with testers who provide valuable feedback
- Update builds regularly based on feedback

## Updating Your TestFlight App

As you make improvements:

1. Increase your build number in Xcode
2. Archive and upload the new build
3. Wait for processing
4. Enable the new build for testing
5. Testers will be notified of the update automatically

## Monitoring TestFlight Metrics

App Store Connect provides metrics on:
- Number of testers
- Installs and sessions
- Crashes and feedback
- Retention and usage

Review these metrics regularly to identify issues and track engagement.

## Preparing for App Store Submission

After successful TestFlight testing:
1. Address all critical feedback
2. Complete remaining App Store metadata
3. Prepare final marketing materials
4. Submit for App Store Review

Good luck with your TestFlight testing!
