#Chapter 6.2 
#Part 1
import networkx as nx
import matplotlib.pyplot as plt

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def add_edges(graph, root, pos, x=0, y=0, level=1):
    """Recursively add edges to the graph."""
    if root:
        pos[root.value] = (x, y)
        if root.left:
            graph.add_edge(root.value, root.left.value)
            add_edges(graph, root.left, pos, x - 1 / 2**level, y - 1, level + 1)
        if root.right:
            graph.add_edge(root.value, root.right.value)
            add_edges(graph, root.right, pos, x + 1 / 2**level, y - 1, level + 1)

def draw_tree(root):
    """Draws a binary tree using networkx and matplotlib."""
    graph = nx.DiGraph()
    pos = {}
    add_edges(graph, root, pos)
    plt.figure(figsize=(6, 4))
    nx.draw(graph, pos, with_labels=True, node_size=2000, node_color="lightblue", font_size=10, edge_color="gray")
    plt.show()

# Define the tree:
root = Node(1)
root.left = Node(2)
root.right = Node(3)
root.left.left = Node(4)
root.left.right = Node(5)
root.right.right = Node(6)

# Draw the tree:
draw_tree(root)

from collections import deque


class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def build_tree_from_input():
    """Builds a binary tree from level-order user input."""
    values = input("Enter node values in level order (use 'None' for empty nodes, space-separated): ").split()
    
    if not values or values[0] == 'None':
        return None
    
    root = Node(int(values[0]))
    queue = deque([root])
    i = 1

    while i < len(values):
        current = queue.popleft()

        # Left child
        if values[i] != 'None':
            current.left = Node(int(values[i]))
            queue.append(current.left)
        i += 1

        # Right child
        if i < len(values) and values[i] != 'None':
            current.right = Node(int(values[i]))
            queue.append(current.right)
        i += 1

    return root

def add_edges(graph, root, pos, x=0, y=0, level=1):
    """Recursively add edges to the graph."""
    if root:
        pos[root.value] = (x, y)
        if root.left:
            graph.add_edge(root.value, root.left.value)
            add_edges(graph, root.left, pos, x - 1 / 2**level, y - 1, level + 1)
        if root.right:
            graph.add_edge(root.value, root.right.value)
            add_edges(graph, root.right, pos, x + 1 / 2**level, y - 1, level + 1)

def draw_tree(root):
    """Draws a binary tree using networkx and matplotlib."""
    graph = nx.DiGraph()
    pos = {}
    add_edges(graph, root, pos)
    plt.figure(figsize=(6, 4))
    nx.draw(graph, pos, with_labels=True, node_size=2000, node_color="lightblue", font_size=10, edge_color="gray")
    plt.show()

# Example Usage:
root = build_tree_from_input()
if root:
    draw_tree(root)
else:
    print("Tree is empty.")

