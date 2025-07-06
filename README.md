# Jules' Unique Proxy

Welcome to Jules' Unique Proxy! This Node.js-based web proxy is designed with a touch of originality, offering multiple proxying mechanisms including Wisp (default), Bare, and a unique Scramjet-powered transformation engine.

## Features

*   **Multi-Engine Support:**
    *   **Wisp:** Default proxy method, ideal for robust client-side proxying solutions (e.g., Ultraviolet, Stomp). Connect your Wisp-compatible client to `ws://<your_server_address>/wisp/`.
    *   **Bare:** Supports the Bare Server Protocol for compatibility with clients that use it. Accessible via `/bare/` endpoint.
    *   **Scramjet ("Artistic Weaving"):** A custom proxy mode using Scramjet.js to subtly transform HTML content by weaving in unique, procedurally generated artistic comments. Access via `/scramjet-proxy/?url=<target_url>`.
*   **Unique "Artistic Weaving":** The Scramjet engine, when proxying HTML, injects tiny, almost unnoticeable comments (e.g., `<!-- ~o~ --> <!-- timestamp -->`) into the page structure, making each proxied HTML page subtly unique.
*   **Simple Frontend:** A basic web interface to select the proxy engine (for Bare and Scramjet) and input URLs.
*   **Node.js Powered:** Built with Express.js and standard Node.js libraries.

## Project Structure

```
.
├── public/                 # Frontend static files
│   ├── index.html          # Main HTML page
│   ├── style.css           # CSS styles
│   └── client.js           # Frontend JavaScript
├── server.js               # Main Node.js server application
├── package.json            # Project metadata and dependencies
├── Procfile                # For Heroku deployment
├── Dockerfile              # For containerized deployment
├── .dockerignore           # Files to ignore for Docker build
├── README.md               # This file
└── AGENTS.md               # Instructions for AI development agents
```

## Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Setup and Running

1.  **Clone the repository (if applicable):**
    ```bash
    # git clone <repository_url>
    # cd <repository_directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the server:**
    ```bash
    npm start
    ```
    By default, the server will run on `http://localhost:3000`. You can set the `PORT` environment variable to use a different port.

4.  **Accessing the Proxy:**
    *   **Web Interface:** Open your browser to `http://localhost:3000`.
    *   **Wisp Endpoint:** `ws://localhost:3000/wisp/`
    *   **Bare Endpoint:** `http://localhost:3000/bare/`
    *   **Scramjet Endpoint (direct use, not via UI):** `http://localhost:3000/scramjet-proxy/?url=<some_encoded_url>`

## How to Use Each Proxy Engine

*   **Wisp:**
    *   Configure your Wisp-compatible client application (e.g., Ultraviolet, Stomp) to use `ws://<server_address>/wisp/` as its Wisp server.
    *   Enter the desired URL in your Wisp client.
    *   *Note: The full Wisp protocol for request/response relay is currently stubbed in `server.js`. Only the WebSocket connection handshake is handled.*

*   **Bare:**
    *   Use the web interface: Select "Bare (Standard)", enter a URL, and click "Go".
    *   Or, configure a Bare-compatible client to use `http://<server_address>/bare/`.

*   **Scramjet (Artistic Weaving):**
    *   Use the web interface: Select "Scramjet (Artistic Weaving)", enter a URL, and click "Go".
    *   Content will be loaded in the iframe. View the iframe's page source to find the "woven" comments in HTML pages.

## Deployment

Conceptual deployment instructions and configurations are provided:

*   **`Procfile`:** For Heroku and similar platforms.
*   **`Dockerfile` & `.dockerignore`:** For containerized deployments (e.g., Docker, Kubernetes, Cloud Run).
*   The application listens on `process.env.PORT || 3000`.

## Development Notes

*   The Wisp implementation (`handleWispConnection` in `server.js`) is a basic skeleton. Full Wisp protocol handling (binary message parsing, remote request management, etc.) is a significant task not yet completed.
*   The "Artistic Weaving" in Scramjet uses a naive HTML string replacement. For very complex or malformed HTML, this might not be perfectly robust.
*   Error handling is generally basic; production environments would benefit from more comprehensive error logging and reporting.

## Contributing (Conceptual)

If this were an open project:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file (if one were formally added, conceptually MIT).

---

Crafted with care by Jules the AI.
