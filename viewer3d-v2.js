// GTNH 3D Base Viewer - Version 2.0
// Bases progressives réalistes avec structure et câbles connectés

let scene, camera, renderer, controls;
let textureLoader;
let machineObjects = [];
let cableObjects = [];
let structureObjects = [];
let selectedObject = null;
let currentTier = 'steam';
let loadedTextures = {};

// Couleurs par tier
const TIER_COLORS = {
    steam: { primary: 0x8B4513, secondary: 0xCD7F32, accent: 0xDAA520 },
    lv: { primary: 0xDCDCDC, secondary: 0xA9A9A9, accent: 0x4682B4 },
    mv: { primary: 0xFF6400, secondary: 0xFF8C00, accent: 0xFFA500 },
    hv: { primary: 0xFFFF00, secondary: 0xFFD700, accent: 0x87CEEB },
    ev: { primary: 0x808080, secondary: 0x696969, accent: 0x00CED1 },
    iv: { primary: 0xF0F0F5, secondary: 0xE0E0E5, accent: 0x9400D3 }
};

// Base de données machines complète
const MACHINES = {
    // === GÉNÉRATEURS ===
    'small_coal_boiler': { name: 'Petite Chaudière Charbon', type: 'generator', tier: 'steam', color: 0x8B4513, size: [1,1,1], output: '6 L/t Steam' },
    'hp_coal_boiler': { name: 'Chaudière HP Charbon', type: 'generator', tier: 'steam', color: 0x654321, size: [1,1,1], output: '15 L/t Steam' },
    'lv_steam_turbine': { name: 'Turbine Vapeur LV', type: 'generator', tier: 'lv', color: 0x228B22, size: [1,1,1], output: '32 EU/t' },
    'diesel_generator': { name: 'Générateur Diesel', type: 'generator', tier: 'mv', color: 0x2F4F4F, size: [1,1,1], output: '128 EU/t' },
    'gas_turbine': { name: 'Turbine à Gaz', type: 'generator', tier: 'hv', color: 0x3CB371, size: [1,1,1], output: '512 EU/t' },
    'large_gas_turbine': { name: 'Grande Turbine Gaz', type: 'multiblock', tier: 'ev', color: 0x3CB371, size: [3,3,4], output: '2048+ EU/t' },
    'nuclear_reactor': { name: 'Réacteur Nucléaire', type: 'generator', tier: 'ev', color: 0x32CD32, size: [3,3,3], output: 'Variable' },

    // === STOCKAGE ÉNERGIE ===
    'battery_buffer_4': { name: 'Buffer 4 Batteries', type: 'storage', tier: 'lv', color: 0xFFD700, size: [1,1,1] },
    'battery_buffer_16': { name: 'Buffer 16 Batteries', type: 'storage', tier: 'mv', color: 0xFFD700, size: [1,1,1] },
    'transformer_lv_mv': { name: 'Transfo LV↔MV', type: 'power', tier: 'mv', color: 0x9932CC, size: [1,1,1] },
    'transformer_mv_hv': { name: 'Transfo MV↔HV', type: 'power', tier: 'hv', color: 0x9932CC, size: [1,1,1] },
    'transformer_hv_ev': { name: 'Transfo HV↔EV', type: 'power', tier: 'ev', color: 0x9932CC, size: [1,1,1] },

    // === ORE PROCESSING ===
    'steam_macerator': { name: 'Macérateur Vapeur', type: 'processing', tier: 'steam', color: 0xB8860B, size: [1,1,1] },
    'lv_macerator': { name: 'Macérateur LV', type: 'processing', tier: 'lv', color: 0xC0C0C0, size: [1,1,1] },
    'mv_macerator': { name: 'Macérateur MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'hv_macerator': { name: 'Macérateur HV', type: 'processing', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },
    'ore_washer': { name: 'Laveur de Minerai', type: 'processing', tier: 'lv', color: 0x4169E1, size: [1,1,1] },
    'thermal_centrifuge': { name: 'Centrifugeuse Thermique', type: 'processing', tier: 'mv', color: 0xFF4500, size: [1,1,1] },
    'sifter': { name: 'Tamis', type: 'processing', tier: 'lv', color: 0xDEB887, size: [1,1,1] },

    // === METAL PROCESSING ===
    'steam_alloy_smelter': { name: 'Fonderie Vapeur', type: 'processing', tier: 'steam', color: 0xCD853F, size: [1,1,1] },
    'steam_forge_hammer': { name: 'Marteau Vapeur', type: 'processing', tier: 'steam', color: 0xA0522D, size: [1,1,1] },
    'lv_alloy_smelter': { name: 'Fonderie LV', type: 'processing', tier: 'lv', color: 0xFF6347, size: [1,1,1] },
    'lv_bender': { name: 'Plieuse LV', type: 'processing', tier: 'lv', color: 0x808080, size: [1,1,1] },
    'lv_wiremill': { name: 'Tréfileuse LV', type: 'processing', tier: 'lv', color: 0xA9A9A9, size: [1,1,1] },
    'lv_lathe': { name: 'Tour LV', type: 'processing', tier: 'lv', color: 0x708090, size: [1,1,1] },
    'mv_extruder': { name: 'Extrudeuse MV', type: 'processing', tier: 'mv', color: 0xFF8C00, size: [1,1,1] },
    'arc_furnace': { name: 'Four à Arc', type: 'processing', tier: 'lv', color: 0xFF4500, size: [1,1,1] },

    // === ASSEMBLY ===
    'lv_assembler': { name: 'Assembleur LV', type: 'processing', tier: 'lv', color: 0x696969, size: [1,1,1] },
    'mv_assembler': { name: 'Assembleur MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'hv_assembler': { name: 'Assembleur HV', type: 'processing', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },
    'circuit_assembler': { name: 'Assembleur Circuits', type: 'processing', tier: 'lv', color: 0x4169E1, size: [1,1,1] },

    // === CHEMISTRY ===
    'lv_chemical_reactor': { name: 'Réacteur Chimique LV', type: 'processing', tier: 'lv', color: 0x00CED1, size: [1,1,1] },
    'mv_chemical_reactor': { name: 'Réacteur Chimique MV', type: 'processing', tier: 'mv', color: 0xFFA500, size: [1,1,1] },
    'lv_electrolyzer': { name: 'Électrolyseur LV', type: 'processing', tier: 'lv', color: 0x4682B4, size: [1,1,1] },
    'lv_centrifuge': { name: 'Centrifugeuse LV', type: 'processing', tier: 'lv', color: 0x5F9EA0, size: [1,1,1] },
    'mv_mixer': { name: 'Mixeur MV', type: 'processing', tier: 'mv', color: 0xFFB347, size: [1,1,1] },
    'fluid_extractor': { name: 'Extracteur Fluide', type: 'processing', tier: 'lv', color: 0x20B2AA, size: [1,1,1] },

    // === MULTIBLOCKS ===
    'bbf': { name: 'Haut Fourneau', type: 'multiblock', tier: 'steam', color: 0x8B0000, size: [3,4,3], desc: 'Produit acier' },
    'coke_oven': { name: 'Four à Coke', type: 'multiblock', tier: 'steam', color: 0x4A4A4A, size: [3,3,3], desc: 'Coke + créosote' },
    'ebf': { name: 'Four Électrique (EBF)', type: 'multiblock', tier: 'lv', color: 0xFF4500, size: [3,4,3], desc: 'CRITIQUE!' },
    'pyrolyse_oven': { name: 'Four Pyrolyse', type: 'multiblock', tier: 'mv', color: 0xFF8C00, size: [5,4,5], desc: 'Éthylène' },
    'cleanroom': { name: 'Salle Blanche', type: 'multiblock', tier: 'hv', color: 0xF0FFFF, size: [7,5,7], desc: 'Circuits avancés' },
    'lcr': { name: 'Grand Réacteur Chimique', type: 'multiblock', tier: 'hv', color: 0xFFFF99, size: [3,3,3], desc: 'Perfect OC!' },
    'distillation_tower': { name: 'Tour Distillation', type: 'multiblock', tier: 'hv', color: 0xFFFACD, size: [3,12,3], desc: 'Pétrole' },
    'vacuum_freezer': { name: 'Congélateur Vide', type: 'multiblock', tier: 'hv', color: 0x87CEEB, size: [3,3,3], desc: 'Titane!' },
    'implosion_compressor': { name: 'Compresseur Implosion', type: 'multiblock', tier: 'hv', color: 0x708090, size: [3,3,3] },
    'oil_cracker': { name: 'Unité Craquage', type: 'multiblock', tier: 'hv', color: 0x2F4F4F, size: [5,3,3] },
    'multi_smelter': { name: 'Multi-Four', type: 'multiblock', tier: 'hv', color: 0xFF8C00, size: [3,3,3], desc: 'Parallèles!' },
    'assembly_line': { name: 'Ligne Assemblage', type: 'multiblock', tier: 'iv', color: 0x4169E1, size: [5,3,15], desc: 'Vers LuV!' },

    // === AE2 ===
    'me_controller': { name: 'Contrôleur ME', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'me_drive': { name: 'Lecteur ME', type: 'ae2', tier: 'ev', color: 0x20B2AA, size: [1,1,1] },
    'me_interface': { name: 'Interface ME', type: 'ae2', tier: 'ev', color: 0x48D1CC, size: [1,1,1] },
    'molecular_assembler': { name: 'Assembleur Moléculaire', type: 'ae2', tier: 'ev', color: 0x40E0D0, size: [1,1,1] },
    'inscriber': { name: 'Inscripteur', type: 'ae2', tier: 'ev', color: 0x5F9EA0, size: [1,1,1] },
    'crafting_cpu': { name: 'CPU Crafting', type: 'ae2', tier: 'ev', color: 0x00BFFF, size: [2,2,2] },

    // === STOCKAGE ===
    'bronze_tank': { name: 'Réservoir Bronze', type: 'storage', tier: 'steam', color: 0xCD7F32, size: [1,2,1] },
    'steel_tank': { name: 'Réservoir Acier', type: 'storage', tier: 'lv', color: 0x71797E, size: [1,2,1] },
    'stainless_tank': { name: 'Réservoir Inox', type: 'storage', tier: 'hv', color: 0xC0C0C0, size: [1,2,1] },
    'chest': { name: 'Coffre', type: 'storage', tier: 'steam', color: 0x8B4513, size: [1,1,1] },
    'super_chest': { name: 'Super Coffre', type: 'storage', tier: 'lv', color: 0x4169E1, size: [1,1,1] },
    'quantum_chest': { name: 'Coffre Quantique', type: 'storage', tier: 'ev', color: 0x9400D3, size: [1,1,1] },

    // === HATCHES & BUSES ===
    'energy_hatch_lv': { name: 'Trappe Énergie LV', type: 'hatch', tier: 'lv', color: 0xFFD700, size: [1,1,1] },
    'energy_hatch_mv': { name: 'Trappe Énergie MV', type: 'hatch', tier: 'mv', color: 0xFFD700, size: [1,1,1] },
    'energy_hatch_hv': { name: 'Trappe Énergie HV', type: 'hatch', tier: 'hv', color: 0xFFD700, size: [1,1,1] },
    'input_bus': { name: 'Bus Entrée', type: 'hatch', tier: 'lv', color: 0x4169E1, size: [1,1,1] },
    'output_bus': { name: 'Bus Sortie', type: 'hatch', tier: 'lv', color: 0xFF4500, size: [1,1,1] },
    'input_hatch': { name: 'Trappe Entrée', type: 'hatch', tier: 'lv', color: 0x4169E1, size: [1,1,1] },
    'output_hatch': { name: 'Trappe Sortie', type: 'hatch', tier: 'lv', color: 0xFF4500, size: [1,1,1] },
    'maintenance_hatch': { name: 'Trappe Maintenance', type: 'hatch', tier: 'lv', color: 0xFFA500, size: [1,1,1] },
    'muffler_hatch': { name: 'Trappe Silencieux', type: 'hatch', tier: 'lv', color: 0x696969, size: [1,1,1] },

    // === COILS ===
    'coil_cupronickel': { name: 'Bobine Cupronickel', type: 'component', tier: 'lv', color: 0xFFD700, size: [1,1,1], heat: '1800K' },
    'coil_kanthal': { name: 'Bobine Kanthal', type: 'component', tier: 'mv', color: 0xFF8C00, size: [1,1,1], heat: '2700K' },
    'coil_nichrome': { name: 'Bobine Nichrome', type: 'component', tier: 'hv', color: 0xFF4500, size: [1,1,1], heat: '3600K' },
    'coil_tpv': { name: 'Bobine TPV', type: 'component', tier: 'ev', color: 0x9400D3, size: [1,1,1], heat: '4500K' },

    // === STRUCTURE ===
    'casing_bronze': { name: 'Casing Bronze', type: 'casing', tier: 'steam', color: 0xCD7F32, size: [1,1,1] },
    'casing_steel': { name: 'Casing Acier', type: 'casing', tier: 'lv', color: 0x71797E, size: [1,1,1] },
    'casing_stainless': { name: 'Casing Inox', type: 'casing', tier: 'hv', color: 0xC0C0C0, size: [1,1,1] },
    'casing_titanium': { name: 'Casing Titane', type: 'casing', tier: 'ev', color: 0xB8B8B8, size: [1,1,1] },
    'plascrete': { name: 'Plascrete', type: 'casing', tier: 'hv', color: 0xE8E8E8, size: [1,1,1] },
    'filter_casing': { name: 'Casing Filtre', type: 'casing', tier: 'hv', color: 0xF5F5F5, size: [1,1,1] }
};

// === DÉFINITION DES BASES PROGRESSIVES ===
// Chaque tier HÉRITE du précédent et ajoute de nouvelles machines

const BASE_CONFIGS = {
    steam: {
        name: 'Base Steam Age',
        buildingSize: { width: 20, depth: 24, height: 8 },
        floorLevel: 0,
        description: 'Début du jeu - Vapeur et acier',
        machines: [],
        cables: [],
        inherited: null
    },
    lv: {
        name: 'Base Low Voltage',
        buildingSize: { width: 28, depth: 32, height: 10 },
        floorLevel: 0,
        description: '32 EU/t - Premier tier électrique',
        machines: [],
        cables: [],
        inherited: 'steam'
    },
    mv: {
        name: 'Base Medium Voltage',
        buildingSize: { width: 36, depth: 40, height: 12 },
        floorLevel: 0,
        description: '128 EU/t - Chimie et polymères',
        machines: [],
        cables: [],
        inherited: 'lv'
    },
    hv: {
        name: 'Base High Voltage',
        buildingSize: { width: 48, depth: 52, height: 14 },
        floorLevel: 0,
        description: '512 EU/t - Cleanroom et multiblocks',
        machines: [],
        cables: [],
        inherited: 'mv'
    },
    ev: {
        name: 'Base Extreme Voltage',
        buildingSize: { width: 60, depth: 64, height: 16 },
        floorLevel: 0,
        description: '2048 EU/t - AE2 et automation',
        machines: [],
        cables: [],
        inherited: 'hv'
    },
    iv: {
        name: 'Base Insane Voltage',
        buildingSize: { width: 72, depth: 80, height: 18 },
        floorLevel: 0,
        description: '8192 EU/t - Assembly Line',
        machines: [],
        cables: [],
        inherited: 'ev'
    }
};

// Générer les machines pour chaque tier
function generateBaseLayouts() {
    // === STEAM AGE ===
    BASE_CONFIGS.steam.machines = [
        // Zone génération vapeur (coin nord-ouest)
        { id: 'small_coal_boiler', pos: [2, 1, 2], label: 'Chaudière 1' },
        { id: 'small_coal_boiler', pos: [4, 1, 2], label: 'Chaudière 2' },
        { id: 'hp_coal_boiler', pos: [6, 1, 2], label: 'Chaudière HP' },
        { id: 'bronze_tank', pos: [4, 1, 4], label: 'Buffer vapeur' },

        // Zone ore processing (centre-ouest)
        { id: 'steam_macerator', pos: [2, 1, 8], label: 'Macérateur' },
        { id: 'steam_macerator', pos: [4, 1, 8], label: 'Macérateur 2' },

        // Zone metal processing (centre)
        { id: 'steam_alloy_smelter', pos: [2, 1, 12], label: 'Fonderie' },
        { id: 'steam_forge_hammer', pos: [4, 1, 12], label: 'Marteau' },

        // Multiblocks (côté est)
        { id: 'bbf', pos: [12, 1, 2], label: 'Haut Fourneau - ACIER!' },
        { id: 'coke_oven', pos: [12, 1, 10], label: 'Four à Coke' },

        // Stockage
        { id: 'chest', pos: [8, 1, 8] },
        { id: 'chest', pos: [8, 1, 9] },
        { id: 'bronze_tank', pos: [8, 1, 10], label: 'Créosote' }
    ];

    BASE_CONFIGS.steam.cables = [
        // Pipes vapeur des chaudières vers machines
        { from: [2, 1, 2], to: [2, 1, 4], type: 'pipe_bronze' },
        { from: [4, 1, 2], to: [4, 1, 4], type: 'pipe_bronze' },
        { from: [6, 1, 2], to: [6, 1, 4], type: 'pipe_bronze' },
        { from: [2, 1, 4], to: [6, 1, 4], type: 'pipe_bronze' },
        { from: [4, 1, 4], to: [4, 1, 8], type: 'pipe_bronze' },
        { from: [2, 1, 8], to: [4, 1, 8], type: 'pipe_bronze' },
        { from: [4, 1, 8], to: [4, 1, 12], type: 'pipe_bronze' },
        { from: [2, 1, 12], to: [4, 1, 12], type: 'pipe_bronze' }
    ];

    // === LV - Ajoute à Steam ===
    BASE_CONFIGS.lv.machines = [
        // Génération électrique (remplace/ajoute aux chaudières)
        { id: 'lv_steam_turbine', pos: [8, 1, 2], label: 'Turbine Vapeur' },
        { id: 'lv_steam_turbine', pos: [10, 1, 2], label: 'Turbine 2' },
        { id: 'battery_buffer_4', pos: [9, 1, 4], label: 'Buffer batteries' },

        // EBF - Critique!
        { id: 'ebf', pos: [18, 1, 2], label: 'EBF - CRITIQUE!' },
        { id: 'energy_hatch_lv', pos: [18, 1, 5], label: 'Énergie EBF' },
        { id: 'input_bus', pos: [20, 1, 5], label: 'Input EBF' },
        { id: 'output_bus', pos: [18, 1, 1], label: 'Output EBF' },
        { id: 'muffler_hatch', pos: [19, 5, 3], label: 'Muffler EBF' },
        { id: 'maintenance_hatch', pos: [20, 1, 1], label: 'Maintenance EBF' },

        // Ore processing amélioré
        { id: 'lv_macerator', pos: [2, 1, 16], label: 'Macérateur LV' },
        { id: 'ore_washer', pos: [4, 1, 16], label: 'Laveur' },
        { id: 'sifter', pos: [6, 1, 16], label: 'Tamis' },

        // Metal processing
        { id: 'lv_wiremill', pos: [2, 1, 20], label: 'Tréfileuse - PRIORITÉ' },
        { id: 'lv_bender', pos: [4, 1, 20], label: 'Plieuse - PRIORITÉ' },
        { id: 'lv_lathe', pos: [6, 1, 20], label: 'Tour' },
        { id: 'lv_alloy_smelter', pos: [8, 1, 20], label: 'Fonderie LV' },
        { id: 'arc_furnace', pos: [10, 1, 20], label: 'Four à Arc' },

        // Assemblage et circuits
        { id: 'lv_assembler', pos: [2, 1, 24], label: 'Assembleur' },
        { id: 'circuit_assembler', pos: [4, 1, 24], label: 'Circuits' },

        // Chimie basique
        { id: 'lv_electrolyzer', pos: [8, 1, 24], label: 'Électrolyseur - Gallium!' },
        { id: 'lv_centrifuge', pos: [10, 1, 24], label: 'Centrifugeuse' },
        { id: 'fluid_extractor', pos: [12, 1, 24], label: 'Extracteur fluide' },

        // Stockage amélioré
        { id: 'super_chest', pos: [14, 1, 16] },
        { id: 'super_chest', pos: [14, 1, 17] },
        { id: 'steel_tank', pos: [14, 1, 18] }
    ];

    BASE_CONFIGS.lv.cables = [
        // Power depuis turbines
        { from: [8, 1, 2], to: [9, 1, 4], type: 'cable_lv' },
        { from: [10, 1, 2], to: [9, 1, 4], type: 'cable_lv' },
        // Distribution vers machines
        { from: [9, 1, 4], to: [9, 1, 16], type: 'cable_lv' },
        { from: [9, 1, 16], to: [2, 1, 16], type: 'cable_lv' },
        { from: [9, 1, 16], to: [9, 1, 20], type: 'cable_lv' },
        { from: [9, 1, 20], to: [2, 1, 20], type: 'cable_lv' },
        { from: [9, 1, 20], to: [9, 1, 24], type: 'cable_lv' },
        { from: [9, 1, 24], to: [2, 1, 24], type: 'cable_lv' },
        // Vers EBF
        { from: [9, 1, 4], to: [18, 1, 4], type: 'cable_lv' },
        { from: [18, 1, 4], to: [18, 1, 5], type: 'cable_lv' }
    ];

    // === MV - Ajoute à LV ===
    BASE_CONFIGS.mv.machines = [
        // Génération MV
        { id: 'diesel_generator', pos: [20, 1, 16], label: 'Diesel Gen 1' },
        { id: 'diesel_generator', pos: [22, 1, 16], label: 'Diesel Gen 2' },
        { id: 'battery_buffer_16', pos: [21, 1, 18], label: 'Buffer MV' },
        { id: 'transformer_lv_mv', pos: [19, 1, 18], label: 'Transfo LV↔MV' },

        // Pyrolyse Oven
        { id: 'pyrolyse_oven', pos: [24, 1, 2], label: 'Pyrolyse - Éthylène!' },

        // Chimie MV
        { id: 'mv_chemical_reactor', pos: [20, 1, 24], label: 'Réacteur Chimique' },
        { id: 'mv_chemical_reactor', pos: [22, 1, 24], label: 'Réacteur 2' },
        { id: 'mv_mixer', pos: [24, 1, 24], label: 'Mixeur - Diesel!' },

        // Processing MV
        { id: 'mv_macerator', pos: [20, 1, 28], label: 'Macérateur MV' },
        { id: 'mv_assembler', pos: [22, 1, 28], label: 'Assembleur MV' },
        { id: 'mv_extruder', pos: [24, 1, 28], label: 'Extrudeuse' },
        { id: 'thermal_centrifuge', pos: [26, 1, 28], label: 'Centri Thermique' },

        // EBF avec Kanthal
        { id: 'coil_kanthal', pos: [19, 2, 3], label: 'Upgrade Kanthal' }
    ];

    BASE_CONFIGS.mv.cables = [
        // Power MV
        { from: [20, 1, 16], to: [21, 1, 18], type: 'cable_mv' },
        { from: [22, 1, 16], to: [21, 1, 18], type: 'cable_mv' },
        { from: [21, 1, 18], to: [21, 1, 24], type: 'cable_mv' },
        { from: [21, 1, 24], to: [20, 1, 24], type: 'cable_mv' },
        { from: [21, 1, 24], to: [21, 1, 28], type: 'cable_mv' },
        { from: [21, 1, 28], to: [20, 1, 28], type: 'cable_mv' },
        // Vers Pyrolyse
        { from: [21, 1, 18], to: [24, 1, 6], type: 'cable_mv' }
    ];

    // === HV - Ajoute à MV ===
    BASE_CONFIGS.hv.machines = [
        // Génération HV
        { id: 'gas_turbine', pos: [30, 1, 16], label: 'Turbine Gaz 1' },
        { id: 'gas_turbine', pos: [32, 1, 16], label: 'Turbine Gaz 2' },
        { id: 'transformer_mv_hv', pos: [31, 1, 18], label: 'Transfo MV↔HV' },

        // CLEANROOM - Critique!
        { id: 'cleanroom', pos: [34, 1, 24], label: 'CLEANROOM - Circuits!' },

        // Multiblocks HV
        { id: 'lcr', pos: [30, 1, 2], label: 'LCR - Perfect OC!' },
        { id: 'distillation_tower', pos: [36, 1, 2], label: 'Tour Distillation' },
        { id: 'vacuum_freezer', pos: [30, 1, 8], label: 'Vacuum Freezer - Titane!' },
        { id: 'implosion_compressor', pos: [36, 1, 8], label: 'Compresseur Implosion' },
        { id: 'oil_cracker', pos: [30, 1, 14], label: 'Oil Cracker' },
        { id: 'multi_smelter', pos: [42, 1, 2], label: 'Multi Smelter' },

        // Processing HV
        { id: 'hv_macerator', pos: [30, 1, 32], label: 'Macérateur HV' },
        { id: 'hv_assembler', pos: [32, 1, 32], label: 'Assembleur HV' },

        // EBF avec Nichrome
        { id: 'coil_nichrome', pos: [19, 2, 3], label: 'Upgrade Nichrome' },

        // Stockage
        { id: 'stainless_tank', pos: [34, 1, 16] },
        { id: 'stainless_tank', pos: [34, 1, 17] }
    ];

    // === EV - Ajoute à HV ===
    BASE_CONFIGS.ev.machines = [
        // Génération EV
        { id: 'large_gas_turbine', pos: [42, 1, 16], label: 'Grande Turbine Gaz' },
        { id: 'nuclear_reactor', pos: [48, 1, 16], label: 'Réacteur Nucléaire' },
        { id: 'transformer_hv_ev', pos: [45, 1, 20], label: 'Transfo HV↔EV' },

        // AE2 System complet!
        { id: 'me_controller', pos: [42, 1, 28], label: 'Contrôleur ME' },
        { id: 'me_controller', pos: [43, 1, 28] },
        { id: 'me_controller', pos: [44, 1, 28] },
        { id: 'me_controller', pos: [42, 2, 28] },
        { id: 'me_controller', pos: [43, 2, 28] },
        { id: 'me_controller', pos: [44, 2, 28] },
        { id: 'me_drive', pos: [46, 1, 28], label: 'Drives' },
        { id: 'me_drive', pos: [47, 1, 28] },
        { id: 'me_drive', pos: [48, 1, 28] },
        { id: 'me_interface', pos: [46, 1, 30], label: 'Interface' },
        { id: 'molecular_assembler', pos: [47, 1, 30] },
        { id: 'molecular_assembler', pos: [48, 1, 30] },
        { id: 'molecular_assembler', pos: [49, 1, 30] },
        { id: 'inscriber', pos: [50, 1, 28], label: 'Inscriber' },
        { id: 'crafting_cpu', pos: [50, 1, 30], label: 'CPU Crafting' },

        // EBF avec TPV
        { id: 'coil_tpv', pos: [19, 2, 3], label: 'Upgrade TPV' },

        // Quantum storage
        { id: 'quantum_chest', pos: [54, 1, 28] },
        { id: 'quantum_chest', pos: [54, 1, 29] }
    ];

    // === IV - Ajoute à EV ===
    BASE_CONFIGS.iv.machines = [
        // Assembly Line - Porte vers LuV!
        { id: 'assembly_line', pos: [56, 1, 2], label: 'ASSEMBLY LINE - LuV!' }
    ];
}

// Initialiser les layouts
generateBaseLayouts();

// Initialisation
function init() {
    const canvas = document.getElementById('canvas');

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(30, 25, 30);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(15, 2, 15);

    // Lighting
    setupLighting();

    // Load initial base
    loadBase(currentTier);
    document.getElementById('loading').classList.add('hidden');

    // Events
    setupEvents();

    // Animate
    animate();
}

function setupLighting() {
    // Ambient
    scene.add(new THREE.AmbientLight(0x404060, 0.5));

    // Main light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(50, 80, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.camera.left = -60;
    mainLight.shadow.camera.right = 60;
    mainLight.shadow.camera.top = 60;
    mainLight.shadow.camera.bottom = -60;
    scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8080ff, 0.3);
    fillLight.position.set(-30, 30, -30);
    scene.add(fillLight);
}

function createBuilding(config, tierColors) {
    const group = new THREE.Group();
    const { width, depth, height } = config.buildingSize;

    // Sol
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        roughness: 0.9
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(width/2, 0, depth/2);
    floor.receiveShadow = true;
    group.add(floor);

    // Grille au sol
    const gridHelper = new THREE.GridHelper(Math.max(width, depth), Math.max(width, depth), 0x444466, 0x333344);
    gridHelper.position.set(width/2, 0.01, depth/2);
    group.add(gridHelper);

    // Murs (transparents pour voir l'intérieur)
    const wallMat = new THREE.MeshStandardMaterial({
        color: tierColors.primary,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });

    // Mur arrière
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
    backWall.position.set(width/2, height/2, 0);
    group.add(backWall);

    // Mur gauche
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(0, height/2, depth/2);
    group.add(leftWall);

    // Colonnes aux coins (structure visible)
    const pillarGeo = new THREE.BoxGeometry(0.5, height, 0.5);
    const pillarMat = new THREE.MeshStandardMaterial({ color: tierColors.secondary, metalness: 0.5 });

    [[0, 0], [width, 0], [0, depth], [width, depth]].forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, height/2, z);
        pillar.castShadow = true;
        group.add(pillar);
    });

    // Poutres horizontales
    const beamMat = new THREE.MeshStandardMaterial({ color: tierColors.secondary, metalness: 0.3 });

    // Poutre haute arrière
    const beamBack = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, 0.3), beamMat);
    beamBack.position.set(width/2, height - 0.5, 0.15);
    group.add(beamBack);

    // Poutre haute gauche
    const beamLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, depth), beamMat);
    beamLeft.position.set(0.15, height - 0.5, depth/2);
    group.add(beamLeft);

    return group;
}

function createMachine(machineId, position) {
    const data = MACHINES[machineId];
    if (!data) return null;

    const [w, h, d] = data.size;
    const geometry = new THREE.BoxGeometry(w * 0.9, h * 0.9, d * 0.9);

    // Matériau avec couleur par type
    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.6,
        metalness: data.type === 'multiblock' ? 0.4 : 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
        position[0] + w/2,
        position[1] + h/2 - 0.05,
        position[2] + d/2
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.userData = { machineId, ...data, position };

    // Highlight pour multiblocks
    if (data.type === 'multiblock') {
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
        );
        mesh.add(line);
    }

    return mesh;
}

function createCable(from, to, type) {
    const cableColors = {
        'pipe_bronze': 0xCD7F32,
        'pipe_steel': 0x71797E,
        'cable_lv': 0xDCDCDC,
        'cable_mv': 0xFF6400,
        'cable_hv': 0xFFFF00,
        'cable_ev': 0x808080
    };

    const color = cableColors[type] || 0x888888;
    const radius = type.startsWith('pipe') ? 0.15 : 0.08;

    // Créer le chemin du câble
    const points = [];
    points.push(new THREE.Vector3(from[0] + 0.5, from[1] + 0.3, from[2] + 0.5));

    // Si pas sur la même ligne, faire un coude
    if (from[0] !== to[0] && from[2] !== to[2]) {
        points.push(new THREE.Vector3(to[0] + 0.5, from[1] + 0.3, from[2] + 0.5));
    }

    points.push(new THREE.Vector3(to[0] + 0.5, to[1] + 0.3, to[2] + 0.5));

    const path = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(path, 8, radius, 6, false);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.6
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    return mesh;
}

function loadBase(tier) {
    // Clear scene
    machineObjects.forEach(obj => scene.remove(obj));
    cableObjects.forEach(obj => scene.remove(obj));
    structureObjects.forEach(obj => scene.remove(obj));
    machineObjects = [];
    cableObjects = [];
    structureObjects = [];

    const config = BASE_CONFIGS[tier];
    const tierColors = TIER_COLORS[tier];

    // Créer le bâtiment
    const building = createBuilding(config, tierColors);
    scene.add(building);
    structureObjects.push(building);

    // Collecter toutes les machines (tier actuel + hérités)
    let allMachines = [];
    let allCables = [];
    let currentTierConfig = tier;

    while (currentTierConfig) {
        const cfg = BASE_CONFIGS[currentTierConfig];
        allMachines = [...cfg.machines, ...allMachines];
        allCables = [...cfg.cables, ...allCables];
        currentTierConfig = cfg.inherited;
    }

    // Créer les machines
    allMachines.forEach(machineConfig => {
        const mesh = createMachine(machineConfig.id, machineConfig.pos);
        if (mesh) {
            if (machineConfig.label) {
                mesh.userData.label = machineConfig.label;
            }
            scene.add(mesh);
            machineObjects.push(mesh);
        }
    });

    // Créer les câbles
    allCables.forEach(cableConfig => {
        const mesh = createCable(cableConfig.from, cableConfig.to, cableConfig.type);
        if (mesh) {
            scene.add(mesh);
            cableObjects.push(mesh);
        }
    });

    // Update UI
    document.getElementById('currentTier').textContent = tier.toUpperCase();
    document.getElementById('machineCount').textContent = allMachines.length;

    // Calculer EU production
    let euProd = 0;
    allMachines.forEach(m => {
        const data = MACHINES[m.id];
        if (data && data.output && data.output.includes('EU/t')) {
            const match = data.output.match(/(\d+)/);
            if (match) euProd += parseInt(match[1]);
        }
    });
    document.getElementById('euProduction').textContent = euProd > 0 ? euProd + ' EU/t' : 'Steam';

    // Center camera
    const size = config.buildingSize;
    controls.target.set(size.width/2, 3, size.depth/2);
    camera.position.set(
        size.width/2 + size.width * 0.6,
        size.height * 1.2,
        size.depth/2 + size.depth * 0.6
    );

    // Update legend
    updateLegend(allMachines);
}

function updateLegend(machines) {
    const legendContent = document.getElementById('legendContent');
    const types = {};

    machines.forEach(m => {
        const data = MACHINES[m.id];
        if (data) {
            if (!types[data.type]) {
                types[data.type] = { count: 0, color: data.color };
            }
            types[data.type].count++;
        }
    });

    const typeNames = {
        'generator': 'Générateurs',
        'processing': 'Traitement',
        'multiblock': 'Multiblocks',
        'ae2': 'AE2',
        'storage': 'Stockage',
        'hatch': 'Hatches',
        'component': 'Composants',
        'power': 'Power',
        'casing': 'Casings'
    };

    let html = '';
    Object.entries(types).forEach(([type, info]) => {
        const name = typeNames[type] || type;
        html += `<div class="legend-item">
            <div class="legend-color" style="background: #${info.color.toString(16).padStart(6, '0')}"></div>
            <span>${name} (${info.count})</span>
        </div>`;
    });

    legendContent.innerHTML = html;
}

function setupEvents() {
    // Tier buttons
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTier = btn.dataset.tier;
            loadBase(currentTier);
        });
    });

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(machineObjects);

        if (intersects.length > 0) {
            selectMachine(intersects[0].object);
        }
    });

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function selectMachine(mesh) {
    if (selectedObject) {
        selectedObject.material.emissive.setHex(0x000000);
    }

    selectedObject = mesh;
    mesh.material.emissive.setHex(0x00d4ff);
    mesh.material.emissiveIntensity = 0.3;

    const data = mesh.userData;
    document.getElementById('infoName').textContent = data.label || data.name;
    document.getElementById('infoType').textContent = `${data.type} - ${data.tier.toUpperCase()}`;
    document.getElementById('infoDesc').textContent = data.desc || `Machine de type ${data.type}`;

    let specs = '';
    if (data.output) specs += `<div>Output: <span style="color:#00d4ff">${data.output}</span></div>`;
    if (data.heat) specs += `<div>Heat: <span style="color:#ff6600">${data.heat}</span></div>`;
    if (data.size) specs += `<div>Taille: <span style="color:#888">${data.size.join('x')}</span></div>`;

    document.getElementById('infoSpecs').innerHTML = specs;
    document.getElementById('infoPanel').classList.add('visible');
}

function hideInfo() {
    document.getElementById('infoPanel').classList.remove('visible');
    if (selectedObject) {
        selectedObject.material.emissive.setHex(0x000000);
        selectedObject = null;
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Start
init();
