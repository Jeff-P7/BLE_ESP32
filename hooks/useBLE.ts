import { useState, useEffect, useCallback, useRef } from 'react';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BLEDeviceInfo, BLEScanState, BLEDeviceFilter, ESP32DeviceType } from '../types/ble';
import { BLE_CONFIG, ESP32_CONFIG } from '../constants/ble';

export const useBLE = () => {
  const [scanState, setScanState] = useState<BLEScanState>(BLEScanState.IDLE);
  const [devices, setDevices] = useState<BLEDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState<boolean>(false);
  
  const managerRef = useRef<BleManager | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize BLE Manager
  useEffect(() => {
    try {
      managerRef.current = new BleManager();
      
      // Listen for state changes
      const subscription = managerRef.current.onStateChange((state: State) => {
        setIsBluetoothEnabled(state === 'PoweredOn');
        if (state !== 'PoweredOn') {
          setError(`Bluetooth is ${state}. Please enable Bluetooth.`);
        } else {
          setError(null);
        }
      }, true);

      return () => {
        subscription.remove();
        if (managerRef.current) {
          managerRef.current.destroy();
        }
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
      };
    } catch (err) {
      setError('BLE Manager not available. This app requires a development build.');
      console.warn('BLE Manager initialization failed:', err);
    }
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(results).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        setError('Bluetooth permissions are required for device scanning.');
        setScanState(BLEScanState.PERMISSION_DENIED);
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      setError('Failed to request permissions');
      console.error('Permission request failed:', err);
      return false;
    }
  }, []);

  // Convert Device to BLEDeviceInfo
  const convertToBLEDeviceInfo = useCallback((device: Device): BLEDeviceInfo => ({
    id: device.id,
    name: device.name || null,
    rssi: device.rssi,
    isConnectable: device.isConnectable,
    manufacturerData: device.manufacturerData ? 
      device.manufacturerData.split(' ').map(byte => `0x${byte}`).join(' ') : undefined,
    serviceUUIDs: device.serviceUUIDs || undefined,
  }), []);

  // Check if device is ESP32
  const isESP32Device = useCallback((device: BLEDeviceInfo): ESP32DeviceType => {
    if (!device.name && !device.manufacturerData) {
      return ESP32DeviceType.UNKNOWN;
    }

    const name = device.name?.toUpperCase() || '';
    const isNameMatch = ESP32_CONFIG.NAME_PATTERNS.some(pattern => 
      name.includes(pattern.toUpperCase())
    );

    if (isNameMatch) {
      if (name.includes('S2')) return ESP32DeviceType.ESP32_S2;
      if (name.includes('S3')) return ESP32DeviceType.ESP32_S3;
      if (name.includes('C3')) return ESP32DeviceType.ESP32_C3;
      return ESP32DeviceType.ESP32;
    }

    // Check manufacturer data for Espressif
    if (device.manufacturerData) {
      const hasEspressifId = ESP32_CONFIG.MANUFACTURER_IDS.some(id => 
        device.manufacturerData?.includes(id)
      );
      if (hasEspressifId) return ESP32DeviceType.ESP32;
    }

    return ESP32DeviceType.UNKNOWN;
  }, []);

  // Filter devices based on criteria
  const filterDevices = useCallback((deviceList: BLEDeviceInfo[], filter?: BLEDeviceFilter): BLEDeviceInfo[] => {
    if (!filter) return deviceList;

    return deviceList.filter(device => {
      // Name pattern filter
      if (filter.namePattern && device.name) {
        const regex = new RegExp(filter.namePattern, 'i');
        if (!regex.test(device.name)) return false;
      }

      // RSSI filter
      if (filter.minRSSI && device.rssi && device.rssi < filter.minRSSI) {
        return false;
      }

      // Service UUID filter
      if (filter.serviceUUIDs && device.serviceUUIDs) {
        const hasMatchingService = filter.serviceUUIDs.some(uuid => 
          device.serviceUUIDs?.includes(uuid)
        );
        if (!hasMatchingService) return false;
      }

      return true;
    });
  }, []);

  // Start scanning
  const startScan = useCallback(async (filter?: BLEDeviceFilter) => {
    if (!managerRef.current) {
      setError('BLE Manager not available');
      return;
    }

    if (scanState === BLEScanState.SCANNING) {
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      return;
    }

    if (!isBluetoothEnabled) {
      setError('Please enable Bluetooth to scan for devices');
      return;
    }

    setScanState(BLEScanState.SCANNING);
    setError(null);
    setDevices([]);

    try {
      managerRef.current.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.warn('Scan error:', error);
          setError(`Scan error: ${error.message}`);
          setScanState(BLEScanState.ERROR);
          return;
        }

        if (device) {
          const deviceInfo = convertToBLEDeviceInfo(device);
          
          setDevices(prev => {
            // Check for duplicates and update existing device
            const existingIndex = prev.findIndex(d => d.id === deviceInfo.id);
            if (existingIndex >= 0) {
              // Update existing device with latest info
              const updated = [...prev];
              updated[existingIndex] = deviceInfo;
              return updated;
            }
            
            // Add new device if under limit
            if (prev.length >= BLE_CONFIG.MAX_DEVICES) {
              return prev;
            }
            
            return [...prev, deviceInfo];
          });
        }
      });

      // Auto-stop after timeout
      scanTimeoutRef.current = setTimeout(() => {
        stopScan();
      }, BLE_CONFIG.SCAN_TIMEOUT);

    } catch (err) {
      setError(`Failed to start scan: ${err}`);
      setScanState(BLEScanState.ERROR);
    }
  }, [scanState, isBluetoothEnabled, requestPermissions, convertToBLEDeviceInfo]);

  // Stop scanning
  const stopScan = useCallback(() => {
    if (managerRef.current && scanState === BLEScanState.SCANNING) {
      managerRef.current.stopDeviceScan();
    }
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    setScanState(BLEScanState.IDLE);
  }, [scanState]);

  // Clear devices
  const clearDevices = useCallback(() => {
    setDevices([]);
    setError(null);
  }, []);

  return {
    // State
    scanState,
    devices,
    error,
    isBluetoothEnabled,
    
    // Actions
    startScan,
    stopScan,
    clearDevices,
    
    // Utilities
    filterDevices,
    isESP32Device,
    requestPermissions,
  };
};
