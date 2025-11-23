/**
 * Advanced Controls
 * Zoom, Pan, Touch Gestures
 */

class ZoomPanController {
    constructor(canvas, visualizer) {
        this.canvas = canvas;
        this.visualizer = visualizer;
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.minScale = 0.25;
        this.maxScale = 4;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Touch support
        this.touches = [];
        this.lastTouchDistance = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY) * 0.1;
            this.zoom(delta, e.offsetX, e.offsetY);
        }, { passive: false });

        // Mouse pan
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle button or Alt+Left
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                e.preventDefault();
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.pan(dx, dy);
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Touch gestures
        this.canvas.addEventListener('touchstart', (e) => {
            this.touches = Array.from(e.touches);
            if (this.touches.length === 2) {
                this.lastTouchDistance = this.getTouchDistance();
                e.preventDefault();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = this.getTouchDistance();
                const delta = (currentDistance - this.lastTouchDistance) * 0.01;

                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const rect = this.canvas.getBoundingClientRect();

                this.zoom(delta, centerX - rect.left, centerY - rect.top);
                this.lastTouchDistance = currentDistance;
            } else if (e.touches.length === 1 && this.touches.length === 1) {
                const dx = e.touches[0].clientX - this.touches[0].clientX;
                const dy = e.touches[0].clientY - this.touches[0].clientY;
                this.pan(dx, dy);
            }

            this.touches = Array.from(e.touches);
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.touches = [];
        });
    }

    getTouchDistance() {
        if (this.touches.length < 2) return 0;
        const dx = this.touches[0].clientX - this.touches[1].clientX;
        const dy = this.touches[0].clientY - this.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    zoom(delta, centerX, centerY) {
        const oldScale = this.scale;
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));

        // Adjust translate to zoom towards cursor
        const scaleDiff = this.scale - oldScale;
        this.translateX -= centerX * scaleDiff;
        this.translateY -= centerY * scaleDiff;

        this.apply();
    }

    pan(dx, dy) {
        this.translateX += dx;
        this.translateY += dy;
        this.apply();
    }

    reset() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.apply();
    }

    apply() {
        this.visualizer.setTransform(this.scale, this.translateX, this.translateY);
        this.visualizer.draw();
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.translateX) / this.scale,
            y: (screenY - this.translateY) / this.scale
        };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.scale + this.translateX,
            y: worldY * this.scale + this.translateY
        };
    }

    getState() {
        return {
            scale: this.scale,
            translateX: this.translateX,
            translateY: this.translateY
        };
    }
}

/**
 * Tutorial/Onboarding System
 */
class TutorialManager {
    constructor() {
        this.steps = [
            {
                title: 'Welcome to Graph Algorithm Visualizer!',
                content: 'This interactive tool helps you understand how graph algorithms work. Let\'s take a quick tour!',
                target: null,
                position: 'center'
            },
            {
                title: 'Choose an Algorithm',
                content: 'Select from 7 different algorithms including BFS, DFS, Dijkstra, A*, and more. Each has unique characteristics!',
                target: '#algorithm',
                position: 'bottom'
            },
            {
                title: 'Pick a Graph Preset',
                content: 'Start with pre-built graphs or create your own custom graph.',
                target: '#preset',
                position: 'bottom'
            },
            {
                title: 'Adjust Speed',
                content: 'Control how fast the visualization runs. Slower speeds help you understand each step.',
                target: '#speed',
                position: 'bottom'
            },
            {
                title: 'Interactive Canvas',
                content: 'Right-click to set start node, Shift+Right-click for end node, Ctrl+Click to add walls.',
                target: '#graph-canvas',
                position: 'top'
            },
            {
                title: 'Start Visualization',
                content: 'Click Start to see the algorithm in action! Use Step mode to advance one iteration at a time.',
                target: '#start-btn',
                position: 'top'
            },
            {
                title: 'Keyboard Shortcuts',
                content: 'Press Space to start/pause, R to reset, S to step. Use mouse wheel to zoom, Alt+Drag to pan.',
                target: null,
                position: 'center'
            },
            {
                title: 'You\'re Ready!',
                content: 'Start exploring graph algorithms. Check the legend for node colors and have fun learning!',
                target: null,
                position: 'center'
            }
        ];

        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
    }

    start() {
        if (this.isActive) return;

        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            animation: fadeIn 0.3s;
        `;

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: white;
            border-radius: 12px;
            padding: 25px;
            max-width: 400px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: fadeIn 0.3s;
        `;

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.tooltip);
    }

    showStep() {
        const step = this.steps[this.currentStep];

        this.tooltip.innerHTML = `
            <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 1.3em;">
                    ${step.title}
                </h3>
                <p style="margin: 0; color: #666; line-height: 1.6; font-size: 1em;">
                    ${step.content}
                </p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <span style="color: #999; font-size: 0.9em;">
                    ${this.currentStep + 1} of ${this.steps.length}
                </span>
                <div>
                    ${this.currentStep > 0 ? '<button class="tutorial-btn tutorial-prev">Previous</button>' : ''}
                    ${this.currentStep < this.steps.length - 1
                        ? '<button class="tutorial-btn tutorial-next">Next</button>'
                        : '<button class="tutorial-btn tutorial-finish">Finish</button>'}
                    <button class="tutorial-btn tutorial-skip">Skip Tour</button>
                </div>
            </div>
        `;

        // Position tooltip
        this.positionTooltip(step);

        // Highlight target element
        if (step.target) {
            const target = document.querySelector(step.target);
            if (target) {
                target.style.position = 'relative';
                target.style.zIndex = '10000';
                target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.5)';
            }
        }

        // Add event listeners
        this.tooltip.querySelector('.tutorial-next')?.addEventListener('click', () => this.next());
        this.tooltip.querySelector('.tutorial-prev')?.addEventListener('click', () => this.previous());
        this.tooltip.querySelector('.tutorial-finish')?.addEventListener('click', () => this.finish());
        this.tooltip.querySelector('.tutorial-skip')?.addEventListener('click', () => this.finish());
    }

    positionTooltip(step) {
        if (!step.target || step.position === 'center') {
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const target = document.querySelector(step.target);
        if (!target) return;

        const rect = target.getBoundingClientRect();

        switch (step.position) {
            case 'top':
                this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
                this.tooltip.style.top = `${rect.top - 20}px`;
                this.tooltip.style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
                this.tooltip.style.top = `${rect.bottom + 20}px`;
                this.tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                this.tooltip.style.left = `${rect.left - 20}px`;
                this.tooltip.style.top = `${rect.top + rect.height / 2}px`;
                this.tooltip.style.transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                this.tooltip.style.left = `${rect.right + 20}px`;
                this.tooltip.style.top = `${rect.top + rect.height / 2}px`;
                this.tooltip.style.transform = 'translateY(-50%)';
                break;
        }
    }

    next() {
        this.clearHighlight();
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep();
        }
    }

    previous() {
        this.clearHighlight();
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    finish() {
        this.clearHighlight();
        this.isActive = false;

        if (this.overlay) {
            this.overlay.style.animation = 'fadeOut 0.3s';
            setTimeout(() => this.overlay.remove(), 300);
        }

        if (this.tooltip) {
            this.tooltip.style.animation = 'fadeOut 0.3s';
            setTimeout(() => this.tooltip.remove(), 300);
        }

        Utils.storage.set('tutorialCompleted', true);
        Utils.showToast('Tutorial completed! Happy exploring!', 'success');
    }

    clearHighlight() {
        const step = this.steps[this.currentStep];
        if (step.target) {
            const target = document.querySelector(step.target);
            if (target) {
                target.style.position = '';
                target.style.zIndex = '';
                target.style.boxShadow = '';
            }
        }
    }
}

// Add tutorial button styles
const tutorialStyles = document.createElement('style');
tutorialStyles.textContent = `
    .tutorial-btn {
        padding: 8px 16px;
        margin-left: 8px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tutorial-next, .tutorial-finish {
        background: #667eea;
        color: white;
    }

    .tutorial-next:hover, .tutorial-finish:hover {
        background: #5568d3;
        transform: translateY(-1px);
    }

    .tutorial-prev {
        background: #e0e0e0;
        color: #333;
    }

    .tutorial-prev:hover {
        background: #d0d0d0;
    }

    .tutorial-skip {
        background: transparent;
        color: #999;
    }

    .tutorial-skip:hover {
        color: #666;
    }
`;
document.head.appendChild(tutorialStyles);
