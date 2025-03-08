#Chapter 6.2
#Part 4
from collections import deque
import networkx as nx
import matplotlib.pyplot as plt

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

# 1. LEVEL ORDER INPUT METHOD
def build_tree_from_input():
    """Builds a binary tree from level-order user input."""
    values = input("Enter node values in level order (use 'None' for empty nodes, space-separated): ").split()
    
    if not values or values[0] == 'None':
        return None, {}

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

# 2. LEFT-CHILD RIGHT-CHILD TABLE METHOD
def build_tree_from_table():
    """Builds a binary tree from left-child right-child table."""
    n = int(input("Enter the number of nodes: "))  
    node_map = {}  
    edges = []  
    root_value = None  

    print("Enter the table in the format: Node Left_Child Right_Child (Use 0 for NULL)")

    for _ in range(n):
        node, left, right = map(int, input().split())
        if node not in node_map:
            node_map[node] = Node(node)
        if root_value is None:
            root_value = node  

        if left != 0:
            if left not in node_map:
                node_map[left] = Node(left)
            node_map[node].left = node_map[left]
            edges.append((node, left))

        if right != 0:
            if right not in node_map:
                node_map[right] = Node(right)
            node_map[node].right = node_map[right]
            edges.append((node, right))

    return node_map[root_value], node_map

# 3. BUILD TREE FROM PREORDER & INORDER
def build_tree_from_pre_in(preorder, inorder):
    if not preorder or not inorder:
        return None

    root_value = preorder.pop(0)
    root = Node(root_value)
    index = inorder.index(root_value)

    root.left = build_tree_from_pre_in(preorder, inorder[:index])
    root.right = build_tree_from_pre_in(preorder, inorder[index+1:])
    return root

# 4. BUILD TREE FROM POSTORDER & INORDER
def build_tree_from_post_in(postorder, inorder):
    if not postorder or not inorder:
        return None

    root_value = postorder.pop()
    root = Node(root_value)
    index = inorder.index(root_value)

    root.right = build_tree_from_post_in(postorder, inorder[index+1:])
    root.left = build_tree_from_post_in(postorder, inorder[:index])
    return root

# 5. TREE TRAVERSALS
def preorder_traversal(root):
    return [root.value] + preorder_traversal(root.left) + preorder_traversal(root.right) if root else []

def inorder_traversal(root):
    return inorder_traversal(root.left) + [root.value] + inorder_traversal(root.right) if root else []

def postorder_traversal(root):
    return postorder_traversal(root.left) + postorder_traversal(root.right) + [root.value] if root else []

# 6. GENERATE LEFT-CHILD RIGHT-CHILD TABLE
def generate_child_array(nodes):
    """Generates the left child-right child representation."""
    sorted_keys = sorted(nodes.keys())
    child_array = []

    for key in sorted_keys:
        node = nodes[key]
        left = node.left.value if node.left else 0  # 0 represents NULL
        right = node.right.value if node.right else 0
        child_array.append((key, left, right))

    return child_array

# 7. DRAW TREE
def add_edges(graph, root, pos, x=0, y=0, level=1):
    """Recursively add edges for visualization."""
    if root:
        pos[root.value] = (x, y)
        if root.left:
            graph.add_edge(root.value, root.left.value)
            add_edges(graph, root.left, pos, x - 1 / 2**level, y - 1, level + 1)
        if root.right:
            graph.add_edge(root.value, root.right.value)
            add_edges(graph, root.right, pos, x + 1 / 2**level, y - 1, level + 1)

def draw_tree(root):
    """Draws the binary tree."""
    graph = nx.DiGraph()
    pos = {}
    add_edges(graph, root, pos)
    plt.figure(figsize=(6, 4))
    nx.draw(graph, pos, with_labels=True, node_size=2000, node_color="lightblue", font_size=10, edge_color="gray")
    plt.show()

# 8. MAIN PROGRAM
def main():
    print("Choose Input Method:")
    print("1. Level-Order Input")
    print("2. Left-Child Right-Child Table")
    print("3. Preorder & Inorder")
    print("4. Postorder & Inorder")
    
    choice = int(input("Enter choice (1/2/3/4): "))

    if choice == 1:
        root, nodes = build_tree_from_input()
    elif choice == 2:
        root, nodes = build_tree_from_table()
    elif choice == 3:
        preorder = list(map(int, input("Enter Preorder Traversal: ").split()))
        inorder = list(map(int, input("Enter Inorder Traversal: ").split()))
        root = build_tree_from_pre_in(preorder, inorder)
        nodes = {}  # Traversal methods don't track child nodes
    elif choice == 4:
        postorder = list(map(int, input("Enter Postorder Traversal: ").split()))
        inorder = list(map(int, input("Enter Inorder Traversal: ").split()))
        root = build_tree_from_post_in(postorder, inorder)
        nodes = {}  # Traversal methods don't track child nodes
    else:
        print("Invalid choice.")
        return

    if root:
        print("\nBinary Tree Constructed! Visualizing...\n")
        draw_tree(root)

        print("Preorder Traversal:", preorder_traversal(root))
        print("Inorder Traversal:", inorder_traversal(root))
        print("Postorder Traversal:", postorder_traversal(root))

        if nodes:
            child_array = generate_child_array(nodes)
            print("\nLeft Child - Right Child Array Representation:")
            print(" Node | Left Child | Right Child ")
            print("-------------------------------")
            for row in child_array:
                print(f"  {row[0]:^4} |    {row[1]:^7}  |    {row[2]:^7}  ")
    else:
        print("Tree is empty.")

if __name__ == "__main__":
    main()
