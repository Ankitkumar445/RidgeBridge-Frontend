import React, { useCallback, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, type as ty } from "../theme/theme";

export interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; contact?: string; email?: string };
  theme?: { color?: string };
}

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// react-native-webview has no meaningful web target here (we use the browser
// SDK directly on web instead), so only require it on native.
let WebView: any = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require("react-native-webview").WebView;
}

function buildHtml(options: RazorpayOptions) {
  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;background:#0A0E17;">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
  var options = ${JSON.stringify(options)};
  options.handler = function (response) { post({ type: "success", payload: response }); };
  options.modal = { ondismiss: function () { post({ type: "dismiss" }); } };
  try {
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      post({ type: "failed", payload: response.error });
    });
    rzp.open();
  } catch (e) {
    post({ type: "error", payload: String(e) });
  }
</script>
</body></html>`;
}

export function useRazorpayCheckout() {
  const [visible, setVisible] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const resolverRef = useRef<{ resolve: (v: RazorpaySuccess) => void; reject: (e: Error) => void } | null>(null);

  const open = useCallback((options: RazorpayOptions): Promise<RazorpaySuccess> => {
    return new Promise((resolve, reject) => {
      resolverRef.current = { resolve, reject };

      if (Platform.OS === "web") {
        const w = window as any;
        const startCheckout = () => {
          const rzp = new w.Razorpay({
            ...options,
            handler: (response: RazorpaySuccess) => resolve(response),
            modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
          });
          rzp.on("payment.failed", (response: any) => {
            reject(new Error(response?.error?.description || "Payment failed"));
          });
          rzp.open();
        };

        if (w.Razorpay) {
          startCheckout();
        } else {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = startCheckout;
          script.onerror = () => reject(new Error("Could not load Razorpay checkout script"));
          document.body.appendChild(script);
        }
        return;
      }

      setHtml(buildHtml(options));
      setVisible(true);
    });
  }, []);

  const onMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "success") {
        resolverRef.current?.resolve(data.payload);
        setVisible(false);
      } else if (data.type === "dismiss") {
        resolverRef.current?.reject(new Error("Payment cancelled"));
        setVisible(false);
      } else {
        resolverRef.current?.reject(new Error(data.payload?.description || "Payment failed"));
        setVisible(false);
      }
    } catch {
      // ignore malformed bridge messages
    }
  }, []);

  const CheckoutModal =
    Platform.OS === "web" ? null : (
      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Secure payment</Text>
            <Pressable
              onPress={() => {
                resolverRef.current?.reject(new Error("Payment cancelled"));
                setVisible(false);
              }}
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
          {html && WebView ? (
            <WebView originWhitelist={["*"]} source={{ html }} onMessage={onMessage} style={{ flex: 1 }} />
          ) : null}
        </View>
      </Modal>
    );

  return { open, CheckoutModal };
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  modalTitle: { ...ty.h2, color: colors.textPrimary },
});
