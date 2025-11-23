/**
 * Main Application Controller
 * Handles UI interactions and coordinates visualization
 */

class App {
    constructor() {
        this.canvas = document.getElementById('graph-canvas');
        this.visualizer = new Visualizer(this.canvas);
        this.graph = null;
        this.currentAlgorithm = null;
        this.algorithmGenerator = null;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.customMode = false;
        this.nextNodeId = 0;

        this.setupUI();
        this.setupEventListeners();
        this.loadPreset('grid');

        // Handle window resize
        window.addEventListener('resize', () => {
            this.visualizer.resize();
        });
    }

    setupUI() {
        this.elements = {
            algorithm: document.getElementById('algorithm'),
            preset: document.getElementById('preset'),
            speed: document.getElementById('speed'),
            speedValue: document.getElementById('speed-value'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            stepBtn: document.getElementById('step-btn'),
            clearBtn: document.getElementById('clear-btn'),
            nodesVisited: document.getElementById('nodes-visited'),
            pathLength: document.getElementById('path-length'),
            status: document.getElementById('status')
        };
    }

    setupEventListeners() {
        // Algorithm selection
        this.elements.algorithm.addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
            this.updateStatus(`Selected: ${this.elements.algorithm.options[this.elements.algorithm.selectedIndex].text}`);
        });

        // Preset selection
        this.elements.preset.addEventListener('change', (e) => {
            const preset = e.target.value;
            this.customMode = preset === 'custom';
            if (!this.customMode) {
                this.loadPreset(preset);
            } else {
                this.graph = new Graph();
                this.visualizer.setGraph(this.graph);
                this.updateStatus('Custom mode: Click to create nodes');
            }
        });

        // Speed control
        this.elements.speed.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.elements.speedValue.textContent = this.speed;
        });

        // Buttons
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.stepBtn.addEventListener('click', () => this.step());
        this.elements.clearBtn.addEventListener('click', () => this.clear());

        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleCanvasRightClick(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.togglePause();
                } else {
                    this.start();
                }
            } else if (e.code === 'KeyR') {
                this.reset();
            } else if (e.code === 'KeyS' && !this.isRunning) {
                this.step();
            }
        });
    }

    loadPreset(preset) {
        const width = this.visualizer.width - 100;
        const height = this.visualizer.height - 100;
        const offsetX = 50;
        const offsetY = 50;

        try {
            switch (preset) {
                case 'grid':
                    this.graph = GraphGenerator.createGrid(width, height, 50, offsetX, offsetY);
                    break;
                case 'random':
                    this.graph = GraphGenerator.createRandomGraph(30, width, height, offsetX, offsetY, 0.25);
                    break;
                case 'weighted':
                    this.graph = GraphGenerator.createWeightedGraph(width, height, offsetX, offsetY);
                    break;
                case 'maze':
                    this.graph = GraphGenerator.createMaze(width, height, 40, offsetX, offsetY);
                    break;
                default:
                    this.graph = GraphGenerator.createGrid(width, height, 50, offsetX, offsetY);
            }

            this.visualizer.setGraph(this.graph);
            this.updateStatus(`Loaded ${preset} preset`);
            this.resetStats();
        } catch (error) {
            console.error('Error loading preset:', error);
            this.updateStatus('Error loading preset', true);
        }
    }

    handleCanvasClick(e) {
        const pos = this.visualizer.getClickPosition(e);
        const clickedNode = this.graph.getNodeAt(pos.x, pos.y, this.visualizer.nodeRadius);

        if (this.customMode) {
            if (e.ctrlKey || e.metaKey) {
                // Toggle wall
                if (clickedNode) {
                    clickedNode.type = clickedNode.type === 'wall' ? 'normal' : 'wall';
                    this.visualizer.draw();
                }
            } else if (!clickedNode) {
                // Create new node
                const nodeId = `custom-${this.nextNodeId++}`;
                this.graph.addNode(nodeId, pos.x, pos.y);
                this.visualizer.draw();
            }
        } else {
            // Toggle walls in non-custom mode
            if (clickedNode && e.ctrlKey || e.metaKey) {
                if (clickedNode.type !== 'start' && clickedNode.type !== 'end') {
                    clickedNode.type = clickedNode.type === 'wall' ? 'normal' : 'wall';
                    this.visualizer.draw();
                }
            }
        }
    }

    handleCanvasRightClick(e) {
        const pos = this.visualizer.getClickPosition(e);
        const clickedNode = this.graph.getNodeAt(pos.x, pos.y, this.visualizer.nodeRadius);

        if (clickedNode) {
            if (e.shiftKey) {
                // Set as end node
                this.graph.setEndNode(clickedNode.id);
                this.updateStatus('End node updated');
            } else {
                // Set as start node
                this.graph.setStartNode(clickedNode.id);
                this.updateStatus('Start node updated');
            }
            this.visualizer.draw();
        }
    }

    async start() {
        if (this.isRunning) return;

        if (!this.graph.startNode || !this.graph.endNode) {
            this.updateStatus('Please set start and end nodes', true);
            return;
        }

        this.currentAlgorithm = this.elements.algorithm.value;
        const algorithmFn = Algorithms.getAlgorithm(this.currentAlgorithm);

        if (!algorithmFn) {
            this.updateStatus('Invalid algorithm selected', true);
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.graph.reset();
        this.visualizer.setAnimationPath([]);
        this.resetStats();

        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.stepBtn.disabled = true;

        this.algorithmGenerator = algorithmFn(this.graph);
        this.updateStatus('Running...');

        await this.runAlgorithm();
    }

    async runAlgorithm() {
        try {
            while (this.isRunning && !this.isPaused) {
                const result = this.algorithmGenerator.next();

                if (result.done) {
                    this.isRunning = false;
                    break;
                }

                const step = result.value;
                this.handleStep(step);

                // Calculate delay based on speed (1-100 maps to 500ms-10ms)
                const delay = 510 - this.speed * 5;
                await this.sleep(delay);
            }

            if (!this.isPaused) {
                this.elements.startBtn.disabled = false;
                this.elements.pauseBtn.disabled = true;
                this.elements.stepBtn.disabled = false;
            }
        } catch (error) {
            console.error('Algorithm error:', error);
            this.updateStatus('Error during algorithm execution', true);
            this.stop();
        }
    }

    handleStep(step) {
        switch (step.type) {
            case 'visiting':
            case 'enqueue':
            case 'push':
            case 'update_distance':
            case 'update_score':
                this.visualizer.draw();
                if (step.nodesVisited !== undefined) {
                    this.updateNodesVisited(step.nodesVisited);
                }
                break;

            case 'found':
                this.visualizer.setAnimationPath(step.path);
                this.updateNodesVisited(step.nodesVisited);
                this.updatePathLength(step.pathLength);
                this.updateStatus('Path found!', false, true);
                this.isRunning = false;
                break;

            case 'not_found':
                this.visualizer.draw();
                this.updateNodesVisited(step.nodesVisited);
                this.updateStatus(step.message || 'No path found', true);
                this.isRunning = false;
                break;

            case 'error':
                this.updateStatus(step.message, true);
                this.isRunning = false;
                break;
        }
    }

    step() {
        if (this.isRunning) return;

        if (!this.algorithmGenerator) {
            if (!this.graph.startNode || !this.graph.endNode) {
                this.updateStatus('Please set start and end nodes', true);
                return;
            }

            this.currentAlgorithm = this.elements.algorithm.value;
            const algorithmFn = Algorithms.getAlgorithm(this.currentAlgorithm);

            if (!algorithmFn) {
                this.updateStatus('Invalid algorithm selected', true);
                return;
            }

            this.graph.reset();
            this.visualizer.setAnimationPath([]);
            this.resetStats();
            this.algorithmGenerator = algorithmFn(this.graph);
            this.updateStatus('Stepping...');
        }

        const result = this.algorithmGenerator.next();

        if (!result.done) {
            this.handleStep(result.value);
        } else {
            this.algorithmGenerator = null;
            this.elements.stepBtn.disabled = false;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (!this.isPaused) {
            this.runAlgorithm();
        }
    }

    reset() {
        this.stop();
        this.graph.reset();
        this.visualizer.setAnimationPath([]);
        this.visualizer.draw();
        this.resetStats();
        this.updateStatus('Reset');
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.algorithmGenerator = null;

        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.pauseBtn.textContent = 'Pause';
        this.elements.stepBtn.disabled = false;
    }

    clear() {
        this.stop();
        this.graph.clear();
        this.visualizer.setGraph(this.graph);
        this.resetStats();
        this.updateStatus('Graph cleared');
        this.nextNodeId = 0;
    }

    updateNodesVisited(count) {
        this.elements.nodesVisited.textContent = count;
    }

    updatePathLength(length) {
        this.elements.pathLength.textContent = length;
    }

    updateStatus(message, isError = false, isSuccess = false) {
        this.elements.status.textContent = message;
        this.elements.status.style.color = isError ? '#F44336' : (isSuccess ? '#4CAF50' : '#ff9800');
    }

    resetStats() {
        this.updateNodesVisited(0);
        this.updatePathLength('-');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new App();
        console.log('Graph Algorithm Visualizer initialized successfully');

        // Add keyboard shortcuts help
        console.log('Keyboard Shortcuts:');
        console.log('  Space - Start/Pause visualization');
        console.log('  R - Reset');
        console.log('  S - Step (when paused)');
        console.log('  Ctrl+Click - Toggle wall');
        console.log('  Right-Click - Set start node');
        console.log('  Shift+Right-Click - Set end node');
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error initializing application. Please check the console for details.');
    }
});
