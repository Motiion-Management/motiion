import { WebView as RNWebView } from 'react-native-webview'

const baseURL = 'https://motiion.io'

export default function WebView({ path }) {
  const url = new URL(path, baseURL)

  const newSource = {
    uri: url.toString()
  }

  return <RNWebView sharedCookiesEnabled source={newSource} />
}
