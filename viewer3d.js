// GTNH 3D Base Viewer
// Visualisation 3D des bases par tier avec machines interactives

let scene, camera, renderer, controls;
let machineObjects = [];
let selectedObject = null;
let currentTier = 'steam';

// Machine types avec couleurs et textures procédurales
const MACHINE_TYPES = {
    // Steam Age
    'coal_boiler': { color: 0x8B4513, name: 'Small Coal Boiler', type: 'Générateur', desc: 'Produit 6 L/t de vapeur. Utilise du charbon comme combustible.', specs: { output: '6 L/t Steam', fuel: 'Coal/Charcoal' } },
    'hp_boiler': { color: 0x654321, name: 'High Pressure Coal Boiler', type: 'Générateur', desc: 'Version améliorée produisant 15 L/t de vapeur.', specs: { output: '15 L/t Steam', fuel: 'Coal/Charcoal' } },
    'steam_alloy_smelter': { color: 0xCD853F, name: 'Steam Alloy Smelter', type: 'Processing', desc: 'Fond et allie les métaux. Essentiel pour le bronze.', specs: { steam: '32 L/t max' } },
    'steam_macerator': { color: 0xB8860B, name: 'Steam Macerator', type: 'Ore Processing', desc: 'Double le rendement des minerais en les broyant.', specs: { steam: '4 L/t' } },
    'steam_furnace': { color: 0xDAA520, name: 'Steam Furnace', type: 'Processing', desc: 'Four alimenté à la vapeur.', specs: { steam: '4 L/t' } },
    'steam_compressor': { color: 0xD2691E, name: 'Steam Compressor', type: 'Processing', desc: 'Compresse les items.', specs: { steam: '4 L/t' } },
    'steam_forge_hammer': { color: 0xA0522D, name: 'Steam Forge Hammer', type: 'Processing', desc: 'Crée des plaques (2 pour 3 lingots).', specs: { steam: '32 L/t' } },
    'bronze_tank': { color: 0xCD7F32, name: 'Bronze Fluid Tank', type: 'Storage', desc: 'Stocke la vapeur ou autres fluides.', specs: { capacity: '16000 L' } },
    'bbf': { color: 0x8B0000, name: 'Bricked Blast Furnace', type: 'Multiblock', desc: 'Premier multiblock - produit de l\'acier sans électricité.', specs: { size: '3x3x4', output: 'Steel' } },

    // LV
    'lv_machine_hull': { color: 0xDCDCDC, name: 'LV Machine Hull', type: 'Component', desc: 'Base pour toutes les machines LV.', specs: { voltage: '32 EU/t' } },
    'ebf': { color: 0xFF4500, name: 'Electric Blast Furnace', type: 'Multiblock', desc: 'Multiblock essentiel pour fondre des matériaux haute température.', specs: { size: '3x3x4', coils: 'Cupronickel+' } },
    'lv_macerator': { color: 0xC0C0C0, name: 'LV Macerator', type: 'Ore Processing', desc: 'Double le rendement des minerais électriquement.', specs: { power: '2 EU/t' } },
    'lv_wiremill': { color: 0xA9A9A9, name: 'LV Wiremill', type: 'Processing', desc: 'Produit des fils pour les câbles.', specs: { power: '2 EU/t' } },
    'lv_bender': { color: 0x808080, name: 'LV Bending Machine', type: 'Processing', desc: 'Crée des plaques, tiges, câbles.', specs: { power: '2 EU/t' } },
    'lv_assembler': { color: 0x696969, name: 'LV Assembler', type: 'Processing', desc: 'Assemble des composants.', specs: { power: '2 EU/t' } },
    'lv_electrolyzer': { color: 0x4682B4, name: 'LV Electrolyzer', type: 'Processing', desc: 'Électrolyse des matériaux (Gallium!).', specs: { power: '2 EU/t' } },
    'lv_generator': { color: 0x228B22, name: 'LV Steam Turbine', type: 'Générateur', desc: 'Convertit la vapeur en EU.', specs: { output: '32 EU/t max' } },
    'battery_buffer': { color: 0xFFD700, name: 'Battery Buffer', type: 'Storage', desc: 'Stocke l\'énergie dans des batteries.', specs: { slots: '4-16' } },

    // MV
    'mv_machine_hull': { color: 0xFF6400, name: 'MV Machine Hull', type: 'Component', desc: 'Base pour machines MV.', specs: { voltage: '128 EU/t' } },
    'pyrolyse_oven': { color: 0xFF8C00, name: 'Pyrolyse Oven', type: 'Multiblock', desc: 'Produit du charbon de bois et des gaz. Essentiel pour éthylène.', specs: { size: '5x4x5' } },
    'mv_chemical_reactor': { color: 0xFFA500, name: 'MV Chemical Reactor', type: 'Processing', desc: 'Réactions chimiques - polyéthylène!', specs: { power: '30 EU/t' } },
    'mv_centrifuge': { color: 0xFFB347, name: 'MV Centrifuge', type: 'Processing', desc: 'Sépare les matériaux par densité.', specs: { power: '5 EU/t' } },
    'diesel_generator': { color: 0x2F4F4F, name: 'Diesel Generator', type: 'Générateur', desc: 'Génère de l\'énergie avec du diesel.', specs: { output: '128 EU/t max' } },

    // HV
    'hv_machine_hull': { color: 0xFFFF00, name: 'HV Machine Hull', type: 'Component', desc: 'Base pour machines HV.', specs: { voltage: '512 EU/t' } },
    'cleanroom': { color: 0xF0FFFF, name: 'Cleanroom', type: 'Multiblock', desc: 'Obligatoire pour circuits avancés.', specs: { size: 'Variable', purity: '100%' } },
    'lcr': { color: 0xFFFF99, name: 'Large Chemical Reactor', type: 'Multiblock', desc: 'Perfect overclocks - essentiel!', specs: { bonus: '4x speed/4x power' } },
    'distillation_tower': { color: 0xFFFACD, name: 'Distillation Tower', type: 'Multiblock', desc: 'Distille le pétrole efficacement.', specs: { layers: '12+' } },
    'vacuum_freezer': { color: 0x87CEEB, name: 'Vacuum Freezer', type: 'Multiblock', desc: 'Congèle les matériaux - Titanium!', specs: { size: '3x3x3' } },
    'implosion_compressor': { color: 0x708090, name: 'Implosion Compressor', type: 'Multiblock', desc: 'Utilise du TNT pour compresser.', specs: { explosive: 'TNT/ITNT' } },

    // EV
    'ev_machine_hull': { color: 0x00FFFF, name: 'EV Machine Hull', type: 'Component', desc: 'Base pour machines EV.', specs: { voltage: '2048 EU/t' } },
    'ae2_controller': { color: 0x00CED1, name: 'ME Controller', type: 'AE2', desc: 'Cœur du système AE2.', specs: { channels: '32/face' } },
    'ae2_drive': { color: 0x20B2AA, name: 'ME Drive', type: 'AE2', desc: 'Stockage des cellules ME.', specs: { slots: '10' } },
    'ae2_interface': { color: 0x48D1CC, name: 'ME Interface', type: 'AE2', desc: 'Interface avec machines.', specs: { patterns: '9' } },
    'nuclear_reactor': { color: 0x32CD32, name: 'Nuclear Reactor', type: 'Générateur', desc: 'Génération nucléaire massive.', specs: { output: 'Variable' } },
    'large_gas_turbine': { color: 0x3CB371, name: 'Large Gas Turbine', type: 'Multiblock', desc: 'Génération au gaz efficace.', specs: { output: 'High' } },

    // Utility
    'cable_lv': { color: 0xDCDCDC, name: 'LV Cable', type: 'Cable', desc: 'Transporte 32 EU/t.', specs: { amperage: '1-4A' } },
    'cable_mv': { color: 0xFF6400, name: 'MV Cable', type: 'Cable', desc: 'Transporte 128 EU/t.', specs: { amperage: '1-4A' } },
    'cable_hv': { color: 0xFFFF00, name: 'HV Cable', type: 'Cable', desc: 'Transporte 512 EU/t.', specs: { amperage: '1-4A' } },
    'pipe_bronze': { color: 0xCD7F32, name: 'Bronze Pipe', type: 'Pipe', desc: 'Transporte vapeur et fluides.', specs: { throughput: '120 L/t' } },
    'pipe_steel': { color: 0x71797E, name: 'Steel Pipe', type: 'Pipe', desc: 'Pipe améliorée.', specs: { throughput: '360 L/t' } },
    'chest': { color: 0x8B4513, name: 'Chest', type: 'Storage', desc: 'Stockage basique.', specs: { slots: '27' } },
    'super_chest': { color: 0x4169E1, name: 'Super Chest', type: 'Storage', desc: 'Stockage massif.', specs: { slots: '54+' } },
    'transformer': { color: 0x9932CC, name: 'Transformer', type: 'Power', desc: 'Convertit les voltages.', specs: { ratio: '1:4' } },
    'floor': { color: 0x2F2F2F, name: 'Floor', type: 'Structure', desc: 'Sol de la base.', specs: {} },
    'wall': { color: 0x3D3D3D, name: 'Wall', type: 'Structure', desc: 'Mur de la base.', specs: {} },
    'coil': { color: 0xFFD700, name: 'Heating Coil', type: 'Component', desc: 'Bobine pour EBF.', specs: { heat: '1800K+' } }
};

// Définition des bases par tier
const BASE_LAYOUTS = {
    steam: {
        name: 'Steam Age Base',
        size: { x: 16, y: 6, z: 16 },
        euProduction: 0,
        steamProduction: '60 L/t',
        machines: [
            // Sol
            ...generateFloor(16, 16),
            // Murs partiels
            ...generateWalls(16, 4, 16),

            // Zone chaudières (production de vapeur)
            { type: 'coal_boiler', pos: [2, 1, 2], info: 'Chaudière principale - alimente les machines' },
            { type: 'coal_boiler', pos: [4, 1, 2], info: 'Chaudière secondaire' },
            { type: 'hp_boiler', pos: [6, 1, 2], info: 'High Pressure pour plus de vapeur' },
            { type: 'bronze_tank', pos: [3, 1, 4], info: 'Buffer de vapeur - évite les pertes' },

            // Pipes vapeur
            { type: 'pipe_bronze', pos: [2, 1, 3] },
            { type: 'pipe_bronze', pos: [3, 1, 3] },
            { type: 'pipe_bronze', pos: [4, 1, 3] },
            { type: 'pipe_bronze', pos: [5, 1, 3] },
            { type: 'pipe_bronze', pos: [6, 1, 3] },
            { type: 'pipe_bronze', pos: [3, 1, 5] },
            { type: 'pipe_bronze', pos: [3, 1, 6] },
            { type: 'pipe_bronze', pos: [3, 1, 7] },

            // Zone processing
            { type: 'steam_macerator', pos: [2, 1, 7], info: 'PRIORITÉ: Double les minerais!' },
            { type: 'steam_furnace', pos: [4, 1, 7], info: 'Fond les dusts en lingots' },
            { type: 'steam_alloy_smelter', pos: [6, 1, 7], info: 'Crée le Bronze (Cu + Sn)' },
            { type: 'steam_forge_hammer', pos: [2, 1, 9], info: 'Plaques: 2 pour 3 lingots' },
            { type: 'steam_compressor', pos: [4, 1, 9], info: 'Compresse en blocs' },

            // Pipes vers processing
            { type: 'pipe_bronze', pos: [3, 1, 8] },
            { type: 'pipe_bronze', pos: [4, 1, 8] },
            { type: 'pipe_bronze', pos: [5, 1, 8] },

            // Zone stockage
            { type: 'chest', pos: [10, 1, 2], info: 'Minerais bruts' },
            { type: 'chest', pos: [12, 1, 2], info: 'Dusts' },
            { type: 'chest', pos: [10, 1, 4], info: 'Lingots' },
            { type: 'chest', pos: [12, 1, 4], info: 'Plaques & Components' },

            // Bricked Blast Furnace (3x3x4)
            { type: 'bbf', pos: [10, 1, 8], info: 'CRITIQUE: Produit l\'acier!' },
            { type: 'bbf', pos: [11, 1, 8] },
            { type: 'bbf', pos: [12, 1, 8] },
            { type: 'bbf', pos: [10, 2, 8] },
            { type: 'bbf', pos: [11, 2, 8] },
            { type: 'bbf', pos: [12, 2, 8] },
            { type: 'bbf', pos: [10, 3, 8] },
            { type: 'bbf', pos: [11, 3, 8] },
            { type: 'bbf', pos: [12, 3, 8] },
            { type: 'bbf', pos: [10, 4, 8] },
            { type: 'bbf', pos: [11, 4, 8] },
            { type: 'bbf', pos: [12, 4, 8] }
        ]
    },

    lv: {
        name: 'Low Voltage Base',
        size: { x: 24, y: 8, z: 24 },
        euProduction: '64 EU/t',
        machines: [
            ...generateFloor(24, 24),
            ...generateWalls(24, 6, 24),

            // Zone énergie (Steam -> EU)
            { type: 'coal_boiler', pos: [2, 1, 2], info: 'Alimente la turbine' },
            { type: 'coal_boiler', pos: [4, 1, 2] },
            { type: 'hp_boiler', pos: [6, 1, 2] },
            { type: 'bronze_tank', pos: [4, 1, 4], info: 'Buffer vapeur' },
            { type: 'lv_generator', pos: [4, 1, 6], info: 'Convertit vapeur -> EU' },
            { type: 'lv_generator', pos: [6, 1, 6] },
            { type: 'battery_buffer', pos: [5, 1, 8], info: 'Stocke l\'énergie' },
            { type: 'transformer', pos: [5, 1, 10], info: 'Distribution' },

            // Câblage
            { type: 'cable_lv', pos: [4, 1, 7] },
            { type: 'cable_lv', pos: [5, 1, 7] },
            { type: 'cable_lv', pos: [6, 1, 7] },
            { type: 'cable_lv', pos: [5, 1, 9] },
            { type: 'cable_lv', pos: [5, 1, 11] },
            { type: 'cable_lv', pos: [5, 1, 12] },
            { type: 'cable_lv', pos: [6, 1, 12] },
            { type: 'cable_lv', pos: [7, 1, 12] },
            { type: 'cable_lv', pos: [8, 1, 12] },

            // Zone Ore Processing
            { type: 'lv_macerator', pos: [8, 1, 10], info: 'Broie les minerais' },
            { type: 'lv_macerator', pos: [10, 1, 10], info: 'Second macerator pour bypass' },
            { type: 'steam_furnace', pos: [8, 1, 8], info: 'Encore utile en LV' },

            // Zone Processing
            { type: 'lv_wiremill', pos: [12, 1, 10], info: 'PRIORITÉ: Fils pour câbles' },
            { type: 'lv_bender', pos: [14, 1, 10], info: 'PRIORITÉ: Plaques et rods' },
            { type: 'lv_assembler', pos: [12, 1, 8], info: 'Assemble circuits' },
            { type: 'lv_electrolyzer', pos: [14, 1, 8], info: 'GALLIUM: Électrolyse Sphalerite!' },

            // Câbles vers processing
            { type: 'cable_lv', pos: [9, 1, 12] },
            { type: 'cable_lv', pos: [10, 1, 12] },
            { type: 'cable_lv', pos: [11, 1, 12] },
            { type: 'cable_lv', pos: [12, 1, 12] },
            { type: 'cable_lv', pos: [13, 1, 12] },
            { type: 'cable_lv', pos: [14, 1, 12] },
            { type: 'cable_lv', pos: [12, 1, 11] },
            { type: 'cable_lv', pos: [14, 1, 11] },
            { type: 'cable_lv', pos: [12, 1, 9] },
            { type: 'cable_lv', pos: [14, 1, 9] },

            // EBF (3x3x4)
            { type: 'ebf', pos: [18, 1, 4], info: 'CRITIQUE: Electric Blast Furnace' },
            { type: 'ebf', pos: [19, 1, 4] },
            { type: 'ebf', pos: [20, 1, 4] },
            { type: 'coil', pos: [18, 2, 4] },
            { type: 'coil', pos: [19, 2, 4] },
            { type: 'coil', pos: [20, 2, 4] },
            { type: 'coil', pos: [18, 3, 4] },
            { type: 'coil', pos: [19, 3, 4] },
            { type: 'coil', pos: [20, 3, 4] },
            { type: 'ebf', pos: [18, 4, 4] },
            { type: 'ebf', pos: [19, 4, 4] },
            { type: 'ebf', pos: [20, 4, 4] },

            // Câbles vers EBF
            { type: 'cable_lv', pos: [15, 1, 12] },
            { type: 'cable_lv', pos: [16, 1, 12] },
            { type: 'cable_lv', pos: [17, 1, 12] },
            { type: 'cable_lv', pos: [18, 1, 12] },
            { type: 'cable_lv', pos: [19, 1, 12] },
            { type: 'cable_lv', pos: [19, 1, 11] },
            { type: 'cable_lv', pos: [19, 1, 10] },
            { type: 'cable_lv', pos: [19, 1, 9] },
            { type: 'cable_lv', pos: [19, 1, 8] },
            { type: 'cable_lv', pos: [19, 1, 7] },
            { type: 'cable_lv', pos: [19, 1, 6] },
            { type: 'cable_lv', pos: [19, 1, 5] },

            // Stockage
            { type: 'chest', pos: [2, 1, 18], info: 'Input: Minerais' },
            { type: 'chest', pos: [4, 1, 18], info: 'Dusts' },
            { type: 'chest', pos: [6, 1, 18], info: 'Lingots' },
            { type: 'chest', pos: [8, 1, 18], info: 'Components' },
            { type: 'chest', pos: [10, 1, 18], info: 'Circuits' }
        ]
    },

    mv: {
        name: 'Medium Voltage Base',
        size: { x: 32, y: 10, z: 32 },
        euProduction: '256 EU/t',
        machines: [
            ...generateFloor(32, 32),
            ...generateWalls(32, 8, 32),

            // Zone énergie améliorée
            { type: 'diesel_generator', pos: [4, 1, 4], info: 'Génération MV - Diesel/Cetane' },
            { type: 'diesel_generator', pos: [6, 1, 4] },
            { type: 'battery_buffer', pos: [5, 1, 6], info: 'MV Battery Buffer' },
            { type: 'transformer', pos: [5, 1, 8] },

            // Câblage MV principal
            { type: 'cable_mv', pos: [5, 1, 5] },
            { type: 'cable_mv', pos: [5, 1, 7] },
            { type: 'cable_mv', pos: [5, 1, 9] },
            { type: 'cable_mv', pos: [5, 1, 10] },
            { type: 'cable_mv', pos: [6, 1, 10] },
            { type: 'cable_mv', pos: [7, 1, 10] },
            { type: 'cable_mv', pos: [8, 1, 10] },

            // Pyrolyse Oven (5x4x5)
            { type: 'pyrolyse_oven', pos: [10, 1, 4], info: 'ÉTHYLÈNE: Bois -> Charcoal + Gaz' },
            { type: 'pyrolyse_oven', pos: [11, 1, 4] },
            { type: 'pyrolyse_oven', pos: [12, 1, 4] },
            { type: 'pyrolyse_oven', pos: [13, 1, 4] },
            { type: 'pyrolyse_oven', pos: [14, 1, 4] },
            { type: 'pyrolyse_oven', pos: [10, 2, 4] },
            { type: 'pyrolyse_oven', pos: [14, 2, 4] },
            { type: 'pyrolyse_oven', pos: [10, 3, 4] },
            { type: 'pyrolyse_oven', pos: [14, 3, 4] },

            // Chemical Reactors pour Polyéthylène
            { type: 'mv_chemical_reactor', pos: [20, 1, 4], info: 'POLYÉTHYLÈNE: Éthylène + O2' },
            { type: 'mv_chemical_reactor', pos: [22, 1, 4], info: 'Backup pour production' },
            { type: 'mv_centrifuge', pos: [20, 1, 6], info: 'Centrifugation des byproducts' },

            // Zone processing MV
            { type: 'mv_machine_hull', pos: [10, 1, 15], info: 'MV Machines diverses' },

            // EBF amélioré avec Kanthal
            { type: 'ebf', pos: [26, 1, 10], info: 'EBF avec Kanthal pour Stainless Steel' },
            { type: 'ebf', pos: [27, 1, 10] },
            { type: 'ebf', pos: [28, 1, 10] },
            { type: 'coil', pos: [26, 2, 10], info: 'Kanthal Coils - 2700K' },
            { type: 'coil', pos: [27, 2, 10] },
            { type: 'coil', pos: [28, 2, 10] },
            { type: 'coil', pos: [26, 3, 10] },
            { type: 'coil', pos: [27, 3, 10] },
            { type: 'coil', pos: [28, 3, 10] },
            { type: 'ebf', pos: [26, 4, 10] },
            { type: 'ebf', pos: [27, 4, 10] },
            { type: 'ebf', pos: [28, 4, 10] },

            // Stockage étendu
            { type: 'super_chest', pos: [4, 1, 25], info: 'Stockage massif' },
            { type: 'super_chest', pos: [6, 1, 25] },
            { type: 'super_chest', pos: [8, 1, 25] },
            { type: 'chest', pos: [10, 1, 25], info: 'Polyéthylène' },
            { type: 'chest', pos: [12, 1, 25], info: 'Stainless Steel' }
        ]
    },

    hv: {
        name: 'High Voltage Base',
        size: { x: 40, y: 12, z: 40 },
        euProduction: '1024 EU/t',
        machines: [
            ...generateFloor(40, 40),
            ...generateWalls(40, 10, 40),

            // Zone énergie HV
            { type: 'hv_machine_hull', pos: [4, 1, 4] },
            { type: 'battery_buffer', pos: [6, 1, 4], info: 'HV Battery Buffer' },
            { type: 'transformer', pos: [8, 1, 4] },

            // Câblage HV
            { type: 'cable_hv', pos: [5, 1, 4] },
            { type: 'cable_hv', pos: [7, 1, 4] },
            { type: 'cable_hv', pos: [9, 1, 4] },
            { type: 'cable_hv', pos: [10, 1, 4] },

            // CLEANROOM (variable size) - représenté simplifié
            { type: 'cleanroom', pos: [15, 1, 15], info: 'CLEANROOM: Obligatoire pour circuits!' },
            { type: 'cleanroom', pos: [16, 1, 15] },
            { type: 'cleanroom', pos: [17, 1, 15] },
            { type: 'cleanroom', pos: [18, 1, 15] },
            { type: 'cleanroom', pos: [19, 1, 15] },
            { type: 'cleanroom', pos: [15, 1, 16] },
            { type: 'cleanroom', pos: [19, 1, 16] },
            { type: 'cleanroom', pos: [15, 1, 17] },
            { type: 'cleanroom', pos: [19, 1, 17] },
            { type: 'cleanroom', pos: [15, 1, 18] },
            { type: 'cleanroom', pos: [19, 1, 18] },
            { type: 'cleanroom', pos: [15, 1, 19] },
            { type: 'cleanroom', pos: [16, 1, 19] },
            { type: 'cleanroom', pos: [17, 1, 19] },
            { type: 'cleanroom', pos: [18, 1, 19] },
            { type: 'cleanroom', pos: [19, 1, 19] },
            // Toit cleanroom
            { type: 'cleanroom', pos: [15, 4, 15] },
            { type: 'cleanroom', pos: [16, 4, 15] },
            { type: 'cleanroom', pos: [17, 4, 15] },
            { type: 'cleanroom', pos: [18, 4, 15] },
            { type: 'cleanroom', pos: [19, 4, 15] },

            // Large Chemical Reactor
            { type: 'lcr', pos: [28, 1, 8], info: 'LARGE CHEMICAL REACTOR: Perfect OC!' },
            { type: 'lcr', pos: [29, 1, 8] },
            { type: 'lcr', pos: [30, 1, 8] },
            { type: 'lcr', pos: [28, 1, 9] },
            { type: 'lcr', pos: [30, 1, 9] },
            { type: 'lcr', pos: [28, 1, 10] },
            { type: 'lcr', pos: [29, 1, 10] },
            { type: 'lcr', pos: [30, 1, 10] },

            // Vacuum Freezer
            { type: 'vacuum_freezer', pos: [28, 1, 20], info: 'VACUUM FREEZER: Titanium!' },
            { type: 'vacuum_freezer', pos: [29, 1, 20] },
            { type: 'vacuum_freezer', pos: [30, 1, 20] },
            { type: 'vacuum_freezer', pos: [28, 2, 20] },
            { type: 'vacuum_freezer', pos: [30, 2, 20] },
            { type: 'vacuum_freezer', pos: [28, 3, 20] },
            { type: 'vacuum_freezer', pos: [29, 3, 20] },
            { type: 'vacuum_freezer', pos: [30, 3, 20] },

            // Distillation Tower
            { type: 'distillation_tower', pos: [35, 1, 8], info: 'DISTILLATION TOWER' },
            { type: 'distillation_tower', pos: [35, 2, 8] },
            { type: 'distillation_tower', pos: [35, 3, 8] },
            { type: 'distillation_tower', pos: [35, 4, 8] },
            { type: 'distillation_tower', pos: [35, 5, 8] },
            { type: 'distillation_tower', pos: [35, 6, 8] },

            // Implosion Compressor
            { type: 'implosion_compressor', pos: [4, 1, 30], info: 'IMPLOSION COMPRESSOR: TNT!' }
        ]
    },

    ev: {
        name: 'Extreme Voltage Base',
        size: { x: 48, y: 14, z: 48 },
        euProduction: '4096 EU/t',
        machines: [
            ...generateFloor(48, 48),
            ...generateWalls(48, 12, 48),

            // Zone énergie EV
            { type: 'ev_machine_hull', pos: [4, 1, 4] },
            { type: 'nuclear_reactor', pos: [8, 1, 4], info: 'NUCLEAR REACTOR: EU massif!' },
            { type: 'large_gas_turbine', pos: [4, 1, 10], info: 'Gas Turbine backup' },

            // AE2 SYSTEM
            { type: 'ae2_controller', pos: [20, 1, 20], info: 'ME CONTROLLER: Cœur AE2' },
            { type: 'ae2_drive', pos: [18, 1, 20], info: 'Stockage ME' },
            { type: 'ae2_drive', pos: [22, 1, 20] },
            { type: 'ae2_drive', pos: [18, 1, 22] },
            { type: 'ae2_drive', pos: [22, 1, 22] },
            { type: 'ae2_interface', pos: [20, 1, 18], info: 'Interface vers machines' },
            { type: 'ae2_interface', pos: [20, 1, 22] },
            { type: 'ae2_interface', pos: [18, 1, 18] },
            { type: 'ae2_interface', pos: [22, 1, 18] },

            // Processing Array
            { type: 'ev_machine_hull', pos: [35, 1, 10], info: 'Zone processing EV' },
            { type: 'ev_machine_hull', pos: [37, 1, 10] },
            { type: 'ev_machine_hull', pos: [39, 1, 10] },
            { type: 'ev_machine_hull', pos: [35, 1, 12] },
            { type: 'ev_machine_hull', pos: [37, 1, 12] },
            { type: 'ev_machine_hull', pos: [39, 1, 12] },

            // Multiblocks zone
            { type: 'lcr', pos: [10, 1, 35], info: 'Large Chemical Reactor' },
            { type: 'vacuum_freezer', pos: [20, 1, 35], info: 'Vacuum Freezer' },
            { type: 'distillation_tower', pos: [30, 1, 35], info: 'Distillation Tower' }
        ]
    }
};

// Génère le sol
function generateFloor(sizeX, sizeZ) {
    const floor = [];
    for (let x = 0; x < sizeX; x++) {
        for (let z = 0; z < sizeZ; z++) {
            floor.push({ type: 'floor', pos: [x, 0, z] });
        }
    }
    return floor;
}

// Génère les murs
function generateWalls(sizeX, height, sizeZ) {
    const walls = [];
    for (let y = 1; y < height; y++) {
        for (let x = 0; x < sizeX; x++) {
            walls.push({ type: 'wall', pos: [x, y, 0] });
            walls.push({ type: 'wall', pos: [x, y, sizeZ - 1] });
        }
        for (let z = 1; z < sizeZ - 1; z++) {
            walls.push({ type: 'wall', pos: [0, y, z] });
            walls.push({ type: 'wall', pos: [sizeX - 1, y, z] });
        }
    }
    return walls;
}

// Initialisation Three.js
function init() {
    const canvas = document.getElementById('canvas');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);
    scene.fog = new THREE.Fog(0x0a0a15, 50, 150);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 25, 30);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 10;
    controls.maxDistance = 100;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 0.3, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(100, 100, 0x333333, 0x222222);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Load initial base
    loadBase('steam');

    // Event listeners
    setupEventListeners();

    // Hide loading
    document.getElementById('loading').classList.add('hidden');

    // Animate
    animate();
}

// Création d'une texture procédurale pour les machines
function createMachineTexture(color, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Base color
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 64, 64);

    // Add some detail based on type
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;

    if (type.includes('boiler') || type.includes('generator')) {
        // Add glow effect for generators
        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        ctx.fillRect(16, 16, 32, 32);
    } else if (type.includes('cable') || type.includes('pipe')) {
        // Lines for cables/pipes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(0, 32);
        ctx.lineTo(64, 32);
        ctx.stroke();
    } else if (type.includes('chest') || type.includes('tank')) {
        // Storage pattern
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(8, 8, 48, 48);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(12, 12, 40, 20);
    } else {
        // Generic machine pattern
        ctx.strokeRect(4, 4, 56, 56);
        ctx.strokeRect(16, 16, 32, 32);
    }

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    return texture;
}

// Charge une base
function loadBase(tier) {
    // Clear existing machines
    machineObjects.forEach(obj => scene.remove(obj));
    machineObjects = [];

    const baseData = BASE_LAYOUTS[tier];
    if (!baseData) return;

    // Update stats
    document.getElementById('currentTier').textContent = baseData.name;
    document.getElementById('machineCount').textContent = baseData.machines.filter(m =>
        !['floor', 'wall'].includes(m.type)
    ).length;
    document.getElementById('euProduction').textContent = baseData.euProduction || baseData.steamProduction || '0';

    // Center camera on base
    const centerX = baseData.size.x / 2;
    const centerZ = baseData.size.z / 2;
    controls.target.set(centerX, 2, centerZ);
    camera.position.set(centerX + baseData.size.x * 0.8, baseData.size.y * 2, centerZ + baseData.size.z * 0.8);

    // Create machines
    baseData.machines.forEach(machine => {
        createMachine(machine);
    });

    // Update legend
    updateLegend(tier);

    currentTier = tier;
}

// Crée un objet machine
function createMachine(machineData) {
    const machineType = MACHINE_TYPES[machineData.type];
    if (!machineType) return;

    const color = machineType.color;
    const size = machineData.type === 'floor' || machineData.type === 'wall' ? 1 : 0.95;

    // Geometry
    let geometry;
    if (machineData.type.includes('pipe') || machineData.type.includes('cable')) {
        geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        geometry.rotateZ(Math.PI / 2);
    } else {
        geometry = new THREE.BoxGeometry(size, size, size);
    }

    // Material avec texture
    const texture = createMachineTexture(color, machineData.type);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: color,
        metalness: 0.3,
        roughness: 0.7,
        transparent: machineData.type === 'floor' || machineData.type === 'wall',
        opacity: machineData.type === 'floor' ? 0.3 : machineData.type === 'wall' ? 0.15 : 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
        machineData.pos[0] + 0.5,
        machineData.pos[1] + 0.5,
        machineData.pos[2] + 0.5
    );

    if (machineData.type !== 'floor' && machineData.type !== 'wall') {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    }

    // Store data for interaction
    mesh.userData = {
        type: machineData.type,
        machineInfo: machineType,
        customInfo: machineData.info
    };

    scene.add(mesh);
    machineObjects.push(mesh);
}

// Mise à jour de la légende
function updateLegend(tier) {
    const legendContent = document.getElementById('legendContent');
    const usedTypes = new Set();

    BASE_LAYOUTS[tier].machines.forEach(m => {
        if (m.type !== 'floor' && m.type !== 'wall') {
            usedTypes.add(m.type);
        }
    });

    legendContent.innerHTML = Array.from(usedTypes).map(type => {
        const info = MACHINE_TYPES[type];
        if (!info) return '';
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: #${info.color.toString(16).padStart(6, '0')}"></div>
                <span>${info.name}</span>
            </div>
        `;
    }).join('');
}

// Event listeners
function setupEventListeners() {
    // Tier buttons
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadBase(btn.dataset.tier);
        });
    });

    // Raycasting for machine selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(machineObjects);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData.type !== 'floor' && obj.userData.type !== 'wall') {
                selectMachine(obj);
            }
        }
    });

    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Sélection d'une machine
function selectMachine(obj) {
    // Reset previous selection
    if (selectedObject) {
        selectedObject.material.emissive.setHex(0x000000);
    }

    selectedObject = obj;
    obj.material.emissive.setHex(0x00d4ff);
    obj.material.emissiveIntensity = 0.3;

    // Show info panel
    const info = obj.userData.machineInfo;
    const panel = document.getElementById('infoPanel');

    document.getElementById('infoName').textContent = info.name;
    document.getElementById('infoType').textContent = info.type;
    document.getElementById('infoDesc').textContent = obj.userData.customInfo || info.desc;

    let specsHtml = '';
    for (const [key, value] of Object.entries(info.specs || {})) {
        specsHtml += `<div><strong>${key}:</strong> ${value}</div>`;
    }
    document.getElementById('infoSpecs').innerHTML = specsHtml || '<div>Aucune spec</div>';

    panel.classList.add('visible');
}

function hideInfo() {
    document.getElementById('infoPanel').classList.remove('visible');
    if (selectedObject) {
        selectedObject.material.emissive.setHex(0x000000);
        selectedObject = null;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Start
window.addEventListener('load', init);
