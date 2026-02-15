// GTNH Guide Application
let mainData, machineData, oreData, questData;

// Load all data
async function loadData() {
    try {
        const [main, machines, ores, quests] = await Promise.all([
            fetch('data/gtnh-database.json').then(r => r.json()),
            fetch('data/machines.json').then(r => r.json()),
            fetch('data/ore-veins.json').then(r => r.json()),
            fetch('data/questbook.json').then(r => r.json())
        ]);

        mainData = main;
        machineData = machines;
        oreData = ores;
        questData = quests;

        initApp();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback: try to load from embedded data
        initAppWithFallback();
    }
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
    if (!grid || !machineData) return;

    let allMachines = [];

    // Singleblocks
    if (machineData.singleblocks) {
        Object.entries(machineData.singleblocks).forEach(([category, machines]) => {
            machines.forEach(m => {
                allMachines.push({ ...m, category });
            });
        });
    }

    // Steam machines
    if (machineData.steamMachines) {
        machineData.steamMachines.forEach(m => {
            allMachines.push({ ...m, category: 'steam' });
        });
    }

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
    grid.innerHTML = machines.map(m => `
        <div class="machine-card ${m.priority ? 'priority-' + m.priority : ''}">
            <h3>${m.name}</h3>
            <p>${m.function || m.description || ''}</p>
            ${m.tiers ? `<span class="tiers">${m.tiers.join(' • ')}</span>` : ''}
            ${m.steamUsage ? `<p><strong>Steam:</strong> ${m.steamUsage}</p>` : ''}
            ${m.output ? `<p><strong>Output:</strong> ${m.output}</p>` : ''}
        </div>
    `).join('');
}

// Multiblocks
function renderMultiblocks() {
    const grid = document.getElementById('multiblocksGrid');
    if (!grid || !machineData?.multiblocks) return;

    renderMultiblockGrid(machineData.multiblocks);

    // Filters
    document.getElementById('multiblockTier')?.addEventListener('change', filterMultiblocks);
    document.getElementById('multiblockCategory')?.addEventListener('change', filterMultiblocks);
}

function renderMultiblockGrid(multiblocks) {
    const grid = document.getElementById('multiblocksGrid');
    grid.innerHTML = multiblocks.map(m => `
        <div class="multiblock-card" data-id="${m.id}" data-tier="${m.unlockTier}" data-category="${m.category}">
            <h3>${m.name}</h3>
            <p>${m.description}</p>
            <span class="tier-badge">${m.unlockTier}</span>
            ${m.bonus ? `<p class="bonus"><strong>Bonus:</strong> ${m.bonus}</p>` : ''}
            ${m.wikiUrl ? `<a href="${m.wikiUrl}" target="_blank" style="color: var(--accent); font-size: 0.85rem;">Wiki →</a>` : ''}
        </div>
    `).join('');

    // Click to show detail
    grid.querySelectorAll('.multiblock-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;
            const mb = machineData.multiblocks.find(m => m.id === card.dataset.id);
            if (mb) showMultiblockDetail(mb);
        });
    });
}

function filterMultiblocks() {
    const tier = document.getElementById('multiblockTier').value;
    const category = document.getElementById('multiblockCategory').value;

    let filtered = machineData.multiblocks;

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

    grid.style.display = 'none';
    detail.style.display = 'block';

    detail.innerHTML = `
        <button class="back-btn" onclick="hideMultiblockDetail()">← Retour</button>
        <h2>${mb.name}</h2>
        <p>${mb.description}</p>

        <div class="structure-info">
            <div><strong>Tier:</strong> ${mb.unlockTier}</div>
            <div><strong>Catégorie:</strong> ${mb.category}</div>
            ${mb.bonus ? `<div><strong>Bonus:</strong> ${mb.bonus}</div>` : ''}
            ${mb.euOutput ? `<div><strong>Output:</strong> ${mb.euOutput}</div>` : ''}
        </div>

        ${mb.structure ? `
        <h3>Structure</h3>
        <div class="structure-info">
            ${mb.structure.dimensions ? `<div><strong>Dimensions:</strong> ${mb.structure.dimensions}</div>` : ''}
            ${mb.structure.controller ? `<div><strong>Controller:</strong> ${mb.structure.controller}</div>` : ''}
            ${mb.structure.mainBlocks ? `<div><strong>Main Blocks:</strong> ${mb.structure.mainBlocks}</div>` : ''}
        </div>
        ${mb.structure.coils ? `<p><strong>Coils:</strong> ${mb.structure.coils.join(', ')}</p>` : ''}
        ` : ''}

        ${mb.hatches ? `<p><strong>Hatches:</strong> ${mb.hatches.join(', ')}</p>` : ''}

        ${mb.tips ? `
        <h3>Tips</h3>
        <ul>
            ${mb.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
        ` : ''}

        ${mb.wikiUrl ? `<a href="${mb.wikiUrl}" target="_blank" class="wiki-link">Voir sur le Wiki →</a>` : ''}
        ${mb.imageUrl ? `<br><br><img src="${mb.imageUrl}" alt="${mb.name}" style="max-width: 100%; border-radius: 8px;">` : ''}
    `;
}

window.hideMultiblockDetail = function() {
    document.getElementById('multiblockDetail').style.display = 'none';
    document.getElementById('multiblocksGrid').style.display = 'grid';
};

// Ores
function renderOres() {
    const grid = document.getElementById('oresGrid');
    if (!grid || !oreData?.veins) return;

    let allOres = [];
    Object.entries(oreData.veins).forEach(([stage, veins]) => {
        veins.forEach(v => {
            allOres.push({ ...v, stage });
        });
    });

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
    if (!chaptersGrid || !questData?.questbook?.chapters) return;

    chaptersGrid.innerHTML = questData.questbook.chapters.map(ch => `
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

    if (modGrid && questData.questbook.modSpecificTabs) {
        modGrid.innerHTML = questData.questbook.modSpecificTabs.map(mod => `
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
