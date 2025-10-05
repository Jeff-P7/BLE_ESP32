import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UI_CONFIG } from '../constants/ble';

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  message, 
  onDismiss, 
  type = 'error' 
}) => {
  if (!message) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning': return UI_CONFIG.COLORS.warning;
      case 'info': return UI_CONFIG.COLORS.primary;
      default: return UI_CONFIG.COLORS.error;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning': return '#000';
      case 'info': return '#fff';
      default: return '#fff';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.message, { color: getTextColor() }]}>
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={[styles.dismissText, { color: getTextColor() }]}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_CONFIG.SPACING.md,
    marginHorizontal: UI_CONFIG.SPACING.sm,
    marginBottom: UI_CONFIG.SPACING.sm,
    borderRadius: 8,
  },
  message: {
    flex: 1,
    fontSize: UI_CONFIG.FONT_SIZES.sm,
    fontWeight: '500',
  },
  dismissButton: {
    padding: UI_CONFIG.SPACING.xs,
    marginLeft: UI_CONFIG.SPACING.sm,
  },
  dismissText: {
    fontSize: UI_CONFIG.FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

export default ErrorBanner;
