#Chapter 6.2
#Part 3

import networkx as nx
import matplotlib.pyplot as plt

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def build_tree_from_table():
    """Builds a binary tree from user input in left-child right-child table format."""
    n = int(input("Enter the number of nodes: "))  # Total rows in the table
    node_map = {}  # Dictionary to store nodes

    print("Enter the table in the format: Node Left_Child Right_Child")
    print("(Use 0 for NULL children, space-separated values)")

    edges = []  # Store edges for visualization
    root_value = None  # Identify the root

    for _ in range(n):
        node, left, right = map(int, input().split())

        # Create node if not already created
        if node not in node_map:
            node_map[node] = Node(node)
        if root_value is None:
            root_value = node  # First node is assumed to be root

        # Create left child
        if left != 0:
            if left not in node_map:
                node_map[left] = Node(left)
            node_map[node].left = node_map[left]
            edges.append((node, left))

        # Create right child
        if right != 0:
            if right not in node_map:
                node_map[right] = Node(right)
            node_map[node].right = node_map[right]
            edges.append((node, right))

    return node_map[root_value], edges  # Return root and edges for drawing

def add_edges(graph, root, pos, x=0, y=0, level=1):
    """Recursively add edges to the graph for visualization."""
    if root:
        pos[root.value] = (x, y)
        if root.left:
            graph.add_edge(root.value, root.left.value)
            add_edges(graph, root.left, pos, x - 1 / 2**level, y - 1, level + 1)
        if root.right:
            graph.add_edge(root.value, root.right.value)
            add_edges(graph, root.right, pos, x + 1 / 2**level, y - 1, level + 1)

def draw_tree(root):
    """Draws the binary tree using networkx and matplotlib."""
    graph = nx.DiGraph()
    pos = {}
    add_edges(graph, root, pos)
    plt.figure(figsize=(6, 4))
    nx.draw(graph, pos, with_labels=True, node_size=2000, node_color="lightblue", font_size=10, edge_color="gray")
    plt.show()

# Example Usage:
root, edges = build_tree_from_table()
if root:
    print("\nBinary Tree Constructed! Visualizing...\n")
    draw_tree(root)
else:
    print("No valid tree constructed.")
