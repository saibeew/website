import { StrategyNode, StrategyEdge } from '@/store/useStrategyStore';

export function auditStrategy(nodes: StrategyNode[], edges: StrategyEdge[]) {
    if (nodes.length === 0) return "No strategy logic detected. Initialize nodes to perform an institutional audit.";

    // Simple logic tree construction
    const logicTree = nodes.map(node => {
        const connectedTo = edges.filter(e => e.source === node.id).map(e => {
            const target = nodes.find(n => n.id === e.target);
            return target ? target.label : "Unknown";
        });
        
        return `- ${node.label} (${node.type.toUpperCase()}) ${connectedTo.length > 0 ? `→ Triggers: ${connectedTo.join(', ')}` : ''}`;
    }).join('\n');

    const prompt = `
        Perform an institutional-grade audit of the following visual trading strategy:
        
        ### Strategy Logic Tree:
        ${logicTree}
        
        ### Requirements:
        1. Evaluate the statistical "Edge" of this specific indicator/logic combination.
        2. Identify "Tail Risk" exposure (e.g., if no stop-loss or action-node is detected).
        3. Provide a brief "Strategic Solvency" score (0-100) for this architecture.
        4. Integrate current geopolitical volatility impact on this strategy's primary assets.
        
        Keep the response concise and data-driven (Direct Answer Protocol applies).
    `;

    return prompt;
}
