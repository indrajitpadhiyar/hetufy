package in.idrmusic.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (bridge != null && bridge.getWebView() != null) {
            WebSettings webSettings = bridge.getWebView().getSettings();
            webSettings.setMediaPlaybackRequiresUserGesture(false);
            webSettings.setDomStorageEnabled(true);
            webSettings.setDatabaseEnabled(true);
            webSettings.setJavaScriptEnabled(true);
            String ua = webSettings.getUserAgentString();
            if (ua != null && ua.contains("; wv")) {
                webSettings.setUserAgentString(ua.replace("; wv", ""));
            }
        }
    }
}
