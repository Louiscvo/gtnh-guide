// Migration script: JSON to Supabase
// Run this script to import all JSON data into Supabase

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Use service key for migration

async function migrate() {
    // Load Supabase
    const { createClient } = require('@supabase/supabase-js');
    const fs = require('fs');
    const path = require('path');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log('Starting migration...');

    // Load JSON files
    const machinesI18n = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../data/machines-complete-i18n.json'), 'utf8'
    ));

    const oreVeins = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../data/ore-veins.json'), 'utf8'
    ));

    // Migrate multiblocks
    console.log('Migrating multiblocks...');
    for (const machine of machinesI18n.multiblocks || []) {
        const { error } = await supabase.from('machines').upsert({
            machine_id: machine.id,
            category: 'multiblock',
            type: machine.category || 'processing',
            unlock_tier: machine.unlockTier,
            image_url: machine.image,
            wiki_url: machine.wikiUrl,
            name_en: machine.names?.en || machine.id,
            name_fr: machine.names?.fr || machine.id,
            power_en: machine.power?.en,
            power_fr: machine.power?.fr,
            usage_en: machine.usage?.en,
            usage_fr: machine.usage?.fr,
            dangers_en: machine.dangers?.en,
            dangers_fr: machine.dangers?.fr,
            tips_en: machine.tips?.en,
            tips_fr: machine.tips?.fr,
            structure: machine.structure
        }, { onConflict: 'machine_id' });

        if (error) {
            console.error(`Error migrating ${machine.id}:`, error);
        } else {
            console.log(`  ✓ ${machine.names?.en || machine.id}`);
        }
    }

    // Migrate singleblocks
    console.log('\nMigrating singleblocks...');
    for (const machine of machinesI18n.singleblocks || []) {
        const { error } = await supabase.from('machines').upsert({
            machine_id: machine.id,
            category: 'singleblock',
            type: machine.category || 'processing',
            tiers: machine.tiers,
            priority: machine.priority,
            name_en: machine.names?.en || machine.id,
            name_fr: machine.names?.fr || machine.id,
            power_en: machine.power?.en,
            power_fr: machine.power?.fr,
            usage_en: machine.usage?.en,
            usage_fr: machine.usage?.fr,
            dangers_en: machine.dangers?.en,
            dangers_fr: machine.dangers?.fr,
            tips_en: machine.tips?.en,
            tips_fr: machine.tips?.fr
        }, { onConflict: 'machine_id' });

        if (error) {
            console.error(`Error migrating ${machine.id}:`, error);
        } else {
            console.log(`  ✓ ${machine.names?.en || machine.id}`);
        }
    }

    // Migrate steam machines
    console.log('\nMigrating steam machines...');
    for (const machine of machinesI18n.steamMachines || []) {
        const { error } = await supabase.from('machines').upsert({
            machine_id: machine.id,
            category: 'steam',
            type: machine.category || 'processing',
            unlock_tier: 'Steam',
            name_en: machine.names?.en || machine.id,
            name_fr: machine.names?.fr || machine.id,
            power_en: machine.power?.en,
            power_fr: machine.power?.fr,
            usage_en: machine.usage?.en,
            usage_fr: machine.usage?.fr,
            dangers_en: machine.dangers?.en,
            dangers_fr: machine.dangers?.fr,
            tips_en: machine.tips?.en,
            tips_fr: machine.tips?.fr
        }, { onConflict: 'machine_id' });

        if (error) {
            console.error(`Error migrating ${machine.id}:`, error);
        } else {
            console.log(`  ✓ ${machine.names?.en || machine.id}`);
        }
    }

    // Migrate AE2
    console.log('\nMigrating AE2 machines...');
    for (const machine of machinesI18n.ae2 || []) {
        const { error } = await supabase.from('machines').upsert({
            machine_id: machine.id,
            category: 'ae2',
            type: machine.category || 'network',
            unlock_tier: 'EV',
            name_en: machine.names?.en || machine.id,
            name_fr: machine.names?.fr || machine.id,
            power_en: machine.power?.en,
            power_fr: machine.power?.fr,
            usage_en: machine.usage?.en,
            usage_fr: machine.usage?.fr,
            dangers_en: machine.dangers?.en,
            dangers_fr: machine.dangers?.fr,
            tips_en: machine.tips?.en,
            tips_fr: machine.tips?.fr
        }, { onConflict: 'machine_id' });

        if (error) {
            console.error(`Error migrating ${machine.id}:`, error);
        } else {
            console.log(`  ✓ ${machine.names?.en || machine.id}`);
        }
    }

    // Migrate ore veins
    console.log('\nMigrating ore veins...');
    if (oreVeins.veins) {
        for (const [stage, veins] of Object.entries(oreVeins.veins)) {
            for (const vein of veins) {
                const { error } = await supabase.from('ore_veins').upsert({
                    name: vein.name,
                    primary_ore: vein.primary,
                    secondary_ore: vein.secondary,
                    between_ore: vein.between,
                    sporadic_ore: vein.sporadic,
                    products: vein.products,
                    dimensions: vein.dimensions,
                    y_min: vein.yRange?.min,
                    y_max: vein.yRange?.max,
                    stage: stage,
                    note_en: vein.note,
                    note_fr: vein.note
                }, { onConflict: 'name' });

                if (error) {
                    console.error(`Error migrating ${vein.name}:`, error);
                } else {
                    console.log(`  ✓ ${vein.name}`);
                }
            }
        }
    }

    console.log('\n✅ Migration complete!');
}

// Run if called directly
if (require.main === module) {
    migrate().catch(console.error);
}

module.exports = { migrate };
