# React Native Integration Guide for Panchangam App

This guide will help you integrate your Next.js Panchangam app with React Native to create a hybrid mobile app.

## Architecture Overview

```
React Native App (Main Container)
├── Native Modules (Alarms, Notifications, etc.)
├── React Native WebView
│   └── Next.js Panchangam App (Your existing app)
└── Bridge Communication (Native ↔ WebView)
```

## Step 1: Create React Native Project

```bash
# Create a new React Native project
npx react-native init PanchangamApp --template react-native-template-typescript

# Or if you prefer Expo (easier for beginners)
npx create-expo-app PanchangamApp
```

## Step 2: Install Required Dependencies

```bash
cd PanchangamApp
npm install react-native-webview
npm install @react-native-async-storage/async-storage
npm install @react-native-community/push-notification-ios
npm install react-native-push-notification
npm install @react-native-community/datetimepicker
npm install react-native-background-job

# For iOS (if using bare React Native)
cd ios && pod install && cd ..
```

## Step 3: Project Structure

```
PanchangamApp/
├── src/
│   ├── screens/
│   │   └── WebViewScreen.tsx
│   ├── services/
│   │   ├── AlarmService.ts
│   │   ├── NotificationService.ts
│   │   └── BridgeService.ts
│   ├── native/
│   │   ├── AlarmModule.ts (Android)
│   │   └── AlarmModule.m (iOS)
│   └── utils/
│       └── PanchangamCalculator.ts
├── android/
├── ios/
└── package.json
```

## Step 4: Create WebView Screen

Create `src/screens/WebViewScreen.tsx`:

```typescript
import React, { useRef } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { handleWebViewMessage } from '../services/BridgeService';

const WEBVIEW_URL = __DEV__ 
  ? 'http://localhost:3000'  // Development
  : 'https://your-production-url.com';  // Production

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    handleWebViewMessage(data, webViewRef);
  };

  const injectedJavaScript = `
    (function() {
      // Override console.log to send messages to React Native
      const originalLog = console.log;
      console.log = function(...args) {
        originalLog.apply(console, args);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CONSOLE_LOG',
          data: args
        }));
      };

      // Expose bridge function
      window.sendToNative = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      };

      // Listen for messages from React Native
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type) {
          handleNativeMessage(event.data);
        }
      });

      // Notify that WebView is ready
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'WEBVIEW_READY'
      }));
    })();
    true; // Required for iOS
  `;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEBVIEW_URL }}
        style={styles.webview}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('HTTP error: ', nativeEvent);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});
```

## Step 5: Create Bridge Service

Create `src/services/BridgeService.ts`:

```typescript
import { WebView } from 'react-native-webview';
import AlarmService from './AlarmService';
import NotificationService from './NotificationService';
import { calculateAuspiciousTimings } from '../utils/PanchangamCalculator';

export interface BridgeMessage {
  type: string;
  [key: string]: any;
}

export async function handleWebViewMessage(
  message: BridgeMessage,
  webViewRef: React.RefObject<WebView>
) {
  console.log('Received message from WebView:', message);

  switch (message.type) {
    case 'SET_ALARM_WITH_TRACK':
      await AlarmService.setAlarm({
        trackId: message.trackId,
        trackTitle: message.trackTitle,
        time: message.time,
      });
      sendToWebView(webViewRef, {
        type: 'ALARM_SET',
        success: true,
        trackId: message.trackId,
      });
      break;

    case 'SET_WALLPAPER':
      // Handle wallpaper setting
      sendToWebView(webViewRef, {
        type: 'WALLPAPER_SET',
        success: true,
      });
      break;

    case 'PLAY_AUDIO':
      // Handle audio playback
      break;

    case 'PAUSE_AUDIO':
      // Handle audio pause
      break;

    case 'REQUEST_AUSPICIOUS_TIMINGS':
      const timings = await calculateAuspiciousTimings(message.date);
      sendToWebView(webViewRef, {
        type: 'AUSPICIOUS_TIMINGS',
        data: timings,
      });
      break;

    case 'SCHEDULE_NOTIFICATION':
      await NotificationService.scheduleNotification({
        title: message.title,
        body: message.body,
        date: message.date,
        data: message.data,
      });
      sendToWebView(webViewRef, {
        type: 'NOTIFICATION_SCHEDULED',
        success: true,
      });
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

export function sendToWebView(
  webViewRef: React.RefObject<WebView>,
  message: any
) {
  if (webViewRef.current) {
    webViewRef.current.postMessage(JSON.stringify(message));
  }
}
```

## Step 6: Create Alarm Service

Create `src/services/AlarmService.ts`:

```typescript
import { Platform, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { AlarmModule } from '../native/AlarmModule';

export interface AlarmConfig {
  trackId: number;
  trackTitle: string;
  time: Date;
  repeat?: boolean;
}

class AlarmService {
  async requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SCHEDULE_EXACT_ALARM
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  async setAlarm(config: AlarmConfig) {
    await this.requestPermissions();

    if (Platform.OS === 'android') {
      // Use native module for Android alarms
      AlarmModule.setAlarm({
        id: config.trackId,
        time: config.time.getTime(),
        title: config.trackTitle,
        trackUrl: `track_${config.trackId}`,
      });
    } else {
      // Use PushNotification for iOS
      PushNotification.localNotificationSchedule({
        id: config.trackId.toString(),
        title: 'Panchangam Alarm',
        message: config.trackTitle,
        date: config.time,
        playSound: true,
        soundName: 'default',
        userInfo: {
          trackId: config.trackId,
          type: 'ALARM',
        },
      });
    }
  }

  cancelAlarm(trackId: number) {
    if (Platform.OS === 'android') {
      AlarmModule.cancelAlarm(trackId);
    } else {
      PushNotification.cancelLocalNotifications({
        id: trackId.toString(),
      });
    }
  }
}

export default new AlarmService();
```

## Step 7: Create Notification Service

Create `src/services/NotificationService.ts`:

```typescript
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export interface NotificationConfig {
  title: string;
  body: string;
  date: Date;
  data?: any;
  repeatType?: 'day' | 'week' | 'month';
}

class NotificationService {
  constructor() {
    this.configure();
  }

  configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel(
      {
        channelId: 'panchangam-channel',
        channelName: 'Panchangam Notifications',
        channelDescription: 'Notifications for auspicious timings',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  async scheduleNotification(config: NotificationConfig) {
    PushNotification.localNotificationSchedule({
      id: Math.random().toString(),
      title: config.title,
      message: config.body,
      date: config.date,
      channelId: 'panchangam-channel',
      userInfo: config.data,
      repeatType: config.repeatType,
      playSound: true,
      soundName: 'default',
    });
  }

  scheduleAuspiciousTimingNotification(date: Date, timing: any) {
    this.scheduleNotification({
      title: 'Auspicious Time',
      body: `${timing.name} - ${timing.startTime} to ${timing.endTime}`,
      date: date,
      data: {
        type: 'AUSPICIOUS_TIMING',
        timing: timing,
      },
    });
  }

  scheduleInauspiciousTimingNotification(date: Date, timing: any) {
    this.scheduleNotification({
      title: 'Inauspicious Time',
      body: `Avoid important activities during ${timing.name}`,
      date: date,
      data: {
        type: 'INAUSPICIOUS_TIMING',
        timing: timing,
      },
    });
  }
}

export default new NotificationService();
```

## Step 8: Create Panchangam Calculator

Create `src/utils/PanchangamCalculator.ts`:

```typescript
export interface AuspiciousTiming {
  name: string;
  startTime: string;
  endTime: string;
  type: 'auspicious' | 'inauspicious';
}

export async function calculateAuspiciousTimings(
  date: Date
): Promise<AuspiciousTiming[]> {
  // Fetch panchangam data from your API
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    const response = await fetch(
      `http://your-api-url.com/api/panchangam/${dateStr}`
    );
    const data = await response.json();
    
    // Process and return timings
    return processPanchangamData(data);
  } catch (error) {
    console.error('Error fetching panchangam:', error);
    return [];
  }
}

function processPanchangamData(data: any): AuspiciousTiming[] {
  const timings: AuspiciousTiming[] = [];
  
  // Process auspicious timings (Abhijit Muhurat, Amrit Kaal, etc.)
  if (data.auspicious_timings) {
    data.auspicious_timings.forEach((timing: any) => {
      timings.push({
        name: timing.name,
        startTime: timing.start,
        endTime: timing.end,
        type: 'auspicious',
      });
    });
  }
  
  // Process inauspicious timings (Rahu Kaal, Yamaganda, etc.)
  if (data.inauspicious_timings) {
    data.inauspicious_timings.forEach((timing: any) => {
      timings.push({
        name: timing.name,
        startTime: timing.start,
        endTime: timing.end,
        type: 'inauspicious',
      });
    });
  }
  
  return timings;
}

export function scheduleAllTimingNotifications(date: Date) {
  calculateAuspiciousTimings(date).then((timings) => {
    timings.forEach((timing) => {
      const notificationDate = new Date(date);
      const [hours, minutes] = timing.startTime.split(':').map(Number);
      notificationDate.setHours(hours, minutes, 0, 0);
      
      if (timing.type === 'auspicious') {
        NotificationService.scheduleAuspiciousTimingNotification(
          notificationDate,
          timing
        );
      } else {
        NotificationService.scheduleInauspiciousTimingNotification(
          notificationDate,
          timing
        );
      }
    });
  });
}
```

## Step 9: Update Your Next.js App Bridge

Update your existing `lib/webviewBridge.js`:

```javascript
export const sendToNative = (message) => {
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.log('Not in React Native WebView:', message);
  }
};

// Listen for messages from React Native
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data && typeof event.data === 'string') {
      try {
        const data = JSON.parse(event.data);
        handleNativeMessage(data);
      } catch (e) {
        console.error('Error parsing native message:', e);
      }
    }
  });
}

function handleNativeMessage(data) {
  switch (data.type) {
    case 'ALARM_SET':
      console.log('Alarm set successfully:', data);
      // Show success message in your UI
      break;
    case 'AUSPICIOUS_TIMINGS':
      // Update UI with timings
      console.log('Auspicious timings:', data.data);
      break;
    default:
      console.log('Unknown native message:', data);
  }
}
```

## Step 10: Main App Entry Point

Update `App.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WebViewScreen from './src/screens/WebViewScreen';
import NotificationService from './src/services/NotificationService';

const Stack = createStackNavigator();

export default function App() {
  // Initialize notification service
  React.useEffect(() => {
    NotificationService.configure();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Panchangam"
          component={WebViewScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Step 11: Android Native Module (Optional - for exact alarms)

Create `android/app/src/main/java/com/panchangamapp/AlarmModule.java`:

```java
package com.panchangamapp;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class AlarmModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;

    public AlarmModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AlarmModule";
    }

    @ReactMethod
    public void setAlarm(ReadableMap config) {
        int id = config.getInt("id");
        long time = (long) config.getDouble("time");
        String title = config.getString("title");

        AlarmManager alarmManager = (AlarmManager) reactContext.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(reactContext, AlarmReceiver.class);
        intent.putExtra("trackId", id);
        intent.putExtra("title", title);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            reactContext,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            time,
            pendingIntent
        );
    }

    @ReactMethod
    public void cancelAlarm(int id) {
        AlarmManager alarmManager = (AlarmManager) reactContext.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(reactContext, AlarmReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            reactContext,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        alarmManager.cancel(pendingIntent);
    }
}
```

## Step 12: Build and Run

```bash
# Android
npm run android

# iOS
npm run ios
```

## Additional Features to Implement

1. **Background Tasks**: Schedule daily panchangam calculations
2. **Widget Support**: Show today's auspicious timings on home screen
3. **Offline Support**: Cache panchangam data
4. **Deep Linking**: Open specific pages from notifications
5. **Biometric Auth**: Secure app access

## Testing

1. Test WebView communication
2. Test alarm setting and triggering
3. Test notification scheduling
4. Test auspicious timing calculations

## Production Deployment

1. Build production Next.js app
2. Deploy to hosting (Vercel, Netlify, etc.)
3. Update WebView URL in React Native app
4. Build and publish to App Store/Play Store








