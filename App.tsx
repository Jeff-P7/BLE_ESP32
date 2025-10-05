import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, PermissionsAndroid, Platform, Button } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

let manager: BleManager | null = null;
try {
  manager = new BleManager();
} catch (error) {
  console.warn('BLE Manager not available:', error);
}

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);

  // Ask for Android permissions
  function requestPermissions() {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).catch(console.error);
    }
  }

  useEffect(() => {
    requestPermissions();
    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, []);

  const startScan = () => {
    if (!manager) {
      console.warn('BLE Manager not available - running in Expo Go?');
      return;
    }

    setDevices([]);
    setScanning(true);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        setScanning(false);
        return;
      }

      if (device && !devices.find((d) => d.id === device.id)) {
        setDevices((prev) => [...prev, device]);
      }
    });

    // Stop after 10 seconds
    setTimeout(() => {
      if (manager) {
        manager.stopDeviceScan();
      }
      setScanning(false);
    }, 10000);
  };

  if (!manager) {
    return (
      <View style={{ flex: 1, padding: 20, paddingTop: 60, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
          BLE ESP32 App
        </Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>
          BLE Manager not available
        </Text>
        <Text style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>
          This app requires native BLE support.{'\n'}
          Create a development build to use BLE scanning features.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>BLE ESP32</Text>
      <Button title={scanning ? "Scanning..." : "Start Scan"} onPress={startScan} disabled={scanning} />

      <FlatList
        data={devices}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ccc' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name || 'Unnamed Device'}</Text>
            <Text>ID: {item.id}</Text>
            <Text>RSSI: {item.rssi}</Text>
          </View>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}
