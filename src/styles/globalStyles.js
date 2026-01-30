import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const createTheme = (isDark = false) => {
  const theme = isDark ? darkTheme : lightTheme;
  return StyleSheet.create(theme);
};

const lightTheme = {
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  card: {
    backgroundColor: colors.lightCardBg,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: colors.darkText,
    fontSize: 16,
  },
  textLarge: {
    color: colors.darkText,
    fontSize: 24,
    fontWeight: 'bold',
  },
  textMedium: {
    color: colors.darkText,
    fontSize: 18,
    fontWeight: '600',
  },
  textSmall: {
    color: colors.subText,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
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
    borderColor: colors.lightBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.darkText,
    marginVertical: 8,
    backgroundColor: colors.lightBg,
  },
  inputPlaceholder: colors.subText,
  header: {
    backgroundColor: colors.lightBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBorder,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.darkText,
  },
};

const darkTheme = {
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
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
    backgroundColor: colors.darkCardBg,
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
    color: colors.lightText,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.darkBg,
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
