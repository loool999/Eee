// Unique Proxy - Client-side JavaScript
// Theme: Originality / Uniqueness

document.addEventListener('DOMContentLoaded', () => {
    const urlInputForm = document.getElementById('urlInputForm');
    const urlInput = document.getElementById('urlInput');
    const proxyFrameContainer = document.getElementById('proxyFrameContainer');
    const proxyFrame = document.getElementById('proxyFrame');
    const transportSelect = document.getElementById('transportSelect');

    // Configuration for Wisp server (assuming it runs on a different port)
    const WISP_SERVER_URL = 'ws://127.0.0.1:8008/'; // Standard Wisp server path is /

    let wispSocket;

    // --- Uniqueness: Dynamic placeholder text animation ---
    const placeholders = [
        "Enter destination...",
        "Chart your course...",
        "Where to, navigator?",
        "Input reality matrix...",
        "Forge a new path...",
        "Define your vector..."
    ];
    let currentPlaceholder = 0;
    setInterval(() => {
        currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
        urlInput.setAttribute('placeholder', placeholders[currentPlaceholder]);
    }, 2000);

    // --- Uniqueness: Console-like log ---
    function logToConsole(message, type = 'info') {
        console.log(`[PROXY_CONSOLE] [${type.toUpperCase()}] ${new Date().toISOString()}: ${message}`);
    }

    logToConsole("Client interface initialized. Awaiting instructions.");

    function connectWisp(targetUrl) {
        logToConsole(`Attempting to connect to Wisp server at ${WISP_SERVER_URL}`);

        if (wispSocket && wispSocket.readyState === WebSocket.OPEN) {
            logToConsole("Already connected to Wisp. Closing existing connection first.", "warn");
            wispSocket.close();
        }

        wispSocket = new WebSocket(WISP_SERVER_URL);

        wispSocket.onopen = () => {
            logToConsole("Wisp WebSocket connection established.", "success");
            // Wisp protocol: Server immediately sends a CONTINUE packet (Stream ID 0)
            // Client must wait for this before sending anything.
            // For now, we'll just log this. Full client implementation needed later.
            proxyFrame.srcdoc = `
                <body style="color: #00ff00; background-color: #111; font-family: monospace; padding: 20px;">
                    <h1>Wisp Transport Selected</h1>
                    <p>Connected to Wisp server at: <strong>${WISP_SERVER_URL}</strong></p>
                    <p>Target URL: <strong>${targetUrl}</strong></p>
                    <p>Awaiting initial Wisp protocol handshake (CONTINUE Stream ID 0)...</p>
                    <p>Full Wisp client logic for actual browsing (CONNECT, DATA packets) is pending.</p>
                </body>`;
        };

        wispSocket.onmessage = (event) => {
            logToConsole("Received message from Wisp server:", "info");
            // Here, we would parse the Wisp protocol message (event.data)
            // For the initial handshake, we expect a CONTINUE packet with Stream ID 0.
            // For actual data, it would be DATA packets for specific streams.
            // This is a simplified log for now.
            console.log(event.data);

            // Placeholder: Display received data type or content
            // In a real client, this would involve parsing the binary Wisp frame
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result;
                const view = new DataView(arrayBuffer);
                if (view.byteLength >= 5) { // Packet Type (1) + Stream ID (4)
                    const packetType = view.getUint8(0);
                    const streamId = view.getUint32(1, true); // true for little-endian
                    logToConsole(`Wisp Packet Type: 0x${packetType.toString(16)}, Stream ID: ${streamId}`, 'protocol');
                    if (packetType === 0x03 && streamId === 0) { // CONTINUE, Stream ID 0
                         logToConsole("Received initial Wisp CONTINUE (Stream ID 0). Handshake complete.", "success");
                         proxyFrame.srcdoc = `
                            <body style="color: #00ff00; background-color: #111; font-family: monospace; padding: 20px;">
                                <h1>Wisp Handshake Complete</h1>
                                <p>Target URL: <strong>${targetUrl}</strong></p>
                                <p>Ready to send Wisp CONNECT for the target URL.</p>
                                <p>Further Wisp client implementation required to load content.</p>
                            </body>`;
                        // Now the client can send CONNECT for the actual targetUrl
                        // sendWispConnect(targetUrl); // This function would need to be implemented
                    }
                }
            };
            if (event.data instanceof Blob) {
                reader.readAsArrayBuffer(event.data);
            } else {
                logToConsole("Received non-binary message (unexpected for Wisp data): " + event.data, "warn");
            }
        };

        wispSocket.onerror = (error) => {
            logToConsole(`Wisp WebSocket error: ${error.message || 'Unknown error'}`, "error");
            console.error("Wisp WebSocket error:", error);
            proxyFrame.srcdoc = `
                <body style="color: #ff0000; background-color: #111; font-family: monospace; padding: 20px;">
                    <h1>Wisp Connection Error</h1>
                    <p>Could not connect to Wisp server at: <strong>${WISP_SERVER_URL}</strong></p>
                    <p>Please ensure the Wisp server is running and accessible.</p>
                </body>`;
        };

        wispSocket.onclose = (event) => {
            logToConsole(`Wisp WebSocket connection closed. Code: ${event.code}, Reason: "${event.reason}"`, event.wasClean ? "info" : "warn");
            if (!event.wasClean) {
                 proxyFrame.srcdoc = `
                <body style="color: #ffaa00; background-color: #111; font-family: monospace; padding: 20px;">
                    <h1>Wisp Connection Closed Unexpectedly</h1>
                    <p>Code: ${event.code}</p>
                    <p>Reason: ${event.reason || 'No reason specified'}</p>
                </body>`;
            }
        };
    }

    // function sendWispConnect(destinationUrl) {
    //     if (!wispSocket || wispSocket.readyState !== WebSocket.OPEN) {
    //         logToConsole("Wisp socket not open. Cannot send CONNECT.", "error");
    //         return;
    //     }
    //     // This is where you would construct and send a Wisp CONNECT packet
    //     // See Wisp protocol.md for packet format
    //     // 1. Choose a random Stream ID (uint32)
    //     // 2. Determine Stream Type (0x01 for TCP)
    //     // 3. Get Destination Port and Hostname from destinationUrl
    //     // 4. Construct ArrayBuffer with Packet Type (0x01), Stream ID, Stream Type, Port, Hostname
    //     // 5. wispSocket.send(arrayBuffer);
    //     logToConsole(`Placeholder: Would send Wisp CONNECT for ${destinationUrl}`, "info");
    // }


    urlInputForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const url = urlInput.value.trim();
        const selectedTransport = transportSelect.value;

        if (!url) {
            logToConsole("No URL entered.", 'warn');
            alert('Please enter a URL.');
            return;
        }

        logToConsole(`Requesting to load URL: ${url} via ${selectedTransport}`);
        proxyFrameContainer.style.display = 'block';

        if (selectedTransport === 'wisp') {
            connectWisp(url);
        } else if (selectedTransport === 'scramjet') {
            logToConsole("Scramjet selected. Scramjet loading logic pending server integration.", "info");
            proxyFrame.srcdoc = `
                <body style="color: #00ff00; background-color: #111; font-family: monospace; padding: 20px;">
                    <h1>Scramjet Transport Selected</h1>
                    <p>Attempting to connect to: <strong>${url}</strong> via Scramjet.</p>
                    <p>This requires the Scramjet rewriting engine and transport to be fully integrated.</p>
                    <p>Scramjet typically uses Wisp as its underlying transport after rewriting.</p>
                </body>
            `;
        } else { // bare or direct (for testing)
            logToConsole(`Using direct load for ${url} (placeholder for Bare).`, "info");
            proxyFrame.srcdoc = `
                <body style="color: #00ff00; background-color: #111; font-family: monospace; padding: 20px;">
                    <h1>Bare Transport Selected (Placeholder)</h1>
                    <p>Attempting to connect to: <strong>${url}</strong>.</p>
                    <p>Bare server integration is pending.</p>
                </body>
            `;
            // This is NOT how a bare server works but a placeholder
            // proxyFrame.src = url; // In a real bare server, this would be a specially encoded URL
        }
        // urlInput.value = ''; // Clear input after submission - keep it for now for easier re-attempts
    });

    // --- Uniqueness: ASCII Art Title in Console ---
    console.log(`
██╗   ██╗███╗   ██╗██╗██████╗ ██╗   ██╗███████╗
██║   ██║████╗  ██║██║██╔══██╗╚██╗ ██╔╝██╔════╝
██║   ██║██╔██╗ ██║██║██████╔╝ ╚████╔╝ █████╗
██║   ██║██║╚██╗██║██║██╔═══╝   ╚██╔╝  ██╔══╝
╚██████╔╝██║ ╚████║██║██║        ██║   ███████╗
 ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝        ╚═╝   ╚══════╝
██████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗
██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝╚██╗ ██╔╝
██████╔╝██████╔╝██║   ██║ ╚███╔╝  ╚████╔╝
██╔═══╝ ██╔══██╗██║   ██║ ██╔██╗   ╚██╔╝
██║     ██║  ██║╚██████╔╝██╔╝ ██╗   ██║
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝
    `);
    logToConsole("Proxy Core Systems Nominal.", "success");
});
