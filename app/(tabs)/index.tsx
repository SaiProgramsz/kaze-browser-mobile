import React, { useRef, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView, StatusBar, Platform } from "react-native";

const HOME_URL = "file:///android_asset/index.html";

export default function Browser() {
  const webviewRef = useRef<WebView>(null);

  const [url, setUrl] = useState(HOME_URL);
  const [input, setInput] = useState("");
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);
  const [loading, setLoading] = useState(false);
	
  const [desktop, setDesktop] = useState(false);
  const [jsEnabled, setJsEnabled] = useState(true);
  const [reader, setReader] = useState(false);
  const [zoom, setZoom] = useState(100);

  const [session, setSession] = useState(0);

  // session timer
  useEffect(() => {
    const t = setInterval(() => setSession(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const inject = (js: string) => {
    webviewRef.current?.injectJavaScript(js);
  };

  const readerJS = `
    document.querySelectorAll('nav, header, footer, aside, ads, iframe').forEach(e => e.remove());
    document.body.style.maxWidth = '700px';
    document.body.style.margin = 'auto';
    document.body.style.lineHeight = '1.6';
    true;
  `;

  const zoomJS = `
    document.body.style.fontSize='${zoom}%';
    true;
  `;

  const findJS = (text: string) => `
    const bodyText = document.body.innerHTML;
    document.body.innerHTML = bodyText.replace(/${text}/gi, '<mark>$&</mark>');
    true;
  `;
  const go = () => {
  let text = input.trim();

  if (text === "") return;

  // local asset shortcut
  if (text === "home") {
    setUrl(HOME_URL);
    return;
  }

  // add https if missing
  if (!text.includes("://")) {
    text = "https://" + text;
  }

    setUrl(text);
  };

  const panic = () => {
    setUrl(HOME_URL);
    setDesktop(false);
    setJsEnabled(true);
    setReader(false);
    setZoom(100);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Address Bar */}
      <TextInput
        style={styles.bar}
        placeholder="Enter URL"
        placeholderTextColor="#888"
        value={input}
        onChangeText={setInput}
        onSubmitEditing={go}
      />

      {/* WebView */}
      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        userAgent={desktop ? "Mozilla/5.0 (X11; Linux x86_64)" : undefined}
        javaScriptEnabled={jsEnabled}
        onLoadProgress={e => setLoading(e.nativeEvent.progress < 1)}
        onNavigationStateChange={nav => {
          setCanBack(nav.canGoBack);
          setCanForward(nav.canGoForward);
        }}
        injectedJavaScript={`${reader ? readerJS : ""}${zoomJS}`}
      />

      {/* Bottom Bar */}
      <View style={styles.bottom}>
        <Btn text="←" onPress={() => webviewRef.current?.goBack()} disabled={!canBack} />
        <Btn text="→" onPress={() => webviewRef.current?.goForward()} disabled={!canForward} />
        <Btn text={loading ? "✕" : "⟳"} onPress={() => loading ? webviewRef.current?.stopLoading() : webviewRef.current?.reload()} />
        <Btn text="Aa+" onPress={() => setZoom(z => Math.min(z + 10, 150))} />
        <Btn text="Aa-" onPress={() => setZoom(z => Math.max(z - 10, 80))} />
        <Btn text="R" onPress={() => setReader(r => !r)} />
        <Btn text="JS" onPress={() => setJsEnabled(j => !j)} />
        <Btn text="PC" onPress={() => setDesktop(d => !d)} />
        <Btn text="!" onPress={panic} />
      </View>

      {/* Session indicator */}
      <Text style={styles.session}>
        Ephemeral Session: {Math.floor(session / 60)}:{String(session % 60).padStart(2, "0")}
      </Text>
    </SafeAreaView>
  );
}

function Btn({ text, onPress, disabled = false }: any) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text style={[styles.btn, disabled && { opacity: 0.3 }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#000",
  paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  bar: {
    padding: 10,
    backgroundColor: "#111",
    color: "#fff",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#111",
    paddingVertical: 8,
  },
  btn: { color: "#fff", fontSize: 16 },
  session: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    padding: 4,
  },
});
