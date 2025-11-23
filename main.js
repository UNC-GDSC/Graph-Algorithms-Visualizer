/**
 * Main Application Controller - Enhanced Version
 * Handles UI interactions, state management, and coordinates all features
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

        // Advanced features
        this.stateManager = new StateManager(50);
        this.themeManager = new ThemeManager();
        this.zoomPanController = null;
        this.tutorialManager = new TutorialManager();

        this.setupUI();
        this.setupEventListeners();
        this.setupAdvancedFeatures();
        this.loadPreset('grid');

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.visualizer.resize();
        }, 250));

        // Show tutorial for first-time users
        if (!Utils.storage.get('tutorialCompleted')) {
            setTimeout(() => this.tutorialManager.start(), 1000);
        }

        // Load from URL if present
        const urlGraph = GraphIO.loadFromURL();
        if (urlGraph) {
            this.graph = urlGraph;
            this.visualizer.setGraph(this.graph);
            this.saveState();
            Utils.showToast('Graph loaded from URL!', 'success');
        }
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
            compareBtn: document.getElementById('compare-btn'),
            undoBtn: document.getElementById('undo-btn'),
            redoBtn: document.getElementById('redo-btn'),
            exportBtn: document.getElementById('export-btn'),
            importBtn: document.getElementById('import-btn'),
            importFile: document.getElementById('import-file'),
            themeBtn: document.getElementById('theme-btn'),
            tutorialBtn: document.getElementById('tutorial-btn'),
            shareBtn: document.getElementById('share-btn'),
            fullscreenBtn: document.getElementById('fullscreen-btn'),
            zoomInBtn: document.getElementById('zoom-in-btn'),
            zoomOutBtn: document.getElementById('zoom-out-btn'),
            zoomResetBtn: document.getElementById('zoom-reset-btn'),
            downloadBtn: document.getElementById('download-btn'),
            toggleInstructionsBtn: document.getElementById('toggle-instructions'),
            instructionsPanel: document.getElementById('instructions-panel'),
            algoDescription: document.getElementById('algo-description'),
            nodesVisited: document.getElementById('nodes-visited'),
            pathLength: document.getElementById('path-length'),
            totalDistance: document.getElementById('total-distance'),
            status: document.getElementById('status'),
            complexity: document.getElementById('complexity')
        };

        // Update algorithm description
        this.updateAlgorithmInfo();
    }

    setupEventListeners() {
        // Algorithm selection
        this.elements.algorithm.addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
            this.updateAlgorithmInfo();
            this.updateStatus(`Selected: ${this.elements.algorithm.options[this.elements.algorithm.selectedIndex].text}`);
        });

        // Preset selection
        this.elements.preset.addEventListener('change', (e) => {
            const preset = e.target.value;
            this.customMode = preset === 'custom';
            if (!this.customMode) {
                this.loadPreset(preset);
                this.saveState();
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

        // Main buttons
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.stepBtn.addEventListener('click', () => this.step());
        this.elements.clearBtn.addEventListener('click', () => this.clear());
        this.elements.compareBtn.addEventListener('click', () => this.compareAlgorithms());

        // Undo/Redo
        this.elements.undoBtn.addEventListener('click', () => this.undo());
        this.elements.redoBtn.addEventListener('click', () => this.redo());

        // Import/Export
        this.elements.exportBtn.addEventListener('click', () => this.exportGraph());
        this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
        this.elements.importFile.addEventListener('change', (e) => this.importGraph(e));

        // Header actions
        this.elements.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.elements.tutorialBtn.addEventListener('click', () => this.tutorialManager.start());
        this.elements.shareBtn.addEventListener('click', () => this.shareGraph());
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Zoom controls
        this.elements.zoomInBtn.addEventListener('click', () => this.zoomPanController.zoom(0.1, this.visualizer.width / 2, this.visualizer.height / 2));
        this.elements.zoomOutBtn.addEventListener('click', () => this.zoomPanController.zoom(-0.1, this.visualizer.width / 2, this.visualizer.height / 2));
        this.elements.zoomResetBtn.addEventListener('click', () => this.zoomPanController.reset());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadImage());

        // Instructions toggle
        this.elements.toggleInstructionsBtn.addEventListener('click', () => {
            this.elements.instructionsPanel.classList.toggle('collapsed');
        });

        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleCanvasRightClick(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupAdvancedFeatures() {
        // Initialize zoom/pan controller
        this.zoomPanController = new ZoomPanController(this.canvas, this.visualizer);

        // Apply saved theme
        this.themeManager.applyTheme(this.themeManager.getCurrentTheme());
    }

    handleKeyboard(e) {
        // Prevent default for our shortcuts
        const shortcuts = ['Space', 'KeyR', 'KeyS', 'KeyF', 'KeyT'];
        if (shortcuts.includes(e.code) || (e.ctrlKey && ['KeyZ', 'KeyY', 'KeyS'].includes(e.code))) {
            e.preventDefault();
        }

        if (e.code === 'Space') {
            if (this.isRunning) {
                this.togglePause();
            } else {
                this.start();
            }
        } else if (e.code === 'KeyR') {
            this.reset();
        } else if (e.code === 'KeyS' && !this.isRunning) {
            this.step();
        } else if (e.code === 'KeyF') {
            this.toggleFullscreen();
        } else if (e.code === 'KeyT') {
            this.toggleTheme();
        } else if (e.ctrlKey || e.metaKey) {
            if (e.code === 'KeyZ') {
                this.undo();
            } else if (e.code === 'KeyY') {
                this.redo();
            } else if (e.code === 'KeyS') {
                this.exportGraph();
            }
        }
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
                case 'simple-path':
                    this.graph = GraphGenerator.createSimplePath(width, height, offsetX, offsetY);
                    break;
                case 'binary-tree':
                    this.graph = GraphGenerator.createBinaryTree(width, height, offsetX, offsetY);
                    break;
                case 'diamond':
                    this.graph = GraphGenerator.createDiamond(width, height, offsetX, offsetY);
                    break;
                case 'star':
                    this.graph = GraphGenerator.createStar(width, height, offsetX, offsetY);
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
            Utils.showToast('Error loading preset', 'error');
        }
    }

    handleCanvasClick(e) {
        const pos = this.visualizer.getClickPosition(e);
        const worldPos = this.zoomPanController.screenToWorld(pos.x, pos.y);
        const clickedNode = this.graph.getNodeAt(worldPos.x, worldPos.y, this.visualizer.nodeRadius);

        if (this.customMode) {
            if (e.ctrlKey || e.metaKey) {
                if (clickedNode) {
                    clickedNode.type = clickedNode.type === 'wall' ? 'normal' : 'wall';
                    this.visualizer.draw();
                    this.saveState();
                }
            } else if (!clickedNode) {
                const nodeId = `custom-${this.nextNodeId++}`;
                this.graph.addNode(nodeId, worldPos.x, worldPos.y);
                this.visualizer.draw();
                this.saveState();
            }
        } else {
            if (clickedNode && (e.ctrlKey || e.metaKey)) {
                if (clickedNode.type !== 'start' && clickedNode.type !== 'end') {
                    clickedNode.type = clickedNode.type === 'wall' ? 'normal' : 'wall';
                    this.visualizer.draw();
                    this.saveState();
                }
            }
        }
    }

    handleCanvasRightClick(e) {
        const pos = this.visualizer.getClickPosition(e);
        const worldPos = this.zoomPanController.screenToWorld(pos.x, pos.y);
        const clickedNode = this.graph.getNodeAt(worldPos.x, worldPos.y, this.visualizer.nodeRadius);

        if (clickedNode) {
            if (e.shiftKey) {
                this.graph.setEndNode(clickedNode.id);
                this.updateStatus('End node updated');
            } else {
                this.graph.setStartNode(clickedNode.id);
                this.updateStatus('Start node updated');
            }
            this.visualizer.draw();
            this.saveState();
        }
    }

    async start() {
        if (this.isRunning) return;

        if (!this.graph.startNode || !this.graph.endNode) {
            this.updateStatus('Please set start and end nodes', true);
            Utils.showToast('Please set start and end nodes', 'error');
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
            this.updateStatus('Error during execution', true);
            Utils.showToast('Algorithm error occurred', 'error');
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
            case 'relaxing':
                this.visualizer.draw();
                if (step.nodesVisited !== undefined) {
                    this.updateNodesVisited(step.nodesVisited);
                }
                break;

            case 'found':
                this.visualizer.setAnimationPath(step.path);
                this.updateNodesVisited(step.nodesVisited);
                this.updatePathLength(step.pathLength);
                if (step.totalDistance !== undefined) {
                    this.updateTotalDistance(step.totalDistance);
                }
                this.updateStatus('Path found!', false, true);
                Utils.showToast(`Path found! Length: ${step.pathLength}`, 'success');
                this.isRunning = false;
                break;

            case 'not_found':
                this.visualizer.draw();
                this.updateNodesVisited(step.nodesVisited);
                this.updateStatus(step.message || 'No path found', true);
                Utils.showToast('No path exists', 'error');
                this.isRunning = false;
                break;

            case 'error':
                this.updateStatus(step.message, true);
                Utils.showToast(step.message, 'error');
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
        this.elements.pauseBtn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';

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
        this.elements.pauseBtn.textContent = '⏸ Pause';
        this.elements.stepBtn.disabled = false;
    }

    clear() {
        this.stop();
        this.graph.clear();
        this.visualizer.setGraph(this.graph);
        this.resetStats();
        this.updateStatus('Graph cleared');
        this.nextNodeId = 0;
        this.saveState();
    }

    // Advanced Features

    saveState() {
        if (!this.graph) return;

        const state = {
            nodes: Array.from(this.graph.nodes.values()).map(n => ({
                id: n.id,
                x: n.x,
                y: n.y,
                type: n.type
            })),
            edges: this.graph.edges.map(e => ({
                from: e.from.id,
                to: e.to.id,
                weight: e.weight
            })),
            startNode: this.graph.startNode?.id,
            endNode: this.graph.endNode?.id
        };

        this.stateManager.saveState(state);
        this.updateUndoRedoButtons();
    }

    undo() {
        const state = this.stateManager.undo();
        if (state) {
            this.restoreState(state);
            Utils.showToast('Undo', 'info');
        }
    }

    redo() {
        const state = this.stateManager.redo();
        if (state) {
            this.restoreState(state);
            Utils.showToast('Redo', 'info');
        }
    }

    restoreState(state) {
        const graph = new Graph();

        state.nodes.forEach(n => {
            graph.addNode(n.id, n.x, n.y, n.type);
        });

        state.edges.forEach(e => {
            graph.addEdge(e.from, e.to, e.weight, false);
        });

        if (state.startNode) graph.setStartNode(state.startNode);
        if (state.endNode) graph.setEndNode(state.endNode);

        this.graph = graph;
        this.visualizer.setGraph(this.graph);
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        this.elements.undoBtn.disabled = !this.stateManager.canUndo();
        this.elements.redoBtn.disabled = !this.stateManager.canRedo();
    }

    toggleTheme() {
        const newTheme = this.themeManager.toggleTheme();
        Utils.showToast(`Theme: ${newTheme}`, 'info');
    }

    exportGraph() {
        const menu = confirm('Export as JSON? (Cancel for CSV)');

        if (menu) {
            const json = GraphIO.exportToJSON(this.graph);
            Utils.downloadFile(json, 'graph.json', 'application/json');
            Utils.showToast('Graph exported as JSON', 'success');
        } else {
            const csv = GraphIO.exportToCSV(this.graph);
            Utils.downloadFile(csv, 'graph.csv', 'text/csv');
            Utils.showToast('Graph exported as CSV', 'success');
        }
    }

    async importGraph(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await Utils.readFile(file);
            const result = GraphIO.importFromJSON(content);

            if (result.success) {
                this.graph = result.graph;
                this.visualizer.setGraph(this.graph);
                this.saveState();
                Utils.showToast('Graph imported successfully', 'success');
            } else {
                Utils.showToast(`Import failed: ${result.message}`, 'error');
            }
        } catch (error) {
            Utils.showToast('Error reading file', 'error');
        }

        e.target.value = '';
    }

    async shareGraph() {
        try {
            const url = GraphIO.generateShareURL(this.graph);
            await Utils.copyToClipboard(url);
            Utils.showToast('Share link copied to clipboard!', 'success');
        } catch (error) {
            Utils.showToast('Failed to generate share link', 'error');
        }
    }

    downloadImage() {
        GraphIO.exportAsImage(this.canvas, 'graph-visualization.png');
        Utils.showToast('Image downloaded', 'success');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    compareAlgorithms() {
        Utils.showToast('Algorithm comparison coming soon!', 'info');
        // TODO: Implement side-by-side algorithm comparison
    }

    // UI Updates

    updateAlgorithmInfo() {
        const algo = this.elements.algorithm.value;
        const description = Algorithms.getDescription(algo);
        const complexity = Algorithms.getComplexity(algo);

        this.elements.algoDescription.textContent = description;
        this.elements.complexity.textContent = `Time: ${complexity.time}, Space: ${complexity.space}`;
    }

    updateNodesVisited(count) {
        this.elements.nodesVisited.textContent = count;
    }

    updatePathLength(length) {
        this.elements.pathLength.textContent = length;
    }

    updateTotalDistance(distance) {
        this.elements.totalDistance.textContent = Math.round(distance);
    }

    updateStatus(message, isError = false, isSuccess = false) {
        this.elements.status.textContent = message;
        this.elements.status.style.color = isError ? '#F44336' : (isSuccess ? '#4CAF50' : '#ff9800');
    }

    resetStats() {
        this.updateNodesVisited(0);
        this.updatePathLength('-');
        this.updateTotalDistance('-');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new App();
        window.app = app; // Expose for debugging
        console.log('Graph Algorithm Visualizer initialized successfully');
        console.log('Keyboard Shortcuts:');
        console.log('  Space - Start/Pause | R - Reset | S - Step');
        console.log('  Ctrl+Z - Undo | Ctrl+Y - Redo | Ctrl+S - Export');
        console.log('  F - Fullscreen | T - Toggle Theme');
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error initializing application. Please check the console for details.');
    }
});
