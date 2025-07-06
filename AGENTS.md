# AGENTS.md - Instructions for AI Agents

Welcome, fellow agent! This file contains guidelines for working on the UNI-PROXY project.

## Project Goal

The primary goal is to create a unique and original web proxy.
- **Default Protocol:** Wisp (using `wisp-server-python`).
- **Experimental Protocol:** Scramjet (implementing rewriting techniques in Python).
- **Theme:** Originality, uniqueness, retro-terminal aesthetic.

## Key Technologies

- Python 3
- Flask
- `wisp-server-python` (AGPL-3.0 License)
- HTML, CSS, JavaScript for the frontend

## Development Guidelines

1.  **Understand Wisp:** Familiarize yourself with the Wisp protocol (see `MercuryWorkshop/wisp-protocol/blob/main/protocol.md`) and the `wisp-server-python` library. The server part of Wisp will likely run as a separate process or be carefully integrated with Flask's async capabilities if possible. The client-side will require JavaScript that speaks Wisp, potentially using or adapting `wisp-client-js`.
2.  **Scramjet Implementation:**
    *   Scramjet is about URL rewriting and request interception. The reference implementation (`MercuryWorkshop/scramjet`) is in TypeScript/Rust. For this project, you will be implementing similar *rewriting logic* in Python.
    *   This involves parsing HTML, CSS, and JavaScript to change URLs, modify headers, and handle service workers, cookies, etc. This is the most complex part of Scramjet support.
    *   Start with basic HTML attribute rewriting (`href`, `src`, `action`) and incrementally add more complex rewriting for CSS and JavaScript.
3.  **Flask Structure:**
    *   `app.py` is the main entry point.
    *   Static files are in `static/`.
    *   HTML templates are in `templates/`.
4.  **Frontend - Originality:**
    *   The UI should be unique. The current theme is a retro/glitchy terminal. Enhance this where possible.
    *   Client-side JavaScript (`static/js/main.js`) should handle user interactions and prepare requests for the proxy backend.
5.  **Dependencies:** Manage Python dependencies in `requirements.txt`.
6.  **Licensing:** Due to `wisp-server-python` and the reference Scramjet project both being AGPL-3.0, this project should also be considered AGPL-3.0. Ensure any new library dependencies are compatible.
7.  **Testing:**
    *   Test Wisp connections thoroughly.
    *   Incrementally test Scramjet rewriting capabilities on various websites. Start simple (static sites) and move to more complex ones (dynamic sites, sites with extensive JavaScript).
8.  **Modularity:** Try to keep the Wisp handling, Scramjet rewriting, and Bare server logic (if added) as modular as possible within the Flask application.

## Running the Project (Development)

-   The Flask app: `python app.py`
-   The Wisp server (initially, likely separate): `python -m wisp.server --port <chosen_port>`
-   The Flask app will need to be configured to correctly initialize Wisp connections, potentially by serving HTML that includes a Wisp client which then connects to the Wisp server.

## "Uniqueness" Ideas for Frontend (If you have time for enhancements)

*   More elaborate visual effects (e.g., text corruption, scan lines, CRT distortion on the iframe).
*   Sound effects for UI interactions (bleeps, clicks).
*   A "boot-up" sequence animation on the first load.
*   Customizable themes or color schemes for the terminal UI.

Good luck, and let's make something truly unique!
