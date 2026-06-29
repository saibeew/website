import { create } from 'zustand';

export interface StrategyNode {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    data?: any;
}

export interface StrategyEdge {
    id: string;
    source: string;
    target: string;
}

interface StrategyStore {
    nodes: StrategyNode[];
    edges: StrategyEdge[];
    addNode: (node: StrategyNode) => void;
    removeNode: (id: string) => void;
    updateNodePosition: (id: string, x: number, y: number) => void;
    addEdge: (source: string, target: string) => void;
    removeEdge: (id: string) => void;
    clearStrategy: () => void;
}

export const useStrategyStore = create<StrategyStore>((set) => ({
    nodes: [],
    edges: [],
    addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
    removeNode: (id) => set((state) => ({ 
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id)
    })),
    updateNodePosition: (id, x, y) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n)
    })),
    addEdge: (source, target) => set((state) => {
        const id = `e-${source}-${target}`;
        if (state.edges.find(e => e.id === id)) return state;
        return { edges: [...state.edges, { id, source, target }] };
    }),
    removeEdge: (id) => set((state) => ({
        edges: state.edges.filter(e => e.id !== id)
    })),
    clearStrategy: () => set({ nodes: [], edges: [] })
}));
