import { create } from "zustand";

type RiskLevel = "Low" | "Medium" | "High";

interface User {
  id: string;
  name: string;
  email: string;
}

export interface Strategy {
  id?: string;
  created_at?: string;
  name: string;
  description?: string | null;
  risk: RiskLevel;
  active?: boolean;
  roi?: string | null;
  pairs?: string | null;
}

export interface Trade {
  id?: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: string;
  price: string;
  time: string;
  status: "OPEN" | "CLOSED";
  pnl?: number;
  duration?: number;
  exitPrice?: string;
  maxAdverse?: number;
  maxFavorable?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "alert" | "success" | "warning";
}

export interface DeployedStrategy {
  id: string;
  name: string;
  platform?: "mt4" | "mt5";
  symbol?: string;
  timeframe?: string;
  lotSize: number;
  maxDrawdown: number;
  status: "Running" | "Paused" | "Halted";
  accountType: string;
  startTime: string;
  commandPath?: string;
}

export interface ExchangeConnection {
  id: string;
  exchange: string;
  status: "Active" | "Error" | "Pending";
  keys: string;
  latency: string;
}

interface StoreState {
  isAuthenticated: boolean;
  authInitialized: boolean;
  user: User | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;

  balance: number;
  initialBalance: number;
  pnl: number;
  activeStrategies: number;
  strategies: Strategy[];
  fetchDashboardData: () => Promise<void>;
  fetchStrategies: () => Promise<void>;
  createStrategy: (name: string, risk: RiskLevel | string, description: string) => Promise<boolean>;
  deleteStrategy: (id: string) => Promise<boolean>;

  watchlist: string[];
  toggleWatchlist: (symbol: string) => Promise<void>;
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;

  trades: Trade[];
  terminalLogs: string[];
  exchangeConnections: ExchangeConnection[];
  addTrade: (trade: Trade) => void;
  addTerminalLog: (log: string) => void;
  fetchTrades: () => Promise<void>;
  fetchConnections: () => Promise<void>;
  deleteConnection: (id: string) => Promise<boolean>;

  stopAllStrategies: () => void;
  cloneStrategy: (strategy: Strategy) => Promise<boolean>;
  deployStrategy: (strat: DeployedStrategy) => void;
  fetchDeployments: () => Promise<void>;
  deployedStrategies: DeployedStrategy[];

  notifications: Notification[];
  markAllRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "read" | "time">) => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const isDemoDataEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === "true";
const defaultInitialBalance = Number(process.env.NEXT_PUBLIC_DEFAULT_INITIAL_BALANCE || process.env.NEXT_PUBLIC_INITIAL_BALANCE || 10000);
const defaultWatchlist = isDemoDataEnabled ? ["XAUUSD", "GBPJPY", "GBPUSD", "BTCUSD", "ETHUSD"] : [];

class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function isUnauthorizedError(error: unknown) {
  return error instanceof ApiRequestError && error.status === 401;
}

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...init, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : "Request failed";
    throw new ApiRequestError(message, response.status);
  }

  return payload as T;
}

function normalizeRisk(risk: string): RiskLevel {
  return risk === "Low" || risk === "High" ? risk : "Medium";
}

function createDemoTrades(): Trade[] {
  const symbols = ["EUR/USD", "GBP/JPY", "BTC/USD", "ETH/USD", "XAU/USD", "NAS100"];
  return Array.from({ length: 40 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(i / 2));
    const side = Math.random() > 0.4 ? "BUY" : "SELL";
    const amount = (Math.random() * 2 + 0.1).toFixed(2);
    const pnl = Number((Math.random() * 400 - 150).toFixed(2));
    const price = Number((Math.random() * 1000 + 100).toFixed(2));
    const duration = Math.floor(Math.random() * 72) + 1;
    const exitPrice = (side === "BUY" ? price + pnl / 10 : price - pnl / 10).toFixed(2);
    const maxFavorable = Math.abs(pnl) * (1 + Math.random());
    const maxAdverse = Math.abs(pnl) * Math.random();

    return {
      id: "mock-" + i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      side,
      amount,
      price: price.toFixed(2),
      exitPrice,
      time: date.toISOString().split("T")[0] + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "CLOSED",
      pnl,
      duration,
      maxFavorable: Number(maxFavorable.toFixed(2)),
      maxAdverse: Number(maxAdverse.toFixed(2)),
    };
  });
}

export const useStore = create<StoreState>((set) => ({
  isAuthenticated: false,
  authInitialized: false,
  user: null,
  initializeAuth: async () => {
    try {
      const data = await apiRequest<{ user: User | null }>("/api/auth/session");
      set({ isAuthenticated: Boolean(data.user), authInitialized: true, user: data.user });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        console.error("Failed to initialize auth:", error);
      }
      set({ isAuthenticated: false, authInitialized: true, user: null });
    }
  },
  login: async (email, password) => {
    try {
      const data = await apiRequest<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      set({ isAuthenticated: true, authInitialized: true, user: data.user });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Invalid email or password." };
    }
  },
  register: async (name, email, password) => {
    try {
      const data = await apiRequest<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      set({ isAuthenticated: true, authInitialized: true, user: data.user });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Registration failed." };
    }
  },
  logout: async () => {
    try {
      await apiRequest<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    } finally {
      set({ isAuthenticated: false, authInitialized: true, user: null });
    }
  },

  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isSidebarCollapsed: false,
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  balance: defaultInitialBalance,
  initialBalance: defaultInitialBalance,
  pnl: 0,
  activeStrategies: 0,
  strategies: [],
  fetchDashboardData: async () => {
    try {
      const data = await apiRequest<{ activeStrategies: number; watchlist: string[]; balance: number; pnl: number }>("/api/data/dashboard");
      set({
        activeStrategies: data.activeStrategies,
        watchlist: data.watchlist.length > 0 ? data.watchlist : defaultWatchlist,
        balance: data.balance,
        pnl: data.pnl,
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        set({
          isAuthenticated: false,
          authInitialized: true,
          user: null,
          activeStrategies: 0,
          watchlist: defaultWatchlist,
          balance: defaultInitialBalance,
          pnl: 0,
        });
        return;
      }
      console.error("Failed to fetch dashboard data:", error);
    }
  },
  fetchStrategies: async () => {
    try {
      const data = await apiRequest<{ strategies: Strategy[] }>("/api/data/strategies");
      set({ strategies: data.strategies });
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
    }
  },
  createStrategy: async (name, risk, description) => {
    try {
      await apiRequest<{ strategy: Strategy }>("/api/data/strategies", {
        method: "POST",
        body: JSON.stringify({ name, risk: normalizeRisk(risk), description }),
      });
      await useStore.getState().fetchStrategies();
      return true;
    } catch (error) {
      console.error("Failed to create strategy:", error);
      return false;
    }
  },
  deleteStrategy: async (id) => {
    try {
      await apiRequest<{ success: boolean }>("/api/data/strategies/" + id, { method: "DELETE" });
      set((state) => ({ strategies: state.strategies.filter((strategy) => strategy.id !== id) }));
      return true;
    } catch (error) {
      console.error("Failed to delete strategy:", error);
      return false;
    }
  },

  watchlist: defaultWatchlist,
  toggleWatchlist: async (symbol) => {
    try {
      const data = await apiRequest<{ watchlist: string[] }>("/api/data/watchlist", {
        method: "POST",
        body: JSON.stringify({ symbol }),
      });
      set({ watchlist: data.watchlist });
    } catch (error) {
      console.error("Watchlist sync failed:", error);
    }
  },
  activeSymbol: "XAUUSD",
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),

  notifications: [
    { id: "1", title: "System Online", message: "beew.ai engines are ready.", time: "Just now", read: false, type: "success" },
  ],
  markAllRead: () => set((state) => ({ notifications: state.notifications.map((notification) => ({ ...notification, read: true })) })),
  addNotification: (notification) => set((state) => ({
    notifications: [
      { ...notification, id: Math.random().toString(36).slice(2, 11), read: false, time: "Just now" },
      ...state.notifications,
    ],
  })),

  trades: [],
  terminalLogs: [
    "Initializing beew.ai Execution Bridge...",
    "Awaiting authenticated market data session...",
  ],
  exchangeConnections: [],
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades].slice(0, 50) })),
  addTerminalLog: (log) => set((state) => ({ terminalLogs: [...state.terminalLogs, "[" + new Date().toLocaleTimeString() + "] " + log].slice(-100) })),
  fetchTrades: async () => {
    try {
      const data = await apiRequest<{ trades: Trade[] }>("/api/data/trades");
      set({ trades: data.trades.length > 0 ? data.trades : isDemoDataEnabled ? createDemoTrades() : [] });
    } catch (error) {
      console.error("Failed to fetch trades:", error);
      if (isDemoDataEnabled) {
        set({ trades: createDemoTrades() });
      } else {
        set({ trades: [] });
      }
      throw error;
    }
  },
  fetchConnections: async () => {
    try {
      const data = await apiRequest<{ connections: ExchangeConnection[] }>("/api/data/connections");
      if (data.connections.length > 0 || !isDemoDataEnabled) {
        set({ exchangeConnections: data.connections });
      } else {
        set({ exchangeConnections: [
          { id: "1", exchange: "MetaTrader 5", status: "Active", keys: "************a1b2", latency: "Connected" },
          { id: "2", exchange: "Coinbase Pro", status: "Error", keys: "************f9e2", latency: "-" },
          { id: "3", exchange: "Kraken", status: "Active", keys: "************88d1", latency: "45ms" },
        ] });
      }
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    }
  },
  deleteConnection: async (id) => {
    try {
      await apiRequest<{ success: boolean }>("/api/data/connections/" + id, { method: "DELETE" });
      set((state) => ({ exchangeConnections: state.exchangeConnections.filter((connection) => connection.id !== id) }));
      return true;
    } catch (error) {
      console.error("Failed to delete connection:", error);
      return false;
    }
  },

  stopAllStrategies: () => {
    set({ activeStrategies: 0, deployedStrategies: [] });
    const { addTerminalLog, addNotification } = useStore.getState();
    addTerminalLog("Manual emergency stop triggered. All local deployments halted.");
    addNotification({ title: "Emergency Stop", message: "All active strategies have been halted manually.", type: "alert" });
  },
  deployedStrategies: [],
  fetchDeployments: async () => {
    try {
      const data = await apiRequest<{ deployments: DeployedStrategy[] }>("/api/data/deployments");
      set({
        deployedStrategies: data.deployments,
        activeStrategies: data.deployments.filter((deployment) => deployment.status === "Running").length,
      });
    } catch (error) {
      console.error("Failed to fetch deployments:", error);
    }
  },
  deployStrategy: (strategy) => set((state) => ({
    deployedStrategies: [strategy, ...state.deployedStrategies],
    activeStrategies: state.activeStrategies + 1,
  })),
  cloneStrategy: async (strategy) => {
    try {
      await apiRequest<{ strategy: Strategy }>("/api/data/strategies/clone", {
        method: "POST",
        body: JSON.stringify({
          name: strategy.name,
          risk: normalizeRisk(strategy.risk),
          description: strategy.description || "Cloned from " + strategy.name,
        }),
      });
      await useStore.getState().fetchStrategies();
      return true;
    } catch (error) {
      console.error("Failed to clone strategy:", error);
      return false;
    }
  },
  updateProfile: async (updates) => {
    try {
      const data = await apiRequest<{ user: User }>("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      set({ user: data.user });
      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    }
  },
}));
