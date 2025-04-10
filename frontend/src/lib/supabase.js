import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for payment-related operations
export const paymentApi = {
  async createDeposit({ userId, amount, sourceCurrency, paymentMethod, upiApp, bankName }) {
    const { data, error } = await supabase
      .from('deposits')
      .insert([{
        user_id: userId,
        amount,
        currency: sourceCurrency,
        payment_method: paymentMethod,
        upi_app: upiApp,
        bank_name: bankName,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createWithdrawal({ userId, amount, paymentMethod, upiId, bankDetails }) {
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([{
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        upi_id: upiId,
        bank_details: bankDetails,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTransactions(userId) {
    // Fetch both deposits and withdrawals
    const [{ data: deposits, error: depositsError }, { data: withdrawals, error: withdrawalsError }] = await Promise.all([
      supabase
        .from('deposits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    if (depositsError) throw depositsError;
    if (withdrawalsError) throw withdrawalsError;

    // Combine and sort transactions
    const transactions = [
      ...(deposits?.map(d => ({
        id: d.id,
        type: 'deposit',
        amount: d.amount,
        currency: d.currency,
        status: d.status,
        createdAt: d.created_at
      })) || []),
      ...(withdrawals?.map(w => ({
        id: w.id,
        type: 'withdrawal',
        amount: w.amount,
        currency: 'INR',
        status: w.status,
        createdAt: w.created_at
      })) || [])
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return transactions;
  },

  async checkPaymentStatus(paymentId) {
    const { data, error } = await supabase
      .from('deposits')
      .select('status')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserBalance(userId, amount) {
    const { data, error } = await supabase.rpc('update_user_balance', {
      user_id: userId,
      amount_change: amount
    });

    if (error) throw error;
    return data;
  }
}; 