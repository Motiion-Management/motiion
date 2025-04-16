import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export default function BackgroundGradientView({ children }: { children: React.ReactNode }) {
  return (
    <View className="relative h-full flex-1 bg-[#003D37]">
      <LinearGradient
        colors={['transparent', '#000', '#000']}
        style={styles.background}
        start={{ x: 1.3, y: 0.2 }}
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
