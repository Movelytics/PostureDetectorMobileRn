import {Dimensions, StyleSheet, Text, View} from 'react-native';
import { WebView } from 'react-native-webview'
import {useEffect, useState} from "react";
import { Camera } from 'expo-camera'
import {renderPose} from "./utils";

export default function App() {
  const [hasPermission, setHasPermission] = useState(false)
  const [currentPoses, setCurrentPoses] = useState()

  // Our API request the width and height wanted for display the webcam inside the webview
  const width = 300
  const height = 300


  // We need a bridge to transit data between the ReactNative app and our WebView
  // The WebView will use this function define here to send info that we will use later
  const jsBridge = `
  (function() {
    window.webViewCallback = function(info) {
      window.ReactNativeWebView.postMessage(JSON.stringify(info));
    }
  })();
`

  const handlePoses = (poses) => {
    //console.log('current body poses :', poses)
    setCurrentPoses(poses)
  }

  //This is the function pass to the WebView to listen info from the WebView
  const webViewCallback = (info) => {
    switch (info.type) {
      case 'body poses':
        return handlePoses(info.poses)
      default:
        return handlePoses(info)
    }
  }

  //Our API need to have access to the devise camera
  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  if (!hasPermission) return <View style={styles.container}><Text>The app needs access to your camera. Allow it in your device settings</Text></View>

  return (
    <View style={styles.container}>
      <WebView
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={{
          width: width,
          height: height,
          zIndex: 1,
        }}
        source={{
          uri: `https://posture-detector-api.vercel.app/posture-detect?width=${width}&height=${height}`,
        }}
        originWhitelist={['*']}
        injectedJavaScript={jsBridge}
        onMessage={(event) => {
          const info = JSON.parse(event.nativeEvent.data)
          webViewCallback(info)
        }}
      />
      {renderPose(currentPoses)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
