// Internationalization module for GTNH Guide
const I18N = {
    currentLang: 'fr',
    translations: {},

    async init() {
        // Get saved language or detect from browser
        const saved = localStorage.getItem('gtnh-lang');
        const browserLang = navigator.language.split('-')[0];
        this.currentLang = saved || (['fr', 'en'].includes(browserLang) ? browserLang : 'fr');

        await this.loadLanguage(this.currentLang);
        this.updateUI();
        this.setupLanguageSelector();
    },

    async loadLanguage(lang) {
        try {
            const response = await fetch(`data/i18n/${lang}.json`);
            this.translations = await response.json();
            this.currentLang = lang;
            localStorage.setItem('gtnh-lang', lang);
        } catch (error) {
            console.error(`Failed to load language ${lang}:`, error);
            // Fallback to French
            if (lang !== 'fr') {
                await this.loadLanguage('fr');
            }
        }
    },

    t(key) {
        // Navigate nested keys like "nav.home"
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        return value;
    },

    setupLanguageSelector() {
        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.value = this.currentLang;
            selector.addEventListener('change', async (e) => {
                await this.loadLanguage(e.target.value);
                this.updateUI();
                // Trigger page re-render
                if (typeof initApp === 'function') {
                    initApp();
                }
            });
        }
    },

    updateUI() {
        // Update page title
        document.title = this.t('meta.title');

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = this.t(key);
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = this.t(key);
        });

        // Update specific static elements
        this.updateStaticElements();
    },

    updateStaticElements() {
        // Navigation
        const navItems = {
            'home': 'nav.home',
            'progression': 'nav.progression',
            'machines': 'nav.machines',
            'multiblocks': 'nav.multiblocks',
            'ores': 'nav.ores',
            'quests': 'nav.quests',
            'space': 'nav.space',
            'tools': 'nav.tools'
        };

        document.querySelectorAll('.nav-menu a[data-section]').forEach(a => {
            const section = a.dataset.section;
            if (navItems[section]) {
                const icon = a.querySelector('.icon');
                const iconText = icon ? icon.outerHTML : '';
                a.innerHTML = iconText + ' ' + this.t(navItems[section]);
            }
        });

        // Viewer 3D link
        const viewerLink = document.querySelector('.nav-menu a.viewer-link');
        if (viewerLink) {
            const icon = viewerLink.querySelector('.icon');
            const iconText = icon ? icon.outerHTML : '';
            viewerLink.innerHTML = iconText + ' ' + this.t('nav.viewer3d');
        }

        // Section titles
        const sectionTitles = {
            'machines': 'machines.title',
            'multiblocks': 'multiblocks.title',
            'ores': 'ores.title',
            'quests': 'quests.title',
            'space': 'space.title',
            'tools': 'tools.title'
        };

        for (const [section, key] of Object.entries(sectionTitles)) {
            const el = document.querySelector(`#${section} h1`);
            if (el) el.textContent = this.t(key);
        }

        // Search placeholders
        const machineSearch = document.getElementById('machineSearch');
        if (machineSearch) machineSearch.placeholder = this.t('machines.search');

        const multiblockSearch = document.getElementById('multiblockSearch');
        if (multiblockSearch) multiblockSearch.placeholder = this.t('multiblocks.search');

        // Home page
        const subtitle = document.querySelector('.hero .subtitle');
        if (subtitle) subtitle.textContent = this.t('home.subtitle');

        // Stats labels
        document.querySelectorAll('.stat .label').forEach((el, i) => {
            const labels = ['home.stats.quests', 'home.stats.mods', 'home.stats.solo', 'home.stats.tiers'];
            if (labels[i]) el.textContent = this.t(labels[i]);
        });

        // Tier overview title
        const tierOverview = document.querySelector('.tier-overview h2');
        if (tierOverview) tierOverview.textContent = this.t('home.tierOverview');

        // Quick links title
        const quickLinks = document.querySelector('.quick-links h2');
        if (quickLinks) quickLinks.textContent = this.t('home.quickLinks');
    }
};

// Initialize i18n when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    I18N.init();
});

// Export for use in other scripts
window.I18N = I18N;
