import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BLEScanState } from '../types/ble';
import { UI_CONFIG } from '../constants/ble';

interface ScanControlsProps {
  scanState: BLEScanState;
  onStartScan: () => void;
  onStopScan: () => void;
  onClearDevices: () => void;
  deviceCount: number;
  isBluetoothEnabled: boolean;
}

const ScanControls: React.FC<ScanControlsProps> = ({
  scanState,
  onStartScan,
  onStopScan,
  onClearDevices,
  deviceCount,
  isBluetoothEnabled,
}) => {
  const isScanning = scanState === BLEScanState.SCANNING;
  const canScan = isBluetoothEnabled && scanState !== BLEScanState.PERMISSION_DENIED;

  const getButtonText = () => {
    if (!isBluetoothEnabled) return 'Enable Bluetooth';
    if (scanState === BLEScanState.PERMISSION_DENIED) return 'Permissions Required';
    return isScanning ? 'Stop Scan' : 'Start Scan';
  };

  const getStatusText = () => {
    if (!isBluetoothEnabled) return 'Bluetooth is disabled';
    if (scanState === BLEScanState.PERMISSION_DENIED) return 'Bluetooth permissions required';
    if (isScanning) return 'Scanning for devices...';
    if (deviceCount > 0) return `Found ${deviceCount} device${deviceCount === 1 ? '' : 's'}`;
    return 'Ready to scan';
  };

  const getStatusColor = () => {
    if (!isBluetoothEnabled || scanState === BLEScanState.PERMISSION_DENIED) {
      return UI_CONFIG.COLORS.error;
    }
    if (isScanning) return UI_CONFIG.COLORS.primary;
    if (deviceCount > 0) return UI_CONFIG.COLORS.success;
    return UI_CONFIG.COLORS.textSecondary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        {isScanning && (
          <ActivityIndicator 
            size="small" 
            color={UI_CONFIG.COLORS.primary} 
            style={styles.statusIndicator}
          />
        )}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !canScan && styles.disabledButton,
            isScanning && styles.stopButton,
          ]}
          onPress={isScanning ? onStopScan : onStartScan}
          disabled={!canScan}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.primaryButtonText,
            !canScan && styles.disabledButtonText,
            isScanning && styles.stopButtonText,
          ]}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>

        {deviceCount > 0 && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClearDevices}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI_CONFIG.COLORS.surface,
    padding: UI_CONFIG.SPACING.md,
    marginBottom: UI_CONFIG.SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UI_CONFIG.SPACING.md,
  },
  statusIndicator: {
    marginRight: UI_CONFIG.SPACING.sm,
  },
  statusText: {
    fontSize: UI_CONFIG.FONT_SIZES.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: UI_CONFIG.COLORS.primary,
    paddingVertical: UI_CONFIG.SPACING.md,
    paddingHorizontal: UI_CONFIG.SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: UI_CONFIG.SPACING.sm,
  },
  stopButton: {
    backgroundColor: UI_CONFIG.COLORS.error,
  },
  disabledButton: {
    backgroundColor: UI_CONFIG.COLORS.border,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: UI_CONFIG.FONT_SIZES.md,
    fontWeight: 'bold',
  },
  stopButtonText: {
    color: 'white',
  },
  disabledButtonText: {
    color: UI_CONFIG.COLORS.textSecondary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: UI_CONFIG.SPACING.md,
    paddingHorizontal: UI_CONFIG.SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: UI_CONFIG.COLORS.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: UI_CONFIG.COLORS.textSecondary,
    fontSize: UI_CONFIG.FONT_SIZES.md,
    fontWeight: '500',
  },
});

export default ScanControls;
