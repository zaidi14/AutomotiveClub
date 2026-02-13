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
import { colors } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

export default function WebPortalScreen() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const styles = createStyles();

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
      <StatusBar barStyle="light-content" />
      
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Text style={[styles.navButtonText, !canGoBack && styles.navButtonTextDisabled]}>
            <Ionicons name="arrow-back" size={18} color={!canGoBack ? colors.subText : colors.lightText} />
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={goForward}
          disabled={!canGoForward}
        >
          <Text style={[styles.navButtonText, !canGoForward && styles.navButtonTextDisabled]}>
            <Ionicons name="arrow-forward" size={18} color={!canGoForward ? colors.subText : colors.lightText} />
          </Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.navTitle}>AGU Automotive Club</Text>
        </View>

        <TouchableOpacity style={styles.navButton} onPress={reload}>
          <Ionicons name="reload" size={18} color={colors.lightText} />
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
        renderError={() => (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color={colors.textMuted} />
            <Text style={styles.errorTitle}>Unable to load page</Text>
            <Text style={styles.errorDesc}>Check your internet connection and try again</Text>
            <TouchableOpacity style={styles.retryButton} onPress={reload}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
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

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingTop: 40,
    backgroundColor: colors.darkCardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    backgroundColor: colors.darkBorder,
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
    color: colors.lightText,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkBg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.silver,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkBg,
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
