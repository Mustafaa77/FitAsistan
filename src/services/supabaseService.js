import { supabase } from './supabase';

/**
 * Supabase Service - FitAsistan Week 9
 * Centralized data persistence layer for all health metrics
 */
export const supabaseService = {
  supabase, // Export client for direct access if needed
  
  // --- USER PROFILE ---
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
    return data;
  },

  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...profileData, updated_at: new Date() })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- WATER TRACKING ---
  async getWaterLogs(userId, date) {
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateWaterLog(userId, date, amount) {
    const { data, error } = await supabase
      .from('water_logs')
      .upsert({ user_id: userId, date, amount }, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- CALORIE TRACKING ---
  async getCalorieLog(userId, date) {
    const { data, error } = await supabase
      .from('calorie_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateCalorieLog(userId, date, amount) {
    const { data, error } = await supabase
      .from('calorie_logs')
      .upsert({ user_id: userId, date, amount }, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- HEALTH & DIARY (Mood/Notes) ---
  async getHealthLog(userId, date) {
    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateHealthLog(userId, date, logData) {
    const { data, error } = await supabase
      .from('health_logs')
      .upsert({ user_id: userId, date, ...logData }, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- SLEEP TRACKING ---
  async getSleepLogs(userId, limit = 7) {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async addSleepLog(userId, date, hours) {
    const { data, error } = await supabase
      .from('sleep_logs')
      .upsert({ user_id: userId, date, hours }, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- WEIGHT TRACKING ---
  async getWeightHistory(userId, limit = 10) {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async addWeightLog(userId, date, weight) {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ user_id: userId, date, weight })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- DIET PLANS ---
  async getActiveDietPlan(userId) {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getAllDietPlans(userId) {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async setActiveDietPlan(userId, planId) {
    // First, deactivate all plans for this user
    const { error: deactivateError } = await supabase
      .from('diet_plans')
      .update({ is_active: false })
      .eq('user_id', userId);
    
    if (deactivateError) throw deactivateError;

    // Then, activate the specific plan
    const { data, error: activateError } = await supabase
      .from('diet_plans')
      .update({ is_active: true })
      .eq('id', planId)
      .select()
      .single();
    
    if (activateError) throw activateError;
    return data;
  },

  async deleteDietPlan(planId) {
    const { error } = await supabase
      .from('diet_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
    return true;
  },

  async saveDietPlan(userId, planData) {
    // Check if there are any existing plans
    const { data: existingPlans } = await supabase
      .from('diet_plans')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    const isFirstPlan = !existingPlans || existingPlans.length === 0;

    // If not the first plan, we might want to deactivate others ONLY if we want this new one to be active
    // But per user request, let's make the NEW plan active by default
    await supabase
      .from('diet_plans')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Save new plan as active
    const { data, error } = await supabase
      .from('diet_plans')
      .insert({ 
        user_id: userId, 
        plan_data: planData, 
        is_active: true,
        created_at: new Date()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- DAILY TARGETS ---
  async getDailyTargets(userId) {
    const { data, error } = await supabase
      .from('daily_targets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addDailyTarget(userId, text) {
    const { data, error } = await supabase
      .from('daily_targets')
      .insert({ user_id: userId, text, completed: false })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async toggleDailyTarget(id, completed) {
    const { data, error } = await supabase
      .from('daily_targets')
      .update({ completed })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteDailyTarget(id) {
    const { error } = await supabase
      .from('daily_targets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};