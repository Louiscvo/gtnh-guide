// GTNH 3D Base Viewer - Version 3.0
// Bases RÉALISTES basées sur le wiki GTNH et vraies progressions
// ~2500 heures de gameplay représentées

let scene, camera, renderer, controls;
let machineObjects = [];
let cableObjects = [];
let structureObjects = [];
let selectedObject = null;
let currentTier = 'steam';

// Couleurs par tier (officielles GTNH)
const TIER_COLORS = {
    steam: { primary: 0x8B4513, secondary: 0xCD7F32, accent: 0xDAA520, name: 'Bronze/Brique' },
    lv: { primary: 0xDCDCDC, secondary: 0xA9A9A9, accent: 0x4682B4, name: 'Acier' },
    mv: { primary: 0xFF6400, secondary: 0xFF8C00, accent: 0xFFA500, name: 'Aluminium' },
    hv: { primary: 0xFFFF00, secondary: 0xFFD700, accent: 0x87CEEB, name: 'Inox' },
    ev: { primary: 0x00CED1, secondary: 0x20B2AA, accent: 0x48D1CC, name: 'Titane' },
    iv: { primary: 0xF0F0F5, secondary: 0xE0E0E5, accent: 0x9400D3, name: 'Tungstensteel' },
    luv: { primary: 0xFF69B4, secondary: 0xFF1493, accent: 0xDB7093, name: 'Chrome' },
    zpm: { primary: 0x00FFFF, secondary: 0x00CED1, accent: 0x40E0D0, name: 'Iridium' },
    uv: { primary: 0x00FF00, secondary: 0x32CD32, accent: 0x7CFC00, name: 'Osmium' }
};

// === BASE DE DONNÉES MACHINES COMPLÈTE ===
// Basée sur le wiki GTNH officiel

const MACHINES = {
    // ==========================================
    // STEAM AGE - Début du jeu
    // ==========================================

    // Générateurs vapeur
    'small_coal_boiler': { name: 'Petite Chaudière Charbon', nameFr: 'Petite Chaudière Charbon', type: 'generator', tier: 'steam', color: 0x8B4513, size: [1,1,1], output: '120 L/s Steam', desc: 'Chaudière basique au charbon' },
    'hp_coal_boiler': { name: 'Chaudière HP Charbon', type: 'generator', tier: 'steam', color: 0x654321, size: [1,1,1], output: '300 L/s Steam', desc: 'Haute pression, plus efficace' },
    'solar_boiler': { name: 'Chaudière Solaire', type: 'generator', tier: 'steam', color: 0xFFD700, size: [1,1,1], output: '120 L/s Steam', desc: 'Gratuit mais lent' },
    'lava_boiler': { name: 'Chaudière Lave', type: 'generator', tier: 'steam', color: 0xFF4500, size: [1,1,1], output: '600 L/s Steam', desc: 'Utilise la lave comme fuel' },

    // Machines vapeur (Bronze)
    'steam_macerator': { name: 'Macérateur Bronze', type: 'processing', tier: 'steam', color: 0xB8860B, size: [1,1,1], desc: 'Double le yield des minerais' },
    'steam_compressor': { name: 'Compresseur Bronze', type: 'processing', tier: 'steam', color: 0xCD853F, size: [1,1,1], desc: 'Compresse les matériaux' },
    'steam_forge_hammer': { name: 'Marteau-Pilon Bronze', type: 'processing', tier: 'steam', color: 0xA0522D, size: [1,1,1], desc: 'Forge les plaques' },
    'steam_alloy_smelter': { name: 'Fonderie Bronze', type: 'processing', tier: 'steam', color: 0xD2691E, size: [1,1,1], desc: 'Fusionne les alliages' },
    'steam_extractor': { name: 'Extracteur Bronze', type: 'processing', tier: 'steam', color: 0x8B7355, size: [1,1,1], desc: 'Extrait les fluides' },
    'steam_furnace': { name: 'Four Bronze', type: 'processing', tier: 'steam', color: 0xB22222, size: [1,1,1], desc: 'Cuisson basique' },

    // Multiblocks Steam
    'bronze_blast_furnace': { name: 'Haut Fourneau Primitif', type: 'multiblock', tier: 'steam', color: 0x8B0000, size: [3,4,3], desc: 'Produit acier - CRITIQUE!' },
    'coke_oven': { name: 'Four à Coke', type: 'multiblock', tier: 'steam', color: 0x4A4A4A, size: [3,3,3], desc: 'Coke de charbon + créosote' },
    'pyrolyse_oven_primitive': { name: 'Four Pyrolyse Primitif', type: 'multiblock', tier: 'steam', color: 0x696969, size: [3,3,3], desc: 'Charcoal + wood tar' },

    // Stockage Steam
    'bronze_drum': { name: 'Tambour Bronze', type: 'storage', tier: 'steam', color: 0xCD7F32, size: [1,1,1], capacity: '16000 L' },
    'bronze_tank': { name: 'Réservoir Bronze', type: 'storage', tier: 'steam', color: 0xCD7F32, size: [1,2,1], capacity: '32000 L' },
    'wooden_barrel': { name: 'Tonneau Bois', type: 'storage', tier: 'steam', color: 0x8B4513, size: [1,1,1], capacity: '8000 L' },
    'chest': { name: 'Coffre', type: 'storage', tier: 'steam', color: 0x8B4513, size: [1,1,1] },

    // ==========================================
    // LV - 32 EU/t - Premier tier électrique
    // ==========================================

    // Génération LV
    'steam_turbine_lv': { name: 'Turbine Vapeur LV', type: 'generator', tier: 'lv', color: 0x228B22, size: [1,1,1], output: '12 EU/t', desc: 'Convertit vapeur en EU' },
    'diesel_generator_lv': { name: 'Générateur Diesel LV', type: 'generator', tier: 'lv', color: 0x2F4F4F, size: [1,1,1], output: '12-24 EU/t', desc: 'Brûle les fuels liquides' },
    'gas_turbine_lv': { name: 'Turbine Gaz LV', type: 'generator', tier: 'lv', color: 0x3CB371, size: [1,1,1], output: '8-32 EU/t', desc: 'Brûle les gaz' },

    // Buffer et transformateur
    'battery_buffer_1x_lv': { name: 'Buffer 1 Batterie LV', type: 'storage', tier: 'lv', color: 0xFFD700, size: [1,1,1] },
    'battery_buffer_4x_lv': { name: 'Buffer 4 Batteries LV', type: 'storage', tier: 'lv', color: 0xFFD700, size: [1,1,1] },
    'battery_buffer_9x_lv': { name: 'Buffer 9 Batteries LV', type: 'storage', tier: 'lv', color: 0xFFD700, size: [1,1,1] },
    'battery_buffer_16x_lv': { name: 'Buffer 16 Batteries LV', type: 'storage', tier: 'lv', color: 0xFFD700, size: [1,1,1] },

    // MACHINES LV PRIORITAIRES (selon wiki)
    'bending_machine_lv': { name: 'Plieuse LV', type: 'processing', tier: 'lv', color: 0x808080, size: [1,1,1], desc: 'PRIORITÉ - Plaques courbes' },
    'wiremill_lv': { name: 'Tréfileuse LV', type: 'processing', tier: 'lv', color: 0xA9A9A9, size: [1,1,1], desc: 'PRIORITÉ - Fils métalliques' },
    'lathe_lv': { name: 'Tour LV', type: 'processing', tier: 'lv', color: 0x708090, size: [1,1,1], desc: 'Tiges et vis' },

    // Autres machines LV essentielles
    'macerator_lv': { name: 'Macérateur LV', type: 'processing', tier: 'lv', color: 0xC0C0C0, size: [1,1,1], desc: 'Broie les minerais' },
    'compressor_lv': { name: 'Compresseur LV', type: 'processing', tier: 'lv', color: 0xB8B8B8, size: [1,1,1], desc: 'Compresse matériaux' },
    'alloy_smelter_lv': { name: 'Fonderie LV', type: 'processing', tier: 'lv', color: 0xFF6347, size: [1,1,1], desc: 'Alliages métalliques' },
    'assembler_lv': { name: 'Assembleur LV', type: 'processing', tier: 'lv', color: 0x696969, size: [1,1,1], desc: 'Assemble composants' },
    'electrolyzer_lv': { name: 'Électrolyseur LV', type: 'processing', tier: 'lv', color: 0x4682B4, size: [1,1,1], desc: 'CRITIQUE - Gallium, aluminium' },
    'centrifuge_lv': { name: 'Centrifugeuse LV', type: 'processing', tier: 'lv', color: 0x5F9EA0, size: [1,1,1], desc: 'Sépare les éléments' },
    'chemical_reactor_lv': { name: 'Réacteur Chimique LV', type: 'processing', tier: 'lv', color: 0x00CED1, size: [1,1,1], desc: 'Réactions chimiques' },
    'fluid_extractor_lv': { name: 'Extracteur Fluide LV', type: 'processing', tier: 'lv', color: 0x20B2AA, size: [1,1,1], desc: 'Extrait fluides' },
    'arc_furnace_lv': { name: 'Four à Arc LV', type: 'processing', tier: 'lv', color: 0xFF4500, size: [1,1,1], desc: 'Recyclage métal, 3A minimum' },
    'extruder_lv': { name: 'Extrudeuse LV', type: 'processing', tier: 'lv', color: 0xDC143C, size: [1,1,1], desc: 'Formes complexes' },
    'forming_press_lv': { name: 'Presse LV', type: 'processing', tier: 'lv', color: 0xB22222, size: [1,1,1], desc: 'Moules et formes' },
    'cutter_lv': { name: 'Découpeuse LV', type: 'processing', tier: 'lv', color: 0x8B0000, size: [1,1,1], desc: 'Coupe précise' },
    'circuit_assembler_lv': { name: 'Assembleur Circuits LV', type: 'processing', tier: 'lv', color: 0x4169E1, size: [1,1,1], desc: 'Circuits électroniques' },

    // Ore processing LV
    'ore_washer_lv': { name: 'Laveur Minerai LV', type: 'processing', tier: 'lv', color: 0x4169E1, size: [1,1,1], desc: 'Lave les crushed ores' },
    'thermal_centrifuge_lv': { name: 'Centrifugeuse Thermique LV', type: 'processing', tier: 'lv', color: 0xFF4500, size: [1,1,1], desc: 'Alternative au laveur' },
    'sifter_lv': { name: 'Tamis LV', type: 'processing', tier: 'lv', color: 0xDEB887, size: [1,1,1], desc: 'Sépare les gemmes' },
    'electromagnetic_separator_lv': { name: 'Séparateur Magnétique LV', type: 'processing', tier: 'lv', color: 0x9932CC, size: [1,1,1], desc: 'Fer, nickel, cobalt' },

    // EBF - LE multiblock critique LV
    'electric_blast_furnace': { name: 'Four Électrique (EBF)', type: 'multiblock', tier: 'lv', color: 0xFF4500, size: [3,4,3], desc: 'CRITIQUE - Tous les métaux HT' },
    'energy_hatch_lv': { name: 'Trappe Énergie LV', type: 'hatch', tier: 'lv', color: 0xFFD700, size: [1,1,1] },
    'input_bus_lv': { name: 'Bus Entrée LV', type: 'hatch', tier: 'lv', color: 0x4169E1, size: [1,1,1] },
    'output_bus_lv': { name: 'Bus Sortie LV', type: 'hatch', tier: 'lv', color: 0xFF4500, size: [1,1,1] },
    'maintenance_hatch': { name: 'Trappe Maintenance', type: 'hatch', tier: 'lv', color: 0xFFA500, size: [1,1,1] },
    'muffler_hatch_lv': { name: 'Trappe Silencieux LV', type: 'hatch', tier: 'lv', color: 0x696969, size: [1,1,1] },
    'input_hatch_lv': { name: 'Trappe Fluide Entrée LV', type: 'hatch', tier: 'lv', color: 0x4169E1, size: [1,1,1] },
    'output_hatch_lv': { name: 'Trappe Fluide Sortie LV', type: 'hatch', tier: 'lv', color: 0xFF4500, size: [1,1,1] },

    // Coils EBF
    'coil_cupronickel': { name: 'Bobine Cupronickel', type: 'component', tier: 'lv', color: 0xFFD700, size: [1,1,1], heat: '1800K' },

    // Stockage LV
    'steel_drum': { name: 'Tambour Acier', type: 'storage', tier: 'lv', color: 0x71797E, size: [1,1,1], capacity: '32000 L' },
    'steel_tank': { name: 'Réservoir Acier', type: 'storage', tier: 'lv', color: 0x71797E, size: [1,2,1], capacity: '64000 L' },
    'super_chest_lv': { name: 'Super Coffre LV', type: 'storage', tier: 'lv', color: 0x4169E1, size: [1,1,1], capacity: '4M items' },
    'super_tank_lv': { name: 'Super Réservoir LV', type: 'storage', tier: 'lv', color: 0x4169E1, size: [1,1,1], capacity: '4M L' },

    // ==========================================
    // MV - 128 EU/t - Chimie et polymères
    // ==========================================

    // Génération MV
    'steam_turbine_mv': { name: 'Turbine Vapeur MV', type: 'generator', tier: 'mv', color: 0xFF6400, size: [1,1,1], output: '48 EU/t' },
    'diesel_generator_mv': { name: 'Générateur Diesel MV', type: 'generator', tier: 'mv', color: 0xFF6400, size: [1,1,1], output: '48-96 EU/t' },
    'gas_turbine_mv': { name: 'Turbine Gaz MV', type: 'generator', tier: 'mv', color: 0xFF6400, size: [1,1,1], output: '32-128 EU/t' },

    // Transformateurs
    'transformer_lv_mv': { name: 'Transfo LV↔MV', type: 'power', tier: 'mv', color: 0x9932CC, size: [1,1,1] },
    'battery_buffer_4x_mv': { name: 'Buffer 4 Batteries MV', type: 'storage', tier: 'mv', color: 0xFF8C00, size: [1,1,1] },

    // Machines MV à upgrader (selon wiki)
    'arc_furnace_mv': { name: 'Four à Arc MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'assembler_mv': { name: 'Assembleur MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'circuit_assembler_mv': { name: 'Assembleur Circuits MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'chemical_reactor_mv': { name: 'Réacteur Chimique MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'chemical_bath_mv': { name: 'Bain Chimique MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'cutting_machine_mv': { name: 'Découpeuse MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'extruder_mv': { name: 'Extrudeuse MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'fluid_extractor_mv': { name: 'Extracteur Fluide MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'fluid_solidifier_mv': { name: 'Solidifieur Fluide MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'laser_engraver_mv': { name: 'Graveur Laser MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'macerator_mv': { name: 'Macérateur MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1] },
    'mixer_mv': { name: 'Mixeur MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1], desc: 'IMPORTANT - Diesel blend' },
    'electrolyzer_mv': { name: 'Électrolyseur MV', type: 'processing', tier: 'mv', color: 0xFF6400, size: [1,1,1], desc: 'Alu, O2, Si' },

    // Multiblocks MV
    'pyrolyse_oven': { name: 'Four Pyrolyse', type: 'multiblock', tier: 'mv', color: 0xFF8C00, size: [5,4,5], desc: 'ÉTHYLÈNE - Polyethylene' },
    'distillery_mv': { name: 'Distillerie MV', type: 'processing', tier: 'mv', color: 0xFF8C00, size: [1,1,1], desc: 'Distillation simple' },

    // EBF Upgrade
    'coil_kanthal': { name: 'Bobine Kanthal', type: 'component', tier: 'mv', color: 0xFF8C00, size: [1,1,1], heat: '2700K', desc: 'Obligatoire pour MV+' },

    // Hatches MV
    'energy_hatch_mv': { name: 'Trappe Énergie MV', type: 'hatch', tier: 'mv', color: 0xFF8C00, size: [1,1,1] },
    'input_bus_mv': { name: 'Bus Entrée MV', type: 'hatch', tier: 'mv', color: 0xFF8C00, size: [1,1,1] },
    'output_bus_mv': { name: 'Bus Sortie MV', type: 'hatch', tier: 'mv', color: 0xFF8C00, size: [1,1,1] },

    // ==========================================
    // HV - 512 EU/t - Cleanroom, multiblocks majeurs
    // ==========================================

    // Génération HV
    'gas_turbine_hv': { name: 'Turbine Gaz HV', type: 'generator', tier: 'hv', color: 0xFFFF00, size: [1,1,1], output: '128-512 EU/t' },
    'diesel_generator_hv': { name: 'Générateur Diesel HV', type: 'generator', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },

    // Transformateurs HV
    'transformer_mv_hv': { name: 'Transfo MV↔HV', type: 'power', tier: 'hv', color: 0x9932CC, size: [1,1,1] },
    'battery_buffer_4x_hv': { name: 'Buffer 4 Batteries HV', type: 'storage', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },

    // CLEANROOM - CRITIQUE HV
    'cleanroom': { name: 'Salle Blanche (Cleanroom)', type: 'multiblock', tier: 'hv', color: 0xF0FFFF, size: [7,5,7], desc: 'OBLIGATOIRE - Circuits avancés, NASA' },
    'plascrete': { name: 'Plascrete', type: 'casing', tier: 'hv', color: 0xE8E8E8, size: [1,1,1], desc: 'Murs Cleanroom' },
    'filter_machine_casing': { name: 'Casing Filtre', type: 'casing', tier: 'hv', color: 0xF5F5F5, size: [1,1,1], desc: 'Toit Cleanroom' },

    // Multiblocks HV majeurs
    'large_chemical_reactor': { name: 'Grand Réacteur Chimique (LCR)', type: 'multiblock', tier: 'hv', color: 0xFFFF99, size: [3,3,3], desc: 'PERFECT OC - PTFE, acide sulfurique' },
    'vacuum_freezer': { name: 'Congélateur Vide', type: 'multiblock', tier: 'hv', color: 0x87CEEB, size: [3,3,3], desc: 'Refroidit Nichrome, Titane' },
    'distillation_tower': { name: 'Tour Distillation', type: 'multiblock', tier: 'hv', color: 0xFFFACD, size: [3,12,3], desc: 'Benzène, Toluène, Phénol - 56 Inox/layer' },
    'implosion_compressor': { name: 'Compresseur Implosion', type: 'multiblock', tier: 'hv', color: 0x708090, size: [3,3,3], desc: 'TNT requis - Plaques HD' },
    'oil_cracking_unit': { name: 'Unité Craquage', type: 'multiblock', tier: 'hv', color: 0x2F4F4F, size: [5,3,3], desc: 'Craquage H2/Steam' },
    'multi_smelter': { name: 'Multi-Four', type: 'multiblock', tier: 'hv', color: 0xFF8C00, size: [3,3,3], desc: '8-128 parallèles' },
    'large_sifter': { name: 'Grand Tamis', type: 'multiblock', tier: 'hv', color: 0xDEB887, size: [3,3,3], desc: 'Platline prep' },
    'dissection_apparatus': { name: 'Appareil Dissection', type: 'multiblock', tier: 'hv', color: 0x90EE90, size: [3,3,3], desc: 'Extracteur large' },

    // Machines HV
    'chemical_reactor_hv': { name: 'Réacteur Chimique HV', type: 'processing', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },
    'mixer_hv': { name: 'Mixeur HV', type: 'processing', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },
    'macerator_hv': { name: 'Macérateur HV', type: 'processing', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },
    'assembler_hv': { name: 'Assembleur HV', type: 'processing', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },
    'circuit_assembler_hv': { name: 'Assembleur Circuits HV', type: 'processing', tier: 'hv', color: 0xFFFF00, size: [1,1,1], desc: 'Circuits IV!' },

    // Coils HV
    'coil_nichrome': { name: 'Bobine Nichrome', type: 'component', tier: 'hv', color: 0xFF4500, size: [1,1,1], heat: '3600K' },

    // Hatches HV
    'energy_hatch_hv': { name: 'Trappe Énergie HV', type: 'hatch', tier: 'hv', color: 0xFFFF00, size: [1,1,1] },

    // Space prep
    'nasa_workbench': { name: 'NASA Workbench', type: 'processing', tier: 'hv', color: 0x1E90FF, size: [1,1,1], desc: 'Craft fusées' },
    'fuel_loader': { name: 'Fuel Loader', type: 'processing', tier: 'hv', color: 0xFF4500, size: [1,1,1], desc: 'Charge les fusées' },
    'oxygen_collector': { name: 'Collecteur Oxygène', type: 'processing', tier: 'hv', color: 0x87CEEB, size: [1,1,1] },
    'oxygen_compressor': { name: 'Compresseur Oxygène', type: 'processing', tier: 'hv', color: 0x87CEEB, size: [1,1,1] },
    'landing_pad': { name: 'Plateforme Atterrissage', type: 'structure', tier: 'hv', color: 0x696969, size: [3,1,3], desc: '9 requis' },

    // ==========================================
    // EV - 2048 EU/t - AE2, Titane, Processing
    // ==========================================

    // Génération EV
    'multiblock_combustion_engine': { name: 'Moteur Combustion Multiblock', type: 'multiblock', tier: 'ev', color: 0x00CED1, size: [3,3,5], output: '2048-6144 EU/t', desc: '4 stacks titane, O2 boost' },
    'large_gas_turbine': { name: 'Grande Turbine Gaz', type: 'multiblock', tier: 'ev', color: 0x3CB371, size: [3,3,4], output: '2048+ EU/t' },
    'nuclear_reactor_simple': { name: 'Réacteur Nucléaire', type: 'multiblock', tier: 'ev', color: 0x32CD32, size: [3,3,3], output: '1280 EU/t', desc: '4 chambers' },

    // AE2 System - OBLIGATOIRE EV
    'me_controller': { name: 'Contrôleur ME', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1], desc: 'Cerveau du système' },
    'me_drive': { name: 'Lecteur ME', type: 'ae2', tier: 'ev', color: 0x20B2AA, size: [1,1,1], desc: '10 cellules' },
    'me_interface': { name: 'Interface ME', type: 'ae2', tier: 'ev', color: 0x48D1CC, size: [1,1,1], desc: 'Import/Export' },
    'molecular_assembler': { name: 'Assembleur Moléculaire', type: 'ae2', tier: 'ev', color: 0x40E0D0, size: [1,1,1], desc: 'Autocrafting' },
    'inscriber': { name: 'Inscripteur', type: 'ae2', tier: 'ev', color: 0x5F9EA0, size: [1,1,1], desc: 'Processeurs' },
    'crafting_cpu_1k': { name: 'CPU Crafting 1K', type: 'ae2', tier: 'ev', color: 0x00BFFF, size: [1,1,1] },
    'crafting_cpu_4k': { name: 'CPU Crafting 4K', type: 'ae2', tier: 'ev', color: 0x00BFFF, size: [1,1,1] },
    'crafting_cpu_16k': { name: 'CPU Crafting 16K', type: 'ae2', tier: 'ev', color: 0x00BFFF, size: [1,1,1] },
    'crafting_cpu_64k': { name: 'CPU Crafting 64K', type: 'ae2', tier: 'ev', color: 0x00BFFF, size: [1,1,1] },
    'crafting_co_processing': { name: 'Co-Processing Unit', type: 'ae2', tier: 'ev', color: 0x87CEEB, size: [1,1,1] },
    'me_chest': { name: 'Coffre ME', type: 'ae2', tier: 'ev', color: 0x20B2AA, size: [1,1,1] },
    'me_terminal': { name: 'Terminal ME', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'crafting_terminal': { name: 'Terminal Crafting', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'pattern_terminal': { name: 'Terminal Patterns', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'interface_terminal': { name: 'Terminal Interfaces', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'me_condenser': { name: 'Condensateur ME', type: 'ae2', tier: 'ev', color: 0x2F4F4F, size: [1,1,1], desc: 'Détruit items' },
    'energy_acceptor': { name: 'Accepteur Énergie', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1], desc: 'EU → AE' },
    'energy_cell': { name: 'Cellule Énergie', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'dense_energy_cell': { name: 'Cellule Énergie Dense', type: 'ae2', tier: 'ev', color: 0x006400, size: [1,1,1] },

    // Cellules de stockage
    'storage_cell_1k': { name: 'Cellule 1K', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [0.5,0.5,0.1] },
    'storage_cell_4k': { name: 'Cellule 4K', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [0.5,0.5,0.1] },
    'storage_cell_16k': { name: 'Cellule 16K', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [0.5,0.5,0.1] },
    'storage_cell_64k': { name: 'Cellule 64K', type: 'ae2', tier: 'ev', color: 0x00CED1, size: [0.5,0.5,0.1] },

    // Multiblocks Ore Processing EV
    'industrial_centrifuge': { name: 'Centrifugeuse Industrielle', type: 'multiblock', tier: 'ev', color: 0x00CED1, size: [3,3,3], desc: 'TPV coils requis' },
    'industrial_macerator': { name: 'Macérateur Industriel', type: 'multiblock', tier: 'ev', color: 0x00CED1, size: [3,3,3], desc: 'Ore doubling en masse' },
    'industrial_ore_washer': { name: 'Laveur Industriel', type: 'multiblock', tier: 'ev', color: 0x00CED1, size: [3,3,3] },
    'industrial_thermal_centrifuge': { name: 'Centri Thermique Industrielle', type: 'multiblock', tier: 'ev', color: 0x00CED1, size: [3,3,3] },

    // Machines EV
    'autoclave_ev': { name: 'Autoclave EV', type: 'processing', tier: 'ev', color: 0x00CED1, size: [1,1,1], desc: 'Tungstate processing' },
    'circuit_assembler_ev': { name: 'Assembleur Circuits EV', type: 'processing', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'assembler_ev': { name: 'Assembleur EV', type: 'processing', tier: 'ev', color: 0x00CED1, size: [1,1,1] },

    // Coils EV
    'coil_tpv': { name: 'Bobine TPV-Alloy', type: 'component', tier: 'ev', color: 0x9400D3, size: [1,1,1], heat: '4500K', desc: 'Tungsten recipes' },

    // Stockage EV
    'quantum_chest': { name: 'Coffre Quantique', type: 'storage', tier: 'ev', color: 0x9400D3, size: [1,1,1], capacity: '2B items' },
    'quantum_tank': { name: 'Réservoir Quantique', type: 'storage', tier: 'ev', color: 0x9400D3, size: [1,1,1], capacity: '2B L' },
    'lapotronic_supercapacitor': { name: 'Supercapacité Lapotronique', type: 'storage', tier: 'ev', color: 0x9400D3, size: [3,3,3], desc: 'Power storage massif' },

    // Hatches EV
    'energy_hatch_ev': { name: 'Trappe Énergie EV', type: 'hatch', tier: 'ev', color: 0x00CED1, size: [1,1,1] },
    'transformer_hv_ev': { name: 'Transfo HV↔EV', type: 'power', tier: 'ev', color: 0x9932CC, size: [1,1,1] },

    // ==========================================
    // IV - 8192 EU/t - Assembly Line, Platline
    // ==========================================

    // THE Assembly Line - Porte vers LuV
    'assembly_line': { name: 'Ligne d\'Assemblage', type: 'multiblock', tier: 'iv', color: 0x4169E1, size: [5,3,15], desc: 'CRITIQUE - 90 ZPM circuits, LuV gate' },

    // Processing Multiblocks IV
    'zyngen': { name: 'Zyngen (Alloy Smelter)', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'industrial_electrolyzer': { name: 'Électrolyseur Industriel', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'magnetic_flux_exhibitor': { name: 'Exhibiteur Flux Magnétique', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'industrial_extrusion': { name: 'Extrusion Industrielle', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'industrial_mixing': { name: 'Mixeur Industriel', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'industrial_wire_factory': { name: 'Usine Fil Industrielle', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },

    // Avec Alloy Blast Smelter
    'alloy_blast_smelter': { name: 'Fonderie Alliages (ABS)', type: 'multiblock', tier: 'iv', color: 0xFF4500, size: [3,4,3], desc: 'Gate pour plusieurs multiblocks' },
    'industrial_cutting': { name: 'Découpe Industrielle', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'dangote_distillus': { name: 'Dangote Distillus', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,12,3] },
    'industrial_sledgehammer': { name: 'Marteau Industriel', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'fluid_shaper': { name: 'Formeur Fluide', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'amazon_warehousing': { name: 'Amazon Warehousing Depot', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [5,5,5] },
    'hyper_laser_engraver': { name: 'Graveur Laser Hyper-Intensité', type: 'multiblock', tier: 'iv', color: 0xF0F0F5, size: [3,3,3] },
    'volcanus': { name: 'Volcanus', type: 'multiblock', tier: 'iv', color: 0xFF4500, size: [3,4,3], desc: '2x EBF speed, 8 parallèles' },
    'cryogenic_freezer': { name: 'Congélateur Cryogénique', type: 'multiblock', tier: 'iv', color: 0x87CEEB, size: [3,3,3], desc: '2x speed, 4 parallèles' },

    // Mega multiblocks
    'mega_vacuum_freezer': { name: 'Mega Vacuum Freezer', type: 'multiblock', tier: 'iv', color: 0x87CEEB, size: [5,5,5], desc: '256 parallèles!' },
    'mega_ebf': { name: 'Mega EBF', type: 'multiblock', tier: 'iv', color: 0xFF4500, size: [5,5,5], desc: '256 parallèles, très cher' },

    // Resource gathering
    'boldarnator': { name: 'Boldarnator', type: 'multiblock', tier: 'iv', color: 0x696969, size: [3,3,3], desc: 'Rock Breaker massif' },
    'extreme_greenhouse': { name: 'Serre Extrême', type: 'multiblock', tier: 'iv', color: 0x32CD32, size: [5,5,5] },
    'tree_growth_simulator': { name: 'Simulateur Croissance Arbres', type: 'multiblock', tier: 'iv', color: 0x228B22, size: [5,5,5] },
    'zhuhai_fishing_port': { name: 'Port de Pêche Zhuhai', type: 'multiblock', tier: 'iv', color: 0x4169E1, size: [5,3,5] },
    'ore_drilling_plant_t2': { name: 'Foreuse Minerai T2', type: 'multiblock', tier: 'iv', color: 0x696969, size: [3,3,3] },
    'fluid_drilling_rig_t4': { name: 'Foreuse Fluide T4', type: 'multiblock', tier: 'iv', color: 0x2F4F4F, size: [3,5,3] },

    // Power IV
    'extreme_combustion_engine': { name: 'Moteur Combustion Extrême', type: 'multiblock', tier: 'iv', color: 0x32CD32, size: [3,3,5] },
    'xl_turbo_steam_turbine': { name: 'XL Turbo HP Steam Turbine', type: 'multiblock', tier: 'iv', color: 0x87CEEB, size: [5,5,5] },
    'deep_earth_heating_pump': { name: 'Pompe Géothermique', type: 'multiblock', tier: 'iv', color: 0xFF4500, size: [3,5,3] },
    'rocketdyne_f1a': { name: 'Rocketdyne F-1A Engine', type: 'multiblock', tier: 'iv', color: 0xFF4500, size: [5,5,5] },
    'solar_tower': { name: 'Tour Solaire', type: 'multiblock', tier: 'iv', color: 0xFFD700, size: [7,15,7] },

    // Platline (50 steps!)
    'platline_setup': { name: 'Setup Platline', type: 'multiblock', tier: 'iv', color: 0xE5E4E2, size: [20,3,10], desc: '~50 étapes! Pt, Pd, Rh, Ru, Ir, Os' },

    // Hatches IV
    'energy_hatch_iv': { name: 'Trappe Énergie IV', type: 'hatch', tier: 'iv', color: 0xF0F0F5, size: [1,1,1] },
    'transformer_ev_iv': { name: 'Transfo EV↔IV', type: 'power', tier: 'iv', color: 0x9932CC, size: [1,1,1] },

    // ==========================================
    // CÂBLES ET PIPES
    // ==========================================
    'pipe_bronze_small': { name: 'Pipe Bronze Petit', type: 'pipe', tier: 'steam', color: 0xCD7F32, size: [0.25,0.25,1] },
    'pipe_bronze_medium': { name: 'Pipe Bronze Moyen', type: 'pipe', tier: 'steam', color: 0xCD7F32, size: [0.5,0.5,1] },
    'pipe_steel_small': { name: 'Pipe Acier Petit', type: 'pipe', tier: 'lv', color: 0x71797E, size: [0.25,0.25,1] },
    'pipe_steel_medium': { name: 'Pipe Acier Moyen', type: 'pipe', tier: 'lv', color: 0x71797E, size: [0.5,0.5,1] },

    'cable_tin_1x': { name: 'Câble Étain 1x', type: 'cable', tier: 'lv', color: 0xDCDCDC, size: [0.1,0.1,1], amps: '1A' },
    'cable_tin_4x': { name: 'Câble Étain 4x', type: 'cable', tier: 'lv', color: 0xDCDCDC, size: [0.2,0.2,1], amps: '4A' },
    'cable_copper_1x': { name: 'Câble Cuivre 1x', type: 'cable', tier: 'mv', color: 0xFF6400, size: [0.1,0.1,1], amps: '1A' },
    'cable_copper_4x': { name: 'Câble Cuivre 4x', type: 'cable', tier: 'mv', color: 0xFF6400, size: [0.2,0.2,1], amps: '4A' },
    'cable_gold_1x': { name: 'Câble Or 1x', type: 'cable', tier: 'hv', color: 0xFFFF00, size: [0.1,0.1,1], amps: '1A' },
    'cable_gold_4x': { name: 'Câble Or 4x', type: 'cable', tier: 'hv', color: 0xFFFF00, size: [0.2,0.2,1], amps: '4A' },
    'cable_aluminium_1x': { name: 'Câble Aluminium 1x', type: 'cable', tier: 'ev', color: 0x00CED1, size: [0.1,0.1,1], amps: '1A' },
    'cable_tungsten_1x': { name: 'Câble Tungstène 1x', type: 'cable', tier: 'iv', color: 0xF0F0F5, size: [0.1,0.1,1], amps: '1A' }
};

// === DÉFINITION DES BASES RÉALISTES ===
// Basées sur le wiki GTNH et vraies progressions

const BASE_CONFIGS = {
    steam: {
        name: 'Base Steam Age',
        buildingSize: { width: 32, depth: 40, height: 10 },
        floorLevel: 0,
        description: 'Début - Bronze et acier',
        machines: [],
        cables: [],
        inherited: null
    },
    lv: {
        name: 'Base Low Voltage',
        buildingSize: { width: 50, depth: 60, height: 12 },
        floorLevel: 0,
        description: '32 EU/t - EBF, ore processing',
        machines: [],
        cables: [],
        inherited: 'steam'
    },
    mv: {
        name: 'Base Medium Voltage',
        buildingSize: { width: 70, depth: 80, height: 14 },
        floorLevel: 0,
        description: '128 EU/t - Chimie, Pyrolyse',
        machines: [],
        cables: [],
        inherited: 'lv'
    },
    hv: {
        name: 'Base High Voltage',
        buildingSize: { width: 100, depth: 110, height: 16 },
        floorLevel: 0,
        description: '512 EU/t - Cleanroom, multiblocks',
        machines: [],
        cables: [],
        inherited: 'mv'
    },
    ev: {
        name: 'Base Extreme Voltage',
        buildingSize: { width: 130, depth: 140, height: 20 },
        floorLevel: 0,
        description: '2048 EU/t - AE2, Titane',
        machines: [],
        cables: [],
        inherited: 'hv'
    },
    iv: {
        name: 'Base Insane Voltage',
        buildingSize: { width: 180, depth: 200, height: 25 },
        floorLevel: 0,
        description: '8192 EU/t - Assembly Line, Platline',
        machines: [],
        cables: [],
        inherited: 'ev'
    }
};

// Générer les bases réalistes
function generateRealisticBases() {
    // === STEAM AGE - Vraie base de départ ===
    BASE_CONFIGS.steam.machines = [
        // Zone génération vapeur (4 chaudières minimum pour alimenter tout)
        { id: 'small_coal_boiler', pos: [2, 1, 2] },
        { id: 'small_coal_boiler', pos: [4, 1, 2] },
        { id: 'small_coal_boiler', pos: [6, 1, 2] },
        { id: 'small_coal_boiler', pos: [8, 1, 2] },
        { id: 'hp_coal_boiler', pos: [10, 1, 2] },
        { id: 'hp_coal_boiler', pos: [12, 1, 2] },
        { id: 'bronze_tank', pos: [7, 1, 5], label: 'Buffer Vapeur' },

        // Zone ore processing steam (macérateurs)
        { id: 'steam_macerator', pos: [2, 1, 10] },
        { id: 'steam_macerator', pos: [4, 1, 10] },
        { id: 'steam_macerator', pos: [6, 1, 10] },
        { id: 'steam_compressor', pos: [8, 1, 10] },
        { id: 'steam_compressor', pos: [10, 1, 10] },

        // Zone metal processing
        { id: 'steam_forge_hammer', pos: [2, 1, 14] },
        { id: 'steam_forge_hammer', pos: [4, 1, 14] },
        { id: 'steam_alloy_smelter', pos: [6, 1, 14] },
        { id: 'steam_alloy_smelter', pos: [8, 1, 14] },
        { id: 'steam_furnace', pos: [10, 1, 14] },
        { id: 'steam_furnace', pos: [12, 1, 14] },
        { id: 'steam_extractor', pos: [14, 1, 14] },

        // MULTIBLOCKS CRITIQUES
        { id: 'bronze_blast_furnace', pos: [20, 1, 4], label: 'BBF - ACIER!' },
        { id: 'bronze_blast_furnace', pos: [24, 1, 4], label: 'BBF 2' },
        { id: 'coke_oven', pos: [20, 1, 12], label: 'Coke - Charcoal + Créosote' },
        { id: 'coke_oven', pos: [24, 1, 12], label: 'Coke 2' },

        // Stockage
        { id: 'chest', pos: [2, 1, 20] },
        { id: 'chest', pos: [3, 1, 20] },
        { id: 'chest', pos: [4, 1, 20] },
        { id: 'chest', pos: [5, 1, 20] },
        { id: 'bronze_drum', pos: [7, 1, 20], label: 'Créosote' },
        { id: 'bronze_drum', pos: [9, 1, 20], label: 'Eau' },
        { id: 'wooden_barrel', pos: [11, 1, 20] },
        { id: 'wooden_barrel', pos: [12, 1, 20] }
    ];

    // === LV - Vraie setup avec EBF et ore processing ===
    BASE_CONFIGS.lv.machines = [
        // Génération électrique (8+ turbines pour 4A vers EBF)
        { id: 'steam_turbine_lv', pos: [2, 1, 26] },
        { id: 'steam_turbine_lv', pos: [4, 1, 26] },
        { id: 'steam_turbine_lv', pos: [6, 1, 26] },
        { id: 'steam_turbine_lv', pos: [8, 1, 26] },
        { id: 'steam_turbine_lv', pos: [10, 1, 26] },
        { id: 'steam_turbine_lv', pos: [12, 1, 26] },
        { id: 'steam_turbine_lv', pos: [14, 1, 26] },
        { id: 'steam_turbine_lv', pos: [16, 1, 26] },
        { id: 'battery_buffer_16x_lv', pos: [9, 1, 28], label: 'Buffer Principal' },
        { id: 'battery_buffer_4x_lv', pos: [7, 1, 28] },
        { id: 'battery_buffer_4x_lv', pos: [11, 1, 28] },

        // EBF - LE multiblock critique (besoin 4A minimum)
        { id: 'electric_blast_furnace', pos: [32, 1, 26], label: 'EBF - CRITIQUE!' },
        { id: 'coil_cupronickel', pos: [33, 2, 27], label: 'Coils' },
        { id: 'energy_hatch_lv', pos: [32, 1, 29] },
        { id: 'energy_hatch_lv', pos: [34, 1, 29] }, // 2 pour 2A
        { id: 'input_bus_lv', pos: [33, 1, 29] },
        { id: 'output_bus_lv', pos: [32, 1, 25] },
        { id: 'maintenance_hatch', pos: [34, 1, 25] },
        { id: 'muffler_hatch_lv', pos: [33, 4, 27] },

        // MACHINES PRIORITAIRES (selon wiki)
        { id: 'bending_machine_lv', pos: [2, 1, 32], label: 'PRIORITÉ 1' },
        { id: 'bending_machine_lv', pos: [4, 1, 32] },
        { id: 'wiremill_lv', pos: [6, 1, 32], label: 'PRIORITÉ 2' },
        { id: 'wiremill_lv', pos: [8, 1, 32] },
        { id: 'lathe_lv', pos: [10, 1, 32] },
        { id: 'lathe_lv', pos: [12, 1, 32] },

        // Ore Processing Line
        { id: 'macerator_lv', pos: [2, 1, 36] },
        { id: 'macerator_lv', pos: [4, 1, 36] },
        { id: 'macerator_lv', pos: [6, 1, 36] },
        { id: 'ore_washer_lv', pos: [8, 1, 36] },
        { id: 'ore_washer_lv', pos: [10, 1, 36] },
        { id: 'thermal_centrifuge_lv', pos: [12, 1, 36] },
        { id: 'sifter_lv', pos: [14, 1, 36] },
        { id: 'electromagnetic_separator_lv', pos: [16, 1, 36] },

        // Metal Processing
        { id: 'alloy_smelter_lv', pos: [2, 1, 40] },
        { id: 'alloy_smelter_lv', pos: [4, 1, 40] },
        { id: 'compressor_lv', pos: [6, 1, 40] },
        { id: 'compressor_lv', pos: [8, 1, 40] },
        { id: 'extruder_lv', pos: [10, 1, 40] },
        { id: 'forming_press_lv', pos: [12, 1, 40] },
        { id: 'cutter_lv', pos: [14, 1, 40] },

        // Arc Furnace (3A minimum!)
        { id: 'arc_furnace_lv', pos: [18, 1, 40], label: '3A minimum!' },

        // Assemblage et circuits
        { id: 'assembler_lv', pos: [2, 1, 44] },
        { id: 'assembler_lv', pos: [4, 1, 44] },
        { id: 'circuit_assembler_lv', pos: [6, 1, 44], label: 'Circuits!' },
        { id: 'circuit_assembler_lv', pos: [8, 1, 44] },

        // Chimie basique
        { id: 'electrolyzer_lv', pos: [12, 1, 44], label: 'Gallium!' },
        { id: 'electrolyzer_lv', pos: [14, 1, 44] },
        { id: 'centrifuge_lv', pos: [16, 1, 44] },
        { id: 'centrifuge_lv', pos: [18, 1, 44] },
        { id: 'chemical_reactor_lv', pos: [20, 1, 44] },
        { id: 'chemical_reactor_lv', pos: [22, 1, 44] },
        { id: 'fluid_extractor_lv', pos: [24, 1, 44] },

        // Stockage amélioré
        { id: 'super_chest_lv', pos: [2, 1, 50] },
        { id: 'super_chest_lv', pos: [3, 1, 50] },
        { id: 'super_chest_lv', pos: [4, 1, 50] },
        { id: 'super_tank_lv', pos: [6, 1, 50] },
        { id: 'super_tank_lv', pos: [7, 1, 50] },
        { id: 'steel_drum', pos: [9, 1, 50] },
        { id: 'steel_drum', pos: [10, 1, 50] },
        { id: 'steel_tank', pos: [12, 1, 50] }
    ];

    // === MV - Chimie, Pyrolyse, upgrade machines ===
    BASE_CONFIGS.mv.machines = [
        // Génération MV
        { id: 'diesel_generator_mv', pos: [36, 1, 26] },
        { id: 'diesel_generator_mv', pos: [38, 1, 26] },
        { id: 'diesel_generator_mv', pos: [40, 1, 26] },
        { id: 'diesel_generator_mv', pos: [42, 1, 26] },
        { id: 'gas_turbine_mv', pos: [44, 1, 26] },
        { id: 'gas_turbine_mv', pos: [46, 1, 26] },
        { id: 'transformer_lv_mv', pos: [39, 1, 28] },
        { id: 'battery_buffer_4x_mv', pos: [41, 1, 28] },

        // Pyrolyse Oven - ÉTHYLÈNE
        { id: 'pyrolyse_oven', pos: [50, 1, 26], label: 'Pyrolyse - ÉTHYLÈNE!' },
        { id: 'energy_hatch_mv', pos: [50, 1, 30] },
        { id: 'input_bus_mv', pos: [52, 1, 30] },
        { id: 'output_bus_mv', pos: [54, 1, 30] },

        // Machines MV upgradées (selon wiki)
        { id: 'arc_furnace_mv', pos: [36, 1, 36] },
        { id: 'assembler_mv', pos: [38, 1, 36] },
        { id: 'assembler_mv', pos: [40, 1, 36] },
        { id: 'circuit_assembler_mv', pos: [42, 1, 36] },
        { id: 'chemical_reactor_mv', pos: [44, 1, 36] },
        { id: 'chemical_reactor_mv', pos: [46, 1, 36] },
        { id: 'chemical_bath_mv', pos: [48, 1, 36] },
        { id: 'cutting_machine_mv', pos: [50, 1, 36] },
        { id: 'extruder_mv', pos: [52, 1, 36] },
        { id: 'fluid_extractor_mv', pos: [54, 1, 36] },
        { id: 'fluid_solidifier_mv', pos: [56, 1, 36] },
        { id: 'laser_engraver_mv', pos: [58, 1, 36] },
        { id: 'macerator_mv', pos: [36, 1, 40] },
        { id: 'macerator_mv', pos: [38, 1, 40] },
        { id: 'mixer_mv', pos: [40, 1, 40], label: 'Diesel!' },
        { id: 'mixer_mv', pos: [42, 1, 40] },
        { id: 'electrolyzer_mv', pos: [44, 1, 40], label: 'Alu, O2, Si' },
        { id: 'electrolyzer_mv', pos: [46, 1, 40] },
        { id: 'electrolyzer_mv', pos: [48, 1, 40] },
        { id: 'distillery_mv', pos: [50, 1, 40] },
        { id: 'distillery_mv', pos: [52, 1, 40] },

        // EBF avec Kanthal upgrade
        { id: 'coil_kanthal', pos: [33, 2, 27], label: 'Upgrade Kanthal' }
    ];

    // === HV - Cleanroom, multiblocks majeurs ===
    BASE_CONFIGS.hv.machines = [
        // Génération HV
        { id: 'gas_turbine_hv', pos: [60, 1, 26] },
        { id: 'gas_turbine_hv', pos: [62, 1, 26] },
        { id: 'gas_turbine_hv', pos: [64, 1, 26] },
        { id: 'gas_turbine_hv', pos: [66, 1, 26] },
        { id: 'diesel_generator_hv', pos: [68, 1, 26] },
        { id: 'diesel_generator_hv', pos: [70, 1, 26] },
        { id: 'transformer_mv_hv', pos: [64, 1, 28] },
        { id: 'battery_buffer_4x_hv', pos: [66, 1, 28] },

        // CLEANROOM - OBLIGATOIRE
        { id: 'cleanroom', pos: [60, 1, 50], label: 'CLEANROOM - Circuits avancés!' },
        // Intérieur cleanroom
        { id: 'circuit_assembler_hv', pos: [62, 2, 52] },
        { id: 'circuit_assembler_hv', pos: [64, 2, 52] },
        { id: 'assembler_hv', pos: [62, 2, 54] },
        { id: 'assembler_hv', pos: [64, 2, 54] },

        // Multiblocks HV majeurs
        { id: 'large_chemical_reactor', pos: [72, 1, 36], label: 'LCR - Perfect OC!' },
        { id: 'vacuum_freezer', pos: [78, 1, 36], label: 'Vacuum - Nichrome, Titane' },
        { id: 'distillation_tower', pos: [84, 1, 36], label: 'Distillation - 56 Inox/layer' },
        { id: 'implosion_compressor', pos: [72, 1, 50], label: 'TNT requis' },
        { id: 'oil_cracking_unit', pos: [78, 1, 50], label: 'Craquage H2/Steam' },
        { id: 'multi_smelter', pos: [84, 1, 50], label: '8-128 parallèles' },
        { id: 'large_sifter', pos: [72, 1, 60], label: 'Platline prep' },
        { id: 'dissection_apparatus', pos: [78, 1, 60] },

        // Machines HV
        { id: 'chemical_reactor_hv', pos: [60, 1, 36] },
        { id: 'chemical_reactor_hv', pos: [62, 1, 36] },
        { id: 'chemical_reactor_hv', pos: [64, 1, 36] },
        { id: 'mixer_hv', pos: [66, 1, 36] },
        { id: 'macerator_hv', pos: [68, 1, 36] },

        // Nichrome coils
        { id: 'coil_nichrome', pos: [33, 2, 27], label: 'Upgrade Nichrome' },

        // Space prep
        { id: 'nasa_workbench', pos: [60, 1, 70] },
        { id: 'fuel_loader', pos: [62, 1, 70] },
        { id: 'oxygen_collector', pos: [64, 1, 70] },
        { id: 'oxygen_compressor', pos: [66, 1, 70] },
        { id: 'landing_pad', pos: [70, 1, 70] },
        { id: 'landing_pad', pos: [73, 1, 70] },
        { id: 'landing_pad', pos: [76, 1, 70] }
    ];

    // === EV - AE2 System complet, Titane ===
    BASE_CONFIGS.ev.machines = [
        // Génération EV
        { id: 'multiblock_combustion_engine', pos: [90, 1, 26], label: 'Combustion - 2048-6144 EU/t' },
        { id: 'large_gas_turbine', pos: [96, 1, 26] },
        { id: 'nuclear_reactor_simple', pos: [102, 1, 26], label: '1280 EU/t' },
        { id: 'transformer_hv_ev', pos: [94, 1, 32] },
        { id: 'lapotronic_supercapacitor', pos: [98, 1, 32], label: 'Power Storage' },

        // AE2 System COMPLET
        // Controller cluster
        { id: 'me_controller', pos: [90, 1, 50] },
        { id: 'me_controller', pos: [91, 1, 50] },
        { id: 'me_controller', pos: [92, 1, 50] },
        { id: 'me_controller', pos: [93, 1, 50] },
        { id: 'me_controller', pos: [90, 2, 50] },
        { id: 'me_controller', pos: [91, 2, 50] },
        { id: 'me_controller', pos: [92, 2, 50] },
        { id: 'me_controller', pos: [93, 2, 50] },

        // Drives (beaucoup!)
        { id: 'me_drive', pos: [96, 1, 50] },
        { id: 'me_drive', pos: [97, 1, 50] },
        { id: 'me_drive', pos: [98, 1, 50] },
        { id: 'me_drive', pos: [99, 1, 50] },
        { id: 'me_drive', pos: [100, 1, 50] },
        { id: 'me_drive', pos: [96, 2, 50] },
        { id: 'me_drive', pos: [97, 2, 50] },
        { id: 'me_drive', pos: [98, 2, 50] },
        { id: 'me_drive', pos: [99, 2, 50] },
        { id: 'me_drive', pos: [100, 2, 50] },

        // Crafting CPUs (gros cluster)
        { id: 'crafting_cpu_64k', pos: [90, 1, 54] },
        { id: 'crafting_cpu_64k', pos: [91, 1, 54] },
        { id: 'crafting_cpu_64k', pos: [92, 1, 54] },
        { id: 'crafting_co_processing', pos: [93, 1, 54] },
        { id: 'crafting_co_processing', pos: [94, 1, 54] },
        { id: 'crafting_cpu_64k', pos: [90, 2, 54] },
        { id: 'crafting_cpu_64k', pos: [91, 2, 54] },
        { id: 'crafting_cpu_64k', pos: [92, 2, 54] },
        { id: 'crafting_co_processing', pos: [93, 2, 54] },
        { id: 'crafting_co_processing', pos: [94, 2, 54] },

        // Interfaces + Assemblers
        { id: 'me_interface', pos: [96, 1, 54] },
        { id: 'molecular_assembler', pos: [97, 1, 54] },
        { id: 'molecular_assembler', pos: [98, 1, 54] },
        { id: 'molecular_assembler', pos: [99, 1, 54] },
        { id: 'molecular_assembler', pos: [100, 1, 54] },
        { id: 'me_interface', pos: [96, 2, 54] },
        { id: 'molecular_assembler', pos: [97, 2, 54] },
        { id: 'molecular_assembler', pos: [98, 2, 54] },
        { id: 'molecular_assembler', pos: [99, 2, 54] },
        { id: 'molecular_assembler', pos: [100, 2, 54] },

        // Inscribers
        { id: 'inscriber', pos: [102, 1, 50] },
        { id: 'inscriber', pos: [103, 1, 50] },
        { id: 'inscriber', pos: [104, 1, 50] },
        { id: 'inscriber', pos: [105, 1, 50] },

        // Énergie AE2
        { id: 'energy_acceptor', pos: [102, 1, 54] },
        { id: 'dense_energy_cell', pos: [103, 1, 54] },
        { id: 'dense_energy_cell', pos: [104, 1, 54] },

        // Terminaux
        { id: 'me_terminal', pos: [90, 1, 48] },
        { id: 'crafting_terminal', pos: [91, 1, 48] },
        { id: 'pattern_terminal', pos: [92, 1, 48] },
        { id: 'interface_terminal', pos: [93, 1, 48] },

        // Multiblocks Ore Processing EV
        { id: 'industrial_centrifuge', pos: [90, 1, 70], label: 'TPV coils' },
        { id: 'industrial_macerator', pos: [96, 1, 70] },
        { id: 'industrial_ore_washer', pos: [102, 1, 70] },
        { id: 'industrial_thermal_centrifuge', pos: [108, 1, 70] },

        // Machines EV
        { id: 'autoclave_ev', pos: [90, 1, 80], label: 'Tungstate' },
        { id: 'autoclave_ev', pos: [92, 1, 80] },
        { id: 'circuit_assembler_ev', pos: [94, 1, 80] },
        { id: 'circuit_assembler_ev', pos: [96, 1, 80] },
        { id: 'assembler_ev', pos: [98, 1, 80] },
        { id: 'assembler_ev', pos: [100, 1, 80] },

        // TPV Coils
        { id: 'coil_tpv', pos: [33, 2, 27], label: 'Upgrade TPV' },

        // Quantum storage
        { id: 'quantum_chest', pos: [110, 1, 50] },
        { id: 'quantum_chest', pos: [111, 1, 50] },
        { id: 'quantum_chest', pos: [112, 1, 50] },
        { id: 'quantum_tank', pos: [114, 1, 50] },
        { id: 'quantum_tank', pos: [115, 1, 50] }
    ];

    // === IV - Assembly Line, Platline, Mega multiblocks ===
    BASE_CONFIGS.iv.machines = [
        // Power massive
        { id: 'extreme_combustion_engine', pos: [120, 1, 26] },
        { id: 'xl_turbo_steam_turbine', pos: [126, 1, 26] },
        { id: 'deep_earth_heating_pump', pos: [132, 1, 26] },
        { id: 'rocketdyne_f1a', pos: [138, 1, 26] },
        { id: 'solar_tower', pos: [146, 1, 26] },
        { id: 'transformer_ev_iv', pos: [130, 1, 34] },

        // ASSEMBLY LINE - Gate vers LuV!
        { id: 'assembly_line', pos: [120, 1, 50], label: 'ASSEMBLY LINE - 90 ZPM circuits!' },

        // Processing Multiblocks IV
        { id: 'zyngen', pos: [120, 1, 70] },
        { id: 'industrial_electrolyzer', pos: [126, 1, 70] },
        { id: 'magnetic_flux_exhibitor', pos: [132, 1, 70] },
        { id: 'industrial_extrusion', pos: [138, 1, 70] },
        { id: 'industrial_mixing', pos: [144, 1, 70] },
        { id: 'industrial_wire_factory', pos: [150, 1, 70] },

        // Avec ABS
        { id: 'alloy_blast_smelter', pos: [120, 1, 80], label: 'ABS - Gate' },
        { id: 'industrial_cutting', pos: [126, 1, 80] },
        { id: 'dangote_distillus', pos: [132, 1, 80] },
        { id: 'industrial_sledgehammer', pos: [138, 1, 80] },
        { id: 'fluid_shaper', pos: [144, 1, 80] },
        { id: 'amazon_warehousing', pos: [150, 1, 80] },
        { id: 'hyper_laser_engraver', pos: [156, 1, 80] },

        // Volcanus et Cryo
        { id: 'volcanus', pos: [120, 1, 95], label: '2x EBF, 8 parallèles' },
        { id: 'cryogenic_freezer', pos: [126, 1, 95], label: '2x speed, 4 parallèles' },

        // Mega multiblocks
        { id: 'mega_vacuum_freezer', pos: [134, 1, 95], label: '256 parallèles!' },
        { id: 'mega_ebf', pos: [142, 1, 95], label: '256 parallèles' },

        // Resource gathering
        { id: 'boldarnator', pos: [120, 1, 110] },
        { id: 'extreme_greenhouse', pos: [126, 1, 110] },
        { id: 'tree_growth_simulator', pos: [134, 1, 110] },
        { id: 'zhuhai_fishing_port', pos: [142, 1, 110] },
        { id: 'ore_drilling_plant_t2', pos: [150, 1, 110] },
        { id: 'fluid_drilling_rig_t4', pos: [156, 1, 110] },

        // PLATLINE (~50 étapes)
        { id: 'platline_setup', pos: [120, 1, 130], label: 'PLATLINE - 50 étapes!' }
    ];

    // ===========================================
    // CÂBLES ET PIPES - Comment tout connecter
    // ===========================================

    // === STEAM - Pipes bronze pour la vapeur ===
    BASE_CONFIGS.steam.cables = [
        // Chaudières vers buffer vapeur central
        { from: [2, 1, 2], to: [7, 1, 2], type: 'pipe_bronze', label: 'Vapeur chaudières' },
        { from: [7, 1, 2], to: [12, 1, 2], type: 'pipe_bronze' },
        { from: [7, 1, 2], to: [7, 1, 5], type: 'pipe_bronze', label: 'Vers buffer' },

        // Buffer vers machines vapeur
        { from: [7, 1, 5], to: [7, 1, 10], type: 'pipe_bronze', label: 'Distribution' },
        { from: [2, 1, 10], to: [10, 1, 10], type: 'pipe_bronze', label: 'Ligne macérateurs' },

        // Vers metal processing
        { from: [7, 1, 10], to: [7, 1, 14], type: 'pipe_bronze' },
        { from: [2, 1, 14], to: [14, 1, 14], type: 'pipe_bronze', label: 'Ligne forgeage' },

        // Item transport (hoppers/pipes)
        { from: [6, 1, 10], to: [6, 1, 14], type: 'pipe_item', label: 'Items crushed → forge' },
        { from: [10, 1, 14], to: [10, 1, 20], type: 'pipe_item', label: 'Output → stockage' }
    ];

    // === LV - Câbles tin + pipes steel ===
    BASE_CONFIGS.lv.cables = [
        // Turbines vers battery buffer
        { from: [2, 1, 26], to: [16, 1, 26], type: 'cable_tin_4x', label: '8 turbines → buffer' },
        { from: [9, 1, 26], to: [9, 1, 28], type: 'cable_tin_4x', label: 'Vers buffer 16x' },

        // Buffer principal vers distribution
        { from: [9, 1, 28], to: [9, 1, 32], type: 'cable_tin_4x', label: 'Main power line' },
        { from: [9, 1, 32], to: [9, 1, 36], type: 'cable_tin_4x' },
        { from: [9, 1, 36], to: [9, 1, 40], type: 'cable_tin_4x' },
        { from: [9, 1, 40], to: [9, 1, 44], type: 'cable_tin_4x' },

        // Distribution vers lignes de machines
        { from: [2, 1, 32], to: [12, 1, 32], type: 'cable_tin_1x', label: 'Ligne priorité' },
        { from: [2, 1, 36], to: [16, 1, 36], type: 'cable_tin_1x', label: 'Ligne ore processing' },
        { from: [2, 1, 40], to: [18, 1, 40], type: 'cable_tin_1x', label: 'Ligne metal' },
        { from: [2, 1, 44], to: [24, 1, 44], type: 'cable_tin_1x', label: 'Ligne chimie' },

        // VERS EBF - 4A minimum!
        { from: [9, 1, 28], to: [32, 1, 28], type: 'cable_tin_4x', label: '4A vers EBF!' },
        { from: [32, 1, 28], to: [32, 1, 29], type: 'cable_tin_4x' },
        { from: [32, 1, 29], to: [34, 1, 29], type: 'cable_tin_4x', label: '2x energy hatch' },

        // Ore processing flow (items)
        { from: [2, 1, 36], to: [2, 1, 40], type: 'pipe_item', label: 'Crushed → alloy' },
        { from: [6, 1, 36], to: [8, 1, 36], type: 'pipe_item', label: 'Macerator → washer' },
        { from: [10, 1, 36], to: [12, 1, 36], type: 'pipe_item', label: 'Washer → centri' },

        // Fluides (eau pour ore washer)
        { from: [8, 1, 34], to: [8, 1, 36], type: 'pipe_steel', label: 'Eau → ore washer' },
        { from: [10, 1, 34], to: [10, 1, 36], type: 'pipe_steel' }
    ];

    // === MV - Câbles copper ===
    BASE_CONFIGS.mv.cables = [
        // Générateurs MV vers transfo
        { from: [36, 1, 26], to: [46, 1, 26], type: 'cable_copper_4x', label: 'Gens MV' },
        { from: [41, 1, 26], to: [41, 1, 28], type: 'cable_copper_4x', label: 'Vers buffer MV' },

        // Distribution MV
        { from: [41, 1, 28], to: [41, 1, 36], type: 'cable_copper_4x', label: 'Main MV' },
        { from: [41, 1, 36], to: [41, 1, 40], type: 'cable_copper_4x' },
        { from: [36, 1, 36], to: [58, 1, 36], type: 'cable_copper_1x', label: 'Machines MV' },
        { from: [36, 1, 40], to: [52, 1, 40], type: 'cable_copper_1x' },

        // Vers Pyrolyse
        { from: [41, 1, 28], to: [50, 1, 28], type: 'cable_copper_4x', label: 'Vers Pyrolyse' },
        { from: [50, 1, 28], to: [50, 1, 30], type: 'cable_copper_4x' },

        // Fluides Pyrolyse
        { from: [52, 1, 30], to: [52, 1, 35], type: 'pipe_steel', label: 'Éthylène out' },
        { from: [54, 1, 30], to: [54, 1, 35], type: 'pipe_steel', label: 'Wood tar out' }
    ];

    // === HV - Câbles gold ===
    BASE_CONFIGS.hv.cables = [
        // Générateurs HV
        { from: [60, 1, 26], to: [70, 1, 26], type: 'cable_gold_4x', label: 'Turbines HV' },
        { from: [65, 1, 26], to: [65, 1, 28], type: 'cable_gold_4x' },

        // Main HV distribution
        { from: [65, 1, 28], to: [65, 1, 36], type: 'cable_gold_4x', label: 'Main HV' },
        { from: [65, 1, 36], to: [65, 1, 50], type: 'cable_gold_4x' },
        { from: [65, 1, 50], to: [65, 1, 60], type: 'cable_gold_4x' },
        { from: [65, 1, 60], to: [65, 1, 70], type: 'cable_gold_4x' },

        // Vers multiblocks
        { from: [65, 1, 36], to: [72, 1, 36], type: 'cable_gold_4x', label: 'Vers LCR' },
        { from: [72, 1, 36], to: [78, 1, 36], type: 'cable_gold_4x', label: 'Vers Vacuum' },
        { from: [78, 1, 36], to: [84, 1, 36], type: 'cable_gold_4x', label: 'Vers Distillation' },

        { from: [65, 1, 50], to: [72, 1, 50], type: 'cable_gold_4x', label: 'Vers Implosion' },
        { from: [72, 1, 50], to: [78, 1, 50], type: 'cable_gold_4x', label: 'Vers Oil Cracker' },
        { from: [78, 1, 50], to: [84, 1, 50], type: 'cable_gold_4x', label: 'Vers Multi Smelter' },

        // Vers Cleanroom
        { from: [65, 1, 50], to: [60, 1, 50], type: 'cable_gold_4x', label: 'Vers Cleanroom' },

        // Fluides multiblocks
        { from: [84, 1, 36], to: [84, 1, 45], type: 'pipe_stainless', label: 'Distillation outputs' },
        { from: [78, 1, 50], to: [78, 1, 55], type: 'pipe_stainless', label: 'Cracked fuel' }
    ];

    // === EV - Câbles aluminium ===
    BASE_CONFIGS.ev.cables = [
        // Power EV
        { from: [90, 1, 26], to: [102, 1, 26], type: 'cable_aluminium_4x', label: 'Power EV' },
        { from: [96, 1, 26], to: [96, 1, 32], type: 'cable_aluminium_4x' },
        { from: [96, 1, 32], to: [98, 1, 32], type: 'cable_aluminium_4x', label: 'Vers Supercap' },

        // Main distribution EV
        { from: [98, 1, 32], to: [98, 1, 50], type: 'cable_aluminium_4x', label: 'Main EV' },
        { from: [98, 1, 50], to: [98, 1, 70], type: 'cable_aluminium_4x' },
        { from: [98, 1, 70], to: [98, 1, 80], type: 'cable_aluminium_4x' },

        // Vers AE2
        { from: [98, 1, 50], to: [102, 1, 50], type: 'cable_aluminium_4x', label: 'Vers AE2' },
        { from: [102, 1, 50], to: [102, 1, 54], type: 'cable_aluminium_4x', label: 'Energy Acceptor' },

        // ME Network (câbles ME)
        { from: [90, 1, 50], to: [93, 1, 50], type: 'me_cable', label: 'ME Network' },
        { from: [91, 1, 50], to: [91, 1, 48], type: 'me_cable', label: 'Vers terminaux' },
        { from: [93, 1, 50], to: [96, 1, 50], type: 'me_cable', label: 'Vers drives' },
        { from: [96, 1, 50], to: [100, 1, 50], type: 'me_cable' },
        { from: [98, 1, 50], to: [98, 1, 54], type: 'me_cable', label: 'Vers crafting' },
        { from: [96, 1, 54], to: [100, 1, 54], type: 'me_cable', label: 'Assemblers' },

        // Vers ore processing
        { from: [98, 1, 70], to: [90, 1, 70], type: 'cable_aluminium_4x', label: 'Vers Ind. Centri' },
        { from: [90, 1, 70], to: [108, 1, 70], type: 'cable_aluminium_4x', label: 'Ore processing line' }
    ];

    // === IV - Câbles tungsten ===
    BASE_CONFIGS.iv.cables = [
        // Power IV massive
        { from: [120, 1, 26], to: [146, 1, 26], type: 'cable_tungsten_4x', label: 'Power IV' },
        { from: [133, 1, 26], to: [133, 1, 34], type: 'cable_tungsten_4x' },
        { from: [130, 1, 34], to: [133, 1, 34], type: 'cable_tungsten_4x', label: 'Transfo' },

        // Main IV
        { from: [133, 1, 34], to: [133, 1, 50], type: 'cable_tungsten_4x', label: 'Main IV' },
        { from: [133, 1, 50], to: [133, 1, 70], type: 'cable_tungsten_4x' },
        { from: [133, 1, 70], to: [133, 1, 80], type: 'cable_tungsten_4x' },
        { from: [133, 1, 80], to: [133, 1, 95], type: 'cable_tungsten_4x' },
        { from: [133, 1, 95], to: [133, 1, 110], type: 'cable_tungsten_4x' },
        { from: [133, 1, 110], to: [133, 1, 130], type: 'cable_tungsten_4x' },

        // Vers Assembly Line
        { from: [133, 1, 50], to: [120, 1, 50], type: 'cable_tungsten_4x', label: 'Assembly Line!' },

        // Vers Processing
        { from: [133, 1, 70], to: [120, 1, 70], type: 'cable_tungsten_4x' },
        { from: [120, 1, 70], to: [150, 1, 70], type: 'cable_tungsten_4x', label: 'Processing line' },

        { from: [133, 1, 80], to: [120, 1, 80], type: 'cable_tungsten_4x' },
        { from: [120, 1, 80], to: [156, 1, 80], type: 'cable_tungsten_4x', label: 'ABS line' },

        // Vers Mega multiblocks
        { from: [133, 1, 95], to: [120, 1, 95], type: 'cable_tungsten_4x', label: 'Volcanus' },
        { from: [133, 1, 95], to: [142, 1, 95], type: 'cable_tungsten_4x', label: 'Mega EBF' },

        // Vers Platline
        { from: [133, 1, 130], to: [120, 1, 130], type: 'cable_tungsten_4x', label: 'PLATLINE' }
    ];
}

// Initialiser les layouts
generateRealisticBases();

// === FONCTIONS DE RENDU ===

function init() {
    const canvas = document.getElementById('canvas');

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 40, 50);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(25, 2, 25);

    setupLighting();
    loadBase(currentTier);
    document.getElementById('loading').classList.add('hidden');

    setupEvents();
    animate();
}

function setupLighting() {
    scene.add(new THREE.AmbientLight(0x404060, 0.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(100, 150, 100);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(4096, 4096);
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 400;
    mainLight.shadow.camera.left = -150;
    mainLight.shadow.camera.right = 150;
    mainLight.shadow.camera.top = 150;
    mainLight.shadow.camera.bottom = -150;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8080ff, 0.3);
    fillLight.position.set(-50, 50, -50);
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

    // Murs transparents
    const wallMat = new THREE.MeshStandardMaterial({
        color: tierColors.primary,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
    backWall.position.set(width/2, height/2, 0);
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(0, height/2, depth/2);
    group.add(leftWall);

    // Colonnes
    const pillarGeo = new THREE.BoxGeometry(0.5, height, 0.5);
    const pillarMat = new THREE.MeshStandardMaterial({ color: tierColors.secondary, metalness: 0.5 });

    [[0, 0], [width, 0], [0, depth], [width, depth]].forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, height/2, z);
        pillar.castShadow = true;
        group.add(pillar);
    });

    return group;
}

function createMachine(machineId, position) {
    const data = MACHINES[machineId];
    if (!data) return null;

    const [w, h, d] = data.size;
    const geometry = new THREE.BoxGeometry(w * 0.9, h * 0.9, d * 0.9);

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
        'cable_ev': 0x00CED1,
        'cable_iv': 0xF0F0F5
    };

    const color = cableColors[type] || 0x888888;
    const radius = type.startsWith('pipe') ? 0.15 : 0.08;

    const points = [];
    points.push(new THREE.Vector3(from[0] + 0.5, from[1] + 0.3, from[2] + 0.5));

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
    machineObjects.forEach(obj => scene.remove(obj));
    cableObjects.forEach(obj => scene.remove(obj));
    structureObjects.forEach(obj => scene.remove(obj));
    machineObjects = [];
    cableObjects = [];
    structureObjects = [];

    const config = BASE_CONFIGS[tier];
    const tierColors = TIER_COLORS[tier];

    const building = createBuilding(config, tierColors);
    scene.add(building);
    structureObjects.push(building);

    let allMachines = [];
    let allCables = [];
    let currentTierConfig = tier;

    while (currentTierConfig) {
        const cfg = BASE_CONFIGS[currentTierConfig];
        allMachines = [...cfg.machines, ...allMachines];
        allCables = [...cfg.cables, ...allCables];
        currentTierConfig = cfg.inherited;
    }

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

    allCables.forEach(cableConfig => {
        const mesh = createCable(cableConfig.from, cableConfig.to, cableConfig.type);
        if (mesh) {
            scene.add(mesh);
            cableObjects.push(mesh);
        }
    });

    document.getElementById('currentTier').textContent = tier.toUpperCase();
    document.getElementById('machineCount').textContent = allMachines.length;

    let euProd = 0;
    allMachines.forEach(m => {
        const data = MACHINES[m.id];
        if (data && data.output && data.output.includes('EU/t')) {
            const match = data.output.match(/(\d+)/);
            if (match) euProd += parseInt(match[1]);
        }
    });
    document.getElementById('euProduction').textContent = euProd > 0 ? euProd + ' EU/t' : 'Steam';

    const size = config.buildingSize;
    controls.target.set(size.width/2, 3, size.depth/2);
    camera.position.set(
        size.width/2 + size.width * 0.5,
        size.height * 1.5,
        size.depth/2 + size.depth * 0.5
    );

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
        'casing': 'Casings',
        'structure': 'Structures',
        'pipe': 'Pipes',
        'cable': 'Câbles'
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
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTier = btn.dataset.tier;
            loadBase(currentTier);
        });
    });

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
    if (data.capacity) specs += `<div>Capacité: <span style="color:#00ff00">${data.capacity}</span></div>`;
    if (data.amps) specs += `<div>Amperage: <span style="color:#ffff00">${data.amps}</span></div>`;
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
