/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Setup Supabase credentials (resilient fallback to user-provided JWT credentials)
const DEFAULT_SUPABASE_URL = 'https://ifreybansmlibegsfhkj.supabase.co';
const USER_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcmV5YmFuc21saWJlZ3NmaGtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQxNzc2NCwiZXhwIjoyMDk4OTkzNzY0fQ.V76X5EpN-nMN3wVq36pr5YaBtmV5LtTu-EFGSN7UwQ8';

const rawUrl = (process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('supabase.co'))
  ? process.env.SUPABASE_URL
  : DEFAULT_SUPABASE_URL;
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();

const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = (envServiceKey && envServiceKey.startsWith('eyJ'))
  ? envServiceKey
  : USER_SERVICE_ROLE_KEY;

console.log('[Supabase] Initializing client for:', cleanUrl);
const supabase = createClient(cleanUrl, serviceRoleKey);

// Helper function to check if an error is due to an unregistered/invalid Supabase API key or connection issue
function isApiKeyOrConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
  return (
    msg.includes('Unregistered API key') ||
    msg.includes('Invalid API key') ||
    msg.includes('invalid claim') ||
    msg.includes('ApiKey') ||
    msg.includes('PGRST301') ||
    msg.includes('401')
  );
}

// --- API Endpoints ---

// 1. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { phone, name, password, inviteCode } = req.body;
  if (!phone || !name || !password) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('phone')
      .eq('phone', phone)
      .maybeSingle();

    if (checkError && !isApiKeyOrConnectionError(checkError)) {
      console.warn('[Supabase Error Check User]:', checkError.message || checkError);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Ce numéro est déjà enregistré. Veuillez vous connecter.' });
    }

    // Insert new user profile with exact column matches
    let { error: insertError } = await supabase
      .from('users')
      .insert({
        phone,
        name,
        password,
        invite_code: inviteCode || 'GOLDYIELD',
        balance: 500,
        claimable_sum: 0,
        last_tick_time: Date.now()
      });

    if (insertError) {
      const errMsg = insertError.message || '';
      if (errMsg.includes('claimable_sum') || errMsg.includes('last_tick_time') || errMsg.includes('invite_code') || errMsg.includes('schema cache')) {
        console.warn('[Supabase Fallback] Schema error or missing columns detected in registration. Retrying with minimal user schema...');
        const fallbackObj: any = { phone, name, password };
        if (!errMsg.includes('balance')) fallbackObj.balance = 500;
        if (!errMsg.includes('invite_code')) fallbackObj.invite_code = inviteCode || 'GOLDYIELD';

        const { error: secondAttemptError } = await supabase
          .from('users')
          .insert(fallbackObj);

        if (secondAttemptError) {
          throw secondAttemptError;
        }
      } else {
        throw insertError;
      }
    }

    res.json({
      success: true,
      user: {
        phone,
        name,
        inviteCode: inviteCode || 'GOLDYIELD',
        balance: 500,
        claimableSum: 0,
        lastTickTime: Date.now()
      }
    });
  } catch (error: any) {
    const errorDetails = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    console.error('[Supabase Register Error]:', errorDetails);
    let errMsg = error?.message || 'Erreur lors de l\'inscription.';
    if (errMsg.includes('relation "users" does not exist') || errMsg.includes('relation') || errMsg.includes('does not exist')) {
      errMsg = "La table 'users' n'existe pas encore dans Supabase. Veuillez copier et exécuter le script SQL du fichier 'schema.sql' dans l'éditeur SQL de votre console Supabase pour créer la structure.";
    }
    res.status(500).json({ error: errMsg });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Numéro et mot de passe requis.' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return res.status(404).json({ error: 'Numéro de téléphone non enregistré. Veuillez d’abord créer un compte.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect. Veuillez réessayer.' });
    }

    // Fetch active investments
    const { data: activeInvestments, error: invError } = await supabase
      .from('active_investments')
      .select('*')
      .eq('user_phone', phone);

    if (invError) {
      console.warn('[Supabase Active Investments fetch warning]:', invError.message);
    }

    // Fetch transactions ordered by created_at (since date column does not exist on user's Supabase)
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_phone', phone)
      .order('created_at', { ascending: false });

    if (txError) {
      console.warn('[Supabase Transactions fetch warning]:', txError.message);
    }

    // Map DB fields to application camelCase
    const mappedInvestments = (activeInvestments || []).map((inv: any) => ({
      id: inv.id,
      planId: inv.plan_id,
      planName: inv.plan_name,
      price: Number(inv.price),
      dailyProfit: Number(inv.daily_profit),
      dateActivated: inv.date_activated,
      lastCollectedDate: inv.last_collected_date,
      totalCollected: Number(inv.total_collected || 0),
      totalProfit: Number(inv.total_profit || 0),
      durationDays: Number(inv.duration_days || 30),
    }));

    const mappedTransactions = (transactions || []).map((tx: any) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      date: tx.created_at || tx.date,
      status: tx.status,
      details: tx.details,
    }));

    const schemaCacheStale = (user.claimable_sum === undefined || user.last_tick_time === undefined);

    res.json({
      success: true,
      user: {
        phone: user.phone,
        name: user.name,
        inviteCode: user.invite_code || 'GOLDYIELD',
        balance: user.balance !== undefined && user.balance !== null ? Number(user.balance) : 0,
        claimableSum: user.claimable_sum !== undefined && user.claimable_sum !== null ? Number(user.claimable_sum) : 0,
        lastTickTime: user.last_tick_time !== undefined && user.last_tick_time !== null ? Number(user.last_tick_time) : Date.now()
      },
      schemaCacheStale,
      activeInvestments: mappedInvestments,
      transactions: mappedTransactions
    });
  } catch (error: any) {
    const errorDetails = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    if (isApiKeyOrConnectionError(error)) {
      console.warn('[Supabase Login Info]: API key unregistered or invalid - login fallback to local check.', errorDetails);
      return res.status(404).json({ error: 'Base de données Supabase non connectée. Connexion via profil local.' });
    }
    console.error('[Supabase Login Error]:', errorDetails);
    let errMsg = error?.message || 'Erreur lors de la connexion.';
    if (errMsg.includes('relation "users" does not exist') || errMsg.includes('relation') || errMsg.includes('does not exist')) {
      errMsg = "La table 'users' n'existe pas encore dans Supabase. Veuillez copier et exécuter le script SQL du fichier 'schema.sql' dans l'éditeur SQL de votre console Supabase pour créer la structure.";
    }
    res.status(500).json({ error: errMsg });
  }
});

// 2.5 Auth: Get profile (used on refresh / auto-login)
app.get('/api/auth/profile', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: 'Phone requis.' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    // Fetch active investments
    const { data: activeInvestments, error: invError } = await supabase
      .from('active_investments')
      .select('*')
      .eq('user_phone', phone);

    if (invError) {
      console.warn('[Supabase Active Investments fetch warning]:', invError.message || JSON.stringify(invError));
    }

    // Fetch transactions ordered by created_at (since date column does not exist on user's Supabase)
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_phone', phone)
      .order('created_at', { ascending: false });

    if (txError) {
      console.warn('[Supabase Transactions fetch warning]:', txError.message || JSON.stringify(txError));
    }

    // Map DB fields to application camelCase
    const mappedInvestments = (activeInvestments || []).map((inv: any) => ({
      id: inv.id,
      planId: inv.plan_id,
      planName: inv.plan_name,
      price: Number(inv.price),
      dailyProfit: Number(inv.daily_profit),
      dateActivated: inv.date_activated,
      lastCollectedDate: inv.last_collected_date,
      totalCollected: Number(inv.total_collected || 0),
      totalProfit: Number(inv.total_profit || 0),
      durationDays: Number(inv.duration_days || 30),
    }));

    const mappedTransactions = (transactions || []).map((tx: any) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      date: tx.created_at || tx.date,
      status: tx.status,
      details: tx.details,
    }));

    const schemaCacheStale = (user.claimable_sum === undefined || user.last_tick_time === undefined);

    res.json({
      success: true,
      user: {
        phone: user.phone,
        name: user.name,
        inviteCode: user.invite_code || 'GOLDYIELD',
        balance: user.balance !== undefined && user.balance !== null ? Number(user.balance) : 0,
        claimableSum: user.claimable_sum !== undefined && user.claimable_sum !== null ? Number(user.claimable_sum) : 0,
        lastTickTime: user.last_tick_time !== undefined && user.last_tick_time !== null ? Number(user.last_tick_time) : Date.now()
      },
      schemaCacheStale,
      activeInvestments: mappedInvestments,
      transactions: mappedTransactions
    });
  } catch (error: any) {
    const errorDetails = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    if (isApiKeyOrConnectionError(error)) {
      console.warn('[Supabase Profile Info]: Supabase API key unregistered or invalid - fallback to client local state.');
      return res.status(404).json({ error: 'Database API key not registered. Using local state.' });
    }
    console.error('[Supabase Profile Error]:', errorDetails);
    let errMsg = error?.message || 'Erreur lors du chargement du profil.';
    if (errMsg.includes('relation "users" does not exist') || errMsg.includes('relation') || errMsg.includes('does not exist')) {
      errMsg = "La table 'users' n'existe pas encore dans Supabase. Veuillez copier et exécuter le script SQL du fichier 'schema.sql' dans l'éditeur SQL de votre console Supabase pour créer la structure.";
    }
    res.status(500).json({ error: errMsg });
  }
});

// 3. User: Sync Tick (claimable yields state update)
app.post('/api/user/sync-tick', async (req, res) => {
  const { phone, claimableSum, lastTickTime } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone requis.' });

  try {
    const { error } = await supabase
      .from('users')
      .update({
        claimable_sum: claimableSum,
        last_tick_time: lastTickTime
      })
      .eq('phone', phone);

    if (error) {
      if (isApiKeyOrConnectionError(error) || error.message.includes('claimable_sum') || error.message.includes('last_tick_time') || error.message.includes('schema cache')) {
        console.warn('[Supabase Sync Tick Fallback] Handled API key/schema cache warning on sync-tick.');
        return res.json({ success: true, warned: true });
      }
      throw error;
    }
    res.json({ success: true });
  } catch (error: any) {
    const errMsg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    if (isApiKeyOrConnectionError(error) || errMsg.includes('claimable_sum') || errMsg.includes('last_tick_time') || errMsg.includes('schema cache')) {
      console.warn('[Supabase Sync Tick Info]: Deferred tick sync (Supabase API key unregistered or invalid).');
      return res.json({ success: true, warned: true });
    }
    console.error('[Supabase Sync Tick Error]:', errMsg);
    res.status(500).json({ error: errMsg || 'Erreur lors de la synchronisation.' });
  }
});

// 4. User: Buy/Purchase active investment plan
app.post('/api/user/purchase', async (req, res) => {
  const { phone, planId, planName, price, dailyProfit, durationDays, totalProfit } = req.body;
  if (!phone || !planId) return res.status(400).json({ error: 'Phone et planId requis.' });

  try {
    // Check if trying to invest in 'plan_poussiere' and already has it
    if (planId === 'plan_poussiere') {
      const { data: existing, error: existErr } = await supabase
        .from('active_investments')
        .select('id')
        .eq('user_phone', phone)
        .eq('plan_id', 'plan_poussiere')
        .limit(1);

      if (!existErr && existing && existing.length > 0) {
        return res.status(400).json({ error: "L'investissement dans le Plan Poussière d'Or est limité à une seule fois." });
      }
    }

    // 1. Check current balance
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('phone', phone)
      .single();

    if (userErr) throw userErr;
    if (Number(user.balance) < price) {
      return res.status(400).json({ error: 'Solde insuffisant pour activer cet investissement.' });
    }

    const newBalance = Number(user.balance) - price;

    // 2. Update user balance
    const { error: balErr } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('phone', phone);

    if (balErr) throw balErr;

    // 3. Insert new active investment contract
    const invId = `act_${Date.now()}_${planId}`;
    const { error: invErr } = await supabase
      .from('active_investments')
      .insert({
        id: invId,
        user_phone: phone,
        plan_id: planId,
        plan_name: planName,
        price,
        daily_profit: dailyProfit,
        date_activated: new Date().toISOString(),
        last_collected_date: new Date().toISOString(),
        total_collected: 0,
        total_profit: totalProfit,
        duration_days: durationDays
      });

    if (invErr) throw invErr;

    // 4. Record transaction log (omitting 'date' column as it doesn't exist on user's Supabase)
    const txId = `tx_${Date.now()}_invest`;
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        id: txId,
        user_phone: phone,
        type: 'investment',
        amount: price,
        status: 'completed',
        details: `Activation du ${planName}`
      });

    if (txErr) throw txErr;

    res.json({
      success: true,
      balance: newBalance,
      investment: {
        id: invId,
        planId,
        planName,
        price,
        dailyProfit,
        dateActivated: new Date().toISOString(),
        lastCollectedDate: new Date().toISOString(),
        totalCollected: 0,
        totalProfit,
        durationDays
      },
      transaction: {
        id: txId,
        type: 'investment',
        amount: price,
        date: new Date().toISOString(),
        status: 'completed',
        details: `Activation du ${planName}`
      }
    });
  } catch (error: any) {
    const errorDetails = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    if (isApiKeyOrConnectionError(error)) {
      console.warn('[Supabase Purchase Info]: API key unregistered or invalid - handling transaction.', errorDetails);
    } else {
      console.error('[Supabase Purchase Error]:', errorDetails);
    }
    res.status(500).json({ error: error?.message || errorDetails });
  }
});

// 5. User: Collect accrued yields
app.post('/api/user/collect', async (req, res) => {
  const { phone, collectedAmount, claimableRemaining, updatedInvestments } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone requis.' });

  let schemaCacheStale = false;

  try {
    // 1. Get current balance
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('phone', phone)
      .single();

    if (userErr) throw userErr;

    const newBalance = Number(user.balance) + collectedAmount;

    // 2. Update user balance & claimable sums directly
    const { error: userUpdateErr } = await supabase
      .from('users')
      .update({
        balance: newBalance,
        claimable_sum: claimableRemaining,
        last_tick_time: Date.now()
      })
      .eq('phone', phone);

    if (userUpdateErr) {
      const errMsg = userUpdateErr.message || '';
      if (errMsg.includes('claimable_sum') || errMsg.includes('last_tick_time') || errMsg.includes('schema cache')) {
        schemaCacheStale = true;
        console.warn('[Supabase Collect Fallback] First update attempt failed (likely due to missing claimable_sum column or cached schema). Retrying with balance update only...');
        const { error: retryErr } = await supabase
          .from('users')
          .update({
            balance: newBalance
          })
          .eq('phone', phone);
        if (retryErr) {
          console.error('[Supabase Collect Fallback Retry Failed]:', retryErr.message || JSON.stringify(retryErr));
          throw retryErr;
        }
      } else {
        throw userUpdateErr;
      }
    }

    // 3. Insert transaction log (omitting 'date' column as it doesn't exist on user's Supabase)
    const txId = `tx_${Date.now()}_collect`;
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        id: txId,
        user_phone: phone,
        type: 'collect',
        amount: collectedAmount,
        status: 'completed',
        details: 'Collecte de gains journaliers'
      });

    if (txErr) throw txErr;

    // 4. Update stats for active contracts
    if (updatedInvestments && Array.isArray(updatedInvestments)) {
      for (const inv of updatedInvestments) {
        await supabase
          .from('active_investments')
          .update({
            total_collected: inv.totalCollected,
            last_collected_date: inv.lastCollectedDate
          })
          .eq('id', inv.id);
      }
    }

    res.json({
      success: true,
      balance: newBalance,
      claimableSum: claimableRemaining,
      schemaCacheStale,
      transaction: {
        id: txId,
        type: 'collect',
        amount: collectedAmount,
        date: new Date().toISOString(),
        status: 'completed',
        details: 'Collecte de gains journaliers'
      }
    });
  } catch (error: any) {
    const errorDetails = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    if (isApiKeyOrConnectionError(error)) {
      console.warn('[Supabase Collect Info]: API key unregistered or invalid.', errorDetails);
    } else {
      console.error('[Supabase Collect Error]:', errorDetails);
    }
    res.status(500).json({ error: error?.message || errorDetails });
  }
});

// 6. User: Recharge Dépôt
app.post('/api/user/recharge', async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone et montant requis.' });

  try {
    const txId = `tx_${Date.now()}_deposit`;
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        id: txId,
        user_phone: phone,
        type: 'deposit',
        amount: amount,
        status: 'pending',
        details: 'Dépôt en attente de validation'
      });

    if (txErr) throw txErr;

    res.json({
      success: true,
      transaction: {
        id: txId,
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString(),
        status: 'pending',
        details: 'Dépôt en attente de validation'
      }
    });
  } catch (error: any) {
    const errorDetails = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    if (isApiKeyOrConnectionError(error)) {
      console.warn('[Supabase Recharge Info]: API key unregistered or invalid.', errorDetails);
    } else {
      console.error('[Supabase Recharge Error]:', errorDetails);
    }
    res.status(500).json({ error: error?.message || errorDetails });
  }
});

// 7. User: Demande de retrait
app.post('/api/user/withdraw', async (req, res) => {
  const { phone, amount, vipLevel } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone et montant requis.' });

  const numAmount = Number(amount);

  try {
    // 1. Check if user already made a withdrawal today in database
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayWithdrawals } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_phone', phone)
      .eq('type', 'withdrawal')
      .gte('created_at', todayStart.toISOString());

    if (todayWithdrawals && todayWithdrawals.length > 0) {
      return res.status(400).json({
        error: "Vous avez déjà effectué votre retrait quotidien. La limite est de 1 retrait par jour."
      });
    }

    // 2. VIP level daily amount check
    const isVip2 = vipLevel === 'VIP 2' || vipLevel === 'vip2';
    const maxLimit = isVip2 ? 3000 : 1000;

    if (numAmount > maxLimit) {
      return res.status(400).json({
        error: `En ${isVip2 ? 'VIP 2' : 'VIP 1'}, le montant maximal de retrait est de ${maxLimit.toLocaleString('fr-FR')} FCFA par jour.`
      });
    }

    // 3. Check user balance
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('phone', phone)
      .single();

    if (userErr && !isApiKeyOrConnectionError(userErr)) throw userErr;

    const currentBalanceVal = user ? Number(user.balance) : numAmount;
    if (currentBalanceVal < numAmount) {
      return res.status(400).json({ error: 'Solde insuffisant pour ce retrait.' });
    }

    // 4. Log pending withdrawal transaction
    const txId = `tx_${Date.now()}_withdrawal`;
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        id: txId,
        user_phone: phone,
        type: 'withdrawal',
        amount: numAmount,
        status: 'pending',
        details: `Retrait ${isVip2 ? 'VIP 2 (Max 3000 F)' : 'VIP 1 (Max 1000 F)'} - En attente`
      });

    if (txErr && !isApiKeyOrConnectionError(txErr)) {
      console.warn('[Supabase Withdraw Tx Warning]:', txErr);
    }

    res.json({
      success: true,
      balance: currentBalanceVal,
      transaction: {
        id: txId,
        type: 'withdrawal',
        amount: numAmount,
        date: new Date().toISOString(),
        status: 'pending',
        details: `Retrait ${isVip2 ? 'VIP 2' : 'VIP 1'} - En attente`
      }
    });
  } catch (error: any) {
    const errorDetails = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    if (isApiKeyOrConnectionError(error)) {
      console.warn('[Supabase Withdraw Info]: API key unregistered or invalid.', errorDetails);
    } else {
      console.error('[Supabase Withdraw Error]:', errorDetails);
    }
    res.status(500).json({ error: error?.message || errorDetails });
  }
});

// 8. GeniusPay: Initiate Payment Session
app.post('/api/geniuspay/initiate', async (req, res) => {
  const { phone, amount, paymentMethod } = req.body;
  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone et montant requis pour le paiement GeniusPay.' });
  }

  const publicKey = process.env.GENIUSPAY_PUBLIC_KEY || 'GPAY-XETU';
  const secretKey = process.env.GENIUSPAY_SECRET_KEY || 'priv_QnqJCaHKwLXIgoXQLACWkFSIIDY9';

  console.log('[GeniusPay] Initiating payment for phone:', phone, 'Amount:', amount, 'Method:', paymentMethod);

  try {
    const txId = `GPAY_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Record pending transaction in Supabase
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        id: txId,
        user_phone: phone,
        type: 'deposit',
        amount: Number(amount),
        status: 'pending',
        details: `Dépôt GeniusPay via ${paymentMethod || 'Mobile Money/CB'}`
      });

    if (txErr) {
      console.warn('[GeniusPay Tx Insert Warning]:', txErr.message);
    }

    // Call GeniusPay REST API
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const geniusPayPayload = {
      amount: Number(amount),
      currency: 'XOF',
      description: `Recharge de compte Gold Yield (${amount} FCFA)`,
      order_id: txId,
      customer: {
        name: `Client ${phone}`,
        phone: phone,
        email: `${phone.replace(/\+/g, '')}@goldyield.app`
      },
      callback_url: `${appUrl}/api/geniuspay/webhook`,
      return_url: `${appUrl}?payment_status=success&tx=${txId}`,
      success_url: `${appUrl}?payment_status=success&tx=${txId}`
    };

    let checkoutUrl: string | null = null;
    let apiSuccess = false;

    try {
      // Attempt GeniusPay REST API with official endpoint and fallbacks
      const endpoints = [
        'https://geniuspay.ci/api/v1/merchant',
        'https://geniuspay.ci/api/v1/merchant/payments',
        'https://geniuspay.ci/api/v1/payments',
        'https://api.geniuspay.com/v1/payments'
      ];

      for (const endpoint of endpoints) {
        if (apiSuccess) break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Public-Key': publicKey,
              'X-Secret-Key': secretKey,
              'Authorization': `Bearer ${secretKey}`
            },
            body: JSON.stringify(geniusPayPayload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const responseData: any = await response.json();
            if (responseData && (responseData.checkout_url || responseData.payment_url || responseData.url)) {
              checkoutUrl = responseData.checkout_url || responseData.payment_url || responseData.url;
              apiSuccess = true;
            }
          }
        } catch (_epErr) {
          // Continue to next endpoint or fallback
        }
      }
    } catch (_apiErr) {
      console.log('[GeniusPay] Direct API gateway fallback engaged.');
    }

    if (!checkoutUrl) {
      const numAmount = Number(amount);
      if (numAmount === 75000 || req.body.article === '3/3' || (req.body.articleName && (req.body.articleName.includes('3/3') || req.body.articleName.includes('Moule')))) {
        checkoutUrl = 'https://geniuspay.ci/product/moule-filtre-spectrometrique-PSbX7U';
      } else if (numAmount === 50000 || req.body.article === '2/3' || (req.body.articleName && (req.body.articleName.includes('2/3') || req.body.articleName.includes('Refroidisseur')))) {
        checkoutUrl = 'https://geniuspay.ci/product/refroidisseur-de-creusets-dor-SU8bSn';
      } else if (numAmount === 7800 || numAmount === 25000 || req.body.vipLevel === 'vip2' || req.body.article === '1/3' || (req.body.articleName && req.body.articleName.includes('VIP 2'))) {
        checkoutUrl = 'https://geniuspay.ci/product/vip-2-13-aEUmFo';
      } else if (numAmount === 1800 || numAmount === 2300 || req.body.vipLevel === 'vip1' || (req.body.articleName && req.body.articleName.includes('VIP 1'))) {
        checkoutUrl = 'https://geniuspay.ci/product/article-vip1-HTWkud';
      } else {
        checkoutUrl = process.env.GENIUSPAY_CHECKOUT_URL || (numAmount >= 75000 ? 'https://geniuspay.ci/product/moule-filtre-spectrometrique-PSbX7U' : numAmount >= 50000 ? 'https://geniuspay.ci/product/refroidisseur-de-creusets-dor-SU8bSn' : numAmount >= 7800 ? 'https://geniuspay.ci/product/vip-2-13-aEUmFo' : 'https://geniuspay.ci/product/article-vip1-HTWkud');
      }
    }

    res.json({
      success: true,
      transactionId: txId,
      checkoutUrl: checkoutUrl || null,
      paymentUrl: checkoutUrl || null,
      successUrl: `${appUrl}?payment_status=success&tx=${txId}`,
      publicKey: publicKey,
      amount: Number(amount),
      message: 'Lien de paiement GeniusPay attribué à votre demande avec succès.'
    });

  } catch (error: any) {
    console.error('[GeniusPay Initiate Error]:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l’initialisation de GeniusPay.' });
  }
});

// 8.5 GeniusPay: Register Pending Transaction for Admin Manual Crediting
app.post('/api/geniuspay/confirm', async (req, res) => {
  const { transactionId, phone, amount } = req.body;
  console.log('[GeniusPay Request] Received deposit submission for tx:', transactionId, 'phone:', phone, 'amount:', amount);

  try {
    if (transactionId) {
      // Record transaction as pending for manual verification & admin crediting
      await supabase
        .from('transactions')
        .upsert({
          id: transactionId,
          user_phone: phone,
          type: 'deposit',
          amount: amount,
          status: 'pending',
          details: 'Dépôt GeniusPay en attente de validation administrateur'
        });
      console.log(`[GeniusPay Request] Registered pending deposit tx ${transactionId} for user ${phone} (${amount} FCFA)`);
    }

    res.json({ success: true, message: 'Demande de rechargement enregistrée. Le solde sera crédité après validation administrateur.' });
  } catch (err: any) {
    console.error('[GeniusPay Request Error]:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de l\'enregistrement de la demande.' });
  }
});

// 9. GeniusPay: Webhook Notification Handler
app.post('/api/geniuspay/webhook', async (req, res) => {
  console.log('[GeniusPay Webhook Payload Received]:', req.body);
  const { order_id, reference, status, amount, customer } = req.body;
  const targetTxId = order_id || reference;

  if (status === 'COMPLETED' || status === 'SUCCESS' || status === 'APPROVED' || status === 'SUCCESSFUL') {
    try {
      if (targetTxId) {
        // Update transaction status
        const { data: tx } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', targetTxId)
          .maybeSingle();

        if (tx && tx.user_phone && tx.status !== 'completed') {
          // Update transaction
          await supabase
            .from('transactions')
            .update({ status: 'completed' })
            .eq('id', targetTxId);

          // Credit user balance
          const { data: user } = await supabase
            .from('users')
            .select('balance')
            .eq('phone', tx.user_phone)
            .maybeSingle();

          if (user) {
            const newBal = Number(user.balance || 0) + Number(tx.amount || amount || 0);
            await supabase
              .from('users')
              .update({ balance: newBal })
              .eq('phone', tx.user_phone);
            
            console.log(`[GeniusPay Webhook] Credited user ${tx.user_phone} with +${tx.amount} FCFA. New Balance: ${newBal}`);
          }
        }
      }
    } catch (err) {
      console.error('[GeniusPay Webhook Error]:', err);
    }
  }

  res.status(200).json({ received: true });
});

// 10. Wave Business Direct API: Create Checkout Session
app.post('/api/wave/create-checkout', async (req, res) => {
  const { amount, phone } = req.body;
  const WAVE_MERCHANT_LINK = 'https://pay.wave.com/m/M_ci_v8OIxJ5nyByL/c/ci/';
  const WAVE_RAW_PHONE = '0504402102';
  const txId = `WAVE_DIR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  console.log('[Wave Direct Link] Creating transaction record for:', { phone, amount, txId });

  try {
    // Record pending transaction in Supabase
    if (phone && amount) {
      await supabase
        .from('transactions')
        .upsert({
          id: txId,
          user_phone: phone,
          type: 'deposit',
          amount: Number(amount),
          status: 'pending',
          details: 'Dépôt direct Lien Marchand Wave'
        });
    }

    res.json({
      success: true,
      transactionId: txId,
      merchantPhone: WAVE_RAW_PHONE,
      waveLaunchUrl: WAVE_MERCHANT_LINK,
      waveWebCheckoutUrl: WAVE_MERCHANT_LINK,
      amount: Number(amount),
      message: 'Lien Marchand Wave prêt'
    });
  } catch (err: any) {
    console.error('[Wave Direct Error]:', err);
    res.status(500).json({ error: err.message || 'Erreur lors du traitement de la transaction Wave.' });
  }
});

// 11. Wave Business Direct API: Webhook Listener (Direct Wave Webhook)
app.post('/api/wave/webhook', async (req, res) => {
  console.log('[Wave Direct Webhook Received]:', JSON.stringify(req.body));
  const body = req.body || {};
  
  // Wave Webhook structure check
  const eventType = body.type; // e.g. "checkout.session.completed"
  const data = body.data || body;
  const clientRef = data.client_reference || data.payment_intent || data.id;
  const paymentAmount = data.amount || data.amount_total;

  if (eventType === 'checkout.session.completed' || data.status === 'succeeded' || data.payment_status === 'succeeded') {
    try {
      if (clientRef) {
        const { data: tx } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', clientRef)
          .maybeSingle();

        if (tx && tx.user_phone && tx.status !== 'completed') {
          // 1. Mark transaction as completed
          await supabase
            .from('transactions')
            .update({ status: 'completed' })
            .eq('id', clientRef);

          // 2. Credit user balance automatically via direct Wave Webhook notification
          const { data: user } = await supabase
            .from('users')
            .select('balance')
            .eq('phone', tx.user_phone)
            .maybeSingle();

          if (user) {
            const newBal = Number(user.balance || 0) + Number(tx.amount || paymentAmount || 0);
            await supabase
              .from('users')
              .update({ balance: newBal })
              .eq('phone', tx.user_phone);

            console.log(`[Wave Direct Webhook] AUTO-CREDITED user ${tx.user_phone} with +${tx.amount} FCFA. New Balance: ${newBal}`);
          }
        }
      }
    } catch (err) {
      console.error('[Wave Direct Webhook Error]:', err);
    }
  }

  res.status(200).json({ received: true });
});

// 12. Admin: Seed / Sync VIP Investment Plans to Supabase
app.all('/api/admin/seed-plans', async (req, res) => {
  try {
    const vipPlans = [
      { id: 'vip1_machine', name: 'Pack Machine VIP 1', price: 1800, daily_profit: 1000, duration_days: 30, total_profit: 30000 },
      { id: 'vip2_article1', name: 'Broyeur Hydraulique Quartz 24K (VIP 2 • 1/3)', price: 25000, daily_profit: 0, duration_days: 30, total_profit: 0 },
      { id: 'vip2_article2', name: 'Refroidisseur de Creusets d\'Or (VIP 2 • 2/3)', price: 50000, daily_profit: 0, duration_days: 30, total_profit: 0 },
      { id: 'vip2_article3', name: 'Moule & Filtre Spectrométrique (VIP 2 • 3/3)', price: 75000, daily_profit: 3000, duration_days: 30, total_profit: 200000 }
    ];

    // Delete old legacy plans from investment_plans if present
    const legacyIds = ['plan_poussiere', 'plan_pepite', 'plan_lingot', 'plan_barre', 'plan_coffre', 'plan_filon', 'plan_mine_royale'];
    for (const legId of legacyIds) {
      await supabase.from('investment_plans').delete().eq('id', legId);
    }

    // Upsert new VIP plans
    const { error } = await supabase.from('investment_plans').upsert(vipPlans);

    if (error && !isApiKeyOrConnectionError(error)) {
      console.warn('[Seed Plans Warning]:', error.message);
    }

    res.json({ success: true, message: 'Table investment_plans mise à jour avec la nouvelle structure VIP 1 & VIP 2.', plans: vipPlans });
  } catch (err: any) {
    console.error('[Seed Plans Error]:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la mise à jour des plans.' });
  }
});

async function autoSyncVipPlans() {
  try {
    const vipPlans = [
      { id: 'vip1_machine', name: 'Pack Machine VIP 1', price: 1800, daily_profit: 1000, duration_days: 30, total_profit: 30000 },
      { id: 'vip2_article1', name: 'Broyeur Hydraulique Quartz 24K (VIP 2 • 1/3)', price: 25000, daily_profit: 0, duration_days: 30, total_profit: 0 },
      { id: 'vip2_article2', name: 'Refroidisseur de Creusets d\'Or (VIP 2 • 2/3)', price: 50000, daily_profit: 0, duration_days: 30, total_profit: 0 },
      { id: 'vip2_article3', name: 'Moule & Filtre Spectrométrique (VIP 2 • 3/3)', price: 75000, daily_profit: 3000, duration_days: 30, total_profit: 200000 }
    ];

    const legacyIds = ['plan_poussiere', 'plan_pepite', 'plan_lingot', 'plan_barre', 'plan_coffre', 'plan_filon', 'plan_mine_royale'];
    for (const legId of legacyIds) {
      await supabase.from('investment_plans').delete().eq('id', legId);
    }
    await supabase.from('investment_plans').upsert(vipPlans);
    console.log('[Supabase AutoSync] Table investment_plans synchronisée avec la nouvelle structure VIP.');
  } catch (_e) {
    // Silent catch
  }
}

// --- Vite Dev Middleware and Production Static Server ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log('[Server] Launching in Development mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Launching in Production mode serving built assets');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server is running on http://localhost:${PORT}`);
    autoSyncVipPlans().catch(() => {});
  });
}

startServer();
