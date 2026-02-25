import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const createTheme = (isDark = false) => {
  const theme = isDark ? darkTheme : lightTheme;
  return StyleSheet.create(theme);
};

const lightTheme = {
  container: {
    flex: 1,
    backgroundColor: colors.darkBg, // Anthracite Blue background
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  card: {
    backgroundColor: colors.darkCardBg, // Lighter Anthracite cards
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  text: {
    color: colors.lightText, // White text
    fontSize: 16,
  },
  textLarge: {
    color: colors.lightText,
    fontSize: 24,
    fontWeight: 'bold',
  },
  textMedium: {
    color: colors.lightText,
    fontSize: 18,
    fontWeight: '600',
  },
  textSmall: {
    color: colors.subText,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.accent, // Club Blue
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.lightText,
    marginVertical: 8,
    backgroundColor: colors.darkCardBg, // Lighter Anthracite for inputs
  },
  inputPlaceholder: colors.subText,
  header: {
    backgroundColor: colors.darkCardBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.lightText,
  },
};

const darkTheme = {
  container: {
    flex: 1,
    backgroundColor: colors.darkBg, // Anthracite Blue
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  card: {
    backgroundColor: colors.darkCardBg, // Lighter Anthracite
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  text: {
    color: colors.lightText, // White text
    fontSize: 16,
  },
  textLarge: {
    color: colors.lightText,
    fontSize: 24,
    fontWeight: 'bold',
  },
  textMedium: {
    color: colors.lightText,
    fontSize: 18,
    fontWeight: '600',
  },
  textSmall: {
    color: colors.lightSubText,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.accent, // Club Blue
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.lightText,
    marginVertical: 8,
    backgroundColor: colors.darkCardBg, // Lighter Anthracite for inputs
  },
  inputPlaceholder: colors.lightSubText,
  header: {
    backgroundColor: colors.darkCardBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.lightText,
  },
};
