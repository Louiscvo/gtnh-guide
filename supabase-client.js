// Supabase Client for GTNH Guide
// Configuration - Replace with your Supabase project credentials

const SUPABASE_URL = 'https://tkdahbclnagzdeuaydzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZGFoYmNsbmFnemRldWF5ZHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTY3NjgsImV4cCI6MjA4NjY5Mjc2OH0.oFKroPYqFzVRbfK9E7ygNyyyBm_xBL7vjLhjAsxuXl0';

// Check if Supabase is configured
const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// Supabase client instance
let supabase = null;

// Initialize Supabase
async function initSupabase() {
    if (!isSupabaseConfigured) {
        console.log('Supabase not configured - using local JSON files');
        return false;
    }

    // Load Supabase JS from CDN if not already loaded
    if (typeof window.supabase === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
    return true;
}

// Helper to load external scripts
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

// Get all machines
async function getMachines(lang = 'fr') {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('unlock_tier', { ascending: true });

    if (error) {
        console.error('Error fetching machines:', error);
        return null;
    }

    // Transform to app format
    return data.map(m => ({
        id: m.machine_id,
        category: m.category,
        type: m.type,
        unlockTier: m.unlock_tier,
        image: m.image_url,
        wikiUrl: m.wiki_url,
        tiers: m.tiers,
        priority: m.priority,
        names: { en: m.name_en, fr: m.name_fr },
        power: { en: m.power_en, fr: m.power_fr },
        usage: { en: m.usage_en, fr: m.usage_fr },
        dangers: { en: m.dangers_en, fr: m.dangers_fr },
        tips: { en: m.tips_en, fr: m.tips_fr },
        structure: m.structure
    }));
}

// Get all tiers
async function getTiers(lang = 'fr') {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('tiers')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching tiers:', error);
        return null;
    }

    return data.map(t => ({
        id: t.tier_id,
        name: lang === 'fr' ? t.name_fr : t.name_en,
        nameShort: t.name_short,
        voltage: t.voltage,
        color: t.color,
        description: lang === 'fr' ? t.description_fr : t.description_en,
        goals: lang === 'fr' ? t.goals_fr : t.goals_en,
        keyMaterials: t.key_materials,
        tips: lang === 'fr' ? t.tips_fr : t.tips_en,
        warnings: lang === 'fr' ? t.warnings_fr : t.warnings_en
    }));
}

// Get all ore veins
async function getOreVeins(lang = 'fr') {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('ore_veins')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching ore veins:', error);
        return null;
    }

    return data.map(o => ({
        name: o.name,
        primary: o.primary_ore,
        secondary: o.secondary_ore,
        between: o.between_ore,
        sporadic: o.sporadic_ore,
        products: o.products,
        dimensions: o.dimensions,
        yRange: { min: o.y_min, max: o.y_max },
        stage: o.stage,
        note: lang === 'fr' ? o.note_fr : o.note_en
    }));
}

// Get machines by category
async function getMachinesByCategory(category, lang = 'fr') {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('category', category);

    if (error) {
        console.error('Error fetching machines:', error);
        return null;
    }

    return data;
}

// Get machines by tier
async function getMachinesByTier(tier, lang = 'fr') {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('unlock_tier', tier);

    if (error) {
        console.error('Error fetching machines:', error);
        return null;
    }

    return data;
}

// Search machines
async function searchMachines(query, lang = 'fr') {
    if (!supabase) return null;

    const nameColumn = lang === 'fr' ? 'name_fr' : 'name_en';

    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .ilike(nameColumn, `%${query}%`);

    if (error) {
        console.error('Error searching machines:', error);
        return null;
    }

    return data;
}

// ============================================
// USER BASES FUNCTIONS
// ============================================

// Get user's saved bases
async function getUserBases() {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_bases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user bases:', error);
        return null;
    }

    return data;
}

// Get public bases
async function getPublicBases(tier = null) {
    if (!supabase) return null;

    let query = supabase
        .from('user_bases')
        .select('*')
        .eq('is_public', true)
        .order('likes', { ascending: false });

    if (tier) {
        query = query.eq('tier', tier);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching public bases:', error);
        return null;
    }

    return data;
}

// Save a base
async function saveBase(name, tier, layout, isPublic = false, description = '') {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('Must be logged in to save bases');
        return null;
    }

    const { data, error } = await supabase
        .from('user_bases')
        .insert({
            user_id: user.id,
            name,
            tier,
            layout,
            is_public: isPublic,
            description
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving base:', error);
        return null;
    }

    return data;
}

// Update a base
async function updateBase(baseId, updates) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('user_bases')
        .update(updates)
        .eq('id', baseId)
        .select()
        .single();

    if (error) {
        console.error('Error updating base:', error);
        return null;
    }

    return data;
}

// Delete a base
async function deleteBase(baseId) {
    if (!supabase) return null;

    const { error } = await supabase
        .from('user_bases')
        .delete()
        .eq('id', baseId);

    if (error) {
        console.error('Error deleting base:', error);
        return false;
    }

    return true;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

// Sign up
async function signUp(email, password) {
    if (!supabase) return null;

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        console.error('Sign up error:', error);
        return null;
    }

    return data;
}

// Sign in
async function signIn(email, password) {
    if (!supabase) return null;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Sign in error:', error);
        return null;
    }

    return data;
}

// Sign out
async function signOut() {
    if (!supabase) return null;

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Sign out error:', error);
        return false;
    }

    return true;
}

// Get current user
async function getCurrentUser() {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ============================================
// EXPORT
// ============================================

window.SupabaseDB = {
    init: initSupabase,
    isConfigured: isSupabaseConfigured,

    // Data
    getMachines,
    getTiers,
    getOreVeins,
    getMachinesByCategory,
    getMachinesByTier,
    searchMachines,

    // User bases
    getUserBases,
    getPublicBases,
    saveBase,
    updateBase,
    deleteBase,

    // Auth
    signUp,
    signIn,
    signOut,
    getCurrentUser
};
