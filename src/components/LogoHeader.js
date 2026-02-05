import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export default function LogoHeader() {
  return (
    <View style={styles.headerContainer} />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.darkCardBg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
  },
});
