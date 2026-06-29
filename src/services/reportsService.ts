import { createClient } from '@/lib/supabase/client';

export type MarketReport = {
  id: string;
  created_at: string;
  title: string;
  summary: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral' | 'Slightly Bullish' | 'Slightly Bearish';
  symbol: string;
  tags: string[];
};

export const ReportService = {
  async getLatestReports() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('market_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return data as MarketReport[];
  },

  async createReport(report: Omit<MarketReport, 'id' | 'created_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('market_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
