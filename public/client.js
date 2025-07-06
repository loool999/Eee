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
            // Show Wisp section and hide iframe
            document.getElementById('wisp-section').style.display = '';
            document.getElementById('wispUrlInput').value = targetUrl;
            proxyFrame.style.display = 'none';
            outputContainer.style.backgroundColor = '#fff';
        } else {
            document.getElementById('wisp-section').style.display = 'none';
            proxyFrame.style.display = '';
        }
        if (selectedEngine === 'scramjet') {
            // Use the /scramjet-proxy/ endpoint
            // The target URL is passed as a query parameter
            proxyFrame.src = `/scramjet-proxy/?url=${encodeURIComponent(targetUrl)}`;
            outputContainer.style.backgroundColor = '#fff'; // Remove placeholder bg
        }
        if (selectedEngine === 'bare') {
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
    // Wisp client logic
    const wispForm = document.getElementById('wispForm');
    const wispUrlInput = document.getElementById('wispUrlInput');
    const wispMethodInput = document.getElementById('wispMethodInput');
    const wispHeadersInput = document.getElementById('wispHeadersInput');
    const wispBodyInput = document.getElementById('wispBodyInput');
    const wispSendButton = document.getElementById('wispSendButton');
    const wispResult = document.getElementById('wispResult');
    const wispFrame = document.getElementById('wispFrame');
    let wispSocket = null;

    if (wispForm) {
        wispForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendWispRequest();
        });
    }
    if (wispSendButton) {
        wispSendButton.addEventListener('click', (e) => {
            e.preventDefault();
            sendWispRequest();
        });
    }

    function sendWispRequest() {
        const url = wispUrlInput.value.trim();
        const method = wispMethodInput.value;
        let headers = {};
        let body = wispBodyInput.value;
        try {
            headers = wispHeadersInput.value ? JSON.parse(wispHeadersInput.value) : {};
        } catch (e) {
            wispResult.textContent = 'Invalid headers JSON.';
            return;
        }
        if (!url) {
            wispResult.textContent = 'Please enter a URL.';
            return;
        }
        if (wispSocket && wispSocket.readyState === 1) {
            wispSocket.close();
        }
        wispResult.textContent = 'Connecting to Wisp server...';
        wispFrame.style.display = 'none';
        wispSocket = new WebSocket(`ws://${window.location.host}/wisp/`);
        wispSocket.onopen = () => {
            wispResult.textContent = 'Connected. Sending request...';
            wispSocket.send(JSON.stringify({ url, method, headers, body }));
        };
        wispSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // If response is HTML, show in iframe, else show as text
                const contentType = (data.headers && (data.headers['content-type'] || data.headers['Content-Type'])) || '';
                if (contentType.includes('text/html')) {
                    const blob = new Blob([data.body], { type: contentType });
                    const url = URL.createObjectURL(blob);
                    wispFrame.src = url;
                    wispFrame.style.display = '';
                    wispResult.textContent = '';
                } else {
                    wispFrame.style.display = 'none';
                    wispResult.textContent = JSON.stringify(data, null, 2);
                }
            } catch (e) {
                wispFrame.style.display = 'none';
                wispResult.textContent = event.data;
            }
        };
        wispSocket.onerror = (err) => {
            wispResult.textContent = 'WebSocket error.';
            wispFrame.style.display = 'none';
        };
        wispSocket.onclose = () => {
            // Optionally handle close
        };
    }
});
