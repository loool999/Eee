# UNI-PROXY Rewriter Engine (Inspired by Scramjet)
# Theme: Originality / Uniqueness

from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin

# This would be dynamically set based on the proxy's current configuration
PROXY_BASE_URL = "http://127.0.0.1:5000/proxy-session/" # Placeholder

# --- Core Rewriting Components (Placeholders and Outlines) ---

def rewrite_url(original_url: str, page_base_url: str, proxy_session_url: str) -> str:
    """
    Rewrites a single URL to point through the proxy.
    Handles relative and absolute URLs.
    """
    if not original_url or original_url.startswith('#') or original_url.startswith('javascript:') or original_url.startswith('mailto:') or original_url.startswith('data:'):
        return original_url

    # Resolve the original URL against the page's base URL to get an absolute URL
    absolute_original_url = urljoin(page_base_url, original_url)

    # Now, construct the proxied URL
    # This is a simplified example. A full implementation needs to handle:
    # - Encoding the target URL safely.
    # - Potentially encrypting or obfuscating the target URL.
    # - Associating it with the correct Wisp stream or proxy session.
    # For now, let's assume the proxy_session_url is the entry point for our proxy
    # and the target URL is passed as a query parameter or path segment.

    # Example: proxy_session_url = "http://myproxy.com/p/"
    # Encoded target: "http%3A%2F%2Fexample.com%2Fpath"
    # Result: "http://myproxy.com/p/http%3A%2F%2Fexample.com%2Fpath"

    # A more robust approach might involve a dedicated Wisp client function
    # that can generate these URLs, e.g., `wisp.rewrite_url(target_url)`

    # For this basic version, let's imagine a simple prefixing strategy.
    # This is NOT how full Scramjet/Ultraviolet works but a starting point.
    # A real proxy would encode the target URL and append it to a proxy endpoint.

    # Let's simulate a simple encoding for the rewriter to use.
    # The proxy server would have a route like /load/<encoded_url>
    # For now, this is highly conceptual and needs to align with how Wisp client will request.

    # The key is that any URL found in the content needs to be transformed
    # so that when the browser requests it, the request comes BACK to our proxy.

    # A common pattern: PROXY_URL + encodeURIComponent(TARGET_URL)
    # However, for Wisp, it's more complex: the client-side Wisp code
    # intercepts requests. The rewritten URL should be something that the Wisp
    # client can recognize and handle.
    # For now, this function will just return a placeholder.
    # The actual rewriting will depend on the client-side JS (Wisp client).

    # Let's assume for the purpose of HTML rewriting, we want to make URLs absolute
    # and then prefix them in a way that our proxy (or client-side wisp handler) can understand.
    # This is a placeholder for a more sophisticated URL encoding/rewriting scheme.

    # Simplistic rewrite for demonstration:
    # If proxy_session_url = "http://localhost:5000/wisp-session/"
    # and absolute_original_url = "http://example.com/foo"
    # it might become "http://localhost:5000/wisp-session/http://example.com/foo" (needs encoding)

    # This function will be called by specific rewriters (HTML, CSS, JS).
    # The `proxy_session_url` should be the base for rewritten URLs.

    parsed_original = urlparse(original_url)
    if parsed_original.scheme and parsed_original.netloc: # Already absolute
        # This is where we'd make it go through our proxy
        # For now, let's assume a simple prefix for demonstration
        # THIS IS A GROSS OVER-SIMPLIFICATION of how real proxies work
        # It should be more like: proxy_session_url + url_encode(absolute_original_url)
        return proxy_session_url + absolute_original_url

    # Handle relative URLs by joining with page_base_url first
    resolved_url = urljoin(page_base_url, original_url)
    return proxy_session_url + resolved_url


def rewrite_html_content(html_content: str, original_page_url: str, proxy_session_base: str) -> str:
    """
    Rewrites HTML content.
    - Modifies URLs in attributes like href, src, action, etc.
    - Handles <base> tags.
    - Modifies inline styles and scripts (delegating to CSS/JS rewriters).
    """
    if not html_content:
        return ""

    soup = BeautifulSoup(html_content, 'lxml') # Using lxml for speed

    # Determine the base URL for resolving relative paths within this HTML
    base_tag = soup.find('base')
    page_base_url = original_page_url
    if base_tag and base_tag.get('href'):
        page_base_url = urljoin(original_page_url, base_tag.get('href'))
        # Potentially rewrite the base tag href itself, or remove it if all URLs are made absolute.
        # For now, let's assume we make all URLs absolute and don't need the base tag after rewriting.
        # Or, rewrite it: base_tag['href'] = rewrite_url(base_tag['href'], original_page_url, proxy_session_base)

    # Tags and attributes to check for URLs
    # This list is not exhaustive
    url_attributes = {
        'a': ['href'],
        'link': ['href'], # for CSS, favicons, etc.
        'script': ['src'],
        'img': ['src', 'srcset'], # srcset needs special parsing
        'iframe': ['src'],
        'form': ['action'],
        'source': ['src', 'srcset'],
        'video': ['src', 'poster'],
        'audio': ['src'],
        'object': ['data'],
        'embed': ['src'],
        # TODO: Add more tags/attributes (e.g., meta refresh, manifest links)
    }

    for tag_name, attrs in url_attributes.items():
        for tag in soup.find_all(tag_name):
            for attr_name in attrs:
                original_url = tag.get(attr_name)
                if original_url:
                    if attr_name == 'srcset':
                        # srcset needs special handling as it contains multiple URLs and descriptors
                        rewritten_srcset = rewrite_srcset(original_url, page_base_url, proxy_session_base)
                        tag[attr_name] = rewritten_srcset
                    else:
                        rewritten_url = rewrite_url(original_url, page_base_url, proxy_session_base)
                        tag[attr_name] = rewritten_url

    # Rewrite URLs in inline style attributes
    for tag in soup.find_all(style=True):
        tag['style'] = rewrite_css_inline(tag['style'], page_base_url, proxy_session_base)

    # TODO: Rewrite inline JavaScript (onclick, onmouseover, etc.) and <script> tag contents
    # This requires a JS parser or very careful regex.

    return str(soup)

def rewrite_srcset(srcset_value: str, page_base_url: str, proxy_session_base: str) -> str:
    """
    Rewrites URLs within a srcset attribute.
    Example: "image-sm.jpg 100w, image-lg.jpg 200w"
    """
    parts = srcset_value.split(',')
    rewritten_parts = []
    for part in parts:
        part = part.strip()
        url_descriptor_pair = part.split(None, 1) # Split by whitespace, max 1 split
        url = url_descriptor_pair[0]
        descriptor = url_descriptor_pair[1] if len(url_descriptor_pair) > 1 else ""

        rewritten_url = rewrite_url(url, page_base_url, proxy_session_base)
        rewritten_parts.append(f"{rewritten_url} {descriptor}".strip())

    return ", ".join(rewritten_parts)


def rewrite_css_content(css_content: str, original_css_url: str, proxy_session_base: str) -> str:
    """
    Rewrites CSS content.
    - Modifies URLs in url(), @import, src (for fonts).
    """
    if not css_content:
        return ""
    # This is a placeholder. CSS rewriting is complex.
    # Needs to handle various url() formats, @import statements.
    # A robust solution would use a CSS parser.
    # For a simple demo, one might use regex, but it's error-prone.
    # Example (very naive regex for url()):
    # import re
    # def repl(match):
    #     original_url = match.group(1).strip("'\"")
    #     return f"url('{rewrite_url(original_url, original_css_url, proxy_session_base)}')"
    # css_content = re.sub(r'url\((.*?)\)', repl, css_content)

    # For now, just return original, highlighting complexity
    print(f"[REWRITER_INFO] CSS rewriting for {original_css_url} is complex and not fully implemented.")
    return css_content # Placeholder

def rewrite_css_inline(style_value: str, page_base_url: str, proxy_session_base: str) -> str:
    """Rewrites URLs in inline style attributes."""
    # Similar to rewrite_css_content but for a single style declaration string.
    # Placeholder - this is also complex.
    return style_value # Placeholder

def rewrite_js_content(js_content: str, original_js_url: str, proxy_session_base: str) -> str:
    """
    Rewrites JavaScript content. This is the most complex part.
    - Modifies URLs in strings, fetch(), XMLHttpRequest, WebSocket, etc.
    - Handles dynamic URL creation.
    - Potentially needs to sandbox or modify certain browser APIs (document.cookie, location).
    """
    if not js_content:
        return ""
    # This is a major placeholder. JS rewriting is extremely hard.
    # Requires a JS parser (like esprima, acorn, or using a Rust/Wasm based one for performance).
    # Then, Abstract Syntax Tree (AST) traversal and modification.
    print(f"[REWRITER_INFO] JavaScript rewriting for {original_js_url} is highly complex and not implemented.")
    return js_content # Placeholder


def rewrite_headers(headers: dict, original_page_url: str, proxy_session_base: str) -> dict:
    """
    Rewrites HTTP headers.
    - Modifies Location, Referer, Content-Security-Policy, etc.
    - Manages cookies (domain, path rewriting).
    """
    rewritten_headers = headers.copy()

    # Example: Location header
    if 'Location' in rewritten_headers:
        rewritten_headers['Location'] = rewrite_url(rewritten_headers['Location'], original_page_url, proxy_session_base)
    if 'location' in rewritten_headers: # Headers can be case-insensitive
        rewritten_headers['location'] = rewrite_url(rewritten_headers['location'], original_page_url, proxy_session_base)

    # TODO: Cookie rewriting (Set-Cookie from server, Cookie to server)
    # TODO: Content-Security-Policy rewriting
    # TODO: Referer
    # TODO: CORS headers (Access-Control-Allow-Origin)

    # Remove problematic headers like 'Strict-Transport-Security' if proxying over HTTP from HTTPS
    # or if the proxy can't guarantee HTTPS to the end-user.

    print(f"[REWRITER_INFO] Header rewriting is partially implemented (Location only for now).")
    return rewritten_headers


# --- Main Rewriter Function ---
def ScramjetRewriter(content_type: str, content: bytes, headers: dict, request_url: str, proxy_config: dict) -> tuple[bytes, dict]:
    """
    Main entry point for the Scramjet-inspired rewriter.

    :param content_type: The MIME type of the content (e.g., "text/html").
    :param content: The raw bytes of the content.
    :param headers: The original response headers from the target server.
    :param request_url: The original URL requested by the client (before proxying).
    :param proxy_config: Dictionary containing proxy configuration,
                         e.g., {'base_url': 'http://myproxy.com/session_xyz/'}
                         This base_url is what rewritten URLs should be relative to.
    :return: Tuple of (rewritten_content_bytes, rewritten_headers)
    """

    proxy_session_base = proxy_config.get("session_base_url", PROXY_BASE_URL) # Fallback to global

    # Decode content if it's text-based (HTML, CSS, JS)
    # Need to handle character encodings properly (from Content-Type header or detected)
    text_content = None
    encoding = 'utf-8' # Default, should be parsed from headers.get('Content-Type')

    if 'text/html' in content_type:
        try:
            text_content = content.decode(encoding) # Add error handling for encoding
            rewritten_text_content = rewrite_html_content(text_content, request_url, proxy_session_base)
            content = rewritten_text_content.encode(encoding)
        except UnicodeDecodeError:
            print(f"[REWRITER_ERROR] Failed to decode HTML with {encoding} for {request_url}")
            # Fallback or error handling
            pass # Keep original content

    elif 'text/css' in content_type:
        try:
            text_content = content.decode(encoding)
            rewritten_text_content = rewrite_css_content(text_content, request_url, proxy_session_base)
            content = rewritten_text_content.encode(encoding)
        except UnicodeDecodeError:
            print(f"[REWRITER_ERROR] Failed to decode CSS with {encoding} for {request_url}")
            pass

    elif 'javascript' in content_type or 'application/javascript' in content_type: # various JS mime types
        try:
            text_content = content.decode(encoding)
            rewritten_text_content = rewrite_js_content(text_content, request_url, proxy_session_base)
            content = rewritten_text_content.encode(encoding)
        except UnicodeDecodeError:
            print(f"[REWRITER_ERROR] Failed to decode JS with {encoding} for {request_url}")
            pass

    # Rewrite headers
    rewritten_headers = rewrite_headers(headers, request_url, proxy_session_base)

    # Update Content-Length if content was modified
    if text_content is not None and 'Content-Length' in rewritten_headers:
        rewritten_headers['Content-Length'] = str(len(content))
    if text_content is not None and 'content-length' in rewritten_headers:
        rewritten_headers['content-length'] = str(len(content))

    return content, rewritten_headers


if __name__ == '__main__':
    # --- Basic Test for HTML Rewriter ---
    print("--- Testing HTML Rewriter ---")
    sample_html = """
    <html>
    <head>
        <title>Test Page</title>
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="/abs/style.css">
        <link rel="stylesheet" href="http://ext.com/style.css">
        <base href="http://example.com/docs/">
    </head>
    <body>
        <h1>Hello</h1>
        <p>This is a <a href="page.html">relative link</a>.</p>
        <p>An <a href="/abs/page.html">absolute link</a>.</p>
        <p>An <a href="http://example.com/another/page.html">external absolute link (same domain)</a>.</p>
        <p>A <a href="https://othersite.com/resource">fully external link</a>.</p>
        <img src="image.png" srcset="img/small.jpg 500w, img/large.jpg 1000w">
        <img src="/img/photo.jpg">
        <form action="submit.php"></form>
        <script src="script.js"></script>
        <div style="background-image: url('bg.png');">Inline Style</div>
    </body>
    </html>
    """
    test_page_url = "http://example.com/docs/current.html"
    # This proxy_session_base is how the Wisp client will know to intercept the URL
    # For example, if our main proxy page is http://localhost:5000/
    # and it uses a service worker + wisp client, the rewritten URLs might look like:
    # http://localhost:5000/wisp-prefix/http://example.com/docs/style.css
    # The service worker at /sw.js would intercept /wisp-prefix/*
    # and send the target (http://example.com/docs/style.css) over Wisp.

    # For now, the rewriter just needs a base to prepend.
    # Let's assume our proxy serves proxied content under "/p/" for simplicity.
    # The actual URL structure will depend on the Wisp client and server setup.
    # The `rewrite_url` function needs to be consistent with how the Wisp client
    # expects to receive and interpret these URLs.

    # Let's define a proxy base that makes sense for the rewriter's current logic.
    # If rewrite_url prepends `proxy_session_base` + `target_absolute_url`
    # then `proxy_session_base` should be the prefix that identifies a proxied resource.
    # e.g. "http://localhost:5000/p/" (where /p/ is a route on our Flask server that handles proxied requests)
    # OR, it could be the Wisp server's endpoint itself if the Wisp client is smart enough.

    # For Scramjet/Ultraviolet, they often use a specific path prefix like `/service/` or `/session/`
    # and the actual target URL is encoded within that path or query params.

    # Let's use a placeholder compatible with the current simple `rewrite_url`
    test_proxy_base = "http://myproxy.uni/s/" # 's' for session or scramjet

    print(f"Original Page URL: {test_page_url}")
    print(f"Proxy Session Base for Rewriting: {test_proxy_base}")

    rewritten_html = rewrite_html_content(sample_html, test_page_url, test_proxy_base)
    print("\n--- Rewritten HTML ---")
    print(rewritten_html)

    print("\n--- Testing Header Rewriter ---")
    sample_headers = {
        'Content-Type': 'text/html',
        'Location': 'http://example.com/new-page',
        'Set-Cookie': 'sessionid=123; Path=/; Domain=example.com'
    }
    rewritten_headers = rewrite_headers(sample_headers, test_page_url, test_proxy_base)
    print("\n--- Rewritten Headers ---")
    for k, v in rewritten_headers.items():
        print(f"{k}: {v}")

    print("\n--- Testing ScramjetRewriter Main Function ---")
    test_html_bytes = sample_html.encode('utf-8')
    test_content_type = 'text/html; charset=utf-8'
    test_req_url = 'http://example.com/some/page.html'
    test_proxy_cfg = {'session_base_url': 'http://localhost:5000/proxied/'}

    r_content, r_headers = ScramjetRewriter(test_content_type, test_html_bytes, sample_headers, test_req_url, test_proxy_cfg)
    print("\n--- ScramjetRewriter Output Headers ---")
    print(r_headers)
    print("\n--- ScramjetRewriter Output HTML (first 200 chars) ---")
    print(r_content.decode('utf-8')[:200] + "...")
```
