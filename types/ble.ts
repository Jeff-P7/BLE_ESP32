export interface BLEDeviceInfo {
  id: string;
  name: string | null;
  rssi: number | null;
  isConnectable: boolean;
  manufacturerData?: string;
  serviceUUIDs?: string[];
}

export interface ScanResult {
  devices: BLEDeviceInfo[];
  isScanning: boolean;
  error: string | null;
}

export interface BLEDeviceFilter {
  namePattern?: string;
  serviceUUIDs?: string[];
  manufacturerData?: string;
  minRSSI?: number;
}

export enum BLEScanState {
  IDLE = 'idle',
  SCANNING = 'scanning',
  ERROR = 'error',
  PERMISSION_DENIED = 'permission_denied'
}

export enum ESP32DeviceType {
  UNKNOWN = 'unknown',
  ESP32 = 'esp32',
  ESP32_S2 = 'esp32_s2',
  ESP32_S3 = 'esp32_s3',
  ESP32_C3 = 'esp32_c3'
}
