import { StatusBar, Platform, View } from 'react-native'
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight

export function Header({ dark }: { dark?: boolean }) {
  return (
    <View style={{ height: STATUS_BAR_HEIGHT }}>
      <StatusBar
        translucent
        barStyle={dark ? 'light-content' : 'dark-content'}
      />
    </View>
  )
}

export function LightHeader() {
  return <Header />
}

export function DarkHeader() {
  return <Header dark />
}
