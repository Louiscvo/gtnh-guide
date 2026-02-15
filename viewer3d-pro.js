// GTNH 3D Base Viewer - Version Professionnelle
// Utilise les vraies textures GTNH et la base de données complète

let scene, camera, renderer, controls;
let textureLoader;
let machineObjects = [];
let selectedObject = null;
let currentTier = 'steam';
let loadedTextures = {};

// Configuration des textures par type de machine
const TEXTURE_CONFIG = {
    // GregTech Multiblocks
    'ebf': { path: 'textures/gregtech/OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE.png', color: 0xFF4500 },
    'ebf_active': { path: 'textures/gregtech/OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE.png', color: 0xFF6600 },
    'vacuum_freezer': { path: 'textures/gregtech/OVERLAY_FRONT_VACUUM_FREEZER.png', color: 0x87CEEB },
    'implosion_compressor': { path: 'textures/gregtech/OVERLAY_FRONT_IMPLOSION_COMPRESSOR.png', color: 0x708090 },
    'distillation_tower': { path: 'textures/gregtech/OVERLAY_FRONT_DISTILLATION_TOWER.png', color: 0xFFFACD },
    'multi_smelter': { path: 'textures/gregtech/OVERLAY_FRONT_MULTI_SMELTER.png', color: 0xFF8C00 },
    'oil_cracker': { path: 'textures/gregtech/OVERLAY_FRONT_OIL_CRACKER.png', color: 0x2F4F4F },
    'pyrolyse_oven': { path: 'textures/gregtech/OVERLAY_FRONT_PYROLYSE_OVEN.png', color: 0xFF8C00 },
    'assembly_line': { path: 'textures/gregtech/OVERLAY_FRONT_ASSEMBLY_LINE.png', color: 0x4169E1 },
    'lcr': { path: 'textures/gregtech/OVERLAY_FRONT_LARGE_CHEMICAL_REACTOR.png', color: 0xFFFF99 },
    'large_turbine': { path: 'textures/gregtech/OVERLAY_FRONT_LARGE_TURBINE.png', color: 0x3CB371 },
    'large_boiler': { path: 'textures/gregtech/OVERLAY_FRONT_LARGE_BOILER.png', color: 0x8B0000 },
    'heat_exchanger': { path: 'textures/gregtech/OVERLAY_FRONT_HEAT_EXCHANGER.png', color: 0xFF6347 },
    'scanner': { path: 'textures/gregtech/OVERLAY_FRONT_SCANNER.png', color: 0x00CED1 },

    // GregTech Casings
    'casing_steel': { path: 'textures/gregtech/MACHINE_CASING_SOLID_STEEL.png', color: 0x71797E },
    'casing_tungstensteel': { path: 'textures/gregtech/MACHINE_CASING_ROBUST_TUNGSTENSTEEL.png', color: 0x4A4A4A },
    'casing_stainless': { path: 'textures/gregtech/MACHINE_CASING_CLEAN_STAINLESSSTEEL.png', color: 0xC0C0C0 },
    'casing_titanium': { path: 'textures/gregtech/MACHINE_CASING_STABLE_TITANIUM.png', color: 0xB8B8B8 },
    'casing_fusion': { path: 'textures/gregtech/MACHINE_CASING_FUSION.png', color: 0x9400D3 },
    'coil_fusion': { path: 'textures/gregtech/MACHINE_CASING_FUSION_COIL.png', color: 0xFF00FF },

    // GregTech Hulls par tier
    'hull_lv': { path: 'textures/gregtech/MACHINE_LV_SIDE.png', color: 0xDCDCDC },
    'hull_mv': { path: 'textures/gregtech/MACHINE_MV_SIDE.png', color: 0xFF6400 },
    'hull_hv': { path: 'textures/gregtech/MACHINE_HV_SIDE.png', color: 0xFFFF00 },
    'hull_ev': { path: 'textures/gregtech/MACHINE_EV_SIDE.png', color: 0x808080 },
    'hull_iv': { path: 'textures/gregtech/MACHINE_IV_SIDE.png', color: 0xF0F0F5 },

    // GregTech Hatches
    'energy_hatch': { path: 'textures/gregtech/OVERLAY_ENERGY_IN.png', color: 0xFFD700 },
    'dynamo_hatch': { path: 'textures/gregtech/OVERLAY_ENERGY_OUT.png', color: 0x32CD32 },
    'input_hatch': { path: 'textures/gregtech/OVERLAY_PIPE_IN.png', color: 0x4169E1 },
    'output_hatch': { path: 'textures/gregtech/OVERLAY_PIPE_OUT.png', color: 0xFF4500 },
    'maintenance_hatch': { path: 'textures/gregtech/OVERLAY_MAINTENANCE.png', color: 0xFFA500 },
    'muffler_hatch': { path: 'textures/gregtech/OVERLAY_MUFFLER.png', color: 0x696969 },

    // AE2
    'me_controller': { path: 'textures/ae2/BlockControllerLights.png', color: 0x00CED1 },
    'me_drive': { path: 'textures/ae2/BlockDrive.png', color: 0x20B2AA },
    'me_interface': { path: 'textures/ae2/BlockInterface.png', color: 0x48D1CC },
    'molecular_assembler': { path: 'textures/ae2/BlockMolecularAssembler.png', color: 0x40E0D0 },
    'inscriber': { path: 'textures/ae2/BlockInscriber.png', color: 0x5F9EA0 },
    'crafting_storage': { path: 'textures/ae2/BlockCraftingStorage.png', color: 0x00BFFF },
    'crafting_unit': { path: 'textures/ae2/BlockCraftingUnit.png', color: 0x87CEEB },
    'crafting_monitor': { path: 'textures/ae2/BlockCraftingMonitor.png', color: 0x00CED1 },
    'me_chest': { path: 'textures/ae2/BlockChest.png', color: 0x708090 },
    'charger': { path: 'textures/ae2/BlockCharger.png', color: 0xFFD700 },
    'energy_cell': { path: 'textures/ae2/BlockEnergyCell.png', color: 0x32CD32 },
    'dense_energy_cell': { path: 'textures/ae2/BlockDenseEnergyCell.png', color: 0x228B22 },
    'condenser': { path: 'textures/ae2/BlockCondenser.png', color: 0x2F4F4F },
    'grinder': { path: 'textures/ae2/BlockGrinder.png', color: 0x696969 },
    'spatial_io': { path: 'textures/ae2/BlockSpatialIOPort.png', color: 0x9400D3 },
    'quantum_ring': { path: 'textures/ae2/BlockQuantumRing.png', color: 0xFF00FF },
    'quantum_link': { path: 'textures/ae2/BlockQuantumLinkChamber.png', color: 0xDA70D6 },
    'io_port': { path: 'textures/ae2/BlockIOPort.png', color: 0x4682B4 },
    'energy_acceptor': { path: 'textures/ae2/BlockEnergyAcceptor.png', color: 0xFFD700 },

    // EnderIO
    'alloy_smelter_eio': { path: 'textures/enderio/alloySmelterFront.png', color: 0xFF4500 },
    'dark_steel_block': { path: 'textures/enderio/darkSteelBlock.png', color: 0x1C1C1C },
    'electrical_steel': { path: 'textures/enderio/electricalSteelBlock.png', color: 0x708090 },
    'energetic_alloy': { path: 'textures/enderio/energeticAlloyBlock.png', color: 0xFFA500 },
    'powered_spawner': { path: 'textures/enderio/poweredSpawnerFront.png', color: 0x8B0000 },

    // Botania
    'runic_altar': { path: 'textures/botania/runeAltar0.png', color: 0x9400D3 },
    'terra_plate': { path: 'textures/botania/terraPlate0.png', color: 0x32CD32 },
    'alfheim_portal': { path: 'textures/botania/alfheimPortal0.png', color: 0x00FF7F },
    'open_crate': { path: 'textures/botania/openCrate0.png', color: 0x8B4513 },

    // Tinkers
    'casting_table': { path: 'textures/tinkers/castingtable_top.png', color: 0x8B4513 },

    // Forestry
    'analyzer': { path: 'textures/forestry/analyzer.0.png', color: 0xFFD700 },

    // Blood Magic
    'ritual_stone': { path: 'textures/bloodmagic/RitualStone.png', color: 0x8B0000 }
};

// Données des machines complètes (fusionnées depuis gtnh-machines-complete.json)
const MACHINE_DATA = {
    // === STEAM AGE ===
    'small_coal_boiler': {
        name: 'Small Coal Boiler',
        nameFr: 'Petite Chaudière Charbon',
        type: 'Générateur',
        tier: 'Steam',
        color: 0x8B4513,
        desc: 'Produit 6 L/t de vapeur avec du charbon.',
        specs: { output: '6 L/t Steam', fuel: 'Charbon' }
    },
    'hp_coal_boiler': {
        name: 'HP Coal Boiler',
        nameFr: 'Chaudière HP Charbon',
        type: 'Générateur',
        tier: 'Steam',
        color: 0x654321,
        desc: 'Version améliorée: 15 L/t de vapeur.',
        specs: { output: '15 L/t Steam', fuel: 'Charbon' }
    },
    'steam_macerator': {
        name: 'Steam Macerator',
        nameFr: 'Macérateur Vapeur',
        type: 'Ore Processing',
        tier: 'Steam',
        color: 0xB8860B,
        desc: 'Double le rendement des minerais!',
        specs: { steam: '4 L/t' }
    },
    'steam_alloy_smelter': {
        name: 'Steam Alloy Smelter',
        nameFr: 'Fonderie Vapeur',
        type: 'Processing',
        tier: 'Steam',
        color: 0xCD853F,
        desc: 'Fond et allie les métaux. Bronze!',
        specs: { steam: '32 L/t' }
    },
    'steam_forge_hammer': {
        name: 'Steam Forge Hammer',
        nameFr: 'Marteau Vapeur',
        type: 'Processing',
        tier: 'Steam',
        color: 0xA0522D,
        desc: 'Crée des plaques (2 pour 3 lingots).',
        specs: { steam: '32 L/t' }
    },
    'steam_compressor': {
        name: 'Steam Compressor',
        nameFr: 'Compresseur Vapeur',
        type: 'Processing',
        tier: 'Steam',
        color: 0xD2691E,
        desc: 'Compresse les items.',
        specs: { steam: '4 L/t' }
    },
    'steam_extractor': {
        name: 'Steam Extractor',
        nameFr: 'Extracteur Vapeur',
        type: 'Processing',
        tier: 'Steam',
        color: 0xDEB887,
        desc: 'Extrait items des blocs.',
        specs: { steam: '4 L/t' }
    },
    'bbf': {
        name: 'Bricked Blast Furnace',
        nameFr: 'Haut Fourneau',
        type: 'Multiblock',
        tier: 'Steam',
        color: 0x8B0000,
        textureKey: 'large_boiler',
        desc: 'Premier multiblock - produit de l\'acier!',
        specs: { size: '3x3x4', output: 'Steel' }
    },
    'coke_oven': {
        name: 'Coke Oven',
        nameFr: 'Four à Coke',
        type: 'Multiblock',
        tier: 'Steam',
        color: 0x4A4A4A,
        desc: 'Produit coke et créosote.',
        specs: { size: '3x3x3' }
    },
    'bronze_tank': {
        name: 'Bronze Tank',
        nameFr: 'Réservoir Bronze',
        type: 'Storage',
        tier: 'Steam',
        color: 0xCD7F32,
        desc: 'Stocke vapeur et fluides.',
        specs: { capacity: '16000 L' }
    },

    // === LV (32 EU/t) ===
    'lv_hull': {
        name: 'LV Machine Hull',
        nameFr: 'Châssis LV',
        type: 'Component',
        tier: 'LV',
        color: 0xDCDCDC,
        textureKey: 'hull_lv',
        desc: 'Base pour machines LV.',
        specs: { voltage: '32 EU/t' }
    },
    'ebf': {
        name: 'Electric Blast Furnace',
        nameFr: 'Four Électrique',
        type: 'Multiblock',
        tier: 'LV',
        color: 0xFF4500,
        textureKey: 'ebf',
        desc: 'CRITIQUE: Fond matériaux haute température!',
        specs: { size: '3x3x4', coils: 'Cupronickel+' }
    },
    'lv_macerator': {
        name: 'LV Macerator',
        nameFr: 'Macérateur LV',
        type: 'Ore Processing',
        tier: 'LV',
        color: 0xC0C0C0,
        textureKey: 'hull_lv',
        desc: 'Double minerais électriquement.',
        specs: { power: '2 EU/t' }
    },
    'lv_wiremill': {
        name: 'LV Wiremill',
        nameFr: 'Tréfileuse LV',
        type: 'Processing',
        tier: 'LV',
        color: 0xA9A9A9,
        textureKey: 'hull_lv',
        desc: 'Produit fils pour câbles.',
        specs: { power: '2 EU/t' }
    },
    'lv_bender': {
        name: 'LV Bending Machine',
        nameFr: 'Plieuse LV',
        type: 'Processing',
        tier: 'LV',
        color: 0x808080,
        textureKey: 'hull_lv',
        desc: 'Crée plaques, tiges, câbles.',
        specs: { power: '2 EU/t' }
    },
    'lv_assembler': {
        name: 'LV Assembler',
        nameFr: 'Assembleur LV',
        type: 'Processing',
        tier: 'LV',
        color: 0x696969,
        textureKey: 'hull_lv',
        desc: 'Assemble composants.',
        specs: { power: '2 EU/t' }
    },
    'lv_electrolyzer': {
        name: 'LV Electrolyzer',
        nameFr: 'Électrolyseur LV',
        type: 'Processing',
        tier: 'LV',
        color: 0x4682B4,
        textureKey: 'hull_lv',
        desc: 'Électrolyse - Gallium!',
        specs: { power: '2 EU/t' }
    },
    'lv_centrifuge': {
        name: 'LV Centrifuge',
        nameFr: 'Centrifugeuse LV',
        type: 'Processing',
        tier: 'LV',
        color: 0x5F9EA0,
        textureKey: 'hull_lv',
        desc: 'Sépare par densité.',
        specs: { power: '5 EU/t' }
    },
    'lv_alloy_smelter': {
        name: 'LV Alloy Smelter',
        nameFr: 'Fonderie LV',
        type: 'Processing',
        tier: 'LV',
        color: 0xFF6347,
        textureKey: 'hull_lv',
        desc: 'Fond alliages.',
        specs: { power: '4 EU/t' }
    },
    'lv_steam_turbine': {
        name: 'LV Steam Turbine',
        nameFr: 'Turbine Vapeur LV',
        type: 'Générateur',
        tier: 'LV',
        color: 0x228B22,
        desc: 'Convertit vapeur en EU.',
        specs: { output: '32 EU/t max' }
    },
    'battery_buffer_lv': {
        name: 'LV Battery Buffer',
        nameFr: 'Buffer Batteries LV',
        type: 'Storage',
        tier: 'LV',
        color: 0xFFD700,
        desc: 'Stocke énergie.',
        specs: { slots: '4-16' }
    },

    // === MV (128 EU/t) ===
    'mv_hull': {
        name: 'MV Machine Hull',
        nameFr: 'Châssis MV',
        type: 'Component',
        tier: 'MV',
        color: 0xFF6400,
        textureKey: 'hull_mv',
        desc: 'Base pour machines MV.',
        specs: { voltage: '128 EU/t' }
    },
    'pyrolyse_oven': {
        name: 'Pyrolyse Oven',
        nameFr: 'Four Pyrolyse',
        type: 'Multiblock',
        tier: 'MV',
        color: 0xFF8C00,
        textureKey: 'pyrolyse_oven',
        desc: 'Charbon de bois et gaz - Éthylène!',
        specs: { size: '5x4x5' }
    },
    'mv_chemical_reactor': {
        name: 'MV Chemical Reactor',
        nameFr: 'Réacteur Chimique MV',
        type: 'Processing',
        tier: 'MV',
        color: 0xFFA500,
        textureKey: 'hull_mv',
        desc: 'Réactions chimiques - Polyéthylène!',
        specs: { power: '30 EU/t' }
    },
    'diesel_generator': {
        name: 'Diesel Generator',
        nameFr: 'Générateur Diesel',
        type: 'Générateur',
        tier: 'MV',
        color: 0x2F4F4F,
        desc: 'Génère EU avec diesel.',
        specs: { output: '128 EU/t max' }
    },

    // === HV (512 EU/t) ===
    'hv_hull': {
        name: 'HV Machine Hull',
        nameFr: 'Châssis HV',
        type: 'Component',
        tier: 'HV',
        color: 0xFFFF00,
        textureKey: 'hull_hv',
        desc: 'Base pour machines HV.',
        specs: { voltage: '512 EU/t' }
    },
    'cleanroom': {
        name: 'Cleanroom',
        nameFr: 'Salle Blanche',
        type: 'Multiblock',
        tier: 'HV',
        color: 0xF0FFFF,
        desc: 'OBLIGATOIRE pour circuits avancés!',
        specs: { size: 'Variable', purity: '100%' }
    },
    'lcr': {
        name: 'Large Chemical Reactor',
        nameFr: 'Grand Réacteur Chimique',
        type: 'Multiblock',
        tier: 'HV',
        color: 0xFFFF99,
        textureKey: 'lcr',
        desc: 'CRITIQUE: Perfect overclocks!',
        specs: { bonus: '4x speed/4x power' }
    },
    'distillation_tower': {
        name: 'Distillation Tower',
        nameFr: 'Tour Distillation',
        type: 'Multiblock',
        tier: 'HV',
        color: 0xFFFACD,
        textureKey: 'distillation_tower',
        desc: 'Distille pétrole efficacement.',
        specs: { layers: '12+' }
    },
    'vacuum_freezer': {
        name: 'Vacuum Freezer',
        nameFr: 'Congélateur Vide',
        type: 'Multiblock',
        tier: 'HV',
        color: 0x87CEEB,
        textureKey: 'vacuum_freezer',
        desc: 'CRITIQUE: Congèle - Titane!',
        specs: { size: '3x3x3' }
    },
    'implosion_compressor': {
        name: 'Implosion Compressor',
        nameFr: 'Compresseur Implosion',
        type: 'Multiblock',
        tier: 'HV',
        color: 0x708090,
        textureKey: 'implosion_compressor',
        desc: 'Utilise TNT pour compresser.',
        specs: { explosive: 'TNT/ITNT' }
    },
    'oil_cracker': {
        name: 'Oil Cracking Unit',
        nameFr: 'Unité Craquage',
        type: 'Multiblock',
        tier: 'HV',
        color: 0x2F4F4F,
        textureKey: 'oil_cracker',
        desc: 'Craque pétrole.',
        specs: { size: '5x3x3' }
    },

    // === EV (2048 EU/t) ===
    'ev_hull': {
        name: 'EV Machine Hull',
        nameFr: 'Châssis EV',
        type: 'Component',
        tier: 'EV',
        color: 0x808080,
        textureKey: 'hull_ev',
        desc: 'Base pour machines EV.',
        specs: { voltage: '2048 EU/t' }
    },
    'multi_smelter': {
        name: 'Multi Smelter',
        nameFr: 'Multi-Four',
        type: 'Multiblock',
        tier: 'EV',
        color: 0xFF8C00,
        textureKey: 'multi_smelter',
        desc: 'Four multiblock parallèle.',
        specs: { parallels: '8-256' }
    },
    'ae2_controller': {
        name: 'ME Controller',
        nameFr: 'Contrôleur ME',
        type: 'AE2',
        tier: 'EV',
        color: 0x00CED1,
        textureKey: 'me_controller',
        desc: 'Cœur du système AE2!',
        specs: { channels: '32/face' }
    },
    'ae2_drive': {
        name: 'ME Drive',
        nameFr: 'Lecteur ME',
        type: 'AE2',
        tier: 'EV',
        color: 0x20B2AA,
        textureKey: 'me_drive',
        desc: 'Stockage cellules ME.',
        specs: { slots: '10' }
    },
    'ae2_interface': {
        name: 'ME Interface',
        nameFr: 'Interface ME',
        type: 'AE2',
        tier: 'EV',
        color: 0x48D1CC,
        textureKey: 'me_interface',
        desc: 'Interface avec machines.',
        specs: { patterns: '9' }
    },
    'molecular_assembler': {
        name: 'Molecular Assembler',
        nameFr: 'Assembleur Moléculaire',
        type: 'AE2',
        tier: 'EV',
        color: 0x40E0D0,
        textureKey: 'molecular_assembler',
        desc: 'Craft automatique patterns.',
        specs: { speed: 'Variable' }
    },
    'inscriber': {
        name: 'Inscriber',
        nameFr: 'Inscripteur',
        type: 'AE2',
        tier: 'EV',
        color: 0x5F9EA0,
        textureKey: 'inscriber',
        desc: 'Crée processeurs AE2.',
        specs: { recipes: 'Processors' }
    },
    'crafting_cpu': {
        name: 'Crafting CPU',
        nameFr: 'CPU Craft',
        type: 'AE2',
        tier: 'EV',
        color: 0x00BFFF,
        textureKey: 'crafting_storage',
        desc: 'Autocrafting CPU.',
        specs: { storage: '1k-64k' }
    },
    'nuclear_reactor': {
        name: 'Nuclear Reactor',
        nameFr: 'Réacteur Nucléaire',
        type: 'Générateur',
        tier: 'EV',
        color: 0x32CD32,
        desc: 'Génération nucléaire massive!',
        specs: { output: 'Variable' }
    },
    'large_gas_turbine': {
        name: 'Large Gas Turbine',
        nameFr: 'Grande Turbine Gaz',
        type: 'Multiblock',
        tier: 'EV',
        color: 0x3CB371,
        textureKey: 'large_turbine',
        desc: 'Génération gaz efficace.',
        specs: { output: 'High' }
    },

    // === IV (8192 EU/t) ===
    'iv_hull': {
        name: 'IV Machine Hull',
        nameFr: 'Châssis IV',
        type: 'Component',
        tier: 'IV',
        color: 0xF0F0F5,
        textureKey: 'hull_iv',
        desc: 'Base pour machines IV.',
        specs: { voltage: '8192 EU/t' }
    },
    'assembly_line': {
        name: 'Assembly Line',
        nameFr: 'Ligne Assemblage',
        type: 'Multiblock',
        tier: 'IV',
        color: 0x4169E1,
        textureKey: 'assembly_line',
        desc: 'CRITIQUE: Porte vers LuV!',
        specs: { size: 'Variable' }
    },
    'volcanus': {
        name: 'Volcanus',
        nameFr: 'Volcanus',
        type: 'Multiblock',
        tier: 'IV',
        color: 0xFF4500,
        textureKey: 'ebf',
        desc: 'EBF amélioré - 8 parallèles.',
        specs: { bonus: '20% faster, 90% EU' }
    },
    'mega_vacuum_freezer': {
        name: 'Mega Vacuum Freezer',
        nameFr: 'Méga Congélateur',
        type: 'Multiblock',
        tier: 'IV',
        color: 0x87CEEB,
        textureKey: 'vacuum_freezer',
        desc: '256 recettes parallèles!',
        specs: { parallels: '256' }
    },

    // === UTILITY ===
    'cable_lv': { name: 'LV Cable', nameFr: 'Câble LV', type: 'Cable', tier: 'LV', color: 0xDCDCDC, desc: 'Transporte 32 EU/t.', specs: { amperage: '1-4A' } },
    'cable_mv': { name: 'MV Cable', nameFr: 'Câble MV', type: 'Cable', tier: 'MV', color: 0xFF6400, desc: 'Transporte 128 EU/t.', specs: { amperage: '1-4A' } },
    'cable_hv': { name: 'HV Cable', nameFr: 'Câble HV', type: 'Cable', tier: 'HV', color: 0xFFFF00, desc: 'Transporte 512 EU/t.', specs: { amperage: '1-4A' } },
    'cable_ev': { name: 'EV Cable', nameFr: 'Câble EV', type: 'Cable', tier: 'EV', color: 0x808080, desc: 'Transporte 2048 EU/t.', specs: { amperage: '1-4A' } },
    'pipe_bronze': { name: 'Bronze Pipe', nameFr: 'Tuyau Bronze', type: 'Pipe', tier: 'Steam', color: 0xCD7F32, desc: 'Transporte vapeur.', specs: { throughput: '120 L/t' } },
    'pipe_steel': { name: 'Steel Pipe', nameFr: 'Tuyau Acier', type: 'Pipe', tier: 'LV', color: 0x71797E, desc: 'Pipe améliorée.', specs: { throughput: '360 L/t' } },
    'chest': { name: 'Chest', nameFr: 'Coffre', type: 'Storage', tier: 'Steam', color: 0x8B4513, desc: 'Stockage basique.', specs: { slots: '27' } },
    'super_chest': { name: 'Super Chest', nameFr: 'Super Coffre', type: 'Storage', tier: 'LV', color: 0x4169E1, desc: 'Stockage massif.', specs: { capacity: '1M items' } },
    'transformer': { name: 'Transformer', nameFr: 'Transformateur', type: 'Power', tier: 'LV', color: 0x9932CC, desc: 'Convertit voltages.', specs: { ratio: '1:4' } },
    'floor': { name: 'Floor', nameFr: 'Sol', type: 'Structure', tier: 'all', color: 0x2F2F2F, desc: 'Sol de la base.', specs: {} },
    'wall': { name: 'Wall', nameFr: 'Mur', type: 'Structure', tier: 'all', color: 0x3D3D3D, desc: 'Mur de la base.', specs: {} },
    'coil_cupronickel': { name: 'Cupronickel Coil', nameFr: 'Bobine Cupronickel', type: 'Component', tier: 'LV', color: 0xFFD700, desc: 'Bobine EBF - 1800K.', specs: { heat: '1800K' } },
    'coil_kanthal': { name: 'Kanthal Coil', nameFr: 'Bobine Kanthal', type: 'Component', tier: 'MV', color: 0xFF8C00, desc: 'Bobine EBF - 2700K.', specs: { heat: '2700K' } },
    'coil_nichrome': { name: 'Nichrome Coil', nameFr: 'Bobine Nichrome', type: 'Component', tier: 'HV', color: 0xFF4500, desc: 'Bobine EBF - 3600K.', specs: { heat: '3600K' } }
};

// Initialisation
function init() {
    const canvas = document.getElementById('canvas');

    // Renderer avec antialiasing
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);
    scene.fog = new THREE.Fog(0x0a0a15, 50, 150);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(25, 20, 25);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(8, 2, 8);

    // Texture loader
    textureLoader = new THREE.TextureLoader();

    // Éclairage amélioré
    setupLighting();

    // Grille de référence
    createGrid();

    // Précharger les textures
    preloadTextures().then(() => {
        // Charger la base initiale
        loadBase(currentTier);
        document.getElementById('loading').classList.add('hidden');
    });

    // Events
    setupEvents();

    // Animation loop
    animate();
}

function setupLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(30, 50, 30);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8080ff, 0.3);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x362312, 0.3);
    scene.add(hemiLight);
}

function createGrid() {
    const gridHelper = new THREE.GridHelper(50, 50, 0x333355, 0x222233);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);
}

async function preloadTextures() {
    const promises = [];

    for (const [key, config] of Object.entries(TEXTURE_CONFIG)) {
        promises.push(
            new Promise((resolve) => {
                textureLoader.load(
                    config.path,
                    (texture) => {
                        texture.magFilter = THREE.NearestFilter;
                        texture.minFilter = THREE.NearestMipMapLinearFilter;
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        loadedTextures[key] = texture;
                        resolve();
                    },
                    undefined,
                    () => {
                        // Texture not found, use color fallback
                        loadedTextures[key] = null;
                        resolve();
                    }
                );
            })
        );
    }

    await Promise.all(promises);
    console.log(`Loaded ${Object.keys(loadedTextures).length} textures`);
}

function createMachine(machineId, position, rotation = 0) {
    const data = MACHINE_DATA[machineId];
    if (!data) {
        console.warn(`Machine inconnue: ${machineId}`);
        return null;
    }

    // Déterminer la taille selon le type
    let size = [1, 1, 1];
    if (data.type === 'Multiblock') {
        if (machineId === 'ebf' || machineId === 'bbf') size = [3, 4, 3];
        else if (machineId === 'distillation_tower') size = [3, 12, 3];
        else if (machineId === 'cleanroom') size = [5, 4, 5];
        else if (machineId === 'assembly_line') size = [5, 3, 7];
        else if (machineId === 'pyrolyse_oven') size = [5, 4, 5];
        else size = [3, 3, 3];
    } else if (data.type === 'Cable' || data.type === 'Pipe') {
        size = [0.3, 0.3, 1];
    }

    // Géométrie
    const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);

    // Matériau avec texture ou couleur
    let material;
    const textureKey = data.textureKey || machineId;

    if (loadedTextures[textureKey] && loadedTextures[textureKey] !== null) {
        material = new THREE.MeshStandardMaterial({
            map: loadedTextures[textureKey],
            roughness: 0.7,
            metalness: 0.3
        });
    } else {
        // Fallback: couleur avec effet métallique
        material = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.6,
            metalness: 0.4,
            flatShading: false
        });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
        position[0] + size[0]/2,
        position[1] + size[1]/2,
        position[2] + size[2]/2
    );
    mesh.rotation.y = rotation * Math.PI / 180;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Données pour interaction
    mesh.userData = {
        machineId,
        ...data,
        position
    };

    return mesh;
}

// Définition des bases par tier
const BASE_LAYOUTS = {
    steam: {
        name: 'Base Steam Age',
        size: { x: 16, y: 6, z: 16 },
        euProduction: '0 EU/t',
        steamProduction: '60 L/t',
        machines: [
            // Zone chaudières
            { id: 'small_coal_boiler', pos: [2, 0, 2] },
            { id: 'small_coal_boiler', pos: [4, 0, 2] },
            { id: 'hp_coal_boiler', pos: [6, 0, 2] },
            { id: 'bronze_tank', pos: [4, 0, 4] },

            // Pipes vapeur
            { id: 'pipe_bronze', pos: [3, 0, 3] },
            { id: 'pipe_bronze', pos: [4, 0, 3] },
            { id: 'pipe_bronze', pos: [5, 0, 3] },
            { id: 'pipe_bronze', pos: [4, 0, 5] },
            { id: 'pipe_bronze', pos: [4, 0, 6] },

            // Zone processing
            { id: 'steam_macerator', pos: [2, 0, 7] },
            { id: 'steam_alloy_smelter', pos: [4, 0, 7] },
            { id: 'steam_forge_hammer', pos: [6, 0, 7] },
            { id: 'steam_compressor', pos: [2, 0, 9] },
            { id: 'steam_extractor', pos: [4, 0, 9] },

            // Multiblocks
            { id: 'bbf', pos: [10, 0, 2] },
            { id: 'coke_oven', pos: [10, 0, 8] },

            // Stockage
            { id: 'chest', pos: [8, 0, 7] },
            { id: 'chest', pos: [8, 0, 8] },
            { id: 'bronze_tank', pos: [8, 0, 9] }
        ]
    },
    lv: {
        name: 'Base Low Voltage',
        size: { x: 20, y: 8, z: 20 },
        euProduction: '64 EU/t',
        steamProduction: '0 L/t',
        machines: [
            // Génération
            { id: 'lv_steam_turbine', pos: [2, 0, 2] },
            { id: 'lv_steam_turbine', pos: [4, 0, 2] },
            { id: 'battery_buffer_lv', pos: [6, 0, 2] },

            // Câbles power
            { id: 'cable_lv', pos: [3, 0, 3] },
            { id: 'cable_lv', pos: [4, 0, 3] },
            { id: 'cable_lv', pos: [5, 0, 3] },
            { id: 'cable_lv', pos: [6, 0, 3] },
            { id: 'cable_lv', pos: [6, 0, 4] },
            { id: 'cable_lv', pos: [6, 0, 5] },

            // EBF - Multiblock critique!
            { id: 'ebf', pos: [10, 0, 2] },
            { id: 'coil_cupronickel', pos: [11, 1, 3] },
            { id: 'energy_hatch', pos: [10, 0, 4], textureKey: 'energy_hatch' },
            { id: 'input_hatch', pos: [12, 0, 4], textureKey: 'input_hatch' },
            { id: 'output_hatch', pos: [10, 0, 5], textureKey: 'output_hatch' },
            { id: 'muffler_hatch', pos: [11, 4, 3], textureKey: 'muffler_hatch' },
            { id: 'maintenance_hatch', pos: [12, 0, 5], textureKey: 'maintenance_hatch' },

            // Zone processing
            { id: 'lv_macerator', pos: [2, 0, 7] },
            { id: 'lv_alloy_smelter', pos: [4, 0, 7] },
            { id: 'lv_wiremill', pos: [6, 0, 7] },
            { id: 'lv_bender', pos: [2, 0, 9] },
            { id: 'lv_assembler', pos: [4, 0, 9] },
            { id: 'lv_electrolyzer', pos: [6, 0, 9] },
            { id: 'lv_centrifuge', pos: [2, 0, 11] },

            // Stockage
            { id: 'super_chest', pos: [8, 0, 7] },
            { id: 'chest', pos: [8, 0, 8] },
            { id: 'transformer', pos: [8, 0, 9] }
        ]
    },
    mv: {
        name: 'Base Medium Voltage',
        size: { x: 24, y: 10, z: 24 },
        euProduction: '256 EU/t',
        steamProduction: '0 L/t',
        machines: [
            // Génération
            { id: 'diesel_generator', pos: [2, 0, 2] },
            { id: 'diesel_generator', pos: [4, 0, 2] },
            { id: 'transformer', pos: [6, 0, 2] },

            // Pyrolyse Oven
            { id: 'pyrolyse_oven', pos: [10, 0, 2] },

            // Chemical Reactor (important pour polymères)
            { id: 'mv_chemical_reactor', pos: [2, 0, 8] },
            { id: 'mv_chemical_reactor', pos: [4, 0, 8] },

            // EBF upgraded
            { id: 'ebf', pos: [16, 0, 2] },
            { id: 'coil_kanthal', pos: [17, 1, 3] },

            // Processing MV
            { id: 'mv_hull', pos: [2, 0, 12] },
            { id: 'mv_hull', pos: [4, 0, 12] },
            { id: 'mv_hull', pos: [6, 0, 12] }
        ]
    },
    hv: {
        name: 'Base High Voltage',
        size: { x: 28, y: 14, z: 28 },
        euProduction: '1024 EU/t',
        steamProduction: '0 L/t',
        machines: [
            // Cleanroom (obligatoire!)
            { id: 'cleanroom', pos: [2, 0, 2] },

            // LCR - Large Chemical Reactor
            { id: 'lcr', pos: [10, 0, 2] },

            // Distillation Tower
            { id: 'distillation_tower', pos: [16, 0, 2] },

            // Vacuum Freezer (Titanium!)
            { id: 'vacuum_freezer', pos: [2, 0, 10] },

            // Implosion Compressor
            { id: 'implosion_compressor', pos: [8, 0, 10] },

            // Oil Cracker
            { id: 'oil_cracker', pos: [14, 0, 10] },

            // EBF avec Nichrome
            { id: 'ebf', pos: [20, 0, 2] },
            { id: 'coil_nichrome', pos: [21, 1, 3] },

            // Hulls HV
            { id: 'hv_hull', pos: [2, 0, 16] },
            { id: 'hv_hull', pos: [4, 0, 16] },
            { id: 'hv_hull', pos: [6, 0, 16] }
        ]
    },
    ev: {
        name: 'Base Extreme Voltage',
        size: { x: 32, y: 16, z: 32 },
        euProduction: '4096 EU/t',
        steamProduction: '0 L/t',
        machines: [
            // AE2 System complet
            { id: 'ae2_controller', pos: [2, 0, 2] },
            { id: 'ae2_controller', pos: [3, 0, 2] },
            { id: 'ae2_controller', pos: [2, 0, 3] },
            { id: 'ae2_drive', pos: [5, 0, 2] },
            { id: 'ae2_drive', pos: [6, 0, 2] },
            { id: 'ae2_interface', pos: [5, 0, 4] },
            { id: 'molecular_assembler', pos: [6, 0, 4] },
            { id: 'molecular_assembler', pos: [7, 0, 4] },
            { id: 'inscriber', pos: [5, 0, 6] },
            { id: 'crafting_cpu', pos: [8, 0, 2] },
            { id: 'crafting_cpu', pos: [9, 0, 2] },
            { id: 'crafting_cpu', pos: [8, 0, 3] },
            { id: 'crafting_cpu', pos: [9, 0, 3] },

            // Multi Smelter
            { id: 'multi_smelter', pos: [14, 0, 2] },

            // Large Gas Turbine
            { id: 'large_gas_turbine', pos: [20, 0, 2] },

            // Nuclear Reactor
            { id: 'nuclear_reactor', pos: [26, 0, 2] },

            // Processing EV
            { id: 'ev_hull', pos: [2, 0, 12] },
            { id: 'ev_hull', pos: [4, 0, 12] },
            { id: 'ev_hull', pos: [6, 0, 12] },
            { id: 'scanner', pos: [8, 0, 12], textureKey: 'scanner' }
        ]
    },
    iv: {
        name: 'Base Insane Voltage',
        size: { x: 36, y: 18, z: 36 },
        euProduction: '16384 EU/t',
        steamProduction: '0 L/t',
        machines: [
            // Assembly Line (porte vers LuV!)
            { id: 'assembly_line', pos: [2, 0, 2] },

            // Volcanus (EBF amélioré)
            { id: 'volcanus', pos: [12, 0, 2] },

            // Mega Vacuum Freezer
            { id: 'mega_vacuum_freezer', pos: [20, 0, 2] },

            // AE2 étendu
            { id: 'ae2_controller', pos: [2, 0, 12] },
            { id: 'ae2_controller', pos: [3, 0, 12] },
            { id: 'ae2_controller', pos: [4, 0, 12] },
            { id: 'ae2_controller', pos: [2, 1, 12] },
            { id: 'ae2_controller', pos: [3, 1, 12] },
            { id: 'ae2_controller', pos: [4, 1, 12] },
            { id: 'ae2_drive', pos: [6, 0, 12] },
            { id: 'ae2_drive', pos: [7, 0, 12] },
            { id: 'ae2_drive', pos: [8, 0, 12] },

            // IV Processing
            { id: 'iv_hull', pos: [2, 0, 20] },
            { id: 'iv_hull', pos: [4, 0, 20] },
            { id: 'iv_hull', pos: [6, 0, 20] }
        ]
    }
};

function loadBase(tier) {
    // Clear existing machines
    machineObjects.forEach(obj => scene.remove(obj));
    machineObjects = [];

    const layout = BASE_LAYOUTS[tier];
    if (!layout) return;

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(layout.size.x + 4, layout.size.z + 4);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.9,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(layout.size.x / 2, -0.01, layout.size.z / 2);
    floor.receiveShadow = true;
    scene.add(floor);
    machineObjects.push(floor);

    // Create machines
    layout.machines.forEach(machine => {
        const mesh = createMachine(machine.id, machine.pos, machine.rotation || 0);
        if (mesh) {
            scene.add(mesh);
            machineObjects.push(mesh);
        }
    });

    // Update UI
    document.getElementById('currentTier').textContent = tier.toUpperCase();
    document.getElementById('machineCount').textContent = layout.machines.length;
    document.getElementById('euProduction').textContent = layout.euProduction;

    // Center camera
    controls.target.set(layout.size.x / 2, 2, layout.size.z / 2);
    camera.position.set(
        layout.size.x / 2 + layout.size.x * 0.8,
        layout.size.y * 1.5,
        layout.size.z / 2 + layout.size.z * 0.8
    );

    // Update legend
    updateLegend(tier);
}

function updateLegend(tier) {
    const legendContent = document.getElementById('legendContent');
    const machineTypes = new Set();

    BASE_LAYOUTS[tier].machines.forEach(m => {
        const data = MACHINE_DATA[m.id];
        if (data) machineTypes.add(data.type);
    });

    let html = '';
    const typeColors = {
        'Générateur': '#228B22',
        'Processing': '#4169E1',
        'Ore Processing': '#FFD700',
        'Multiblock': '#FF4500',
        'AE2': '#00CED1',
        'Storage': '#8B4513',
        'Component': '#808080',
        'Cable': '#DCDCDC',
        'Pipe': '#CD7F32',
        'Power': '#9932CC'
    };

    machineTypes.forEach(type => {
        const color = typeColors[type] || '#888888';
        html += `<div class="legend-item">
            <div class="legend-color" style="background: ${color}"></div>
            <span>${type}</span>
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

    // Raycasting pour sélection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(machineObjects);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData.machineId) {
                selectMachine(obj);
            }
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
    // Deselect previous
    if (selectedObject) {
        selectedObject.material.emissive = new THREE.Color(0x000000);
    }

    selectedObject = mesh;
    mesh.material.emissive = new THREE.Color(0x00d4ff);
    mesh.material.emissiveIntensity = 0.3;

    // Show info panel
    const data = mesh.userData;
    document.getElementById('infoName').textContent = data.nameFr || data.name;
    document.getElementById('infoType').textContent = `${data.type} - ${data.tier || 'All'}`;
    document.getElementById('infoDesc').textContent = data.desc;

    let specsHtml = '';
    if (data.specs) {
        for (const [key, value] of Object.entries(data.specs)) {
            specsHtml += `<div><span style="color:#888">${key}:</span> <span style="color:#00d4ff">${value}</span></div>`;
        }
    }
    document.getElementById('infoSpecs').innerHTML = specsHtml;
    document.getElementById('infoPanel').classList.add('visible');
}

function hideInfo() {
    document.getElementById('infoPanel').classList.remove('visible');
    if (selectedObject) {
        selectedObject.material.emissive = new THREE.Color(0x000000);
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
