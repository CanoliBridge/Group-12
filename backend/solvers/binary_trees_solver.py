'''----------------- 
# Title: binary_trees_solver.py
# Author: Michael Lowder
# Date: 3/14/2025
# Description: A solver for generating binary trees
-----------------'''

from collections import deque
import re
import networkx as nx
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import json

class Node:
    """Node class for binary tree representation"""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def get_height(root):
    """Returns the height (max depth) of the tree."""
    if not root:
        return 0
    return 1 + max(get_height(root.left), get_height(root.right))

def count_nodes(root):
    """Returns total number of nodes."""
    if not root:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)

def count_leaves(root):
    """Returns number of leaf nodes."""
    if not root:
        return 0
    if not root.left and not root.right:
        return 1
    return count_leaves(root.left) + count_leaves(root.right)

def is_full_tree(root):
    """Checks if the tree is a full binary tree (0 or 2 children for each node)."""
    if not root:
        return True
    if (root.left and not root.right) or (not root.left and root.right):
        return False
    return is_full_tree(root.left) and is_full_tree(root.right)

def is_complete_tree(root):
    """Checks if the tree is a complete binary tree."""
    if not root:
        return True

    queue = deque([root])
    encountered_none = False

    while queue:
        current = queue.popleft()

        if current.left:
            if encountered_none:
                return False
            queue.append(current.left)
        else:
            encountered_none = True

        if current.right:
            if encountered_none:
                return False
            queue.append(current.right)
        else:
            encountered_none = True

    return True

def is_balanced(root):
    """Checks if the tree is height-balanced."""
    def check(node):
        if not node:
            return 0, True
        lh, left_bal = check(node.left)
        rh, right_bal = check(node.right)
        balanced = left_bal and right_bal and abs(lh - rh) <= 1
        return 1 + max(lh, rh), balanced
    
    _, balanced = check(root)
    return balanced

def get_expression_height(root):
    if not root:
        return 0
    return 1 + max(get_expression_height(root.left), get_expression_height(root.right))

def count_expression_nodes(root):
    if not root:
        return 0
    return 1 + count_expression_nodes(root.left) + count_expression_nodes(root.right)

def count_operators_operands(root):
    """Returns a tuple: (operators_count, operands_count, set_of_unique_operands)"""
    if not root:
        return 0, 0, set()

    left_ops, left_vals, left_set = count_operators_operands(root.left)
    right_ops, right_vals, right_set = count_operators_operands(root.right)

    if root.value in "+-*/^":
        return 1 + left_ops + right_ops, left_vals + right_vals, left_set.union(right_set)
    else:
        return left_ops + right_ops, 1 + left_vals + right_vals, left_set.union(right_set).union({root.value})
    

def build_tree_from_input(input_str):
    """Builds a binary tree from level-order user input."""
    values = input_str.split()
    
    if not values or values[0] == 'None':
        return None
    
    root = Node(values[0])
    queue = deque([root])
    i = 1
    
    while i < len(values):
        current = queue.popleft()
        
        # Left child
        if i < len(values) and values[i] != 'None':
            current.left = Node(values[i])
            queue.append(current.left)
        i += 1
        
        # Right child
        if i < len(values) and values[i] != 'None':
            current.right = Node(values[i])
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
    plt.title("Binary Tree Visualization")
    
    img_buf = BytesIO()
    plt.savefig(img_buf, format='png')
    img_buf.seek(0)
    img_data = base64.b64encode(img_buf.getvalue()).decode('utf-8')
    plt.close()
    
    return img_data

def tokenize(expression):
    """Tokenizes an expression, handling implicit multiplication."""
    expression = expression.replace(" ", "")
    
    # Insert * between:
    # 1. number/variable and (
    expression = re.sub(r'(\d|[a-zA-Z])\(', r'\1*(', expression)
    # 2. ) and number/variable
    expression = re.sub(r'\)(\d|[a-zA-Z])', r')*\1', expression)
    # 3. ) and (
    expression = re.sub(r'\)\(', r')*(', expression)
    
    # Now standard tokenizing: Match numbers, variables, operators, parentheses
    tokens = re.findall(r'\d+|[a-zA-Z]+|[+\-*/^()]', expression)
    
    return tokens

def precedence(op):
    """Returns precedence of operators."""
    return {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}.get(op, 0)

def to_postfix(tokens):
    """Converts infix expression to postfix notation (Reverse Polish Notation)."""
    output = []
    stack = []
    
    for token in tokens:
        if token.isalnum():  # Operand (number or variable)
            output.append(token)
        elif token == '(':
            stack.append(token)
        elif token == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            stack.pop()  # Remove '('
        else:  # Operator
            while stack and stack[-1] != '(' and precedence(stack[-1]) >= precedence(token):
                output.append(stack.pop())
            stack.append(token)
    
    while stack:
        output.append(stack.pop())
    
    return output

def build_expression_tree(postfix_tokens):
    """Builds an expression tree from postfix notation."""
    stack = []
    
    for token in postfix_tokens:
        node = Node(token)
        
        if token in "+-*/^":  # Operator
            if len(stack) < 2:
                return None
            
            node.right = stack.pop()  # First pop is right child
            node.left = stack.pop()   # Second pop is left child
        
        stack.append(node)
    
    if len(stack) != 1:
        return None
    
    return stack[0]

def add_edges_for_expression_tree(graph, node, pos, node_ids, x=0, y=0, level=1, x_spacing=1.5):
    """Recursively adds edges to the graph and positions nodes uniquely."""
    if node:
        node_id = node_ids[node]  # Get the unique ID for this node
        pos[node_id] = (x, y)  # Assign position
        
        if node.left:
            left_id = node_ids[node.left]
            graph.add_edge(node_id, left_id)
            add_edges_for_expression_tree(graph, node.left, pos, node_ids, x - x_spacing / (2 ** level), y - 1, level + 1, x_spacing)
        
        if node.right:
            right_id = node_ids[node.right]
            graph.add_edge(node_id, right_id)
            add_edges_for_expression_tree(graph, node.right, pos, node_ids, x + x_spacing / (2 ** level), y - 1, level + 1, x_spacing)

def draw_expression_tree(root):
    """Draws the binary expression tree with correct alignment."""
    if not root:
        return None
    
    graph = nx.DiGraph()
    pos = {}
    
    # Assign unique node identifiers using their object reference
    node_ids = {}
    def assign_ids(node, count=[0]):  # Use a mutable default argument to keep track
        if node:
            node_ids[node] = f"{node.value}_{count[0]}"  # Create a unique ID
            count[0] += 1
            assign_ids(node.left, count)
            assign_ids(node.right, count)
    
    assign_ids(root)  # Assign unique IDs before drawing
    
    add_edges_for_expression_tree(graph, root, pos, node_ids)
    
    # Create a mapping for labels, stripping the unique ID from display
    labels = {node_ids[n]: n.value for n in node_ids}
    
    plt.figure(figsize=(8, 5))
    nx.draw(graph, pos, labels=labels, 
            with_labels=True, node_size=2000, node_color="lightblue", 
            font_size=10, edge_color="gray")
    
    plt.title("Expression Tree Visualization")
    img_buf = BytesIO()
    plt.savefig(img_buf, format='png')
    img_buf.seek(0)
    img_data = base64.b64encode(img_buf.getvalue()).decode('utf-8')
    plt.close()
    
    return img_data


def solve(input, choice):
    """
    Main entry point for binary tree solver.
    
    Args:
        input (str): The input string (tree nodes or math expression)
        choice (int): 1 for regular binary tree, 2 for math expression tree
    
    Returns:
        str: JSON string with the results including base64 image
    """
    result = {}
    
    try:
        if choice == 1:
            # Regular binary tree
            root = build_tree_from_input(input)
            if root:
                image_data = draw_tree(root)
                result = {
                    "success": True,
                    "type": "regular_binary_tree",
                    "image": image_data,
                    "properties": {
                        "height": get_height(root),
                        "total_nodes": count_nodes(root),
                        "leaf_nodes": count_leaves(root),
                        "is_full": is_full_tree(root),
                        "is_complete": is_complete_tree(root),
                        "is_balanced": is_balanced(root)
                    }
                }
            else:
                result = {
                    "success": False,
                    "type": "regular_binary_tree",
                    "error": "Failed to build tree. Check your input format."
                }
        
        elif choice == 2:
            # Mathematical expression tree
            tokens = tokenize(input)
            postfix_tokens = to_postfix(tokens)
            root = build_expression_tree(postfix_tokens)
            
            if root:
                image_data = draw_expression_tree(root)
                height = get_expression_height(root)
                total_nodes = count_expression_nodes(root)
                operator_count, operand_count, unique_operands = count_operators_operands(root)
                
                result = {
                    "success": True,
                    "type": "expression_tree",
                    "image": image_data,
                    "postfix": ' '.join(postfix_tokens),
                    "properties": {
                        "height": height,
                        "total_nodes": total_nodes,
                        "operators": operator_count,
                        "operands": operand_count,
                        "unique_operands": sorted(unique_operands),
                        "is_full": is_full_tree(root),
                        "is_complete": is_complete_tree(root),
                        "is_balanced": is_balanced(root)
                    }
                }
            else:
                result = {
                    "success": False,
                    "type": "expression_tree",
                    "error": "Failed to build expression tree. Check your input format."
                }
        else:
            result = {
                "success": False,
                "error": "Invalid choice. Must be 1 (regular tree) or 2 (expression tree)."
            }
    
    except Exception as e:
        result = {
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }
    
    return json.dumps(result)