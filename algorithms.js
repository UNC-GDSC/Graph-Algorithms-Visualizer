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
     * Bidirectional BFS
     * Searches from both start and end simultaneously
     */
    static* bidirectionalBFS(graph) {
        if (!graph.startNode || !graph.endNode) {
            yield { type: 'error', message: 'Start and end nodes must be set' };
            return;
        }

        graph.reset();

        const queueStart = [graph.startNode];
        const queueEnd = [graph.endNode];
        const visitedStart = new Map([[graph.startNode, null]]);
        const visitedEnd = new Map([[graph.endNode, null]]);

        let nodesVisited = 0;
        let meetingPoint = null;

        while (queueStart.length > 0 || queueEnd.length > 0) {
            // Search from start
            if (queueStart.length > 0) {
                const current = queueStart.shift();
                current.visiting = true;
                nodesVisited++;

                yield {
                    type: 'visiting',
                    node: current,
                    direction: 'forward',
                    nodesVisited
                };

                for (const { node: neighbor } of current.neighbors) {
                    if (!neighbor.isWall()) {
                        if (visitedEnd.has(neighbor)) {
                            meetingPoint = neighbor;
                            const path = Algorithms.reconstructBidirectionalPath(
                                current, neighbor, visitedStart, visitedEnd
                            );
                            yield {
                                type: 'found',
                                path,
                                nodesVisited,
                                pathLength: path.length,
                                meetingPoint: neighbor
                            };
                            return;
                        }

                        if (!visitedStart.has(neighbor)) {
                            visitedStart.set(neighbor, current);
                            queueStart.push(neighbor);
                        }
                    }
                }

                current.visited = true;
                current.visiting = false;
            }

            // Search from end
            if (queueEnd.length > 0) {
                const current = queueEnd.shift();
                current.visiting = true;
                nodesVisited++;

                yield {
                    type: 'visiting',
                    node: current,
                    direction: 'backward',
                    nodesVisited
                };

                for (const { node: neighbor } of current.neighbors) {
                    if (!neighbor.isWall()) {
                        if (visitedStart.has(neighbor)) {
                            meetingPoint = neighbor;
                            const path = Algorithms.reconstructBidirectionalPath(
                                neighbor, current, visitedStart, visitedEnd
                            );
                            yield {
                                type: 'found',
                                path,
                                nodesVisited,
                                pathLength: path.length,
                                meetingPoint: neighbor
                            };
                            return;
                        }

                        if (!visitedEnd.has(neighbor)) {
                            visitedEnd.set(neighbor, current);
                            queueEnd.push(neighbor);
                        }
                    }
                }

                current.visited = true;
                current.visiting = false;
            }
        }

        yield {
            type: 'not_found',
            nodesVisited,
            message: 'No path exists between start and end nodes'
        };
    }

    /**
     * Bellman-Ford Algorithm
     * Handles negative weights and detects negative cycles
     */
    static* bellmanFord(graph) {
        if (!graph.startNode || !graph.endNode) {
            yield { type: 'error', message: 'Start and end nodes must be set' };
            return;
        }

        graph.reset();
        graph.startNode.distance = 0;

        const nodes = Array.from(graph.nodes.values());
        const edges = graph.edges.filter(e => !e.from.isWall() && !e.to.isWall());
        let nodesVisited = 0;

        // Relax edges V-1 times
        for (let i = 0; i < nodes.length - 1; i++) {
            let updated = false;

            for (const edge of edges) {
                const { from, to, weight } = edge;

                if (from.distance !== Infinity && from.distance + weight < to.distance) {
                    to.distance = from.distance + weight;
                    to.parent = from;
                    to.visiting = true;
                    updated = true;
                    nodesVisited++;

                    yield {
                        type: 'relaxing',
                        edge,
                        from,
                        to,
                        newDistance: to.distance,
                        iteration: i + 1,
                        nodesVisited
                    };

                    to.visited = true;
                    to.visiting = false;
                }
            }

            if (!updated) break;
        }

        // Check for negative cycles
        for (const edge of edges) {
            const { from, to, weight } = edge;
            if (from.distance !== Infinity && from.distance + weight < to.distance) {
                yield {
                    type: 'error',
                    message: 'Graph contains negative weight cycle',
                    nodesVisited
                };
                return;
            }
        }

        if (graph.endNode.distance === Infinity) {
            yield {
                type: 'not_found',
                nodesVisited,
                message: 'No path exists between start and end nodes'
            };
        } else {
            const path = Algorithms.reconstructPath(graph.endNode);
            yield {
                type: 'found',
                path,
                nodesVisited,
                pathLength: path.length,
                totalDistance: graph.endNode.distance
            };
        }
    }

    /**
     * Greedy Best-First Search
     * Uses only heuristic (faster but not optimal)
     */
    static* greedyBestFirst(graph) {
        if (!graph.startNode || !graph.endNode) {
            yield { type: 'error', message: 'Start and end nodes must be set' };
            return;
        }

        graph.reset();
        const openSet = new PriorityQueue((a, b) => a.heuristic - b.heuristic);
        const closedSet = new Set();

        graph.startNode.heuristic = graph.getDistance(graph.startNode, graph.endNode);
        openSet.enqueue(graph.startNode);

        let nodesVisited = 0;

        while (!openSet.isEmpty()) {
            const current = openSet.dequeue();

            if (closedSet.has(current)) continue;

            closedSet.add(current);
            current.visiting = true;
            nodesVisited++;

            yield {
                type: 'visiting',
                node: current,
                nodesVisited,
                heuristic: current.heuristic
            };

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

            for (const { node: neighbor } of current.neighbors) {
                if (!closedSet.has(neighbor) && !neighbor.isWall()) {
                    if (!neighbor.parent) {
                        neighbor.parent = current;
                        neighbor.heuristic = graph.getDistance(neighbor, graph.endNode);
                        openSet.enqueue(neighbor);

                        yield {
                            type: 'enqueue',
                            node: neighbor,
                            from: current,
                            heuristic: neighbor.heuristic,
                            nodesVisited
                        };
                    }
                }
            }
        }

        yield {
            type: 'not_found',
            nodesVisited,
            message: 'No path exists between start and end nodes'
        };
    }

    /**
     * Reconstruct bidirectional path
     */
    static reconstructBidirectionalPath(meetingFromStart, meetingFromEnd, visitedStart, visitedEnd) {
        const pathStart = [];
        let current = meetingFromStart;

        while (current !== null) {
            pathStart.unshift(current);
            current = visitedStart.get(current);
        }

        const pathEnd = [];
        current = visitedEnd.get(meetingFromEnd);

        while (current !== null) {
            pathEnd.push(current);
            current = visitedEnd.get(current);
        }

        return [...pathStart, ...pathEnd];
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
            'astar': Algorithms.aStar,
            'bidirectional': Algorithms.bidirectionalBFS,
            'bellman-ford': Algorithms.bellmanFord,
            'greedy': Algorithms.greedyBestFirst
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
            'astar': 'A* Algorithm uses heuristics to efficiently find the shortest path, combining Dijkstra with goal-directed search.',
            'bidirectional': 'Bidirectional BFS searches from both start and end simultaneously, often faster than regular BFS.',
            'bellman-ford': 'Bellman-Ford handles negative weights and detects negative cycles, slower but more versatile than Dijkstra.',
            'greedy': 'Greedy Best-First Search uses only heuristic for speed, but doesn\'t guarantee the shortest path.'
        };

        return descriptions[name] || 'Unknown algorithm';
    }

    /**
     * Get algorithm complexity
     */
    static getComplexity(name) {
        const complexities = {
            'bfs': { time: 'O(V + E)', space: 'O(V)' },
            'dfs': { time: 'O(V + E)', space: 'O(V)' },
            'dijkstra': { time: 'O((V + E) log V)', space: 'O(V)' },
            'astar': { time: 'O((V + E) log V)', space: 'O(V)' },
            'bidirectional': { time: 'O(V + E)', space: 'O(V)' },
            'bellman-ford': { time: 'O(V × E)', space: 'O(V)' },
            'greedy': { time: 'O((V + E) log V)', space: 'O(V)' }
        };

        return complexities[name] || { time: 'Unknown', space: 'Unknown' };
    }
}
