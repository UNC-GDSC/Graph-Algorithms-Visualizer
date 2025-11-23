# Contributing to Graph Algorithm Visualizer

Thank you for your interest in contributing to the Graph Algorithm Visualizer! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title**: Describe the bug in a few words
2. **Description**: Provide detailed information about the bug
3. **Steps to reproduce**: List the steps to reproduce the behavior
4. **Expected behavior**: Describe what you expected to happen
5. **Screenshots**: If applicable, add screenshots
6. **Environment**: Browser version, OS, screen size, etc.

### Suggesting Features

Feature requests are welcome! Please create an issue with:

1. **Clear title**: Describe the feature
2. **Use case**: Explain why this feature would be useful
3. **Proposed solution**: Describe how you envision it working
4. **Alternatives**: List alternative solutions you've considered

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/UNC-GDSC/Graph-Algorithms-Visualizer.git
   cd Graph-Algorithms-Visualizer
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Keep functions small and focused
   - Ensure cross-browser compatibility

4. **Test your changes**
   - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
   - Test on different screen sizes
   - Verify all algorithms still work correctly
   - Check console for errors

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

   Use conventional commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes
   - `Style:` for formatting changes

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Provide a clear description of changes
   - Reference any related issues

## Development Guidelines

### Code Style

- **Indentation**: Use 4 spaces (no tabs)
- **Naming**: Use camelCase for variables and functions, PascalCase for classes
- **Comments**: Add JSDoc comments for functions and classes
- **Line length**: Keep lines under 100 characters when possible

### JavaScript Guidelines

```javascript
/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 */
function exampleFunction(paramName) {
    // Implementation
}
```

### Adding New Algorithms

To add a new algorithm:

1. **Add generator function in `algorithms.js`**:
   ```javascript
   static* yourAlgorithm(graph) {
       // Initialize
       graph.reset();

       // Algorithm logic with yields for visualization
       yield { type: 'visiting', node: current, ... };

       // Return result
       yield { type: 'found', path: [...], ... };
   }
   ```

2. **Register in `Algorithms.getAlgorithm()`**:
   ```javascript
   const algorithms = {
       // ...existing algorithms
       'your-algo': Algorithms.yourAlgorithm
   };
   ```

3. **Add to HTML dropdown** in `index.html`:
   ```html
   <option value="your-algo">Your Algorithm Name</option>
   ```

4. **Add description** in `Algorithms.getDescription()`:
   ```javascript
   'your-algo': 'Description of your algorithm'
   ```

5. **Update documentation** in README.md

### Adding New Graph Presets

To add a new graph preset:

1. **Create generator in `graph.js`**:
   ```javascript
   static createYourPreset(width, height, offsetX, offsetY) {
       const graph = new Graph();
       // Create nodes and edges
       return graph;
   }
   ```

2. **Add to preset switch** in `main.js`:
   ```javascript
   case 'your-preset':
       this.graph = GraphGenerator.createYourPreset(...);
       break;
   ```

3. **Add to HTML dropdown** in `index.html`:
   ```html
   <option value="your-preset">Your Preset Name</option>
   ```

### Testing Checklist

Before submitting a pull request:

- [ ] Code runs without errors
- [ ] All algorithms work correctly
- [ ] UI is responsive on mobile and desktop
- [ ] No console errors or warnings
- [ ] Code follows style guidelines
- [ ] Comments are clear and helpful
- [ ] Documentation is updated
- [ ] Git history is clean (squash if needed)

## Project Structure

```
Graph-Algorithms-Visualizer/
├── index.html          # Main HTML structure
├── styles.css          # All styling
├── graph.js           # Graph data structure
│   ├── Node class
│   ├── Graph class
│   └── GraphGenerator class
├── algorithms.js      # Algorithm implementations
│   ├── PriorityQueue class
│   └── Algorithms class (BFS, DFS, Dijkstra, A*)
├── visualizer.js      # Canvas rendering
│   └── Visualizer class
└── main.js            # Application controller
    └── App class
```

## Performance Considerations

- Avoid blocking the main thread
- Use generators for step-by-step execution
- Minimize DOM manipulations
- Use Canvas for efficient rendering
- Profile before optimizing

## Questions?

If you have questions about contributing:

1. Check existing issues and pull requests
2. Review the README.md documentation
3. Create a new issue with your question

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Future CONTRIBUTORS.md file
- Project documentation

Thank you for contributing to Graph Algorithm Visualizer! 🎉
