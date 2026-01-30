import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';

export default function WebPortalScreen() {
  const { isDark } = useApp();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const styles = createStyles(isDark);

  const injectedCSS = `
    /* Hide website header/footer for native feel */
    header, footer, .site-header, .site-footer, nav.main-nav {
      display: none !important;
    }
    
    /* Adjust body padding */
    body {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
    
    /* Hide cookie banners and popups */
    .cookie-banner, .popup-overlay, #cookie-notice {
      display: none !important;
    }
  `;

  const injectedJavaScript = `
    (function() {
      const style = document.createElement('style');
      style.innerHTML = \`${injectedCSS}\`;
      document.head.appendChild(style);
    })();
    true;
  `;

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const goBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const goForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const reload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Text style={[styles.navButtonText, !canGoBack && styles.navButtonTextDisabled]}>
            ←
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={goForward}
          disabled={!canGoForward}
        >
          <Text style={[styles.navButtonText, !canGoForward && styles.navButtonTextDisabled]}>
            →
          </Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.navTitle}>AGU Automotive Club</Text>
        </View>

        <TouchableOpacity style={styles.navButton} onPress={reload}>
          <Text style={styles.navButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://aguautomotiveclub.com' }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading website...</Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
    </View>
  );
}

const createStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? colors.darkBg : colors.lightBg,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingTop: 40,
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.darkBorder : colors.lightBorder,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? colors.primary : colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    backgroundColor: isDark ? colors.darkBorder : colors.lightBorder,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightText,
  },
  navButtonTextDisabled: {
    color: colors.subText,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? colors.lightText : colors.primary,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? colors.darkBg : colors.lightBg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDark ? 'rgba(18, 18, 18, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: isDark ? colors.silver : colors.subText,
  },
});
