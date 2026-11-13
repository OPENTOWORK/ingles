package es.dralo.academy;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {
    private String shellJs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (bridge == null || bridge.getWebView() == null) {
            return;
        }

        shellJs = readShell();
        bridge.addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageStarted(WebView webView) {
                    inject(webView);
                }

                @Override
                public void onPageLoaded(WebView webView) {
                    inject(webView);
                }
            }
        );

        getOnBackPressedDispatcher()
            .addCallback(
                this,
                new OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        WebView view = bridge.getWebView();
                        if (view != null && view.canGoBack()) {
                            view.goBack();
                            return;
                        }
                        setEnabled(false);
                        getOnBackPressedDispatcher().onBackPressed();
                    }
                }
            );
    }

    private void inject(WebView view) {
        if (shellJs == null || view == null) {
            return;
        }
        view.evaluateJavascript(shellJs, null);
    }

    private String readShell() {
        try (
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(getAssets().open("public/native-shell.js"), StandardCharsets.UTF_8)
            )
        ) {
            StringBuilder js = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                js.append(line).append('\n');
            }
            return js.toString();
        } catch (Exception error) {
            return null;
        }
    }
}
