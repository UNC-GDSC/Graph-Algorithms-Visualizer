# Graph Algorithm Visualizer - Production Ready

[![Status](https://img.shields.io/badge/status-production-brightgreen)](https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-enabled-purple)](manifest.json)

A comprehensive, production-ready web application for visualizing graph traversal and pathfinding algorithms with real-time interactive controls, dark mode, PWA support, and advanced features.

🔗 **[Live Demo](#)** | 📖 **[Documentation](CONTRIBUTING.md)** | 🐛 **[Report Bug](https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer/issues)**

## ✨ Features

### 🎯 Core Algorithms (7 Implemented)

1. **Breadth-First Search (BFS)** - Level-by-level exploration, guarantees shortest path in unweighted graphs
2. **Depth-First Search (DFS)** - Deep branch exploration with backtracking
3. **Dijkstra's Algorithm** - Optimal shortest path in weighted graphs
4. **A* Algorithm** - Heuristic-guided optimal pathfinding
5. **Bidirectional BFS** - Searches from both start and end simultaneously (faster)
6. **Bellman-Ford Algorithm** - Handles negative weights, detects negative cycles
7. **Greedy Best-First Search** - Heuristic-only search (fast but not always optimal)

### 🎨 Visualization Features

- ✅ **Real-time step-by-step animation** with adjustable speed (1-100)
- ✅ **Multiple visualization modes**: continuous, step-by-step, or pause/resume
- ✅ **Path highlighting** with animated transitions
- ✅ **Color-coded node states**: visiting, visited, path, walls, start, end
- ✅ **Edge weight visualization** for weighted graphs
- ✅ **Performance statistics**: nodes visited, path length, total distance, complexity

### 🛠️ Interactive Controls

- **Zoom & Pan**: Mouse wheel zoom, pinch-to-zoom, pan with Alt+Drag
- **Node Manipulation**:
  - Right-click → Set start node
  - Shift + Right-click → Set end node
  - Ctrl/Cmd + Click → Toggle walls/obstacles
  - Click (custom mode) → Create nodes
- **Undo/Redo**: Full state management with Ctrl+Z/Ctrl+Y
- **Import/Export**: Save and load graphs as JSON or CSV
- **Share**: Generate shareable URLs with compressed graph data
- **Download**: Export visualization as PNG image

### 🎭 Graph Presets (9 Types)

1. **Grid (10x10)** - Regular grid for maze-solving
2. **Random Graph** - Random nodes with probabilistic connections
3. **Weighted Graph** - Pre-built weighted example
4. **Maze** - Grid with random obstacles
5. **Simple Path** - Linear path for testing
6. **Binary Tree** - Balanced tree structure
7. **Diamond Pattern** - Multiple paths with different costs
8. **Star Pattern** - Radial hub-and-spoke layout
9. **Custom** - Build your own graph from scratch

### 🎨 Themes & Appearance

- **3 Built-in Themes**:
  - Light (default)
  - Dark (OLED-friendly)
  - Ocean (blue tones)
- **Theme persistence** via localStorage
- **Smooth transitions** between themes
- **System preference detection** (prefers-color-scheme)

### 📱 Progressive Web App (PWA)

- ✅ **Installable** on mobile and desktop
- ✅ **Offline support** via Service Worker
- ✅ **Fast loading** with caching
- ✅ **App-like experience** with fullscreen mode
- ✅ **Manifest** with icons and shortcuts

### ♿ Accessibility

- **ARIA labels** on all interactive elements
- **Keyboard navigation** with comprehensive shortcuts
- **Focus indicators** for keyboard users
- **Screen reader support**
- **Reduced motion** support for accessibility preferences
- **High contrast** themes available

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Start/Pause visualization |
| `R` | Reset current visualization |
| `S` | Step through algorithm (when paused) |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + S` | Export graph |
| `F` | Toggle fullscreen |
| `T` | Toggle theme |

### 📱 Touch Gestures

- **Pinch** - Zoom in/out
- **Two-finger drag** - Pan canvas
- **Tap** - Select/create nodes
- **Long press** - Set start/end nodes

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No build tools or dependencies required!

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer.git
   cd Graph-Algorithms-Visualizer
   ```

2. **Serve the files** (choose one):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx http-server

   # Using PHP
   php -S localhost:8000

   # Or simply open index.html in your browser
   open index.html  # macOS
   start index.html # Windows
   xdg-open index.html # Linux
   ```

3. **Navigate to** `http://localhost:8000`

### Quick Start Guide

1. **Select an algorithm** from the dropdown (try A* to start)
2. **Choose a graph preset** or create your own
3. **Adjust the speed** slider to your preference
4. **Click Start** or press `Space` to begin visualization
5. **Watch** the algorithm explore and find the shortest path!

## 📚 Usage Guide

### Creating Custom Graphs

1. Select **"Custom"** from the preset dropdown
2. **Click** anywhere on the canvas to create nodes
3. **Right-click** a node to set it as the start node (green)
4. **Shift + Right-click** a node to set it as the end node (red)
5. **Ctrl/Cmd + Click** nodes to toggle walls (black)
6. **Start** the visualization to see your algorithm in action

### Comparing Algorithms

1. Run an algorithm on a graph preset
2. Note the **nodes visited** and **path length**
3. Reset and try a different algorithm
4. Compare performance metrics!

### Sharing Your Work

1. Create an interesting graph
2. Click the **Share** button (🔗)
3. The URL is automatically copied to your clipboard
4. Share with friends or save for later!

### Exporting Graphs

- **JSON format**: Full graph structure with all metadata
- **CSV format**: Nodes and edges in spreadsheet-compatible format
- **PNG image**: Visual snapshot of the current state

## 🏗️ Architecture

### Project Structure

```
Graph-Algorithms-Visualizer/
├── index.html           # Main HTML structure with semantic markup
├── styles.css          # Responsive CSS with theme support
├── graph.js            # Graph data structure & generators
├── algorithms.js       # 7 algorithm implementations
├── visualizer.js       # Canvas rendering engine
├── main.js             # Application controller
├── utils.js            # Utility functions & state management
├── import-export.js    # Graph I/O operations
├── controls.js         # Zoom, pan, touch & tutorial
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker for offline support
├── README.md           # This file
├── CONTRIBUTING.md     # Contribution guidelines
├── LICENSE             # MIT License
└── package.json        # npm metadata
```

### Technology Stack

- **Pure Vanilla JavaScript** (ES6+) - No frameworks, maximum performance
- **HTML5 Canvas** - Hardware-accelerated rendering
- **CSS3 Variables** - Dynamic theming support
- **Service Workers** - Offline-first PWA
- **LocalStorage** - State persistence
- **URL Compression** - Shareable graph links

### Code Organization

#### graph.js
- `Node` class: Individual graph nodes with properties
- `Graph` class: Adjacency list representation
- `GraphGenerator` class: 9 preset generators

#### algorithms.js
- `PriorityQueue` class: Min-heap for Dijkstra/A*
- `Algorithms` class: 7 static algorithm methods
- Generator-based for step-by-step visualization

#### utils.js
- `Utils` class: Helper functions (debounce, storage, toast, etc.)
- `StateManager` class: Undo/redo with 50-state history
- `ThemeManager` class: Multi-theme support

#### import-export.js
- `GraphIO` class: JSON/CSV import/export
- `LZString` class: URL compression
- `GraphTemplates` class: Preset library

#### controls.js
- `ZoomPanController` class: Zoom/pan with touch support
- `TutorialManager` class: Interactive onboarding

## 🎓 Algorithm Details

### Breadth-First Search (BFS)

**Complexity**: Time O(V + E), Space O(V)

Explores nodes level-by-level using a queue. Guarantees the shortest path in unweighted graphs.

**Best for**: Shortest path in unweighted graphs, level-order traversal

### Depth-First Search (DFS)

**Complexity**: Time O(V + E), Space O(V)

Explores as far as possible along each branch using a stack (or recursion).

**Best for**: Detecting cycles, topological sorting, maze solving

### Dijkstra's Algorithm

**Complexity**: Time O((V + E) log V), Space O(V)

Finds shortest path in weighted graphs with non-negative edge weights using a priority queue.

**Best for**: GPS navigation, network routing, shortest paths with costs

### A* Algorithm

**Complexity**: Time O((V + E) log V), Space O(V)

Combines Dijkstra with heuristic (Euclidean distance) for goal-directed search.

**Best for**: Video game pathfinding, robotics, optimal routing

### Bidirectional BFS

**Complexity**: Time O(V + E), Space O(V)

Searches from both start and end simultaneously, often finding paths faster.

**Best for**: Large graphs where start and end are known

### Bellman-Ford Algorithm

**Complexity**: Time O(V × E), Space O(V)

Handles negative edge weights and detects negative cycles.

**Best for**: Currency arbitrage, network routing with costs

### Greedy Best-First Search

**Complexity**: Time O((V + E) log V), Space O(V)

Uses only heuristic for speed, but doesn't guarantee optimal path.

**Best for**: Quick approximate solutions, real-time scenarios

## 🎨 Customization

### Adding New Themes

Edit `utils.js`:

```javascript
this.themes = {
    // ... existing themes
    mytheme: {
        name: 'My Theme',
        colors: {
            background: '#...',
            surface: '#...',
            // ... other colors
        }
    }
}
```

### Adding New Algorithms

1. Add algorithm to `algorithms.js`:
```javascript
static* myAlgorithm(graph) {
    // Implementation using yield for visualization
    yield { type: 'visiting', node: current, ... };
    yield { type: 'found', path: [...], ... };
}
```

2. Register in `getAlgorithm()`:
```javascript
'my-algo': Algorithms.myAlgorithm
```

3. Add to HTML dropdown in `index.html`

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🔧 Development

### Local Development

```bash
# Start local server
npm run start  # or npm run serve

# Open browser to
http://localhost:8000
```

### Code Quality

- **Linting**: All JavaScript is syntax-validated
- **No dependencies**: Pure vanilla JS
- **Browser compatibility**: Tested on major browsers
- **Performance**: Optimized Canvas rendering

## 📊 Performance

- **Graph Size**: Optimized for up to 1000 nodes
- **Rendering**: 60 FPS canvas updates
- **Memory**: Efficient adjacency list
- **Caching**: Service Worker caching for instant loads

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Chrome Android | 90+ | ✅ Full |

## 🐛 Known Issues

- Algorithm comparison mode (coming soon)
- Negative edge weights only work with Bellman-Ford
- Some PWA features require HTTPS in production

## 🗺️ Roadmap

- [ ] Algorithm comparison mode (side-by-side)
- [ ] Floyd-Warshall (all-pairs shortest path)
- [ ] Minimum spanning tree (Prim's, Kruskal's)
- [ ] Animation recording/export
- [ ] More graph layouts (force-directed, circular)
- [ ] Graph analytics (centrality, clustering)
- [ ] Collaborative editing
- [ ] Custom heuristics for A*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 UNC-GDSC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

## 🙏 Acknowledgments

- Inspired by classic algorithm visualizers
- Built with ❤️ using vanilla JavaScript
- Thanks to the open-source community
- Special thanks to UNC-GDSC members and contributors

## 📞 Contact & Support

- **GitHub Issues**: [Create an issue](https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer/issues)
- **GitHub Discussions**: [Join the conversation](https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer/discussions)
- **Repository**: [View on GitHub](https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer)

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

**Built with ❤️ by [UNC-GDSC](https://github.com/UNC-GDSC)**

**Version**: 2.0.0 (Production Ready)
**Last Updated**: November 2024
