#Chapter 6.2
#Part 5
import networkx as nx
import matplotlib.pyplot as plt
import re


#---test case---
G = nx.DiGraph()
G.add_edge("A", "B")
G.add_edge("A", "C")

pos = nx.spring_layout(G)
plt.figure(figsize=(6, 4))
nx.draw(G, pos, with_labels=True, node_size=2000, node_color="lightblue", font_size=10, edge_color="gray")
plt.show()


class TreeNode:
    """A node in the expression tree."""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def tokenize(expression):
    """Tokenizes a mathematical expression."""
    expression = expression.replace(" ", "")
    expression = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', expression)  # Handle implicit multiplication
    tokens = re.findall(r'\d+|[a-zA-Z]+|[+\-*/^()]', expression)
    return tokens

def precedence(op):
    """Returns operator precedence."""
    return {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}.get(op, 0)

def to_postfix(tokens):
    """Converts infix expression tokens to postfix notation."""
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

    print("Postfix Expression:", output)  # Debugging output
    return output


def build_expression_tree(postfix_tokens):
    """Builds an expression tree from postfix notation."""
    stack = []

    for token in postfix_tokens:
        node = TreeNode(token)

        if token in "+-*/^":  # Operator
            if len(stack) < 2:
                print(f"Error: Not enough operands for operator '{token}'")
                return None

            node.right = stack.pop()
            node.left = stack.pop()

        stack.append(node)

    if len(stack) != 1:
        print("Error: Invalid postfix expression. Stack:", [n.value for n in stack])
        return None

    print("Expression tree successfully built!")  # Debugging output
    return stack[0]


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

def draw_expression_tree(root):
    """Draws an expression tree and prints debug information."""
    graph = nx.DiGraph()
    pos = {}

    def add_nodes_edges(node):
        if node:
            graph.add_node(node.value)
            print(f"Added node: {node.value}")  # Debugging output
            if node.left:
                graph.add_edge(node.value, node.left.value)
                print(f"Added edge: {node.value} -> {node.left.value}")  # Debugging output
                add_nodes_edges(node.left)
            if node.right:
                graph.add_edge(node.value, node.right.value)
                print(f"Added edge: {node.value} -> {node.right.value}")  # Debugging output
                add_nodes_edges(node.right)

    add_nodes_edges(root)

    if not graph.nodes:
        print("Error: No nodes were added to the graph.")
        return

    pos = nx.spring_layout(graph)  # Automatic positioning

    plt.figure(figsize=(6, 4))
    nx.draw(graph, pos, with_labels=True, node_size=2000, node_color="lightblue", font_size=10, edge_color="gray")

    print("Displaying graph...")  # Debugging output
    plt.show(block=True)




# MAIN PROGRAM
def main():
    print("Enter a mathematical expression to generate an expression tree.")
    print("Example: 3(2*x - 3*y) + 4*z^4 + 1")
    print("Type 'exit' to stop.\n")

    while True:
        expr = input("Enter expression: ").strip()
        if expr.lower() == "exit":
            print("Exiting program.")
            break

        tokens = tokenize(expr)
        postfix = to_postfix(tokens)
        tree_root = build_expression_tree(postfix)
        draw_expression_tree(tree_root)

if __name__ == "__main__":
    main()
