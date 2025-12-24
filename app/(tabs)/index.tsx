import { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useRef } from "react";
import { Platform, StatusBar } from "react-native";

const HOME_HTML = `
<!DOCTYPE html>
<html>
<body style="
  margin:0;
  background:#0b0b0b;
  color:white;
  font-family:sans-serif;
  display:flex;
  align-items:center;
  justify-content:center;
  height:100vh">
  <h1>Kaze Browser</h1>
</body>
</html>
`;

export default function Browser() {
  const webViewRef = useRef<WebView>(null);

  const [input, setInput] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const go = () => {
    const text = input.trim();
    if (!text) return;

    const isUrl =
      text.startsWith("http://") ||
      text.startsWith("https://") ||
      text.includes(".");

    if (isUrl) {
      setUrl(text.startsWith("http") ? text : `https://${text}`);
    } else {
      setUrl(null); // back to home
    }
  };

  return (
    <View style={styles.container}>
      {/* Address Bar */}
      <View style={styles.bar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Enter URL"
          placeholderTextColor="#888"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={go}
        />
        <Pressable onPress={go} style={styles.go}>
          <Text style={{ color: "#fff" }}>Go</Text>
        </Pressable>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={url ? { uri: url } : { html: HOME_HTML }}
        style={{ flex: 1 }}
        onNavigationStateChange={(nav) => {
          setCanGoBack(nav.canGoBack);
          setCanGoForward(nav.canGoForward);
        }}
      />

      {/* Bottom Navigation */}
      <View style={styles.nav}>
        <Pressable
          disabled={!canGoBack}
          onPress={() => webViewRef.current?.goBack()}
        >
          <Text style={[styles.navText, !canGoBack && styles.disabled]}>
            ◀
          </Text>
        </Pressable>

        <Pressable
          disabled={!canGoForward}
          onPress={() => webViewRef.current?.goForward()}
        >
          <Text style={[styles.navText, !canGoForward && styles.disabled]}>
            ▶
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#000",
  paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },  


  bar: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#111",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 6,
    height: 40,
  },
  go: {
    marginLeft: 8,
    backgroundColor: "#333",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 6,
  },
  nav: {
    height: 48,
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  navText: {
    color: "#fff",
    fontSize: 22,
  },
  disabled: {
    opacity: 0.3,
  },
});
