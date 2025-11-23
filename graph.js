/**
 * Graph Data Structure
 * Represents a graph with nodes and edges
 */

class Node {
    constructor(id, x, y, type = 'normal') {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type; // 'normal', 'start', 'end', 'wall'
        this.neighbors = [];
        this.visited = false;
        this.visiting = false;
        this.distance = Infinity;
        this.parent = null;
        this.heuristic = 0;
        this.fScore = Infinity;
    }

    addNeighbor(node, weight = 1) {
        this.neighbors.push({ node, weight });
    }

    reset() {
        this.visited = false;
        this.visiting = false;
        this.distance = Infinity;
        this.parent = null;
        this.heuristic = 0;
        this.fScore = Infinity;
    }

    isWall() {
        return this.type === 'wall';
    }
}

class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
        this.startNode = null;
        this.endNode = null;
    }

    addNode(id, x, y, type = 'normal') {
        if (!this.nodes.has(id)) {
            const node = new Node(id, x, y, type);
            this.nodes.set(id, node);

            // Auto-set start and end nodes
            if (type === 'start') {
                this.startNode = node;
            } else if (type === 'end') {
                this.endNode = node;
            }

            return node;
        }
        return this.nodes.get(id);
    }

    getNode(id) {
        return this.nodes.get(id);
    }

    addEdge(fromId, toId, weight = 1, bidirectional = true) {
        const fromNode = this.nodes.get(fromId);
        const toNode = this.nodes.get(toId);

        if (fromNode && toNode && !fromNode.isWall() && !toNode.isWall()) {
            fromNode.addNeighbor(toNode, weight);
            this.edges.push({ from: fromNode, to: toNode, weight });

            if (bidirectional) {
                toNode.addNeighbor(fromNode, weight);
                this.edges.push({ from: toNode, to: fromNode, weight });
            }
        }
    }

    setStartNode(nodeId) {
        if (this.startNode) {
            this.startNode.type = 'normal';
        }
        const node = this.nodes.get(nodeId);
        if (node) {
            node.type = 'start';
            this.startNode = node;
        }
    }

    setEndNode(nodeId) {
        if (this.endNode) {
            this.endNode.type = 'normal';
        }
        const node = this.nodes.get(nodeId);
        if (node) {
            node.type = 'end';
            this.endNode = node;
        }
    }

    setWall(nodeId, isWall = true) {
        const node = this.nodes.get(nodeId);
        if (node && node.type !== 'start' && node.type !== 'end') {
            node.type = isWall ? 'wall' : 'normal';
        }
    }

    reset() {
        this.nodes.forEach(node => node.reset());
    }

    clear() {
        this.nodes.clear();
        this.edges = [];
        this.startNode = null;
        this.endNode = null;
    }

    getNodeAt(x, y, radius = 20) {
        for (const [id, node] of this.nodes) {
            const dx = node.x - x;
            const dy = node.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius) {
                return node;
            }
        }
        return null;
    }

    // Calculate Euclidean distance (heuristic for A*)
    getDistance(node1, node2) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate Manhattan distance (alternative heuristic)
    getManhattanDistance(node1, node2) {
        return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
    }
}

// Graph Generators
class GraphGenerator {
    static createGrid(width, height, cellSize, offsetX, offsetY) {
        const graph = new Graph();
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);

        // Create nodes
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const id = `${row}-${col}`;
                const x = offsetX + col * cellSize + cellSize / 2;
                const y = offsetY + row * cellSize + cellSize / 2;
                graph.addNode(id, x, y);
            }
        }

        // Create edges (4-directional connectivity)
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const currentId = `${row}-${col}`;

                // Right neighbor
                if (col < cols - 1) {
                    graph.addEdge(currentId, `${row}-${col + 1}`);
                }
                // Bottom neighbor
                if (row < rows - 1) {
                    graph.addEdge(currentId, `${row + 1}-${col}`);
                }
            }
        }

        // Set default start and end
        if (graph.nodes.size > 0) {
            graph.setStartNode('0-0');
            graph.setEndNode(`${rows - 1}-${cols - 1}`);
        }

        return graph;
    }

    static createRandomGraph(numNodes, width, height, offsetX, offsetY, connectionProbability = 0.3) {
        const graph = new Graph();
        const nodes = [];

        // Create nodes at random positions
        for (let i = 0; i < numNodes; i++) {
            const x = offsetX + Math.random() * width;
            const y = offsetY + Math.random() * height;
            const node = graph.addNode(`node-${i}`, x, y);
            nodes.push(node);
        }

        // Create random edges
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() < connectionProbability) {
                    const distance = Math.floor(graph.getDistance(nodes[i], nodes[j]));
                    graph.addEdge(nodes[i].id, nodes[j].id, distance);
                }
            }
        }

        // Ensure at least some connectivity
        for (let i = 0; i < nodes.length - 1; i++) {
            if (nodes[i].neighbors.length === 0) {
                const nextNode = nodes[i + 1];
                const distance = Math.floor(graph.getDistance(nodes[i], nextNode));
                graph.addEdge(nodes[i].id, nextNode.id, distance);
            }
        }

        // Set start and end
        if (nodes.length >= 2) {
            graph.setStartNode(nodes[0].id);
            graph.setEndNode(nodes[nodes.length - 1].id);
        }

        return graph;
    }

    static createWeightedGraph(width, height, offsetX, offsetY) {
        const graph = new Graph();
        const positions = [
            { id: 'A', x: offsetX + 100, y: offsetY + 100 },
            { id: 'B', x: offsetX + 300, y: offsetY + 100 },
            { id: 'C', x: offsetX + 500, y: offsetY + 100 },
            { id: 'D', x: offsetX + 100, y: offsetY + 300 },
            { id: 'E', x: offsetX + 300, y: offsetY + 300 },
            { id: 'F', x: offsetX + 500, y: offsetY + 300 },
            { id: 'G', x: offsetX + 100, y: offsetY + 500 },
            { id: 'H', x: offsetX + 300, y: offsetY + 500 },
            { id: 'I', x: offsetX + 500, y: offsetY + 500 }
        ];

        positions.forEach(pos => {
            graph.addNode(pos.id, pos.x, pos.y);
        });

        // Add weighted edges
        const edges = [
            ['A', 'B', 4], ['A', 'D', 2],
            ['B', 'C', 3], ['B', 'E', 1],
            ['C', 'F', 6],
            ['D', 'E', 5], ['D', 'G', 7],
            ['E', 'F', 2], ['E', 'H', 3],
            ['F', 'I', 1],
            ['G', 'H', 4],
            ['H', 'I', 2]
        ];

        edges.forEach(([from, to, weight]) => {
            graph.addEdge(from, to, weight);
        });

        graph.setStartNode('A');
        graph.setEndNode('I');

        return graph;
    }

    static createMaze(width, height, cellSize, offsetX, offsetY) {
        const graph = GraphGenerator.createGrid(width, height, cellSize, offsetX, offsetY);

        // Add random walls (about 30% of nodes)
        const nodes = Array.from(graph.nodes.values());
        const numWalls = Math.floor(nodes.length * 0.3);

        for (let i = 0; i < numWalls; i++) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            if (randomNode.type === 'normal') {
                randomNode.type = 'wall';
            }
        }

        return graph;
    }
}
