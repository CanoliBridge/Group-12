#Chapter 6.2
#Part 2

from collections import deque
import networkx as nx
import matplotlib.pyplot as plt

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
    nodes = {int(values[0]): root}  # Map values to nodes

    while i < len(values):
        current = queue.popleft()

        # Left child
        if values[i] != 'None':
            current.left = Node(int(values[i]))
            nodes[int(values[i])] = current.left
            queue.append(current.left)
        i += 1

        # Right child
        if i < len(values) and values[i] != 'None':
            current.right = Node(int(values[i]))
            nodes[int(values[i])] = current.right
            queue.append(current.right)
        i += 1

    return root, nodes

def generate_child_array(nodes):
    """Generates the left child-right child representation like Figure 6.42a."""
    sorted_keys = sorted(nodes.keys())  # Sort keys for consistent order
    child_array = []

    for key in sorted_keys:
        node = nodes[key]
        left = node.left.value if node.left else 0  # 0 represents NULL
        right = node.right.value if node.right else 0
        child_array.append((key, left, right))

    return child_array

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
root, nodes = build_tree_from_input()
if root:
    draw_tree(root)
    child_array = generate_child_array(nodes)

    print("\nLeft Child - Right Child Array Representation:")
    print(" Node | Left Child | Right Child ")
    print("-------------------------------")
    for row in child_array:
        print(f"  {row[0]:^4} |    {row[1]:^7}  |    {row[2]:^7}  ")
else:
    print("Tree is empty.")

