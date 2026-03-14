# Physics Notebook: Concept Page Pattern

This guide documents the standard pattern for creating new concept pages in the Physics Notebook project. Follow this template to ensure consistency in design, functionality, and code structure.

## 1. File Structure & Location
-   **New Concept File**: Create in `Concepts/<concept-name>.html`.
-   **Asset Linking**: Ensure CSS (`../css/`) and JS (`../js/`) paths are correct relative to the `Concepts/` directory.

## 2. HTML Template
Use the following structure for the HTML file.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Concept Title] • Physics Notebook</title>

    <!-- Standard Framework Styles -->
    <link rel="stylesheet" href="../css/common.css">
    <link rel="stylesheet" href="../css/article.css">
    
    <!-- Page Specific Styles (AI Links types) -->
    <style>
        /* ... Copy AI Links styles from existing pages ... */
        /* ... Add specific styles for interactive controls ... */
    </style>

    <!-- MathJax (LaTeX) Support -->
    <script>
        window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] } };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <!-- Theme Initialization -->
    <script>
        const savedTheme = localStorage.getItem('physics-notebook-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    </script>

    <!-- Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <!-- Navbar -->
    <nav class="sticky">
        <div class="nav-bg"></div>
        <a href="../index.html" class="logo"><i data-lucide="arrow-left" width="16"></i> Library</a>
        <button id="themeBtn"><i data-lucide="moon" width="16"></i> Theme</button>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="text-reveal-wrapper">
            <h1 class="hero-title">[Concept Title]<br>[Second Line]</h1>
            <p style="margin-top: 2rem; font-size: 1.4rem; max-width: 40ch;">
                [One sentence description of the concept].
            </p>
        </div>
    </section>

    <!-- Standard Section Layout (Repeat for 3 Sections) -->
    <section>
        <div class="split-layout">
            <!-- Left: Content -->
            <div class="content-col">
                <h3 class="section-label" style="color: var(--accent);">01. [Section Label]</h3>
                <h2>[Section Title]</h2>
                <p>[Explanatory text...]</p>
                
                <!-- Math Block -->
                <div class="math-block">$$ [Equation] $$</div>
                
                <!-- Setup/Analogy Card -->
                <div class="etu-card">
                    <span class="etu-tag">Real World Analogy</span>
                    <h4 style="margin-bottom:0.5rem;">[Analogy Title]</h4>
                    <p style="font-size: 0.95rem; margin-bottom:0;">[Analogy Description]</p>
                </div>

                <!-- AI Links -->
                <div class="ai-links">
                    <span class="ai-label">Ask AI:</span>
                    <!-- Example: Perplexity, Gemini, ChatGPT, Claude, Grok -->
                    <button onclick="openAI('topic', 'perplexity')" class="ai-btn" title="Ask Perplexity"><svg ... ></svg></button>
                    <button onclick="openAI('topic', 'gemini')" class="ai-btn" title="Ask Gemini"><svg ... ></svg></button>
                    <button onclick="openAI('topic', 'chatgpt')" class="ai-btn" title="Ask ChatGPT"><svg ... ></svg></button>
                    <button onclick="openAI('topic', 'claude')" class="ai-btn" title="Ask Claude"><svg ... ></svg></button>
                    <button onclick="openAI('topic', 'grok')" class="ai-btn" title="Ask Grok"><svg ... ></svg></button>
                </div>
                
                <!-- Interactive Controls (Optional) -->
                <div class="sim-controls">
                    <div class="slider-group">
                        <label>[Variable Name] <span id="val-[id]">[Default]</span>[Unit]</label>
                        <input type="range" id="input-[id]" min="[min]" max="[max]" step="[step]" value="[default]">
                    </div>
                </div>
            </div>

            <!-- Right: Visualization -->
            <div class="visual-col">
                <canvas id="canvas-[id]"></canvas>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Additional sections follow same pattern... -->

    <!-- References -->
    <section class="references">
        <div style="max-width: 800px; margin: 0 auto;">
            <h3>Academic References</h3>
            <ul>
                <li><strong>[Author]</strong> ([Year]). <em>[Title]</em>, [Details].</li>
            </ul>
        </div>
    </section>

    <!-- Scripts -->
    <script src="../js/common.js"></script>
    <script>
        // ... Page Specific JS (See Section 3) ...
    </script>
</body>
</html>
```

## 3. JavaScript Architecture

The JavaScript structure handles the canvas animations, theme updates, and intersection observing (for performance).

### 3.1 Standard `openAI` Function
Use the shared `launchAIPrompt()` helper from `../js/common.js` instead of
duplicating direct provider and clipboard logic in each page.

```javascript
function openAI(topic, model) {
    let prompt = "";
    // Define prompts based on specific topics in the page
    switch (topic) {
        case 'topic1': prompt = "Query 1..."; break;
        // ...
    }
    launchAIPrompt(model, prompt);
}
```

### 3.2 The `APP` Object
Manages initialization and lifecycle.

```javascript
const APP = {
    visuals: [],
    observer: null,

    init() {
        this.setupObserver();
        this.initScrollAnimations(); // GSAP setup
        this.initVisuals(); // Instantiate visuals

        // Listen for theme changes to update canvas colors
        window.addEventListener('theme-changed', (e) => {
            this.visuals.forEach(v => v.updateColors());
        });
    },

    setupObserver() {
        // Only render canvases when visible
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const visual = this.visuals.find(v => v.canvas === entry.target);
                if (visual) visual.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.1 });
    },

    initVisuals() {
        this.addVisual(new VisualClass1('canvas-id-1'));
        this.addVisual(new VisualClass2('canvas-id-2'));
    },

    addVisual(visual) {
        this.visuals.push(visual);
        this.observer.observe(visual.canvas);
    }
};

window.onload = () => APP.init();
```

### 3.3 Visual Classes
All visualizations should extend a `BaseVisual` class to handle common canvas logic (HiDPI scaling, colors, loop).

```javascript
class BaseVisual {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.isVisible = false;
        this.updateColors();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop();
    }
    updateColors() {
        // Fetch CSS variables for theme consistency
        this.color = getComputedStyle(document.body).getPropertyValue('--text-main').trim();
        this.bg = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
        this.accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
        this.secondary = getComputedStyle(document.body).getPropertyValue('--accent-secondary').trim();
    }
    resize() {
        // Handle Retina/HighDPI displays
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * 2;
        this.canvas.height = rect.height * 2;
        this.scale = 2;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
    }
    loop() {
        if (this.isVisible) this.draw();
        requestAnimationFrame(() => this.loop());
    }
    draw() { /* Override this */ }
}

class MySpecificVisual extends BaseVisual {
    constructor(id) {
        super(id);
        
        // Initialize interactive parameters
        this.customParam = 0;
        
        // Hook up slider controls
        const input = document.getElementById('input-[id]');
        if (input) {
            input.addEventListener('input', (e) => {
                this.customParam = parseFloat(e.target.value);
                const valDisplay = document.getElementById('val-[id]');
                if (valDisplay) valDisplay.innerText = e.target.value;
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Custom drawing logic using this.ctx, this.cx, this.cy, this.scale
        // Use this.customParam in your visualizations
    }
}
```

## 4. Integration
1.  Add the new file to `Concepts/`.
2.  Serve the repo locally and open `http://localhost:8000/index.html`.
3.  Add a new entry to the `DATA` array:
    ```javascript
    {
        id: 'new-id',
        title: 'New Concept Title',
        domain: 'Domain Name',
        desc: 'Short description for the card.',
        type: 'new-type', // Used to map to your unique visual class
        href: 'Concepts/new-concept.html'
    }
    ```
4.  Create a unique visualization class for the index page card by extending `BaseVisual` inside `index.html`:
    ```javascript
    class NewConceptVisual extends BaseVisual {
        // Implement your own custom draw() loop for the card animation
        draw() {
            if (!this.isVisible) return;
            this.time += 0.05;
            this.clear();
            // custom animation code here
        }
    }
    ```
5.  Link the new visual class in the `renderGrid` function's switch statement inside `index.html`:
    ```javascript
    switch (item.type) {
        // ... existing cases ...
        case 'new-type': visual = new NewConceptVisual(canvas); break;
        default: visual = new BaseVisual(canvas);
    }
    ```

## 5. Design & Accessibility Standards
- **Shared Typography**: Standard site fonts are bundled locally and loaded through `../css/common.css`. Do not add page-level Google Fonts includes for `DM Serif Display`, `Inter`, or `JetBrains Mono`.
- **Shared Design Rules**: Read `STYLE_GUIDE.md` before changing shared typography, layout, color, or motion behavior.
- **Readable and Responsive Simulation Text**: The text labels in the simulations must be clearly readable. Make sure they are responsive for all devices (e.g., using dynamic sizing with `this.scale` for high-DPI displays) and clearly legible across all simulations.
- **Interactive Controls Placement**: Interactive controls, such as sliders, toggle switches, or buttons, must always be positioned **above** the simulations on mobile and tablet responsive views. Furthermore, both the controls and the canvas simulation they affect should comfortably fit within the viewport of the device simultaneously to prevent the user from having to scroll up and down to observe the simulation changes.
