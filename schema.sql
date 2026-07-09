-- ==========================================
-- SCRIPT DE BASE DE DONNÉES POUR GOLD YIELD
-- À exécuter dans l'éditeur SQL de Supabase
-- ==========================================
--
-- 💡 IMPORTANT : Si vous venez de créer les colonnes mais obtenez des erreurs 
-- de cache de schéma (ex: "Could not find the 'claimable_sum' column..."),
-- exécutez la commande suivante dans l'éditeur SQL pour forcer la mise à jour :
-- 
-- NOTIFY pgrst, 'reload schema';
-- ==========================================

-- 1. Création de la table 'users'
CREATE TABLE IF NOT EXISTS users (
    phone TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    invite_code TEXT DEFAULT 'GOLDYIELD',
    balance NUMERIC DEFAULT 1000,
    claimable_sum NUMERIC DEFAULT 0,
    last_tick_time BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la sécurité pour la table 'users' (Optionnel)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Création de la table 'active_investments'
CREATE TABLE IF NOT EXISTS active_investments (
    id TEXT PRIMARY KEY,
    user_phone TEXT REFERENCES users(phone) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    daily_profit NUMERIC NOT NULL,
    date_activated TEXT NOT NULL,
    last_collected_date TEXT NOT NULL,
    total_collected NUMERIC DEFAULT 0,
    total_profit NUMERIC NOT NULL,
    duration_days NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Création de la table 'transactions'
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_phone TEXT REFERENCES users(phone) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'collect')),
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Création d'index pour optimiser les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_active_investments_user ON active_investments(user_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_phone);
