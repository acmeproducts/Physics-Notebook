
/**
 * Physics Notebook - Common Utilities
 * Handles Theme persistence and Initialization
 */

const ThemeManager = {
    init() {
        this.setupTheme();
        this.bindEvents();
    },

    setupTheme() {
        // Check localStorage first, fallback to 'light'
        const savedTheme = localStorage.getItem('physics-notebook-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', next);
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('physics-notebook-theme', next);

        // Dispatch event for canvases to redraw colors
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: next }));
    },

    bindEvents() {
        const btn = document.getElementById('themeBtn');
        if (btn) {
            btn.addEventListener('click', () => this.toggle());
        }

        // Also listen for logo click in top left if it sometimes acts as toggle? 
        // No, logo is navigation.
    }
};

const ExternalNavigation = {
    open(url) {
        const popup = window.open(url, '_blank', 'noopener,noreferrer');
        if (popup) {
            popup.opener = null;
        }
    },

    openBlank() {
        const popup = window.open('', '_blank', 'noopener,noreferrer');
        if (popup) {
            popup.opener = null;
        }
        return popup;
    },

    navigate(popup, url) {
        if (popup) {
            popup.location = url;
            return;
        }

        this.open(url);
    }
};

const AIProviderLauncher = {
    launch(model, prompt, options = {}) {
        const encodedPrompt = encodeURIComponent(prompt);

        if (model === 'gemini') {
            const geminiAppUrl = options.geminiAppUrl || 'https://gemini.google.com/app';
            const geminiQueryUrl = options.geminiQueryUrl || `https://gemini.google.com/?q=${encodedPrompt}`;
            const showClipboardAlert = options.showClipboardAlert !== false;

            if (window.isSecureContext && navigator.clipboard?.writeText) {
                const popup = ExternalNavigation.openBlank();

                navigator.clipboard.writeText(prompt).then(() => {
                    if (showClipboardAlert) {
                        alert("Gemini doesn't support auto-fill. The prompt has been copied to your clipboard.");
                    }

                    ExternalNavigation.navigate(popup, geminiAppUrl);
                }).catch(() => {
                    ExternalNavigation.navigate(popup, geminiQueryUrl);
                });
                return;
            }

            ExternalNavigation.open(geminiQueryUrl);
            return;
        }

        const providerUrls = {
            perplexity: `https://www.perplexity.ai/search?q=${encodedPrompt}`,
            chatgpt: `https://chatgpt.com/?q=${encodedPrompt}`,
            claude: `https://claude.ai/new?q=${encodedPrompt}`,
            grok: `https://grok.com/?q=${encodedPrompt}`
        };

        const url = providerUrls[model];
        if (url) {
            ExternalNavigation.open(url);
        }
    }
};

// Immediate execution to prevent flash IF this script is loaded in head deferred
// But we actually want to run `setupTheme` ASAP.
// Optimally, a small inline script in head handles the initial set, but this works traversing the DOM once body exists


// Expose for usage
// GitHub Stats
const GitHubStats = {
    repo: 'CasberryIndia/Physics-Notebook',

    init() {
        this.fetchStars();
    },

    async fetchStars() {
        const starCountEl = document.getElementById('starCount');
        if (!starCountEl) return;

        // Visual loading state
        starCountEl.style.opacity = '0.5';

        try {
            // Check session storage first to avoid rate limits
            const cached = sessionStorage.getItem('physics-notebook-stars');
            if (cached) {
                starCountEl.textContent = cached;
                starCountEl.style.opacity = '1';
                return;
            }

            const response = await fetch(`https://api.github.com/repos/${this.repo}`);
            if (response.ok) {
                const data = await response.json();
                const stars = this.formatCount(data.stargazers_count);
                starCountEl.textContent = stars;
                sessionStorage.setItem('physics-notebook-stars', stars);
            } else {
                starCountEl.textContent = '--';
            }
        } catch (e) {
            console.warn('Failed to fetch stars:', e);
            starCountEl.textContent = '--';
        } finally {
            starCountEl.style.opacity = '1';
        }
    },

    formatCount(count) {
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count;
    }
};

window.ThemeManager = ThemeManager;
window.openExternalLink = (url) => ExternalNavigation.open(url);
window.launchAIPrompt = (model, prompt, options) => AIProviderLauncher.launch(model, prompt, options);

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    GitHubStats.init();
    // Initialize Lucide icons if library is present
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
