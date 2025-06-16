import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useColorScheme, View } from 'react-native';

export default function BackgroundGradientView({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  const gradientColor = colorScheme === 'dark' ? '#15191C' : '#F8F9FA';

  return (
    <View className="relative h-full flex-1 bg-background-default">
      <LinearGradient
        colors={['transparent', gradientColor, gradientColor]}
        style={styles.background}
        start={{ x: 1.5, y: 0.1 }}
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
