/**
 * Graph Visualizer
 * Handles rendering of the graph and animations
 */

class Visualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.graph = null;
        this.animationPath = [];

        // Colors
        this.colors = {
            normal: '#E0E0E0',
            start: '#4CAF50',
            end: '#F44336',
            visiting: '#2196F3',
            visited: '#90CAF9',
            path: '#FFD700',
            wall: '#424242',
            edge: '#BDBDBD',
            edgeWeight: '#666',
            text: '#333'
        };

        // Sizes
        this.nodeRadius = 15;
        this.edgeWidth = 2;
        this.fontSize = 12;

        this.setupCanvas();
    }

    setupCanvas() {
        // Set canvas size with high DPI support
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = Math.max(600, rect.height) * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = Math.max(600, rect.height) + 'px';

        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = Math.max(600, rect.height);
    }

    setGraph(graph) {
        this.graph = graph;
        this.animationPath = [];
        this.draw();
    }

    draw() {
        if (!this.graph) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw edges first
        this.drawEdges();

        // Draw nodes on top
        this.drawNodes();

        // Draw path if exists
        if (this.animationPath.length > 0) {
            this.drawPath(this.animationPath);
        }
    }

    drawEdges() {
        const drawnEdges = new Set();

        this.graph.edges.forEach(edge => {
            const key = `${Math.min(edge.from.id, edge.to.id)}-${Math.max(edge.from.id, edge.to.id)}`;

            if (!drawnEdges.has(key)) {
                drawnEdges.add(key);

                this.ctx.beginPath();
                this.ctx.strokeStyle = this.colors.edge;
                this.ctx.lineWidth = this.edgeWidth;
                this.ctx.moveTo(edge.from.x, edge.from.y);
                this.ctx.lineTo(edge.to.x, edge.to.y);
                this.ctx.stroke();

                // Draw weight if > 1
                if (edge.weight > 1) {
                    const midX = (edge.from.x + edge.to.x) / 2;
                    const midY = (edge.from.y + edge.to.y) / 2;

                    this.ctx.fillStyle = 'white';
                    this.ctx.fillRect(midX - 10, midY - 8, 20, 16);

                    this.ctx.fillStyle = this.colors.edgeWeight;
                    this.ctx.font = `bold ${this.fontSize}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(edge.weight, midX, midY);
                }
            }
        });
    }

    drawNodes() {
        this.graph.nodes.forEach(node => {
            // Determine node color
            let color = this.colors.normal;

            if (node.type === 'start') {
                color = this.colors.start;
            } else if (node.type === 'end') {
                color = this.colors.end;
            } else if (node.type === 'wall') {
                color = this.colors.wall;
            } else if (node.visiting) {
                color = this.colors.visiting;
            } else if (node.visited) {
                color = this.colors.visited;
            }

            // Draw node circle
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw node label (only for non-grid graphs or special nodes)
            if (node.type === 'start' || node.type === 'end' || !node.id.includes('-')) {
                this.ctx.fillStyle = node.type === 'wall' ? 'white' : this.colors.text;
                this.ctx.font = `bold ${this.fontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';

                let label = node.id;
                if (node.type === 'start') label = 'S';
                if (node.type === 'end') label = 'E';

                this.ctx.fillText(label, node.x, node.y);
            }

            // Draw distance for Dijkstra/A*
            if (node.distance !== Infinity && node.distance > 0 && !node.id.includes('-')) {
                this.ctx.fillStyle = this.colors.text;
                this.ctx.font = `${this.fontSize - 2}px Arial`;
                this.ctx.fillText(
                    `d:${Math.round(node.distance)}`,
                    node.x,
                    node.y + this.nodeRadius + 12
                );
            }
        });
    }

    drawPath(path) {
        if (path.length < 2) return;

        // Draw path edges
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.path;
        this.ctx.lineWidth = 4;
        this.ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }

        this.ctx.stroke();

        // Draw arrow at the end
        if (path.length >= 2) {
            const lastNode = path[path.length - 1];
            const secondLastNode = path[path.length - 2];
            this.drawArrow(secondLastNode.x, secondLastNode.y, lastNode.x, lastNode.y);
        }

        // Highlight path nodes
        path.forEach((node, index) => {
            if (node.type !== 'start' && node.type !== 'end') {
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = this.colors.path;
                this.ctx.fill();
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Draw step number
                this.ctx.fillStyle = '#333';
                this.ctx.font = `bold ${this.fontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(index, node.x, node.y);
            }
        });
    }

    drawArrow(fromX, fromY, toX, toY) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 15;
        const arrowWidth = 10;

        // Calculate arrow tip position (at the edge of the target node)
        const tipX = toX - this.nodeRadius * Math.cos(angle);
        const tipY = toY - this.nodeRadius * Math.sin(angle);

        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.path;
        this.ctx.moveTo(tipX, tipY);
        this.ctx.lineTo(
            tipX - arrowLength * Math.cos(angle - Math.PI / 6),
            tipY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            tipX - arrowLength * Math.cos(angle + Math.PI / 6),
            tipY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    setAnimationPath(path) {
        this.animationPath = path;
        this.draw();
    }

    highlightNode(node, color) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.nodeRadius + 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Get click position relative to canvas
    getClickPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    // Handle window resize
    resize() {
        this.setupCanvas();
        this.draw();
    }

    // Export canvas as image
    exportImage() {
        return this.canvas.toDataURL('image/png');
    }
}
