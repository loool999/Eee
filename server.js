const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { createBareServer } = require('@tomphttp/bare-server-node');
const { StringStream } = require('scramjet'); // Import Scramjet StringStream
const fetch = require('node-fetch'); // For making outbound requests

const app = express();
const server = http.createServer(app);
const bareServer = createBareServer('/bare/', { // Initialize BareServer
    logErrors: true, // Optional: for debugging
    // Other BareServer options can be added here
});

// It's common for Wisp implementations to use a specific path, e.g., /wisp/ or /ws/
// UV uses /wisp/, so we'll stick to that for broader client compatibility.
const wss = new WebSocket.Server({ server, path: '/wisp/' });

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route Bare requests
app.use((req, res, next) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        // If it's not a Bare request, continue to other routes or 404
        next();
    }
});

// Handle Bare WebSocket connections
server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        // Handle other WebSocket upgrades or destroy the socket
        // For Wisp, it's handled by the wss instance directly based on path
        // If no other WebSocket server handles it, it's good practice to destroy
        if (req.url.startsWith('/wisp/')) {
            // This will be handled by the 'wss' instance
            return;
        }
        socket.destroy();
    }
});


// Placeholder for the actual Wisp connection handling logic
// This will be significantly more complex in a real implementation

// Minimal working Wisp-like proxy handler (JSON-based, not full binary Wisp protocol)
function handleWispConnection(ws) {
    console.log('Wisp client connected');

    ws.on('message', async (message) => {
        try {
            // Expecting JSON: { url: "https://example.com", method: "GET", headers: {}, body: "" }
            let reqData;
            try {
                reqData = JSON.parse(message.toString());
            } catch (e) {
                ws.send(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }
            if (!reqData.url) {
                ws.send(JSON.stringify({ error: 'Missing url' }));
                return;
            }
            const fetchOptions = {
                method: reqData.method || 'GET',
                headers: reqData.headers || {},
                body: reqData.body || undefined
            };
            const response = await fetch(reqData.url, fetchOptions);
            const resHeaders = {};
            response.headers.forEach((v, k) => { resHeaders[k] = v; });
            const resBody = await response.text();
            ws.send(JSON.stringify({
                status: response.status,
                statusText: response.statusText,
                headers: resHeaders,
                body: resBody
            }));
        } catch (err) {
            ws.send(JSON.stringify({ error: err.message }));
        }
    });

    ws.on('close', () => {
        console.log('Wisp client disconnected');
    });

    ws.on('error', (error) => {
        console.error('Wisp WebSocket error:', error);
    });
}

wss.on('connection', handleWispConnection);

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Wisp WebSocket server available at ws://localhost:${PORT}/wisp/`);
    console.log(`Bare server available at /bare/`);
    console.log(`Scramjet proxy (example) available at /scramjet-proxy/?url=<target_url>`); // Log for Scramjet
});

// --- Artistic Content Weaving Elements ---
const artisticSnippets = [
    "<!-- ~o~ -->",
    "<!-- (::) -->",
    "<!-- <-> -->",
    "<!-- /\\_/\\ -->",
    "<!-- (o.o) -->",
    "<!-- ephemeral echo -->",
    "<!-- woven thread -->"
];

function getArtisticSnippet() {
    // Select a random snippet
    const randomSnippet = artisticSnippets[Math.floor(Math.random() * artisticSnippets.length)];
    // Add a unique timestamp-based element to make it more original per request
    const uniqueMark = `<!-- ${new Date().toISOString().slice(11, 23)} -->`; // HH:MM:SS.mmm
    return `${randomSnippet} ${uniqueMark}`;
}

// Modified Scramjet transformation function for Artistic Content Weaving
async function applyScramjetTransform(dataStream, targetUrl, contentType) {
    console.log(`Applying Scramjet transform for ${targetUrl}, content type: ${contentType}`);

    // Only attempt to weave into HTML content
    if (contentType && contentType.toLowerCase().includes('text/html')) {
        // This is a simplified approach. Robust HTML manipulation is complex.
        // We'll buffer the entire HTML, inject, then stream out.
        // Not ideal for very large files, but simpler for this example.
        try {
            const htmlContent = await dataStream.reduce((acc, chunk) => acc + chunk.toString(), "");
            let modifiedHtml = htmlContent;

            const snippet = getArtisticSnippet();

            // Try to inject before </body>. If not found, try before </html>.
            // This is a naive injection method.
            if (modifiedHtml.includes('</body>')) {
                modifiedHtml = modifiedHtml.replace('</body>', `${snippet}\n</body>`);
            } else if (modifiedHtml.includes('</html>')) {
                modifiedHtml = modifiedHtml.replace('</html>', `${snippet}\n</html>`);
            } else {
                // Fallback: append to the end if no body or html tag found (unlikely for valid HTML)
                modifiedHtml += snippet;
            }
            console.log(`Artistic snippet woven into ${targetUrl}`);
            return StringStream.from(modifiedHtml); // Stream the modified HTML
        } catch (err) {
            console.error("Error during Scramjet HTML transformation: ", err);
            // If error, return original stream (or handle differently)
            // For safety, we might need to re-create the stream if consumed by `reduce`
            // This part needs careful handling in a real app.
            // For now, if reduce fails, this will also fail.
            // A better approach would be to use a transform stream that can inspect and modify on the fly.
            return dataStream; // Fallback, though dataStream might be consumed
        }

    } else {
        // If not HTML, just pass through
        console.log(`Skipping artistic weaving for non-HTML content: ${contentType}`);
        return dataStream.map(chunk => { // Ensure it's still a Scramjet stream
            // console.log(`Scramjet passthrough chunk for ${targetUrl}, length: ${chunk.length}`);
            return chunk;
        });
    }
}

// Scramjet proxy endpoint
app.get('/scramjet-proxy/', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('Missing "url" query parameter.');
    }

    console.log(`Scramjet proxy request for: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl); // Fetch the actual content
        if (!response.ok) {
            return res.status(response.status).send(`Error fetching remote URL: ${response.statusText}`);
        }

        // Set headers from the original response
        // Important: Filter out headers like 'content-encoding' if we modify the body,
        // and 'content-length' as it might change.
        // Also, be careful with security headers like CSP.
        // For a robust proxy, header manipulation is a complex topic.
        Object.entries(response.headers.raw()).forEach(([key, value]) => {
            // Skip problematic headers
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                // value is an array of strings
                value.forEach(v => res.setHeader(key, v));
            }
        });

        // Create a Scramjet StringStream from the response body
        const dataStream = StringStream.from(response.body); // response.body is a ReadableStream
        const contentType = response.headers.get('content-type');

        // Apply the Scramjet transformation
        const transformedStream = await applyScramjetTransform(dataStream, targetUrl, contentType);

        // Pipe the transformed stream to the client's response
        transformedStream.pipe(res);

    } catch (error) {
        console.error('Scramjet proxy error:', error);
        res.status(500).send(`Server error: ${error.message}`);
    }
});


// Basic error handling for the HTTP server
app.on('error', (err) => {
    console.error('Express server error:', err);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    wss.close(() => {
        console.log('Wisp server closed.');
    });
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
});
