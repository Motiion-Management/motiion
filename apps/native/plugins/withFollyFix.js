const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFollyFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const podfilePath = path.join(platformProjectRoot, 'Podfile');
      const xcodeEnvPath = path.join(platformProjectRoot, '.xcode.env.local');

      // Modify Podfile
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');

        // Check if the prebuilt dependencies fix is already applied
        if (!podfileContent.includes("ENV['RCT_USE_RN_DEP'] = '1'")) {
          // Find the line where environment variables are set
          const envRegex =
            /ENV\['RCT_USE_RN_DEP'\] = '1' if podfile_properties\['ios\.buildFromSource'\] == 'false'/;

          if (envRegex.test(podfileContent)) {
            // Replace the conditional with a forced setting
            podfileContent = podfileContent.replace(
              envRegex,
              "ENV['RCT_USE_RN_DEP'] = '1' # Force use of prebuilt dependencies for React Native 0.80.x"
            );
          } else {
            // If the line doesn't exist, add it after other ENV declarations
            const envBlockRegex = /(ENV\[['"][^'"]+['"]\][^\\n]*\n)+/;
            const match = podfileContent.match(envBlockRegex);

            if (match) {
              const insertPosition = match.index + match[0].length;
              podfileContent =
                podfileContent.slice(0, insertPosition) +
                "ENV['RCT_USE_RN_DEP'] = '1' # Force use of prebuilt dependencies for React Native 0.80.x\n" +
                podfileContent.slice(insertPosition);
            }
          }

          fs.writeFileSync(podfilePath, podfileContent);
        }
      }

      // Modify .xcode.env.local
      if (fs.existsSync(xcodeEnvPath)) {
        let xcodeEnvContent = fs.readFileSync(xcodeEnvPath, 'utf8');

        // Check if RCT_USE_RN_DEP is already set
        if (!xcodeEnvContent.includes('RCT_USE_RN_DEP')) {
          // Add RCT_USE_RN_DEP after NODE_BINARY
          xcodeEnvContent = xcodeEnvContent.trim() + '\nexport RCT_USE_RN_DEP=1\n';
          fs.writeFileSync(xcodeEnvPath, xcodeEnvContent);
        }
      }

      return config;
    },
  ]);
};
