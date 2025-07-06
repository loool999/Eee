document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const proxyEngineSelect = document.getElementById('proxyEngineSelect');
    const goButton = document.getElementById('goButton');
    const proxyFrame = document.getElementById('proxyFrame');
    const outputContainer = document.querySelector('.output-container');

    goButton.addEventListener('click', loadProxiedUrl);
    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            loadProxiedUrl();
        }
    });

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function loadProxiedUrl() {
        let targetUrl = urlInput.value.trim();
        const selectedEngine = proxyEngineSelect.value;

        if (!targetUrl) {
            alert('Please enter a URL.');
            return;
        }

        // For non-Wisp engines, prepend http:// if no protocol is specified
        if (selectedEngine !== 'wisp' && !targetUrl.match(/^https?:\/\//)) {
            targetUrl = 'http://' + targetUrl;
        }

        if (selectedEngine !== 'wisp' && !isValidUrl(targetUrl)) {
            alert('Please enter a valid URL (e.g., http://example.com)');
            return;
        }


        // Clear previous content and show placeholder
        proxyFrame.src = 'about:blank';
        outputContainer.style.backgroundColor = '#eee'; // Reset background

        if (selectedEngine === 'wisp') {
            // Wisp requires client-side handling (e.g., via a dedicated Wisp client or library)
            // The server part is ws://localhost:PORT/wisp/
            // This frontend doesn't directly interact with Wisp other than providing the URL.
            // The user needs to configure their Wisp client (like Ultraviolet)
            alert(`Wisp mode selected. Please ensure your Wisp client is configured to use this server's Wisp endpoint: ws://${window.location.host}/wisp/ with the URL: ${targetUrl}`);
            // Optionally, you could try to dynamically set up a Wisp client here if one is bundled.
            // For now, we assume an external client.
            outputContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Wisp mode: Use your Wisp-compatible client with the provided URL.</p>';
            outputContainer.style.backgroundColor = '#fff';
        } else if (selectedEngine === 'scramjet') {
            // Use the /scramjet-proxy/ endpoint
            // The target URL is passed as a query parameter
            proxyFrame.src = `/scramjet-proxy/?url=${encodeURIComponent(targetUrl)}`;
            outputContainer.style.backgroundColor = '#fff'; // Remove placeholder bg
        } else if (selectedEngine === 'bare') {
            // For Bare, the client (iframe) needs to be served by the Bare server itself
            // or have its requests routed through Bare.
            // A common pattern for iframe-based Bare usage is:
            // /bare/v1/ (or similar, depending on Bare server version/config) + encoded URL
            // For simplicity, let's assume the Bare server itself handles path encoding if we set the src like this.
            // The @tomphttp/bare-client (used in projects like Ultraviolet) does more sophisticated URL construction.
            // A simple approach for direct iframe:
            // proxyFrame.src = `/bare/session/${btoa(targetUrl)}`; // This is a guess, actual path might vary.
            // Or, if the Bare server is set up to rewrite, just the path:
            // proxyFrame.src = `/bare/${targetUrl.replace(/^https?:\/\//, '')}`;

            // The most robust way if using @tomphttp/bare-server-node's default routing is to make the iframe's src
            // a path that the bare server recognizes and can translate.
            // Let's construct a URL that, when requested by the iframe, will be handled by the Bare server.
            // The Bare server expects URLs in the format: /bare/address?remote=ENCODED_URL
            // However, directly setting iframe.src to this might not always work as expected due to how Bare client scripts
            // initialize.
            // A common way to use Bare with an iframe is to have the Bare client library (e.g., Ultraviolet's client code)
            // loaded in the main page, which then sets up the iframe.
            // For a simple direct load:
            const barePrefix = `/bare/`; // Matches server setup
            alert(`Bare mode selected. Attempting to load: ${targetUrl} via ${barePrefix}. May require specific client-side Bare library for full compatibility.`);
            // This is a simplified approach. True Bare client integration is more complex.
            // We'll construct a URL that the Bare server can interpret if it were a direct request.
            // The iframe will request this, and the Bare server should handle it.
            proxyFrame.src = `${barePrefix}${targetUrl}`;
            outputContainer.style.backgroundColor = '#fff';
        }
    }
});
