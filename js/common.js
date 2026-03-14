
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

const AccessibilityManager = {
    init() {
        this.labelAIButtons();
        this.labelCanvases();
        this.enhanceSimulationControls();
    },

    labelAIButtons() {
        const providerLabels = {
            perplexity: 'Perplexity',
            gemini: 'Gemini',
            chatgpt: 'ChatGPT',
            claude: 'Claude',
            grok: 'Grok'
        };

        document.querySelectorAll('.ai-btn').forEach((button) => {
            button.setAttribute('type', 'button');

            if (!button.getAttribute('aria-label')) {
                const title = button.getAttribute('title')?.trim();
                const inferredLabel = title || this.inferAIButtonLabel(button, providerLabels);

                if (inferredLabel) {
                    button.setAttribute('aria-label', inferredLabel);
                }
            }

            button.querySelectorAll('svg').forEach((icon) => {
                icon.setAttribute('aria-hidden', 'true');
                icon.setAttribute('focusable', 'false');
            });
        });
    },

    inferAIButtonLabel(button, providerLabels) {
        const onclick = button.getAttribute('onclick') || '';
        const match = onclick.match(/,\s*'([^']+)'\s*\)/);
        if (!match) {
            return '';
        }

        const provider = providerLabels[match[1]] || match[1];
        return `Ask ${provider}`;
    },

    labelCanvases() {
        document.querySelectorAll('canvas').forEach((canvas) => {
            if (canvas.closest('.card-visual')) {
                canvas.setAttribute('role', 'presentation');
                canvas.setAttribute('aria-hidden', 'true');
                return;
            }

            const layout = canvas.closest('.split-layout');
            const heading = layout?.querySelector('.content-col h2')?.textContent?.trim();
            if (!heading) {
                return;
            }

            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', `${heading} visualization`);
        });
    },

    enhanceSimulationControls() {
        document.querySelectorAll('.split-layout').forEach((layout, layoutIndex) => {
            const heading = layout.querySelector('.content-col h2')?.textContent?.trim();
            const canvas = layout.querySelector('.visual-col canvas');
            if (!heading || !canvas) {
                return;
            }

            const statusId = canvas.id ? `${canvas.id}-status` : `simulation-status-${layoutIndex}`;
            let status = document.getElementById(statusId);

            if (!status) {
                status = document.createElement('div');
                status.id = statusId;
                status.className = 'sr-only';
                status.setAttribute('aria-live', 'polite');
                status.setAttribute('aria-atomic', 'true');
                layout.querySelector('.content-col')?.appendChild(status);
            }

            const describeControls = () => {
                const controls = Array.from(layout.querySelectorAll('input[type="range"]')).map((input) => {
                    const label = this.getSliderLabel(input);
                    const value = this.getSliderValueText(input);
                    return label && value ? `${label}: ${value}` : '';
                }).filter(Boolean);

                return controls.length > 0
                    ? `${heading} simulation. ${controls.join('. ')}.`
                    : `${heading} simulation.`;
            };

            canvas.setAttribute('aria-describedby', status.id);

            layout.querySelectorAll('input[type="range"]').forEach((input, inputIndex) => {
                const label = this.getSliderLabel(input);
                const valueId = this.ensureSliderValueId(input, layoutIndex, inputIndex);
                const describedBy = [valueId, status.id].filter(Boolean).join(' ');

                if (label && !input.getAttribute('aria-label')) {
                    input.setAttribute('aria-label', label);
                }

                if (describedBy) {
                    input.setAttribute('aria-describedby', describedBy);
                }

                const updateInputAccessibility = () => {
                    const valueText = this.getSliderValueText(input);
                    input.setAttribute('aria-valuetext', valueText);
                    status.textContent = `${heading} simulation updated. ${label}: ${valueText}.`;
                };

                updateInputAccessibility();
                input.addEventListener('input', updateInputAccessibility);
                input.addEventListener('change', updateInputAccessibility);
            });

            layout.querySelectorAll('.sim-controls button, .controls button').forEach((button) => {
                if (!button.getAttribute('type')) {
                    button.setAttribute('type', 'button');
                }

                button.addEventListener('click', () => {
                    const label = button.textContent.replace(/\s+/g, ' ').trim();
                    if (label) {
                        status.textContent = `${heading} simulation control activated. ${label}.`;
                    }
                });
            });

            status.textContent = describeControls();
        });
    },

    getSliderLabel(input) {
        const group = input.closest('.slider-group, .control-group');
        if (!group) {
            return input.id || 'Simulation control';
        }

        const controlLabel = group.querySelector('.control-label span');
        if (controlLabel?.textContent?.trim()) {
            return controlLabel.textContent.trim();
        }

        const label = group.querySelector('label');
        if (!label) {
            return input.id || 'Simulation control';
        }

        const clone = label.cloneNode(true);
        clone.querySelectorAll('span').forEach((span) => span.remove());
        return clone.textContent.replace(/\s+/g, ' ').trim() || input.id || 'Simulation control';
    },

    getSliderValueText(input) {
        const group = input.closest('.slider-group, .control-group');
        if (!group) {
            return input.value;
        }

        const valueLabel = group.querySelector('.control-value, label span[id], .control-label span:last-child');
        return valueLabel?.textContent?.replace(/\s+/g, ' ').trim() || input.value;
    },

    ensureSliderValueId(input, layoutIndex, inputIndex) {
        const group = input.closest('.slider-group, .control-group');
        if (!group) {
            return '';
        }

        const valueLabel = group.querySelector('.control-value, label span[id], .control-label span:last-child');
        if (!valueLabel) {
            return '';
        }

        if (!valueLabel.id) {
            valueLabel.id = `${input.id || `slider-${layoutIndex}-${inputIndex}`}-value`;
        }

        return valueLabel.id;
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
    AccessibilityManager.init();
    // Initialize Lucide icons if library is present
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
