# Panchangam Web (mobile-first Next.js)

A stunning mobile-first Panchangam calendar app built with Next.js and Tailwind CSS, designed to be embedded in React Native WebView.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```bash
   cp env.example .env.local
   ```

3. Configure API Base URL in `.env.local`:
   
   **For WebView in React Native:**
   ```env
   # Android Emulator
   NEXT_PUBLIC_API_BASE=http://10.0.2.2:8000
   
   # iOS Simulator / Real Device (replace with your PC's LAN IP)
   NEXT_PUBLIC_API_BASE=http://192.168.1.2:8888
   ```
   
   **For Production Web:**
   ```env
   NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
   ```
   
   **Leave empty for auto-detection** (uses defaults based on platform)

4. Run development server:
   ```bash
   npm run dev
   ```

## API Endpoint Configuration

The app automatically detects the environment and uses the appropriate API base URL:

### Auto-Detection Logic:
- **WebView Detection**: Automatically detects if running in React Native WebView
- **Platform Detection**: Detects Android/iOS platform
- **Environment Override**: Uses `NEXT_PUBLIC_API_BASE` environment variable if set

### Default URLs (when not set via env):
- **Android WebView**: `http://192.168.1.2:8888`
- **iOS WebView**: `http://192.168.1.2:8888`
- **Regular Web**: `https://api.yourdomain.com`

**Important**: Replace `192.168.1.2:8888` with your actual PC's LAN IP address and port in `lib/getBaseURL.js` or use `.env.local` file.

### Finding Your PC's LAN IP:
- **Windows**: Run `ipconfig` and look for IPv4 Address
- **Mac/Linux**: Run `ifconfig` or `ip addr` and look for your local network IP

## Features

- 📱 **Mobile-First Design** (max-width 420px)
- 🎨 **Stunning UI** with Tailwind CSS, gradients, and glassmorphism
- 📅 **Beautiful Calendar** with festival and event indicators
- 🔔 **WebView Integration** ready for React Native
- 💾 **Offline Support** with React Query persistence (IndexedDB)
- ⚡ **Fast & Smooth** animations and transitions

## Notes

- Use `lib/webviewBridge.sendToNative()` to communicate with native layer after embedding in RN WebView
- React Query caches data into IndexedDB; adjust staleness based on your needs
- API base URL is logged to console in development mode for debugging
