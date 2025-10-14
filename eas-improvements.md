EAS Workflows with Fingerprint-based Conditional Builds (iOS-only) │ │
│ │ │ │
│ │ Pattern Overview │ │
│ │ │ │
│ │ 1. Calculate fingerprint │ │
│ │ 2. Check if build exists with that fingerprint │ │
│ │ 3. If no build exists → create new build │ │
│ │ 4. If build exists → publish OTA update instead │ │
│ │ │ │
│ │ 1. Production Build Workflow │ │
│ │ │ │
│ │ - File: .eas/workflows/production-build.yml │ │
│ │ - Trigger: Push to main branch │ │
│ │ - Jobs: │ │
│ │ - fingerprint: Calculate project fingerprint │ │
│ │ - get_ios_build: Check if build exists with fingerprint hash (profile: production) │ │
│ │ - build_ios: Build iOS if no build found (if: !needs.get_ios_build.outputs.build_id) │ │
│ │ - submit_ios: Submit to App Store (needs build_ios) │ │
│ │ - publish_update: Publish OTA update if build exists (if: needs.get_ios_build.outputs.build_id) │ │
│ │ │ │
│ │ 2. Development Build Workflow │ │
│ │ │ │
│ │ - File: .eas/workflows/development-build.yml │ │
│ │ - Trigger: Push to chore/**, feat/**, fix/\*\* branches │ │
│ │ - Jobs: │ │
│ │ - fingerprint: Calculate project fingerprint │ │
│ │ - get_ios_build: Check if build exists with fingerprint hash (profile: development) │ │
│ │ - build_ios: Build iOS if no build found (if: !needs.get_ios_build.outputs.build_id) │ │
│ │ - publish_update: Publish OTA update if build exists (if: needs.get_ios_build.outputs.build_id) │ │
│ │ │ │
│ │ Note: Development workflow skips store submission (internal distribution) │ │
│ │ │ │
│ │ 3. Keep existing update-only workflows │ │
│ │ │ │
│ │ - Keep production-update.yml and development-update.yml as-is for manual update-only triggers if needed
