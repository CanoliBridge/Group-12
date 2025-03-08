#Chapter 6.2
#part 5.5
import re
import networkx as nx
import matplotlib.pyplot as plt

class TreeNode:
    """Class to represent a node in the expression tree."""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def tokenize(expression):
    """Tokenizes an expression, handling implicit multiplication."""
    expression = expression.replace(" ", "")
    
    # Handle implicit multiplication: 3(x+y) → 3*(x+y)
    expression = re.sub(r'(\d)([a-zA-Z(])', r'\1*\2', expression)
    expression = re.sub(r'(\))(\d|[a-zA-Z])', r'\1*\2', expression)

    # Tokenize: Match numbers, variables, operators, and parentheses
    tokens = re.findall(r'\d+|[a-zA-Z]+|[+\-*/^()]', expression)
    
    print("Tokenized Expression:", tokens)
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
            while stack and precedence(stack[-1]) >= precedence(token):
                output.append(stack.pop())
            stack.append(token)

    while stack:
        output.append(stack.pop())

    print("Postfix Expression:", output)
    return output

def build_expression_tree(postfix_tokens):
    """Builds an expression tree from postfix notation."""
    stack = []

    for token in postfix_tokens:
        node = TreeNode(token)

        if token in "+-*/^":  # Operator
            node.right = stack.pop()  # First pop is right child
            node.left = stack.pop()   # Second pop is left child

        stack.append(node)

    if len(stack) != 1:
        print("Error: Invalid postfix expression. Stack:", [n.value for n in stack])
        return None

    print("Expression tree successfully built!")
    return stack[0]

def add_edges(graph, node, pos, x=0, y=0, level=1, x_spacing=1.5):
    """Recursively adds edges to the graph and positions nodes hierarchically."""
    if node:
        pos[node.value] = (x, y)

        if node.left:
            graph.add_edge(node.value, node.left.value)
            add_edges(graph, node.left, pos, x - x_spacing / (2 ** level), y - 1, level + 1, x_spacing)

        if node.right:
            graph.add_edge(node.value, node.right.value)
            add_edges(graph, node.right, pos, x + x_spacing / (2 ** level), y - 1, level + 1, x_spacing)

def draw_expression_tree(root):
    """Draws the binary expression tree with correct alignment."""
    graph = nx.DiGraph()
    pos = {}

    add_edges(graph, root, pos)

    plt.figure(figsize=(8, 5))
    nx.draw(graph, pos, with_labels=True, node_size=2000, node_color="lightblue", font_size=10, edge_color="gray")

    print("Displaying expression tree...")
    plt.show(block=True)

# 🛠 User Input & Execution
expression = input("Enter a mathematical expression: ")
tokens = tokenize(expression)
postfix_tokens = to_postfix(tokens)
root = build_expression_tree(postfix_tokens)

if root:
    draw_expression_tree(root)
else:
    print("Failed to build expression tree.")

