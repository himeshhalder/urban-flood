"""
Graph Network modeling for Underground Drainage and Road Routing using NetworkX
"""

import networkx as nx
from typing import List, Dict, Any, Tuple

class DrainageNetworkGraph:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, node_type: str, max_capacity: float, elevation: float):
        self.graph.add_node(
            node_id,
            node_type=node_type,
            max_capacity=max_capacity,
            elevation=elevation,
            current_inflow=0.0
        )

    def add_edge(self, from_id: str, to_id: str, pipe_id: str, length: float, diameter: float, capacity: float):
        self.graph.add_edge(
            from_id,
            to_id,
            pipe_id=pipe_id,
            length=length,
            diameter=diameter,
            capacity=capacity,
            current_flow=0.0
        )

    def calculate_downstream_surcharge(self, start_node_id: str, surcharge_volume: float) -> List[str]:
        """
        Traverses downstream paths to identify impacted outfalls and road intersections
        """
        if start_node_id not in self.graph:
            return []
        visited = []
        for successor in nx.bfs_tree(self.graph, start_node_id):
            visited.append(successor)
        return visited

class RoadRoutingGraph:
    def __init__(self):
        self.graph = nx.Graph()

    def add_road_edge(self, u: str, v: str, road_id: str, length_m: float, elevation_m: float, flood_depth_cm: float):
        # Dynamic weight penalizing flood depth
        depth_penalty = (flood_depth_cm / 20.0) ** 2 if flood_depth_cm > 15 else 0.0
        weight = length_m * (1.0 + depth_penalty)
        self.graph.add_edge(u, v, road_id=road_id, length=length_m, weight=weight, flood_depth=flood_depth_cm)

    def find_shortest_safe_path(self, source: str, target: str, max_tolerable_depth_cm: float = 30.0) -> Dict[str, Any]:
        """
        Dijkstra shortest path avoiding impassable road segments
        """
        # Create subgraph excluding flooded roads above threshold
        passable_edges = [
            (u, v) for u, v, d in self.graph.edges(data=True)
            if d.get("flood_depth", 0) <= max_tolerable_depth_cm
        ]
        subgraph = self.graph.edge_subgraph(passable_edges)

        try:
            path = nx.shortest_path(subgraph, source=source, target=target, weight="weight")
            total_dist = sum(self.graph[u][v]["length"] for u, v in zip(path[:-1], path[1:]))
            max_depth = max(self.graph[u][v]["flood_depth"] for u, v in zip(path[:-1], path[1:]))
            return {
                "success": True,
                "path": path,
                "total_distance_km": round(total_dist / 1000.0, 2),
                "max_water_depth_cm": max_depth
            }
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return {
                "success": False,
                "path": [],
                "error": "No completely dry path available. Emergency rerouting via elevated freeways recommended."
            }
