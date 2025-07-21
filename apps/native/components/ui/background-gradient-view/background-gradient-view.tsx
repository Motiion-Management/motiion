import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useColorScheme, View } from 'react-native';

export function BackgroundGradientView({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === 'dark';

  const gradientRGB = '21, 28, 25';

  const opaqueStop = isDarkMode ? 1 : 0;
  return (
    <View className="relative h-full flex-1 bg-background-default">
      <LinearGradient
        colors={[
          `rgba(${gradientRGB}, 0)`,
          `rgba(${gradientRGB}, ${opaqueStop})`,
          `rgba(${gradientRGB}, ${opaqueStop})`,
          `rgba(${gradientRGB}, ${opaqueStop})`,
        ]}
        style={styles.background}
        start={{ x: 1.5, y: 0.2 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
});
