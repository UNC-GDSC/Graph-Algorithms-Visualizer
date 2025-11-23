# Graph Algorithm Visualizer

A production-ready, interactive web application for visualizing graph traversal and pathfinding algorithms in real-time using HTML5 Canvas.

![Graph Algorithm Visualizer](https://img.shields.io/badge/status-production-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### Algorithms Implemented

1. **Breadth-First Search (BFS)**
   - Explores nodes level by level
   - Guarantees shortest path in unweighted graphs
   - Time Complexity: O(V + E)

2. **Depth-First Search (DFS)**
   - Explores as far as possible along each branch
   - Uses stack-based approach
   - Time Complexity: O(V + E)

3. **Dijkstra's Algorithm**
   - Finds shortest path in weighted graphs
   - Uses priority queue for optimal performance
   - Time Complexity: O((V + E) log V)

4. **A* Algorithm**
   - Combines Dijkstra with heuristic search
   - Uses Euclidean distance heuristic
   - Optimal and efficient pathfinding
   - Time Complexity: O((V + E) log V)

### Visualization Features

- **Real-time Animation**: Watch algorithms execute step-by-step
- **Variable Speed Control**: Adjust visualization speed from slow to fast
- **Step-by-Step Mode**: Advance one iteration at a time for detailed analysis
- **Multiple Graph Presets**:
  - Grid (10x10)
  - Random Graph
  - Weighted Graph
  - Maze-like Structure
  - Custom (user-created)

### Interactive Controls

- **Node Manipulation**:
  - Right-click to set start node
  - Shift + Right-click to set end node
  - Ctrl/Cmd + Click to toggle walls/obstacles
  - Custom mode for creating graphs from scratch

- **Keyboard Shortcuts**:
  - `Space` - Start/Pause visualization
  - `R` - Reset current visualization
  - `S` - Step through algorithm (when not running)

### Production Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **High DPI Support**: Crisp rendering on retina displays
- **Error Handling**: Graceful handling of edge cases
- **Performance Optimized**: Efficient rendering with Canvas API
- **Accessible UI**: Clear visual feedback and status updates
- **Cross-browser Compatible**: Works on all modern browsers

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required!

### Installation

1. Clone the repository:
```bash
git clone https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer.git
cd Graph-Algorithms-Visualizer
```

2. Open `index.html` in your web browser:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Or simply open the file
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

3. Navigate to `http://localhost:8000` in your browser

## Usage Guide

### Basic Usage

1. **Select an Algorithm**: Choose from BFS, DFS, Dijkstra, or A* in the dropdown
2. **Choose a Preset**: Select a graph preset or create your own
3. **Adjust Speed**: Use the slider to control visualization speed
4. **Start Visualization**: Click "Start" or press `Space`
5. **Observe**: Watch the algorithm explore the graph and find the path

### Creating Custom Graphs

1. Select "Custom" from the preset dropdown
2. Click anywhere on the canvas to create nodes
3. Right-click a node to set it as the start node
4. Shift + Right-click a node to set it as the end node
5. Ctrl/Cmd + Click to add walls
6. Start the visualization

### Understanding the Visualization

#### Color Legend

- **Green**: Start node
- **Red**: End node
- **Blue**: Currently visiting node
- **Light Blue**: Visited nodes
- **Gold/Yellow**: Final path
- **Dark Gray**: Walls/obstacles
- **Light Gray**: Unvisited nodes

#### Statistics Panel

- **Nodes Visited**: Total number of nodes explored
- **Path Length**: Number of nodes in the final path
- **Status**: Current state of the visualization

## Architecture

### File Structure

```
Graph-Algorithms-Visualizer/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── graph.js           # Graph data structure and generators
├── algorithms.js      # Algorithm implementations
├── visualizer.js      # Canvas rendering and visualization
├── main.js            # Application controller and UI
└── README.md          # Documentation
```

### Code Organization

#### graph.js
- `Node` class: Represents graph nodes
- `Graph` class: Graph data structure with adjacency list
- `GraphGenerator` class: Preset graph creation utilities

#### algorithms.js
- `PriorityQueue` class: Min-heap for Dijkstra and A*
- `Algorithms` class: Static methods for each algorithm
- Generator-based implementation for step-by-step execution

#### visualizer.js
- `Visualizer` class: Canvas rendering and drawing
- High DPI support
- Path animation and highlighting

#### main.js
- `App` class: Main application controller
- Event handling and user interactions
- Animation loop management

## Algorithm Details

### Breadth-First Search (BFS)

BFS explores all vertices at the present depth before moving to vertices at the next depth level.

**Use Cases**:
- Finding shortest path in unweighted graphs
- Level-order traversal
- Web crawling

**Characteristics**:
- Uses queue data structure
- Guarantees shortest path in unweighted graphs
- Explores nodes in order of distance from start

### Depth-First Search (DFS)

DFS explores as far as possible along each branch before backtracking.

**Use Cases**:
- Detecting cycles in graphs
- Topological sorting
- Maze solving

**Characteristics**:
- Uses stack data structure (or recursion)
- Does not guarantee shortest path
- Memory efficient for deep graphs

### Dijkstra's Algorithm

Dijkstra's algorithm finds the shortest path in weighted graphs with non-negative edge weights.

**Use Cases**:
- GPS navigation systems
- Network routing protocols
- Social network analysis

**Characteristics**:
- Uses priority queue (min-heap)
- Guarantees shortest path in weighted graphs
- Greedy algorithm approach

### A* Algorithm

A* combines Dijkstra's algorithm with heuristic search for optimal pathfinding.

**Use Cases**:
- Video game pathfinding
- Robotics navigation
- Map applications

**Characteristics**:
- Uses f(n) = g(n) + h(n) scoring
- Heuristic-guided search
- Optimal and efficient when heuristic is admissible

## Performance Considerations

- **Graph Size**: Optimized for graphs with up to 1000 nodes
- **Rendering**: Uses requestAnimationFrame for smooth animations
- **Memory**: Efficient adjacency list representation
- **Responsiveness**: Debounced resize handling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 UNC-GDSC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Acknowledgments

- Inspired by classic graph algorithm visualizations
- Built with vanilla JavaScript and HTML5 Canvas
- No external dependencies for maximum portability

## Future Enhancements

Potential features for future releases:

- [ ] Bidirectional BFS
- [ ] Bellman-Ford algorithm
- [ ] Floyd-Warshall algorithm
- [ ] Minimum spanning tree (Prim's, Kruskal's)
- [ ] Graph export/import functionality
- [ ] Animation recording
- [ ] Dark mode
- [ ] Touch gesture support for mobile
- [ ] Algorithm comparison mode

## Contact

For questions, suggestions, or issues:
- GitHub Issues: [Create an issue](https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer/issues)
- Repository: [Graph-Algorithms-Visualizer](https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer)

---

**Built with ❤️ by UNC-GDSC**
