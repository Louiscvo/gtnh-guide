-- GTNH Guide Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MACHINES TABLE
-- ============================================
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- multiblock, singleblock, steam, ae2
    type VARCHAR(50), -- processing, chemistry, generator, etc.
    unlock_tier VARCHAR(20), -- Steam, LV, MV, HV, EV, IV, LuV, ZPM, UV
    image_url TEXT,
    wiki_url TEXT,
    tiers TEXT[], -- For singleblocks: available tiers
    priority VARCHAR(20), -- critical, high, normal

    -- Multilingual names
    name_en VARCHAR(200) NOT NULL,
    name_fr VARCHAR(200) NOT NULL,

    -- Multilingual descriptions
    power_en TEXT,
    power_fr TEXT,
    usage_en TEXT,
    usage_fr TEXT,
    dangers_en TEXT,
    dangers_fr TEXT,
    tips_en TEXT,
    tips_fr TEXT,

    -- Structure info (JSON)
    structure JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_machines_category ON machines(category);
CREATE INDEX idx_machines_tier ON machines(unlock_tier);
CREATE INDEX idx_machines_type ON machines(type);

-- ============================================
-- ORE VEINS TABLE
-- ============================================
CREATE TABLE ore_veins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    primary_ore VARCHAR(100),
    secondary_ore VARCHAR(100),
    between_ore VARCHAR(100),
    sporadic_ore VARCHAR(100),
    products TEXT[],
    dimensions TEXT[], -- Overworld, Nether, End, Moon, etc.
    y_min INTEGER,
    y_max INTEGER,
    stage VARCHAR(50), -- earlyGame, midGame, advancedGame, lateGame
    note_en TEXT,
    note_fr TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TIERS TABLE
-- ============================================
CREATE TABLE tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_id VARCHAR(20) UNIQUE NOT NULL, -- steam, lv, mv, hv, ev, iv, luv, zpm, uv, uhv
    name_en VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_short VARCHAR(10) NOT NULL,
    voltage INTEGER NOT NULL,
    color VARCHAR(10),
    description_en TEXT,
    description_fr TEXT,
    goals_en TEXT[],
    goals_fr TEXT[],
    key_materials TEXT[],
    tips_en TEXT[],
    tips_fr TEXT[],
    warnings_en TEXT[],
    warnings_fr TEXT[],
    sort_order INTEGER
);

-- ============================================
-- USER BASES TABLE (for saving custom bases)
-- ============================================
CREATE TABLE user_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    description TEXT,
    layout JSONB NOT NULL, -- Machine positions, cables, etc.
    is_public BOOLEAN DEFAULT false,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user bases
CREATE INDEX idx_user_bases_user ON user_bases(user_id);
CREATE INDEX idx_user_bases_tier ON user_bases(tier);
CREATE INDEX idx_user_bases_public ON user_bases(is_public);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ore_veins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public read access for reference data
CREATE POLICY "Public machines read" ON machines FOR SELECT USING (true);
CREATE POLICY "Public ore_veins read" ON ore_veins FOR SELECT USING (true);
CREATE POLICY "Public tiers read" ON tiers FOR SELECT USING (true);

-- User bases policies
CREATE POLICY "Users can read public bases" ON user_bases FOR SELECT USING (is_public = true);
CREATE POLICY "Users can read own bases" ON user_bases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bases" ON user_bases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bases" ON user_bases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bases" ON user_bases FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Public comments read" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_bases_updated_at
    BEFORE UPDATE ON user_bases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SAMPLE DATA INSERT
-- ============================================

-- Insert tiers
INSERT INTO tiers (tier_id, name_en, name_fr, name_short, voltage, color, sort_order) VALUES
('steam', 'Steam Age', 'Âge de la Vapeur', 'Steam', 0, '#C0C0C0', 1),
('lv', 'Low Voltage', 'Basse Tension', 'LV', 32, '#DCDCDC', 2),
('mv', 'Medium Voltage', 'Moyenne Tension', 'MV', 128, '#FF6400', 3),
('hv', 'High Voltage', 'Haute Tension', 'HV', 512, '#FFFF00', 4),
('ev', 'Extreme Voltage', 'Tension Extrême', 'EV', 2048, '#00FFFF', 5),
('iv', 'Insane Voltage', 'Tension Insensée', 'IV', 8192, '#FF00FF', 6),
('luv', 'Ludicrous Voltage', 'Tension Ridicule', 'LuV', 32768, '#FF69B4', 7),
('zpm', 'Zero Point Module', 'Module Point Zéro', 'ZPM', 131072, '#00FF00', 8),
('uv', 'Ultimate Voltage', 'Tension Ultime', 'UV', 524288, '#FF0000', 9),
('uhv', 'Highly Ultimate Voltage', 'Tension Hautement Ultime', 'UHV', 2097152, '#4B0082', 10);

-- Insert sample machines (EBF example)
INSERT INTO machines (machine_id, category, type, unlock_tier, image_url, wiki_url, name_en, name_fr, power_en, power_fr, usage_en, usage_fr, dangers_en, dangers_fr, tips_en, tips_fr, structure) VALUES
('ebf', 'multiblock', 'processing', 'LV',
'textures/machines/EBF.png',
'https://gtnh.miraheze.org/wiki/Electric_Blast_Furnace',
'Electric Blast Furnace', 'Four à Arc Électrique',
'LV: 120 EU/t (4A minimum = 2 energy hatches)
MV: 480 EU/t
HV: 1920 EU/t
Requires minimum 4 amps for most recipes',
'LV: 120 EU/t (4A minimum = 2 energy hatches)
MV: 480 EU/t
HV: 1920 EU/t
Nécessite minimum 4 ampères pour la plupart des recettes',
'Essential for smelting high-temperature materials: Steel (1000K), Aluminium (1700K), Titanium (1940K), Tungstensteel (3000K). Place items in input bus, output appears in output bus. Coil tier determines max temperature.',
'Essentiel pour fondre les matériaux haute température : Acier (1000K), Aluminium (1700K), Titane (1940K), Tungstensteel (3000K). Placez les items dans l''input bus, le résultat apparaît dans l''output bus. Le tier des bobines détermine la température max.',
'⚠️ POLLUTION: Produces pollution - use Muffler Hatch
⚠️ POWER DRAW: 4A minimum - single energy hatch will NOT work for most recipes
⚠️ MAINTENANCE: Will stop working if maintenance issues occur',
'⚠️ POLLUTION : Produit de la pollution - utiliser Muffler Hatch
⚠️ CONSOMMATION : 4A minimum - une seule energy hatch NE FONCTIONNERA PAS pour la plupart des recettes
⚠️ MAINTENANCE : Arrêtera de fonctionner si problèmes de maintenance',
'• Build wall-shared EBFs to save resources
• Upgrade coils ASAP for higher temperature recipes
• Use 2+ Energy Hatches for 4A recipes',
'• Construisez des EBF avec murs partagés pour économiser
• Améliorez les bobines rapidement pour recettes haute température
• Utilisez 2+ Energy Hatches pour recettes 4A',
'{"dimensions": "3x3x4", "components": ["Heat-Proof Machine Casing", "Cupronickel Coils (LV) / Kanthal (MV+)", "1 Controller", "1+ Input Bus", "1+ Output Bus", "1+ Energy Hatch", "Optional: Maintenance Hatch"]}'::jsonb);
