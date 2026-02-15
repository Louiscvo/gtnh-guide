// GTNH Guide Application
let mainData, machineData, machineDataI18n, oreData, questData;
let currentLang = 'fr';

// Get current language
function getLang() {
    return window.I18N?.currentLang || localStorage.getItem('gtnh-lang') || 'fr';
}

// Load all data - Always use local JSON files for reliability
async function loadData() {
    try {
        console.log('Loading from local JSON files...');

        const results = await Promise.allSettled([
            fetch('data/gtnh-database.json').then(r => r.json()),
            fetch('data/machines.json').then(r => r.json()),
            fetch('data/machines-complete-i18n.json').then(r => r.json()),
            fetch('data/ore-veins.json').then(r => r.json()),
            fetch('data/questbook.json').then(r => r.json())
        ]);

        // Extract data with fallbacks
        mainData = results[0].status === 'fulfilled' ? results[0].value : null;
        machineData = results[1].status === 'fulfilled' ? results[1].value : null;
        machineDataI18n = results[2].status === 'fulfilled' ? results[2].value : null;
        oreData = results[3].status === 'fulfilled' ? results[3].value : null;
        questData = results[4].status === 'fulfilled' ? results[4].value : null;

        currentLang = getLang();

        // Log what we loaded
        console.log('Data loaded:', {
            tiers: mainData?.tiers?.length || 0,
            machines: Object.keys(machineData?.singleblocks || {}).length,
            multiblocks: machineData?.multiblocks?.length || 0,
            i18nMultiblocks: machineDataI18n?.multiblocks?.length || 0,
            oreVeins: Object.keys(oreData?.veins || {}).length
        });

        if (!mainData?.tiers) {
            console.warn('No tier data found, using fallback');
            initAppWithFallback();
            return;
        }

        initApp();
    } catch (error) {
        console.error('Error loading data:', error);
        initAppWithFallback();
    }
}

// Transform Supabase machines to app format
function transformSupabaseMachines(machines) {
    const result = {
        multiblocks: [],
        singleblocks: [],
        steamMachines: [],
        ae2: []
    };

    for (const m of machines) {
        const transformed = {
            id: m.id,
            category: m.type,
            unlockTier: m.unlockTier,
            image: m.image,
            wikiUrl: m.wikiUrl,
            tiers: m.tiers,
            priority: m.priority,
            names: m.names,
            power: m.power,
            usage: m.usage,
            dangers: m.dangers,
            tips: m.tips,
            structure: m.structure
        };

        switch (m.category) {
            case 'multiblock':
                result.multiblocks.push(transformed);
                break;
            case 'singleblock':
                result.singleblocks.push(transformed);
                break;
            case 'steam':
                result.steamMachines.push(transformed);
                break;
            case 'ae2':
                result.ae2.push(transformed);
                break;
        }
    }

    return result;
}

function initAppWithFallback() {
    // Use minimal embedded data if JSON fails to load
    mainData = {
        tiers: [
            { id: "stone_age", name: "Stone Age", nameShort: "Stone", voltage: 0, color: "#8B7355" },
            { id: "steam_age", name: "Steam Age", nameShort: "Steam", voltage: 0, color: "#C0C0C0" },
            { id: "lv", name: "Low Voltage", nameShort: "LV", voltage: 32, color: "#DCDCDC" },
            { id: "mv", name: "Medium Voltage", nameShort: "MV", voltage: 128, color: "#FF6400" },
            { id: "hv", name: "High Voltage", nameShort: "HV", voltage: 512, color: "#FFFF00" },
            { id: "ev", name: "Extreme Voltage", nameShort: "EV", voltage: 2048, color: "#00FFFF" },
            { id: "iv", name: "Insane Voltage", nameShort: "IV", voltage: 8192, color: "#FF00FF" },
            { id: "luv", name: "Ludicrous Voltage", nameShort: "LuV", voltage: 32768, color: "#FF69B4" },
            { id: "zpm", name: "Zero Point Module", nameShort: "ZPM", voltage: 131072, color: "#00FF00" },
            { id: "uv", name: "Ultimate Voltage", nameShort: "UV", voltage: 524288, color: "#FF0000" },
            { id: "uhv", name: "Highly Ultimate Voltage", nameShort: "UHV", voltage: 2097152, color: "#4B0082" }
        ]
    };
    initApp();
}

function initApp() {
    console.log('Initializing app...');
    console.log('mainData:', mainData ? 'loaded' : 'missing');
    console.log('machineData:', machineData ? 'loaded' : 'missing');
    console.log('machineDataI18n:', machineDataI18n ? 'loaded' : 'missing');
    console.log('oreData:', oreData ? 'loaded' : 'missing');
    console.log('questData:', questData ? 'loaded' : 'missing');

    try {
        setupNavigation();
        renderTierGrid();
        renderTierDetails();
        renderMachines();
        renderMultiblocks();
        renderOres();
        renderQuests();
        setupSearch();
        setupFilters();
        setupMobileMenu();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error in initApp:', error);
    }
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            showSection(section);

            // Update nav active state
            document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
            document.querySelector(`.nav-menu a[data-section="${section}"]`)?.classList.add('active');

            // Close mobile menu
            document.getElementById('sidebar').classList.remove('open');
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
}

// Tier Grid (Home)
function renderTierGrid() {
    const grid = document.getElementById('tierGrid');
    if (!grid || !mainData?.tiers) return;

    grid.innerHTML = mainData.tiers.map(tier => `
        <div class="tier-card ${tier.id.replace('_age', '')}" data-tier="${tier.id}" style="border-left-color: ${tier.color}">
            <div class="tier-name">${tier.nameShort}</div>
            <div class="tier-voltage">${tier.voltage > 0 ? tier.voltage + ' EU/t' : tier.id.includes('steam') ? 'Steam' : 'Primitive'}</div>
        </div>
    `).join('');

    grid.querySelectorAll('.tier-card').forEach(card => {
        card.addEventListener('click', () => {
            showSection('progression');
            filterTier(card.dataset.tier);
        });
    });
}

// Tier Details (Progression)
function renderTierDetails() {
    const container = document.getElementById('tierDetails');
    if (!container || !mainData?.tiers) return;

    container.innerHTML = mainData.tiers.map(tier => `
        <div class="tier-detail-card" data-tier="${tier.id}">
            <h2>
                <span style="color: ${tier.color}">${tier.name}</span>
                <span class="voltage-badge">${tier.voltage > 0 ? tier.voltage + ' EU/t' : tier.id.includes('steam') ? 'Steam Power' : 'No Power'}</span>
            </h2>
            <p>${tier.description || ''}</p>

            ${tier.goals ? `
            <div class="goals">
                <h3>Objectifs Principaux</h3>
                <ul>
                    ${tier.goals.map(g => `<li>${g}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${tier.keyMaterials ? `
            <div class="materials">
                <h3>Matériaux Clés</h3>
                <p>${tier.keyMaterials.join(', ')}</p>
            </div>
            ` : ''}

            ${tier.machines?.length ? `
            <div class="machines-list">
                <h3>Machines Importantes</h3>
                <ul>
                    ${tier.machines.slice(0, 6).map(m => `<li><strong>${m.name}</strong> - ${m.description || m.type}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${tier.tips ? `
            <div class="tips">
                <h3>Conseils</h3>
                <ul>
                    ${tier.tips.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${tier.warnings?.length ? `
            <div class="warning">
                <strong>⚠️ Attention:</strong> ${tier.warnings.join(' ')}
            </div>
            ` : ''}
        </div>
    `).join('');

    // Setup tier filter buttons
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTier(btn.dataset.tier);
        });
    });
}

function filterTier(tierId) {
    const cards = document.querySelectorAll('.tier-detail-card');
    cards.forEach(card => {
        if (tierId === 'all' || card.dataset.tier === tierId) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Update button state
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tier === tierId);
    });
}

// Machines
function renderMachines() {
    const grid = document.getElementById('machinesGrid');
    if (!grid) {
        console.log('machinesGrid not found');
        return;
    }
    if (!machineData) {
        console.log('machineData not loaded');
        grid.innerHTML = '<p style="color: var(--accent);">Chargement des machines...</p>';
        return;
    }

    let allMachines = [];

    // Singleblocks
    if (machineData.singleblocks) {
        Object.entries(machineData.singleblocks).forEach(([category, machines]) => {
            if (Array.isArray(machines)) {
                machines.forEach(m => {
                    allMachines.push({ ...m, category });
                });
            }
        });
    }

    // Steam machines
    if (machineData.steamMachines && Array.isArray(machineData.steamMachines)) {
        machineData.steamMachines.forEach(m => {
            allMachines.push({ ...m, category: 'steam' });
        });
    }

    console.log('Total machines to render:', allMachines.length);
    renderMachineGrid(allMachines);

    // Category filter
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.dataset.cat;
            if (cat === 'all') {
                renderMachineGrid(allMachines);
            } else {
                renderMachineGrid(allMachines.filter(m => m.category === cat));
            }
        });
    });
}

function renderMachineGrid(machines) {
    const grid = document.getElementById('machinesGrid');
    const lang = getLang();

    grid.innerHTML = machines.map(m => {
        // Check if we have i18n data for this machine
        const i18nData = findMachineI18n(m.name || m.id);

        let name = m.name;
        let description = m.function || m.description || '';
        let power = '';
        let dangers = '';
        let image = '';

        if (i18nData) {
            name = i18nData.names?.[lang] || i18nData.names?.en || m.name;
            description = i18nData.usage?.[lang] || i18nData.usage?.en || description;
            power = i18nData.power?.[lang] || i18nData.power?.en || '';
            dangers = i18nData.dangers?.[lang] || i18nData.dangers?.en || '';
            image = i18nData.image || '';
        }

        return `
            <div class="machine-card ${m.priority ? 'priority-' + m.priority : ''}" data-machine-id="${m.id || m.name}">
                ${image ? `<img src="${image}" alt="${name}" class="machine-img" onerror="this.style.display='none'">` : ''}
                <h3>${name}</h3>
                <p>${description}</p>
                ${m.tiers ? `<span class="tiers">${m.tiers.join(' • ')}</span>` : ''}
                ${power ? `<div class="power-info"><strong>⚡ ${lang === 'fr' ? 'Énergie' : 'Power'}:</strong> ${power.split('\n')[0]}</div>` : ''}
                ${dangers ? `<div class="dangers">${dangers.split('\n')[0]}</div>` : ''}
                <button class="details-btn" onclick="showMachineDetail('${m.id || m.name}')">${lang === 'fr' ? 'Voir détails' : 'View details'}</button>
            </div>
        `;
    }).join('');
}

// Find i18n data for a machine
function findMachineI18n(id) {
    if (!machineDataI18n) return null;

    // Search in multiblocks
    let found = machineDataI18n.multiblocks?.find(m =>
        m.id === id || m.names?.en?.toLowerCase().includes(id.toLowerCase()) || m.names?.fr?.toLowerCase().includes(id.toLowerCase())
    );
    if (found) return found;

    // Search in singleblocks
    found = machineDataI18n.singleblocks?.find(m =>
        m.id === id || m.names?.en?.toLowerCase().includes(id.toLowerCase()) || m.names?.fr?.toLowerCase().includes(id.toLowerCase())
    );
    if (found) return found;

    // Search in steam machines
    found = machineDataI18n.steamMachines?.find(m =>
        m.id === id || m.names?.en?.toLowerCase().includes(id.toLowerCase()) || m.names?.fr?.toLowerCase().includes(id.toLowerCase())
    );
    if (found) return found;

    // Search in AE2
    found = machineDataI18n.ae2?.find(m =>
        m.id === id || m.names?.en?.toLowerCase().includes(id.toLowerCase()) || m.names?.fr?.toLowerCase().includes(id.toLowerCase())
    );

    return found;
}

// Show machine detail modal
window.showMachineDetail = function(id) {
    const lang = getLang();
    const i18nData = findMachineI18n(id);

    if (!i18nData) {
        console.log('No i18n data found for:', id);
        return;
    }

    const name = i18nData.names?.[lang] || i18nData.names?.en || id;
    const usage = i18nData.usage?.[lang] || i18nData.usage?.en || '';
    const power = i18nData.power?.[lang] || i18nData.power?.en || '';
    const dangers = i18nData.dangers?.[lang] || i18nData.dangers?.en || '';
    const tips = i18nData.tips?.[lang] || i18nData.tips?.en || '';
    const image = i18nData.image || '';
    const wikiUrl = i18nData.wikiUrl || '';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'machine-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
            ${image ? `<img src="${image}" alt="${name}" class="modal-img">` : ''}
            <h2>${name}</h2>

            ${power ? `
            <div class="info-section power-section">
                <h3>⚡ ${lang === 'fr' ? 'Alimentation' : 'Power'}</h3>
                <pre>${power}</pre>
            </div>
            ` : ''}

            ${usage ? `
            <div class="info-section usage-section">
                <h3>📖 ${lang === 'fr' ? 'Utilisation' : 'Usage'}</h3>
                <p>${usage}</p>
            </div>
            ` : ''}

            ${dangers ? `
            <div class="info-section danger-section">
                <h3>⚠️ ${lang === 'fr' ? 'Dangers' : 'Warnings'}</h3>
                <pre>${dangers}</pre>
            </div>
            ` : ''}

            ${tips ? `
            <div class="info-section tips-section">
                <h3>💡 ${lang === 'fr' ? 'Conseils' : 'Tips'}</h3>
                <pre>${tips}</pre>
            </div>
            ` : ''}

            ${wikiUrl ? `<a href="${wikiUrl}" target="_blank" class="wiki-btn">📚 Wiki</a>` : ''}
        </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Multiblocks
function renderMultiblocks() {
    const grid = document.getElementById('multiblocksGrid');
    if (!grid) {
        console.log('multiblocksGrid not found');
        return;
    }

    // Get multiblocks from either machineData or machineDataI18n
    let multiblocks = machineData?.multiblocks || [];

    // If empty, try i18n data
    if (multiblocks.length === 0 && machineDataI18n?.multiblocks) {
        multiblocks = machineDataI18n.multiblocks;
    }

    if (!multiblocks || multiblocks.length === 0) {
        console.log('No multiblocks found');
        grid.innerHTML = '<p style="color: var(--accent);">Aucun multiblock trouvé</p>';
        return;
    }

    console.log('Multiblocks to render:', multiblocks.length);
    renderMultiblockGrid(multiblocks);

    // Filters
    document.getElementById('multiblockTier')?.addEventListener('change', filterMultiblocks);
    document.getElementById('multiblockCategory')?.addEventListener('change', filterMultiblocks);
}

function renderMultiblockGrid(multiblocks) {
    const grid = document.getElementById('multiblocksGrid');
    const lang = getLang();

    grid.innerHTML = multiblocks.map(m => {
        // Get i18n data
        const i18nData = findMachineI18n(m.id || m.name);

        let name = m.name;
        let description = m.description;
        let image = '';
        let dangers = '';

        if (i18nData) {
            name = i18nData.names?.[lang] || i18nData.names?.en || m.name;
            description = i18nData.usage?.[lang] || i18nData.usage?.en || m.description;
            image = i18nData.image || '';
            dangers = i18nData.dangers?.[lang] || i18nData.dangers?.en || '';
        }

        return `
            <div class="multiblock-card" data-id="${m.id}" data-tier="${m.unlockTier}" data-category="${m.category}">
                ${image ? `<img src="${image}" alt="${name}" class="machine-img" onerror="this.style.display='none'">` : ''}
                <h3>${name}</h3>
                <p>${description ? description.substring(0, 120) + (description.length > 120 ? '...' : '') : ''}</p>
                <span class="tier-badge">${m.unlockTier}</span>
                ${dangers ? `<div class="dangers">${dangers.split('\n')[0]}</div>` : ''}
                <button class="details-btn">${lang === 'fr' ? 'Voir détails' : 'View details'}</button>
            </div>
        `;
    }).join('');

    // Click to show detail
    grid.querySelectorAll('.multiblock-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;
            const multiblocks = machineData?.multiblocks || machineDataI18n?.multiblocks || [];
            const mb = multiblocks.find(m => m.id === card.dataset.id);
            if (mb) showMultiblockDetail(mb);
        });
    });
}

function filterMultiblocks() {
    const tier = document.getElementById('multiblockTier')?.value || 'all';
    const category = document.getElementById('multiblockCategory')?.value || 'all';

    let multiblocks = machineData?.multiblocks || machineDataI18n?.multiblocks || [];
    let filtered = multiblocks;

    if (tier !== 'all') {
        filtered = filtered.filter(m => m.unlockTier === tier);
    }
    if (category !== 'all') {
        filtered = filtered.filter(m => m.category === category);
    }

    renderMultiblockGrid(filtered);
}

function showMultiblockDetail(mb) {
    const detail = document.getElementById('multiblockDetail');
    const grid = document.getElementById('multiblocksGrid');
    const lang = getLang();

    // Get i18n data if available
    const i18nData = findMachineI18n(mb.id || mb.name);

    let name = mb.name;
    let description = mb.description;
    let power = '';
    let usage = '';
    let dangers = '';
    let tips = '';
    let image = mb.imageUrl || '';
    let wikiUrl = mb.wikiUrl || '';
    let structure = mb.structure;

    if (i18nData) {
        name = i18nData.names?.[lang] || i18nData.names?.en || mb.name;
        usage = i18nData.usage?.[lang] || i18nData.usage?.en || mb.description;
        power = i18nData.power?.[lang] || i18nData.power?.en || '';
        dangers = i18nData.dangers?.[lang] || i18nData.dangers?.en || '';
        tips = i18nData.tips?.[lang] || i18nData.tips?.en || '';
        image = i18nData.image || image;
        wikiUrl = i18nData.wikiUrl || wikiUrl;
        structure = i18nData.structure || structure;
    }

    grid.style.display = 'none';
    detail.style.display = 'block';

    detail.innerHTML = `
        <button class="back-btn" onclick="hideMultiblockDetail()">← ${lang === 'fr' ? 'Retour' : 'Back'}</button>

        ${image ? `<img src="${image}" alt="${name}" class="multiblock-detail-img">` : ''}

        <h2>${name}</h2>

        <div class="structure-info">
            <div><strong>Tier:</strong> ${mb.unlockTier}</div>
            <div><strong>${lang === 'fr' ? 'Catégorie' : 'Category'}:</strong> ${mb.category}</div>
            ${mb.bonus ? `<div><strong>Bonus:</strong> ${mb.bonus}</div>` : ''}
        </div>

        ${power ? `
        <div class="info-section power-section">
            <h3>⚡ ${lang === 'fr' ? 'Alimentation' : 'Power'}</h3>
            <pre>${power}</pre>
        </div>
        ` : ''}

        ${usage ? `
        <div class="info-section usage-section">
            <h3>📖 ${lang === 'fr' ? 'Utilisation' : 'Usage'}</h3>
            <p>${usage}</p>
        </div>
        ` : ''}

        ${dangers ? `
        <div class="info-section danger-section">
            <h3>⚠️ ${lang === 'fr' ? 'Dangers & Avertissements' : 'Dangers & Warnings'}</h3>
            <pre>${dangers}</pre>
        </div>
        ` : ''}

        ${structure ? `
        <div class="info-section structure-section">
            <h3>🏗️ Structure</h3>
            <div class="structure-info">
                ${structure.dimensions ? `<div><strong>Dimensions:</strong> ${structure.dimensions}</div>` : ''}
                ${structure.components ? `
                <div><strong>${lang === 'fr' ? 'Composants' : 'Components'}:</strong>
                    <ul>${structure.components.map(c => `<li>${c}</li>`).join('')}</ul>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        ${tips ? `
        <div class="info-section tips-section">
            <h3>💡 ${lang === 'fr' ? 'Conseils' : 'Tips'}</h3>
            <pre>${tips}</pre>
        </div>
        ` : ''}

        ${wikiUrl ? `<a href="${wikiUrl}" target="_blank" class="wiki-btn">📚 ${lang === 'fr' ? 'Voir sur le Wiki' : 'View on Wiki'}</a>` : ''}
    `;
}

window.hideMultiblockDetail = function() {
    document.getElementById('multiblockDetail').style.display = 'none';
    document.getElementById('multiblocksGrid').style.display = 'grid';
};

// Ores
function renderOres() {
    const grid = document.getElementById('oresGrid');
    if (!grid) {
        console.log('oresGrid not found');
        return;
    }

    if (!oreData?.veins) {
        console.log('No ore data found');
        grid.innerHTML = '<p style="color: var(--accent);">Données des minerais non trouvées</p>';
        return;
    }

    let allOres = [];
    Object.entries(oreData.veins).forEach(([stage, veins]) => {
        if (Array.isArray(veins)) {
            veins.forEach(v => {
                allOres.push({ ...v, stage });
            });
        }
    });

    console.log('Total ores to render:', allOres.length);
    renderOreGrid(allOres);

    // Filters
    document.getElementById('oreDimension')?.addEventListener('change', () => filterOres(allOres));
    document.getElementById('oreStage')?.addEventListener('change', () => filterOres(allOres));
}

function renderOreGrid(ores) {
    const grid = document.getElementById('oresGrid');
    grid.innerHTML = ores.map(o => `
        <div class="ore-card" data-stage="${o.stage}">
            <h3>${o.name}</h3>
            <div class="composition">
                <span title="Primary">${o.primary}</span>
                <span title="Secondary">${o.secondary}</span>
                <span title="Between">${o.between}</span>
                <span title="Sporadic">${o.sporadic}</span>
            </div>
            <p><strong>Products:</strong> ${o.products?.join(', ') || '-'}</p>
            <div class="dimensions">${o.dimensions?.join(', ') || '-'}</div>
            ${o.yRange ? `<p>Y: ${o.yRange.min} - ${o.yRange.max}</p>` : ''}
            ${o.note ? `<p class="note" style="color: var(--accent); font-style: italic;">${o.note}</p>` : ''}
        </div>
    `).join('');
}

function filterOres(allOres) {
    const dimension = document.getElementById('oreDimension').value;
    const stage = document.getElementById('oreStage').value;

    let filtered = allOres;

    if (dimension !== 'all') {
        filtered = filtered.filter(o => o.dimensions?.includes(dimension));
    }
    if (stage !== 'all') {
        filtered = filtered.filter(o => o.stage === stage);
    }

    renderOreGrid(filtered);
}

// Quests
function renderQuests() {
    const chaptersGrid = document.getElementById('chaptersGrid');
    const modGrid = document.getElementById('modGrid');

    // Support both structures: questData.chapters or questData.questbook.chapters
    const chapters = questData?.chapters || questData?.questbook?.chapters;
    const modTabs = questData?.modSpecificTabs || questData?.questbook?.modSpecificTabs;

    if (!chaptersGrid || !chapters) {
        console.log('No quest chapters found');
        return;
    }

    chaptersGrid.innerHTML = chapters.map(ch => `
        <div class="chapter-card">
            <h3>${ch.name}</h3>
            <p>${ch.description}</p>
            <span class="quest-count">${ch.questCount || '~100'} quêtes</span>
            ${ch.mainGoals ? `
            <ul class="goals">
                ${ch.mainGoals.slice(0, 4).map(g => `<li>${g}</li>`).join('')}
            </ul>
            ` : ''}
            ${ch.warning ? `<p style="color: #ff6666; margin-top: 10px;">${ch.warning}</p>` : ''}
        </div>
    `).join('');

    if (modGrid && modTabs) {
        modGrid.innerHTML = modTabs.map(mod => `
            <div class="mod-card">
                <h3>${mod.name}</h3>
                <p>${mod.description}</p>
                <span class="tier-badge">Unlock: ${mod.unlockTier}</span>
            </div>
        `).join('');
    }
}

// Search
function setupSearch() {
    const machineSearch = document.getElementById('machineSearch');
    const multiblockSearch = document.getElementById('multiblockSearch');

    machineSearch?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.machine-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    });

    multiblockSearch?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.multiblock-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    });
}

// Filters
function setupFilters() {
    // Already set up in render functions
}

// Mobile Menu
function setupMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    toggle?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadData);
