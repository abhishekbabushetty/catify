# Catify – Production-Grade Image Replacement Engine

Catify is a high-performance Chrome Extension (Manifest V3) designed to systematically replace every image, background-image, and lazy-loaded asset on any website with a curated selection of random cat images.

## 🚀 The Approach

Building a reliable image replacer on the modern web is challenging due to complex frontend frameworks (React, Angular, Vue) and aggressive lazy-loading techniques used by sites like Google, YouTube, and Instagram. Catify uses a multi-layered "Engine" approach:

### 1. Element-Agnostic Targeting
Most standard extensions only target `<img>` tags. Catify scans the entire DOM for:
*   **Standard Images:** `<img>` and responsive `<picture>`/`<source>` sets.
*   **SVG Assets:** Embedded `<image>` tags within SVGs.
*   **CSS Backgrounds:** Elements (`div`, `span`, `section`) using `background-image` or shorthand `background` styles.
*   **Lazy-Loaded Buffers:** Custom attributes like `data-src`, `data-original`, and `lazy-src`.

### 2. High-Performance Caching & Zero Latency
Dynamic API calls (like `cataas.com`) can be slow and rate-limited, causing grey boxes. Catify uses a **Hardcoded URL Pool** from Unsplash:
*   **Instant Load:** Images load directly from the browser's disk cache after the first few hits.
*   **Zero API Dependency:** No waiting for external server responses; the replacement happens nearly instantly via the browser's optimized image pipeline.

### 3. The "Relentless" Mutation Strategy
To beat sites that "fight back" (re-rendering images when they are tampered with), Catify uses a dual-trigger system:
*   **MutationObserver (Aggressive):** Listens for *any* attribute change (not just `src`). If a site tries to revert a cat image back to the original photo, Catify detects the change and immediately re-catifies it.
*   **Fallback Scanner (Safety Net):** A systematic scanner runs every 2 seconds to catch elements rendered in the "Shadow DOM" or via complex lazy-loaders that occasionally bypass standard DOM observers.

### 4. Debounced Execution
To prevent browser "jank" or lag during infinite scrolling, all DOM updates are **debounced**. This ensures thousands of images can be processed without locking the main thread or affecting the user's scroll performance.

## 🛠️ Installation

1.  Clone/Download this repository.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer Mode** (top-right).
4.  Click **Load unpacked** and select the `CAT-EXTENSION` folder.
5.  Refresh any tab to start the cat invasion.

## 📄 Manifest Details
*   **Manifest Version:** 3
*   **Script Injection:** `document_end` for maximum coverage.
*   **Permissions:** Minimal footprint, requiring only `<all_urls>` for content script functionality.
