/**
 * Graph Import/Export Manager
 * Handles saving and loading graphs in various formats
 */

class GraphIO {
    /**
     * Export graph to JSON
     */
    static exportToJSON(graph) {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            nodes: [],
            edges: [],
            startNode: graph.startNode?.id || null,
            endNode: graph.endNode?.id || null
        };

        // Export nodes
        graph.nodes.forEach(node => {
            data.nodes.push({
                id: node.id,
                x: node.x,
                y: node.y,
                type: node.type
            });
        });

        // Export edges (avoid duplicates)
        const addedEdges = new Set();
        graph.edges.forEach(edge => {
            const key = `${edge.from.id}-${edge.to.id}`;
            const reverseKey = `${edge.to.id}-${edge.from.id}`;

            if (!addedEdges.has(key) && !addedEdges.has(reverseKey)) {
                data.edges.push({
                    from: edge.from.id,
                    to: edge.to.id,
                    weight: edge.weight
                });
                addedEdges.add(key);
            }
        });

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import graph from JSON
     */
    static importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Validate data
            if (!data.nodes || !data.edges) {
                throw new Error('Invalid graph format: missing nodes or edges');
            }

            const graph = new Graph();

            // Import nodes
            data.nodes.forEach(nodeData => {
                graph.addNode(nodeData.id, nodeData.x, nodeData.y, nodeData.type);
            });

            // Import edges
            data.edges.forEach(edgeData => {
                graph.addEdge(edgeData.from, edgeData.to, edgeData.weight, true);
            });

            // Set start and end nodes
            if (data.startNode) {
                graph.setStartNode(data.startNode);
            }
            if (data.endNode) {
                graph.setEndNode(data.endNode);
            }

            return { success: true, graph, message: 'Graph imported successfully' };

        } catch (error) {
            return { success: false, graph: null, message: error.message };
        }
    }

    /**
     * Export graph to CSV
     */
    static exportToCSV(graph) {
        let csv = 'Node ID,X Position,Y Position,Type\n';

        graph.nodes.forEach(node => {
            csv += `${node.id},${node.x},${node.y},${node.type}\n`;
        });

        csv += '\nFrom,To,Weight\n';

        const addedEdges = new Set();
        graph.edges.forEach(edge => {
            const key = `${edge.from.id}-${edge.to.id}`;
            const reverseKey = `${edge.to.id}-${edge.from.id}`;

            if (!addedEdges.has(key) && !addedEdges.has(reverseKey)) {
                csv += `${edge.from.id},${edge.to.id},${edge.weight}\n`;
                addedEdges.add(key);
            }
        });

        return csv;
    }

    /**
     * Export graph as image
     */
    static exportAsImage(canvas, filename = 'graph.png') {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    /**
     * Generate shareable URL
     */
    static generateShareURL(graph) {
        const data = {
            nodes: [],
            edges: [],
            start: graph.startNode?.id,
            end: graph.endNode?.id
        };

        graph.nodes.forEach(node => {
            data.nodes.push({
                id: node.id,
                x: node.x,
                y: node.y,
                type: node.type
            });
        });

        const addedEdges = new Set();
        graph.edges.forEach(edge => {
            const key = `${edge.from.id}-${edge.to.id}`;
            if (!addedEdges.has(key)) {
                data.edges.push({
                    f: edge.from.id,
                    t: edge.to.id,
                    w: edge.weight
                });
                addedEdges.add(key);
            }
        });

        // Compress and encode
        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
        const baseURL = window.location.origin + window.location.pathname;
        return `${baseURL}?graph=${compressed}`;
    }

    /**
     * Load graph from URL
     */
    static loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const graphData = urlParams.get('graph');

        if (!graphData) return null;

        try {
            const decompressed = LZString.decompressFromEncodedURIComponent(graphData);
            const data = JSON.parse(decompressed);

            const graph = new Graph();

            data.nodes.forEach(node => {
                graph.addNode(node.id, node.x, node.y, node.type);
            });

            data.edges.forEach(edge => {
                graph.addEdge(edge.f, edge.t, edge.w, true);
            });

            if (data.start) graph.setStartNode(data.start);
            if (data.end) graph.setEndNode(data.end);

            return graph;

        } catch (error) {
            console.error('Error loading graph from URL:', error);
            return null;
        }
    }

    /**
     * Export to adjacency list format
     */
    static exportToAdjacencyList(graph) {
        let output = 'Adjacency List Representation:\n\n';

        graph.nodes.forEach(node => {
            if (node.type !== 'wall') {
                output += `${node.id}: `;
                const neighbors = node.neighbors
                    .filter(n => !n.node.isWall())
                    .map(n => `${n.node.id}(${n.weight})`)
                    .join(', ');
                output += neighbors || 'none';
                output += '\n';
            }
        });

        return output;
    }

    /**
     * Export to adjacency matrix format
     */
    static exportToAdjacencyMatrix(graph) {
        const nodes = Array.from(graph.nodes.values()).filter(n => n.type !== 'wall');
        const size = nodes.length;
        const matrix = Array(size).fill(0).map(() => Array(size).fill(0));

        // Build index map
        const nodeIndex = new Map();
        nodes.forEach((node, index) => {
            nodeIndex.set(node.id, index);
        });

        // Fill matrix
        graph.edges.forEach(edge => {
            if (!edge.from.isWall() && !edge.to.isWall()) {
                const fromIdx = nodeIndex.get(edge.from.id);
                const toIdx = nodeIndex.get(edge.to.id);
                if (fromIdx !== undefined && toIdx !== undefined) {
                    matrix[fromIdx][toIdx] = edge.weight;
                }
            }
        });

        // Format output
        let output = 'Adjacency Matrix:\n\n';
        output += '    ';
        nodes.forEach(node => output += `${node.id.padEnd(6)}`);
        output += '\n';

        nodes.forEach((node, i) => {
            output += `${node.id.padEnd(4)}`;
            matrix[i].forEach(val => {
                output += `${val.toString().padEnd(6)}`;
            });
            output += '\n';
        });

        return output;
    }
}

/**
 * Simple LZ-string compression
 * Minimal implementation for URL encoding
 */
class LZString {
    static compressToEncodedURIComponent(input) {
        if (input == null) return '';
        return encodeURIComponent(btoa(input));
    }

    static decompressFromEncodedURIComponent(input) {
        if (input == null) return '';
        if (input == '') return null;
        try {
            return atob(decodeURIComponent(input));
        } catch (e) {
            return null;
        }
    }
}

/**
 * Graph Templates Library
 */
class GraphTemplates {
    static templates = {
        'simple-path': {
            name: 'Simple Path',
            description: 'A simple linear path for testing',
            generator: (width, height, offsetX, offsetY) => {
                const graph = new Graph();
                const spacing = 100;
                const y = height / 2 + offsetY;

                for (let i = 0; i < 8; i++) {
                    const x = offsetX + (i + 1) * spacing;
                    graph.addNode(`node-${i}`, x, y);

                    if (i > 0) {
                        graph.addEdge(`node-${i - 1}`, `node-${i}`, 1);
                    }
                }

                graph.setStartNode('node-0');
                graph.setEndNode('node-7');
                return graph;
            }
        },

        'binary-tree': {
            name: 'Binary Tree',
            description: 'A balanced binary tree structure',
            generator: (width, height, offsetX, offsetY) => {
                const graph = new Graph();
                const levels = 4;
                const spacing = 80;

                function addNode(id, level, position) {
                    const x = offsetX + width / 2 + (position - Math.pow(2, level - 1) / 2) * spacing;
                    const y = offsetY + level * 100;
                    graph.addNode(id, x, y);
                }

                let nodeId = 0;
                for (let level = 1; level <= levels; level++) {
                    const nodesInLevel = Math.pow(2, level - 1);
                    for (let i = 0; i < nodesInLevel; i++) {
                        addNode(`node-${nodeId}`, level, i);

                        if (level > 1) {
                            const parent = Math.floor((nodeId - 1) / 2);
                            graph.addEdge(`node-${parent}`, `node-${nodeId}`, 1);
                        }

                        nodeId++;
                    }
                }

                graph.setStartNode('node-0');
                graph.setEndNode(`node-${nodeId - 1}`);
                return graph;
            }
        },

        'diamond': {
            name: 'Diamond Pattern',
            description: 'Multiple paths with different costs',
            generator: (width, height, offsetX, offsetY) => {
                const graph = new Graph();
                const centerX = offsetX + width / 2;
                const centerY = offsetY + height / 2;

                graph.addNode('start', centerX - 200, centerY);
                graph.addNode('top', centerX, centerY - 150);
                graph.addNode('middle', centerX, centerY);
                graph.addNode('bottom', centerX, centerY + 150);
                graph.addNode('end', centerX + 200, centerY);

                graph.addEdge('start', 'top', 1);
                graph.addEdge('start', 'middle', 2);
                graph.addEdge('start', 'bottom', 3);

                graph.addEdge('top', 'end', 3);
                graph.addEdge('middle', 'end', 2);
                graph.addEdge('bottom', 'end', 1);

                graph.setStartNode('start');
                graph.setEndNode('end');
                return graph;
            }
        },

        'star': {
            name: 'Star Pattern',
            description: 'Central hub with radial connections',
            generator: (width, height, offsetX, offsetY) => {
                const graph = new Graph();
                const centerX = offsetX + width / 2;
                const centerY = offsetY + height / 2;
                const radius = 150;
                const points = 8;

                graph.addNode('center', centerX, centerY);

                for (let i = 0; i < points; i++) {
                    const angle = (i * 2 * Math.PI) / points;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    const id = `point-${i}`;

                    graph.addNode(id, x, y);
                    graph.addEdge('center', id, 1);

                    // Connect to adjacent points
                    if (i > 0) {
                        graph.addEdge(`point-${i - 1}`, id, 1);
                    }
                }

                graph.addEdge(`point-${points - 1}`, 'point-0', 1);
                graph.setStartNode('point-0');
                graph.setEndNode('point-4');
                return graph;
            }
        }
    };

    static getTemplate(name) {
        return this.templates[name] || null;
    }

    static getAllTemplates() {
        return Object.entries(this.templates).map(([key, value]) => ({
            id: key,
            name: value.name,
            description: value.description
        }));
    }
}
