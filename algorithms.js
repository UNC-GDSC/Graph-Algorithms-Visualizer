/**
 * Graph Algorithm Implementations
 * Each algorithm returns a generator that yields steps for visualization
 */

class PriorityQueue {
    constructor(compareFn) {
        this.items = [];
        this.compareFn = compareFn || ((a, b) => a - b);
    }

    enqueue(item) {
        this.items.push(item);
        this.items.sort(this.compareFn);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }
}

class Algorithms {
    /**
     * Breadth-First Search (BFS)
     * Explores nodes level by level
     */
    static* bfs(graph) {
        if (!graph.startNode || !graph.endNode) {
            yield { type: 'error', message: 'Start and end nodes must be set' };
            return;
        }

        graph.reset();
        const queue = [graph.startNode];
        const visited = new Set();
        visited.add(graph.startNode);
        graph.startNode.distance = 0;

        let nodesVisited = 0;

        while (queue.length > 0) {
            const current = queue.shift();
            current.visiting = true;
            nodesVisited++;

            yield {
                type: 'visiting',
                node: current,
                nodesVisited,
                queue: [...queue]
            };

            // Found the end node
            if (current === graph.endNode) {
                current.visited = true;
                const path = Algorithms.reconstructPath(graph.endNode);
                yield {
                    type: 'found',
                    path,
                    nodesVisited,
                    pathLength: path.length
                };
                return;
            }

            current.visited = true;
            current.visiting = false;

            // Explore neighbors
            for (const { node: neighbor } of current.neighbors) {
                if (!visited.has(neighbor) && !neighbor.isWall()) {
                    visited.add(neighbor);
                    neighbor.parent = current;
                    neighbor.distance = current.distance + 1;
                    queue.push(neighbor);

                    yield {
                        type: 'enqueue',
                        node: neighbor,
                        from: current,
                        nodesVisited
                    };
                }
            }
        }

        // No path found
        yield {
            type: 'not_found',
            nodesVisited,
            message: 'No path exists between start and end nodes'
        };
    }

    /**
     * Depth-First Search (DFS)
     * Explores as far as possible along each branch
     */
    static* dfs(graph) {
        if (!graph.startNode || !graph.endNode) {
            yield { type: 'error', message: 'Start and end nodes must be set' };
            return;
        }

        graph.reset();
        const stack = [graph.startNode];
        const visited = new Set();
        let nodesVisited = 0;

        while (stack.length > 0) {
            const current = stack.pop();

            if (visited.has(current)) {
                continue;
            }

            visited.add(current);
            current.visiting = true;
            nodesVisited++;

            yield {
                type: 'visiting',
                node: current,
                nodesVisited,
                stack: [...stack]
            };

            // Found the end node
            if (current === graph.endNode) {
                current.visited = true;
                const path = Algorithms.reconstructPath(graph.endNode);
                yield {
                    type: 'found',
                    path,
                    nodesVisited,
                    pathLength: path.length
                };
                return;
            }

            current.visited = true;
            current.visiting = false;

            // Explore neighbors (in reverse to maintain left-to-right order)
            const neighbors = [...current.neighbors].reverse();
            for (const { node: neighbor } of neighbors) {
                if (!visited.has(neighbor) && !neighbor.isWall()) {
                    neighbor.parent = current;
                    stack.push(neighbor);

                    yield {
                        type: 'push',
                        node: neighbor,
                        from: current,
                        nodesVisited
                    };
                }
            }
        }

        // No path found
        yield {
            type: 'not_found',
            nodesVisited,
            message: 'No path exists between start and end nodes'
        };
    }

    /**
     * Dijkstra's Algorithm
     * Finds shortest path in weighted graphs
     */
    static* dijkstra(graph) {
        if (!graph.startNode || !graph.endNode) {
            yield { type: 'error', message: 'Start and end nodes must be set' };
            return;
        }

        graph.reset();
        const unvisited = new PriorityQueue((a, b) => a.distance - b.distance);
        const visited = new Set();

        graph.startNode.distance = 0;
        unvisited.enqueue(graph.startNode);

        let nodesVisited = 0;

        while (!unvisited.isEmpty()) {
            const current = unvisited.dequeue();

            if (visited.has(current)) {
                continue;
            }

            visited.add(current);
            current.visiting = true;
            nodesVisited++;

            yield {
                type: 'visiting',
                node: current,
                nodesVisited,
                distance: current.distance
            };

            // Found the end node
            if (current === graph.endNode) {
                current.visited = true;
                const path = Algorithms.reconstructPath(graph.endNode);
                yield {
                    type: 'found',
                    path,
                    nodesVisited,
                    pathLength: path.length,
                    totalDistance: current.distance
                };
                return;
            }

            current.visited = true;
            current.visiting = false;

            // Update distances to neighbors
            for (const { node: neighbor, weight } of current.neighbors) {
                if (!visited.has(neighbor) && !neighbor.isWall()) {
                    const newDistance = current.distance + weight;

                    if (newDistance < neighbor.distance) {
                        neighbor.distance = newDistance;
                        neighbor.parent = current;
                        unvisited.enqueue(neighbor);

                        yield {
                            type: 'update_distance',
                            node: neighbor,
                            from: current,
                            distance: newDistance,
                            nodesVisited
                        };
                    }
                }
            }
        }

        // No path found
        yield {
            type: 'not_found',
            nodesVisited,
            message: 'No path exists between start and end nodes'
        };
    }

    /**
     * A* Algorithm
     * Finds shortest path using heuristic
     */
    static* aStar(graph) {
        if (!graph.startNode || !graph.endNode) {
            yield { type: 'error', message: 'Start and end nodes must be set' };
            return;
        }

        graph.reset();
        const openSet = new PriorityQueue((a, b) => a.fScore - b.fScore);
        const closedSet = new Set();

        graph.startNode.distance = 0;
        graph.startNode.heuristic = graph.getDistance(graph.startNode, graph.endNode);
        graph.startNode.fScore = graph.startNode.heuristic;
        openSet.enqueue(graph.startNode);

        let nodesVisited = 0;

        while (!openSet.isEmpty()) {
            const current = openSet.dequeue();

            if (closedSet.has(current)) {
                continue;
            }

            closedSet.add(current);
            current.visiting = true;
            nodesVisited++;

            yield {
                type: 'visiting',
                node: current,
                nodesVisited,
                gScore: current.distance,
                hScore: current.heuristic,
                fScore: current.fScore
            };

            // Found the end node
            if (current === graph.endNode) {
                current.visited = true;
                const path = Algorithms.reconstructPath(graph.endNode);
                yield {
                    type: 'found',
                    path,
                    nodesVisited,
                    pathLength: path.length,
                    totalDistance: current.distance
                };
                return;
            }

            current.visited = true;
            current.visiting = false;

            // Explore neighbors
            for (const { node: neighbor, weight } of current.neighbors) {
                if (closedSet.has(neighbor) || neighbor.isWall()) {
                    continue;
                }

                const tentativeGScore = current.distance + weight;

                if (tentativeGScore < neighbor.distance) {
                    neighbor.parent = current;
                    neighbor.distance = tentativeGScore;
                    neighbor.heuristic = graph.getDistance(neighbor, graph.endNode);
                    neighbor.fScore = neighbor.distance + neighbor.heuristic;
                    openSet.enqueue(neighbor);

                    yield {
                        type: 'update_score',
                        node: neighbor,
                        from: current,
                        gScore: neighbor.distance,
                        hScore: neighbor.heuristic,
                        fScore: neighbor.fScore,
                        nodesVisited
                    };
                }
            }
        }

        // No path found
        yield {
            type: 'not_found',
            nodesVisited,
            message: 'No path exists between start and end nodes'
        };
    }

    /**
     * Reconstruct path from end node to start node
     */
    static reconstructPath(endNode) {
        const path = [];
        let current = endNode;

        while (current !== null) {
            path.unshift(current);
            current = current.parent;
        }

        return path;
    }

    /**
     * Get algorithm by name
     */
    static getAlgorithm(name) {
        const algorithms = {
            'bfs': Algorithms.bfs,
            'dfs': Algorithms.dfs,
            'dijkstra': Algorithms.dijkstra,
            'astar': Algorithms.aStar
        };

        return algorithms[name] || null;
    }

    /**
     * Get algorithm description
     */
    static getDescription(name) {
        const descriptions = {
            'bfs': 'Breadth-First Search explores nodes level by level, guaranteeing the shortest path in unweighted graphs.',
            'dfs': 'Depth-First Search explores as far as possible along each branch before backtracking.',
            'dijkstra': 'Dijkstra\'s Algorithm finds the shortest path in weighted graphs using a greedy approach.',
            'astar': 'A* Algorithm uses heuristics to efficiently find the shortest path, combining Dijkstra with goal-directed search.'
        };

        return descriptions[name] || 'Unknown algorithm';
    }
}
