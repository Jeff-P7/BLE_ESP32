# BLE ESP32 Scanner

A modern React Native application for discovering and connecting to ESP32 devices via Bluetooth Low Energy (BLE).

## Features

- 🔍 **Advanced BLE Scanning**: Discover nearby Bluetooth devices with real-time updates
- 🎯 **ESP32 Detection**: Automatically identify and filter ESP32 devices
- 📱 **Modern UI**: Clean, intuitive interface with Material Design principles
- 🔧 **TypeScript**: Fully typed for better development experience
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback
- 📊 **Device Information**: Detailed device information including RSSI, services, and manufacturer data
- 🎨 **Customizable**: Easy to customize colors, spacing, and configuration

## ESP32 Device Support

The app automatically detects various ESP32 variants:
- ESP32 (standard)
- ESP32-S2
- ESP32-S3
- ESP32-C3

## Requirements

- React Native with Expo
- Development build (BLE functionality requires native modules)
- Android/iOS device with Bluetooth Low Energy support
- Proper permissions for Bluetooth and location access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Jeff-P7/BLE_ESP32.git
cd BLE_ESP32
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a development build:
```bash
npx expo install expo-dev-client
npx expo run:android
# or
npx expo run:ios
```

## Usage

1. **Start the app** on your device
2. **Grant permissions** when prompted for Bluetooth and location access
3. **Tap "Start Scan"** to begin discovering nearby devices
4. **View discovered devices** with detailed information
5. **Filter ESP32 devices** using the toggle button
6. **Tap on devices** to connect (connection logic to be implemented)

## Project Structure

```
├── components/          # Reusable UI components
│   ├── DeviceCard.tsx   # Device display component
│   ├── ScanControls.tsx # Scan control buttons
│   └── ErrorBanner.tsx  # Error display component
├── hooks/               # Custom React hooks
│   └── useBLE.ts        # BLE functionality hook
├── types/               # TypeScript type definitions
│   └── ble.ts           # BLE-related types
├── constants/           # App constants and configuration
│   └── ble.ts           # BLE configuration constants
└── App.tsx              # Main application component
```

## Configuration

Key configuration options in `constants/ble.ts`:

- `SCAN_TIMEOUT`: How long to scan for devices (default: 10 seconds)
- `RSSI_THRESHOLD`: Minimum signal strength to display
- `MAX_DEVICES`: Maximum number of devices to store
- `ESP32_CONFIG`: ESP32 detection patterns and manufacturer IDs

## Development

The app is built with:
- **React Native** with Expo
- **TypeScript** for type safety
- **react-native-ble-plx** for BLE functionality
- **Custom hooks** for clean separation of concerns
- **Styled components** for maintainable UI

## Future Enhancements

- [ ] Device connection and communication
- [ ] Data reading/writing to ESP32 services
- [ ] Device pairing and bonding
- [ ] Connection history and favorites
- [ ] Advanced filtering options
- [ ] Dark mode support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
