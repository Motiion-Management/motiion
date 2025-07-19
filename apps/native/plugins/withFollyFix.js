const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

module.exports = function withFollyFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile')
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8')
        
        // Add the Folly fix to the post_install hook
        const postInstallHook = `
    # Fix for React Native 0.80.x - disable coroutines in Folly
    installer.pods_project.targets.each do |target|
      if target.name == 'RCT-Folly'
        target.build_configurations.each do |config|
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
        end
      end
    end`
        
        // Find the post_install block and add our fix before the last 'end'
        const postInstallRegex = /post_install do \|installer\|[\s\S]*?(\n\s*end\s*\nend)/
        const match = podfileContent.match(postInstallRegex)
        
        if (match) {
          // Insert our fix right before the closing 'end' of post_install
          podfileContent = podfileContent.replace(
            match[1],
            `${postInstallHook}${match[1]}`
          )
        }
        
        fs.writeFileSync(podfilePath, podfileContent)
      }
      
      return config
    },
  ])
}