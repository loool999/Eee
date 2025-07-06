# UNI-PROXY :: Ethereal Gateway

UNI-PROXY is a web proxy with a focus on originality and uniqueness, designed to explore different proxying techniques.
Its primary transport mechanism is **Wisp**, offering a modern WebSocket-based approach to proxying. It also aims to support **Scramjet** techniques for advanced interception and rewriting capabilities.

## Theme

The theme of this proxy is **originality and uniqueness**. This is reflected in:
- The choice of Wisp as the default, a less common but powerful protocol.
- The planned support for Scramjet, representing cutting-edge proxying ideas.
- A unique, retro-terminal-inspired user interface.

## Features

- **Wisp Protocol by Default:** Utilizes the Wisp protocol for robust and efficient proxying over WebSockets. (Basic client connection test implemented).
- **Scramjet Support (Experimental):** Aims to implement Scramjet-like interception and content rewriting. (Research complete, implementation planned)
- **Bare Protocol (Optional):** Future consideration for including Bare server support as an alternative.
- **Unique User Interface:** A distinctive frontend designed with a retro-futuristic terminal aesthetic.

## Tech Stack

- **Backend:** Python with Flask (for frontend serving)
- **Wisp Server:** `wisp-server-python` library (runs as a separate ASGI process)
- **Frontend:** HTML, CSS, JavaScript (with basic Wisp client connection logic)
- **Scramjet Rewriting Engine:** To be developed in Python, inspired by the TypeScript/Rust Scramjet project.

## Project Structure

```
/
├── app.py                  # Main Flask application (serves frontend)
├── requirements.txt        # Python dependencies
├── static/                 # Static assets
│   ├── css/style.css       # Main stylesheet
│   └── js/main.js          # Client-side JavaScript (Wisp connection logic)
├── templates/
│   └── index.html          # Main HTML page for the proxy
├── AGENTS.md               # Instructions for AI agents
└── README.md               # This file
```

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Wisp Server:**
    Open a terminal and run the Wisp server. This server handles the WebSocket connections.
    ```bash
    python -m wisp.server --host 127.0.0.1 --port 8008 --log-level debug
    ```
    You can change the host and port as needed. Ensure `--host 127.0.0.1` is used if your Flask app (and browser) are on the same machine and you want to avoid firewall issues for local testing. Use `--host 0.0.0.0` if you need to access the Wisp server from other devices on your network.
    The Wisp server will listen on path `/` by default. Our client-side JS (`main.js`) is configured to connect to `ws://127.0.0.1:8008/`.

5.  **Run the Flask Development Server:**
    Open another terminal and run the Flask app. This serves the HTML, CSS, and JS frontend.
    ```bash
    python app.py
    ```
    The UNI-PROXY frontend will be available at `http://127.0.0.1:5000` (or `http://0.0.0.0:5000` as configured in `app.py`).

6.  **Access UNI-PROXY:**
    Open your web browser and navigate to `http://127.0.0.1:5000`.
    - Select "Wisp" as the transport.
    - Enter a target URL (e.g., `http://example.com`).
    - Click "Engage Hyperlink Engine".
    - Open your browser's developer console (F12) to see logs from `main.js` regarding the WebSocket connection attempt to the Wisp server. You should see messages about the connection being established and the initial Wisp protocol handshake (a CONTINUE packet with Stream ID 0).

## Development Notes

### Wisp Integration
- The `wisp-python` library runs as a standalone ASGI server.
- The client-side JavaScript (`static/js/main.js`) currently initiates a WebSocket connection to the Wisp server and logs the initial handshake.
- **Next Steps for Wisp:**
    - Implement full Wisp client logic in `main.js` (or integrate `wisp-client-js`). This includes:
        - Sending `CONNECT` packets for requested URLs (parsing the URL, creating the binary packet).
        - Handling `DATA` packets from the server and deciding how to render/use them. This is the most complex part: how do you get the proxied content into the user's view?
            - **Option A (Simpler, less compatible):** If the content is simple HTML, could try to load it into the iframe `srcdoc`.
            - **Option B (More robust, like Ultraviolet/Scramjet):** The Wisp client (often in a Service Worker) intercepts all network requests made by the page (e.g., for images, CSS, further JS, XHR/fetch calls, navigation). These requests are then routed over Wisp. The initial page loaded into the iframe is a "bootstrapper" that sets up this Wisp client and service worker. The URL in the address bar is rewritten to point to the proxy.
        - Sending `DATA` packets from client to server (e.g., form submissions).
        - Managing stream IDs and buffer `CONTINUE` messages.
    - The most challenging part of Wisp (and any advanced web proxy) is correctly rewriting the proxied content (HTML, CSS, JS, headers, service workers) so that all subsequent requests from the proxied page also go through Wisp. The `wisp-server-python` itself does *not* do this rewriting; it's purely a transport layer. This rewriting is what Scramjet (and similar proxies like Ultraviolet) are primarily responsible for. If we want to proxy arbitrary websites effectively using Wisp, we *need* this rewriting capability.

### Scramjet Implementation
"Supporting Scramjet" means creating a Python-based content rewriting engine. This engine will parse and modify HTML, CSS, and JavaScript to ensure all resource requests and navigation go through the proxy (using Wisp as the transport). This is a complex task and will be developed iteratively. The Wisp server, when it receives a `CONNECT` request, would fetch the remote resource, pass it to this Python rewriting engine, and then send the rewritten content back over Wisp using `DATA` packets.

### Originality
The UI aims for a unique "glitchy" terminal aesthetic. Client-side JS includes minor visual novelties like dynamic placeholders and console logging for thematic effect.

## License

This project is licensed under the **GNU AGPL v3.0** due to the licensing of `wisp-server-python` and the reference Scramjet project.

---

*This proxy is a creative exploration of web proxy technologies.*
```
