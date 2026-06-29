import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface StoreState {
    // Auth State
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;

    // UI State
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isSidebarCollapsed: boolean;
    toggleSidebarCollapse: () => void;
    
    // Trading State
    balance: number;
    initialBalance: number;
    pnl: number;
    activeStrategies: number;
    strategies: any[];
    
    fetchDashboardData: () => Promise<void>;
    fetchStrategies: () => Promise<void>;
    createStrategy: (name: string, risk: string, description: string) => Promise<boolean>;
    deleteStrategy: (id: string) => Promise<boolean>;
    
    // Watchlist
    watchlist: string[];
    toggleWatchlist: (symbol: string) => void;

    // Active Context
    activeSymbol: string;
    setActiveSymbol: (symbol: string) => void;

    // Live Monitoring State
    trades: Trade[];
    terminalLogs: string[];
    exchangeConnections: ExchangeConnection[];
    addTrade: (trade: Trade) => void;
    addTerminalLog: (log: string) => void;
    fetchTrades: () => Promise<void>;
    fetchConnections: () => Promise<void>;
    deleteConnection: (id: string) => Promise<boolean>;

    // Strategy Operations
    stopAllStrategies: () => void;
    cloneStrategy: (strategy: any) => Promise<boolean>;
    deployStrategy: (strat: DeployedStrategy) => void;
    
    // Deployed State
    deployedStrategies: DeployedStrategy[];

    // Notifications
    notifications: Notification[];
    markAllRead: () => void;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => void;
    updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export interface Trade {
  id?: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: string;
  price: string;
  time: string;
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
  duration?: number; // in hours
  exitPrice?: string;
  maxAdverse?: number; // Maximum drawdown during trade (MAE)
  maxFavorable?: number; // Maximum profit during trade (MFE)
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'alert' | 'success' | 'warning';
}

export interface DeployedStrategy {
    id: string;
    name: string;
    lotSize: number;
    maxDrawdown: number;
    status: 'Running' | 'Paused' | 'Halted';
    accountType: string;
    startTime: string;
}

export interface ExchangeConnection {
    id: string;
    exchange: string;
    status: 'Active' | 'Error' | 'Pending';
    keys: string;
    latency: string;
}

export const useStore = create<StoreState>((set) => ({
    isAuthenticated: true,
    user: { id: '00000000-0000-0000-0000-000000000000', name: 'Mock Trader', email: 'trader@aialgo.com' },
    // Auth State
    login: async (email, password) => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || "Trader";
        
        set({ 
            isAuthenticated: true, 
            user: { 
                id: data.user.id, 
                email: data.user.email!, 
                name: userName
            } 
        });
        
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message || "Invalid email or password." };
      }
    },
    loginWithGoogle: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    },
    register: async (name, email, password) => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        if (data.user) {
             set({ isAuthenticated: true, user: { id: data.user.id, email: data.user.email!, name: name } });
             return { success: true };
        }
        return { success: false, error: "Registration failed. Please try again." };
      } catch (error: any) {
        console.error("Registration failed:", error);
        return { success: false, error: error.message || "Registration failed." };
      }
    },
    logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ isAuthenticated: false, user: null });
    },

    isSidebarOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    isSidebarCollapsed: false,
    toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

    balance: 12450.75,
    initialBalance: 10000,
    pnl: 24.5, // Percentage
    activeStrategies: 3,
    // Dashboard State
    fetchDashboardData: async () => {
        const state = useStore.getState();
        const userId = state.user?.id;
        if (!userId) return;

        try {
            const supabase = createClient();
            // 1. Fetch active strategies count
             const { count: strategiesCount } = await supabase
                .from('strategies')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('active', true);
             
             // 2. Fetch watchlist
             const { data: watchlistData } = await supabase
                .from('watchlists')
                .select('symbol')
                .eq('user_id', userId);

             const dbWatchlist = watchlistData?.map(w => w.symbol) || [];
             
             // Calculate dynamic stats from trades
             const tradePnL = state.trades.reduce((acc, trade) => {
                const amount = parseFloat(trade.amount);
                const price = parseFloat(trade.price);
                return acc + (trade.side === 'BUY' ? amount * 100 : -amount * 100); // Simple mock calc
             }, 0);

             set({ 
                activeStrategies: strategiesCount || 1,
                watchlist: dbWatchlist.length > 0 ? dbWatchlist : state.watchlist,
                balance: 10000 + tradePnL, 
                pnl: parseFloat(((tradePnL / 10000) * 100).toFixed(2)), 
             });
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
    },

    // Strategy State
    strategies: [],
    fetchStrategies: async () => {
        try {
             const state = useStore.getState();
             const userId = state.user?.id;
             if (!userId) return;

             const supabase = createClient();
             const { data, error } = await supabase
                .from('strategies')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
                
             if (error) throw error;
             set({ strategies: data || [] });
        } catch (error) {
            console.error(error);
        }
    },
    createStrategy: async (name, risk, description) => {
        try {
            const state = useStore.getState();
            const userId = state.user?.id;
            if (!userId) return false;

            const supabase = createClient();
            const { error } = await supabase
                .from('strategies')
                .insert([{ user_id: userId, name, risk, description, active: true }]);
                
            if (error) throw error;
            useStore.getState().fetchStrategies();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    // Watchlist State
    watchlist: ["XAUUSD", "GBPJPY", "GBPUSD", "BTCUSD", "ETHUSD"], // Default
    toggleWatchlist: async (symbol: string) => {
        const state = useStore.getState();
        const userId = state.user?.id;
        if (!userId) return;

        const exists = state.watchlist.includes(symbol);
        try {
            const supabase = createClient();
            if (exists) {
                const { error } = await supabase
                    .from('watchlists')
                    .delete()
                    .eq('user_id', userId)
                    .eq('symbol', symbol);
                if (error) throw error;
                set({ watchlist: state.watchlist.filter(s => s !== symbol) });
            } else {
                const { error } = await supabase
                    .from('watchlists')
                    .insert([{ user_id: userId, symbol }]);
                if (error) throw error;
                set({ watchlist: [...state.watchlist, symbol] });
            }
        } catch (error) {
            console.error("Watchlist sync failed:", error);
        }
    },

    // Active Context
    activeSymbol: "XAUUSD",
    setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),

    // Notifications Implementation
    notifications: [
        { id: '1', title: 'System Online', message: 'BEEW AI Engines are fully operational.', time: 'Just now', read: false, type: 'success' },
        { id: '2', title: 'Market Alert', message: 'High volatility detected in XAUUSD.', time: '2m ago', read: false, type: 'warning' },
        { id: '3', title: 'Trade Executed', message: 'Long BTCUSD closed for +12.5% profit.', time: '1h ago', read: true, type: 'info' },
    ],
    markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),
    addNotification: (n) => set((state) => ({
        notifications: [
            { ...n, id: Math.random().toString(36).substr(2, 9), read: false, time: 'Just now' },
            ...state.notifications
        ]
    })),

    // Live Monitoring
    trades: [],
    terminalLogs: [
        "Initializing BEEW Execution Bridge...",
        "Connecting to Global Liquidity Hub (Equinix NY4)...",
        "MetaTrader 4 Core: Link Established.",
        "AI Model: BEEW-V2.1 Loaded and Running.",
    ],
    exchangeConnections: [],
    addTrade: (trade) => set((state) => ({
        trades: [trade, ...state.trades].slice(0, 50)
    })),
    addTerminalLog: (log) => set((state) => ({
        terminalLogs: [...state.terminalLogs, `[${new Date().toLocaleTimeString()}] ${log}`].slice(-100)
    })),
    fetchTrades: async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (!error && data && data.length > 0) {
                set({ trades: data });
            } else {
                // Expanded Mock Data for Visualization
                const symbols = ["EUR/USD", "GBP/JPY", "BTC/USD", "ETH/USD", "XAU/USD", "NAS100"];
                const mockTrades: Trade[] = Array.from({ length: 40 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - Math.floor(i / 2)); // Spread over 20 days
                    const side = Math.random() > 0.4 ? "BUY" : "SELL";
                    const amount = (Math.random() * 2 + 0.1).toFixed(2);
                    const pnl = parseFloat((Math.random() * 400 - 150).toFixed(2));
                    const price = parseFloat((Math.random() * 1000 + 100).toFixed(2));
                    const duration = Math.floor(Math.random() * 72) + 1; // 1-72 hours
                    const exitPrice = (side === "BUY" ? price + pnl/10 : price - pnl/10).toFixed(2);
                    
                    // MAE/MFE Mock Logic
                    const maxFavorable = Math.abs(pnl) * (1 + Math.random());
                    const maxAdverse = Math.abs(pnl) * Math.random();

                    return {
                        id: `mock-${i}`,
                        symbol: symbols[Math.floor(Math.random() * symbols.length)],
                        side: side as 'BUY' | 'SELL',
                        amount: amount,
                        price: price.toFixed(2),
                        exitPrice: exitPrice,
                        time: date.toISOString().split('T')[0] + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: "CLOSED",
                        pnl: pnl,
                        duration: duration,
                        maxFavorable: parseFloat(maxFavorable.toFixed(2)),
                        maxAdverse: parseFloat(maxAdverse.toFixed(2))
                    };
                });
                set({ trades: mockTrades });
            }
        } catch (error) {
            console.error("Failed to fetch trades:", error);
        }
    },
    fetchConnections: async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('exchange_connections')
                .select('*');
            
            if (!error && data && data.length > 0) {
                set({ exchangeConnections: data });
            } else {
                set({ exchangeConnections: [
                    { id: "1", exchange: "Binance", status: "Active", keys: "************a1b2", latency: "12ms" },
                    { id: "2", exchange: "Coinbase Pro", status: "Error", keys: "************f9e2", latency: "-" },
                    { id: "3", exchange: "Kraken", status: "Active", keys: "************88d1", latency: "45ms" },
                ] as ExchangeConnection[] });
            }
        } catch (error) {
            console.error("Failed to fetch connections:", error);
        }
    },
    deleteConnection: async (id: string) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('exchange_connections')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            set((state) => ({
                exchangeConnections: state.exchangeConnections.filter(c => c.id !== id)
            }));
            return true;
        } catch (error) {
            console.error("Failed to delete connection:", error);
            return false;
        }
    },

    // Strategy Operations
    stopAllStrategies: () => {
        set({ activeStrategies: 0, deployedStrategies: [] });
        const { addTerminalLog, addNotification } = useStore.getState();
        addTerminalLog("CRITICAL: Manual Emergency Stop Triggered. All orders halted.");
        addNotification({
            title: "Emergency Stop",
            message: "All active strategies have been halted manually.",
            type: "alert"
        });
    },
    deployedStrategies: [],
    deployStrategy: (strat) => {
        set((state) => ({
            deployedStrategies: [strat, ...state.deployedStrategies],
            activeStrategies: state.activeStrategies + 1
        }));
    },
    cloneStrategy: async (strategy: any) => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { error } = await supabase
                .from('strategies')
                .insert([{
                    user_id: user.id,
                    name: `${strategy.name} (Clone)`,
                    risk: strategy.risk,
                    description: `Cloned from ${strategy.name}`,
                    active: false
                }]);
            
            if (error) throw error;
            useStore.getState().fetchStrategies();
            return true;
        } catch (error) {
            console.error("Failed to clone strategy:", error);
            return false;
        }
    },
    deleteStrategy: async (id: string) => {
        try {
            const state = useStore.getState();
            const userId = state.user?.id;
            if (!userId) return false;

            const supabase = createClient();
            const { error } = await supabase
                .from('strategies')
                .delete()
                .eq('id', id)
                .eq('user_id', userId); // Extra safety: only delete if owned by user
                
            if (error) throw error;
            set((state) => ({
                strategies: state.strategies.filter(s => s.id !== id)
            }));
            return true;
        } catch (error) {
            console.error("Failed to delete strategy:", error);
            return false;
        }
    },

    // Profile
    updateProfile: async (updates: Partial<User>) => {
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                data: updates
            });
            if (error) throw error;
            
            set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            }));
            return true;
        } catch (error) {
            console.error("Failed to update profile:", error);
            return false;
        }
    }

}));
