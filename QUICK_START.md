# Quick Start Guide: Integrating Next.js with React Native

## Prerequisites

- Node.js installed
- React Native CLI or Expo CLI
- Android Studio (for Android) or Xcode (for iOS)
- Your Next.js app running

## Step-by-Step Integration

### 1. Create React Native Project

```bash
# Using Expo (Recommended for beginners)
npx create-expo-app PanchangamMobileApp
cd PanchangamMobileApp

# Or using React Native CLI
npx react-native init PanchangamMobileApp
cd PanchangamMobileApp
```

### 2. Install Dependencies

```bash
npm install react-native-webview
npm install @react-native-async-storage/async-storage
npm install react-native-push-notification
npm install @react-native-community/datetimepicker

# For Expo projects, use:
npx expo install react-native-webview
npx expo install @react-native-async-storage/async-storage
```

### 3. Update Your Next.js App

Make sure your `lib/webviewBridge.js` is updated (see REACT_NATIVE_INTEGRATION.md)

### 4. Create Basic WebView Screen

Create `App.js` or `App.tsx`:

```javascript
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WEBVIEW_URL = __DEV__ 
  ? 'http://localhost:3000'  // Your Next.js dev server
  : 'https://your-production-url.com';

export default function App() {
  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Message from WebView:', data);
    
    // Handle different message types
    switch (data.type) {
      case 'SET_ALARM_WITH_TRACK':
        // Implement alarm setting
        console.log('Setting alarm:', data);
        break;
      case 'SET_WALLPAPER':
        // Implement wallpaper setting
        console.log('Setting wallpaper:', data);
        break;
      default:
        console.log('Unknown message:', data);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: WEBVIEW_URL }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        injectedJavaScript={`
          window.ReactNativeWebView = true;
          window.sendToNative = function(message) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          };
          true;
        `}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
```

### 5. Run Your Apps

**Terminal 1 - Next.js App:**
```bash
cd nextjsweb
npm run dev
```

**Terminal 2 - React Native App:**
```bash
cd PanchangamMobileApp
npm start
# Then press 'a' for Android or 'i' for iOS
```

### 6. Test Communication

In your Next.js app, test the bridge:

```javascript
// This should work from your Next.js app
sendToNative({
  type: 'SET_ALARM_WITH_TRACK',
  trackId: 123,
  trackTitle: 'Test Alarm'
});
```

You should see the message in React Native console.

## Next Steps

1. Implement alarm functionality (see REACT_NATIVE_INTEGRATION.md)
2. Add notification scheduling
3. Implement auspicious timing calculations
4. Add background tasks
5. Test on real devices

## Common Issues

### Issue: WebView not loading
- Check if Next.js server is running
- Verify URL is correct
- Check network permissions in AndroidManifest.xml

### Issue: Messages not received
- Ensure `injectedJavaScript` is set correctly
- Check `onMessage` handler is properly set up
- Verify JSON parsing

### Issue: CORS errors
- Add CORS headers in Next.js API routes
- Or use same origin for development

## Development Tips

1. Use React Native Debugger for debugging
2. Enable remote debugging in WebView
3. Use console.log extensively for debugging
4. Test on both Android and iOS
5. Use Flipper for advanced debugging








