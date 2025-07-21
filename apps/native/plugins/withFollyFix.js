const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFollyFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');

        // Check if the prebuilt dependencies fix is already applied
        if (podfileContent.includes("ENV['RCT_USE_RN_DEP'] = '1'")) {
          return config;
        }

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

      return config;
    },
  ]);
};
