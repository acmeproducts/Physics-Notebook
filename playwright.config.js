// Minimal browser-backed checks for keyboard navigation and accessible names.
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    testDir: './tests',
    timeout: 30000,
    use: {
        baseURL: 'http://127.0.0.1:8765',
        headless: true
    },
    webServer: {
        command: 'python -m http.server 8765',
        url: 'http://127.0.0.1:8765',
        reuseExistingServer: true,
        timeout: 30000
    },
    projects: [
        {
            name: 'edge',
            use: {
                browserName: 'chromium',
                channel: 'msedge'
            }
        }
    ]
};

module.exports = config;
