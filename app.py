# Unique Proxy - Main Application
# Theme: Originality / Uniqueness

from flask import Flask, render_template, request, jsonify
import requests # To fetch content for the debug rewriter
from rewriter import ScramjetRewriter # Import the rewriter

app = Flask(__name__)

# Wisp Server Note:
# The wisp-server-python is an ASGI application and runs independently.
# It should be started as a separate process. For example:
# python -m wisp.server --host 127.0.0.1 --port 8008 --log-level debug
# The client-side JavaScript will then connect to ws://127.0.0.1:8008/
# (Note: wisp-server-python default path is '/', not '/wisp/')

@app.route('/')
def index():
    """Serves the main proxy frontend."""
    return render_template('index.html')

# The '/wisp/' path for WebSocket connections is handled by the separate Wisp server,
# not by Flask. Flask's role is to serve the HTML page that contains
# the client-side JavaScript to connect to the Wisp server.


# --- Scramjet Rewriting Integration (Conceptual) ---
# In a real scenario, the Wisp server itself, after fetching content from the target,
# would call a function like this before sending data back to the Wisp client.
def process_content_for_wisp_client(target_url, fetched_content_bytes, fetched_headers):
    """
    Conceptual function showing where ScramjetRewriter would be used by the Wisp server.
    This function itself wouldn't be a Flask route called by the client directly for proxying.
    """
    content_type = fetched_headers.get('Content-Type', fetched_headers.get('content-type', 'application/octet-stream'))

    # Define how the proxy session URLs should look for this request
    # This needs to be consistent with how the Wisp client-side JS will construct requests
    # and how the Wisp server (or a reverse proxy in front of it) routes them.
    # Example: if Wisp client makes requests to "ws://myproxy.com/wisp-session/<actual_target_url_or_id>"
    # then proxy_session_base might be "http://myproxy.com/wisp-session/" (for HTTP resources)
    # This is highly dependent on the overall architecture.
    proxy_config = {
        "session_base_url": f"http://{request.host}/proxy-content/" # Example: URLs rewritten to /proxy-content/http://example.com/
    }

    print(f"[UNI-PROXY] Rewriting content for: {target_url} of type {content_type}")
    rewritten_content, rewritten_headers = ScramjetRewriter(
        content_type=content_type,
        content=fetched_content_bytes,
        headers=dict(fetched_headers), # Ensure it's a mutable dict
        request_url=target_url,
        proxy_config=proxy_config
    )
    return rewritten_content, rewritten_headers

# --- Debug Route for Testing Rewriter ---
@app.route('/debug-rewrite', methods=['GET'])
def debug_rewrite_page():
    return """
    <!DOCTYPE html><html><head><title>Debug Rewriter</title></head><body>
    <h1>Test Scramjet Rewriter</h1>
    <form id="rewriteForm">
        <label for="url">URL to Fetch & Rewrite:</label><br>
        <input type="text" id="url" name="url" value="http://example.com" style="width: 400px;"><br><br>
        <button type="submit">Fetch and Rewrite</button>
    </form>
    <h2>Original Headers:</h2><pre id="originalHeaders"></pre>
    <h2>Rewritten Headers:</h2><pre id="rewrittenHeaders"></pre>
    <h2>Rewritten Content (first 1000 chars):</h2><pre id="rewrittenContent"></pre>
    <script>
        document.getElementById('rewriteForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const url = document.getElementById('url').value;
            const response = await fetch('/debug-rewrite-backend?url=' + encodeURIComponent(url));
            const data = await response.json();

            document.getElementById('originalHeaders').textContent = JSON.stringify(data.original_headers, null, 2);
            document.getElementById('rewrittenHeaders').textContent = JSON.stringify(data.rewritten_headers, null, 2);
            document.getElementById('rewrittenContent').textContent = data.rewritten_content_snippet;
        });
    </script>
    </body></html>
    """

@app.route('/debug-rewrite-backend', methods=['GET'])
def debug_rewrite_backend():
    target_url = request.args.get('url')
    if not target_url:
        return jsonify({"error": "URL parameter is required"}), 400

    try:
        # Fetch the content from the target URL
        # In a real proxy, this fetch would be done by the Wisp server part
        print(f"[DEBUG_REWRITER] Fetching: {target_url}")
        resp = requests.get(target_url, headers={'User-Agent': 'UNI-PROXY Debug Rewriter'}, timeout=10, allow_redirects=True)
        resp.raise_for_status() # Raise an exception for HTTP errors

        fetched_content_bytes = resp.content
        fetched_headers = dict(resp.headers)
        content_type = fetched_headers.get('Content-Type', fetched_headers.get('content-type', 'application/octet-stream'))

        # This is where the rewriter would be called in the proxy flow
        proxy_config = {
             # This base URL is what the rewriter will use to prefix rewritten URLs.
             # It should point back to a path that the proxy can handle.
            "session_base_url": f"{request.scheme}://{request.host}/p/" # Example: http://localhost:5000/p/
        }

        rewritten_content_bytes, rewritten_headers_dict = ScramjetRewriter(
            content_type=content_type,
            content=fetched_content_bytes,
            headers=fetched_headers,
            request_url=target_url, # The originally requested URL
            proxy_config=proxy_config
        )

        # For JSON response, send a snippet of the content
        try:
            content_snippet = rewritten_content_bytes.decode('utf-8', errors='ignore')[:1000]
        except Exception:
            content_snippet = rewritten_content_bytes.hex()[:1000]


        return jsonify({
            "target_url": target_url,
            "original_headers": fetched_headers,
            "rewritten_headers": rewritten_headers_dict,
            "rewritten_content_snippet": content_snippet + "..." if len(content_snippet) == 1000 else content_snippet
        })

    except requests.exceptions.RequestException as e:
        print(f"[DEBUG_REWRITER] Error fetching {target_url}: {e}")
        return jsonify({"error": f"Failed to fetch URL: {str(e)}"}), 500
    except Exception as e:
        print(f"[DEBUG_REWRITER] Error during rewriting: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


# Placeholder for Bare server endpoint if we add it as an option
# @app.route('/bare/', methods=['GET', 'POST'])
# def bare_server():
#     pass


if __name__ == '__main__':
    print("Starting Flask development server for UNI-PROXY frontend.")
    print("Ensure the Wisp server is running separately on its configured host/port.")
    print("Example Wisp server command: python -m wisp.server --host 127.0.0.1 --port 8008")
    print("Debug rewriter available at /debug-rewrite")
    app.run(debug=True, host='0.0.0.0', port=5000)
