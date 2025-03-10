'''----------------- 
# Title: weighted_graph_solver.py
# Author: Michael Lowder
# Date: 3/5/2025
# Description: A solver to generate weighted graphs.
-----------------'''

import networkx as nx
import matplotlib
import matplotlib.pyplot as plt
import json
matplotlib.use('Agg') # Use to generate diagrams without displaying them
from io import BytesIO
import base64


def solve(graphInput, graphType):
    '''
        A driver function to generate adjacency matrix/list representations of a weighted graph.

        Parameters
        ----------
        graphInput (str): 
            String representing the edges of the graph
        graphType (str): 
            The type of graph to create (directed or undirected)

        Returns
        ----------
        result: json
            Returned a json object with the results
    '''
    # Parse the input into a list of tuples
    graphInput = graphInput.replace("),(", "), (")
    graphInput = graphInput.strip("{}").split("), (")
    input_list = [tuple(item.strip("()").replace(";", ",").split(",")) for item in graphInput]

    # Strip whitespace from each element in the tuples
    input_list = [(x.strip(), y.strip(), z.strip()) for x, y, z in input_list]

    G = get_graph_input(input_list, graphType)
    img_data = plot_graph(G)
    nodes, adj_matrix = get_adjacency_matrix(G)
    adj_list = get_adjacency_list(G)

    result = {
        "Graph": img_data,
        "Matrix": {str(nodes[i]): row for i, row in enumerate(adj_matrix)},
        "List": adj_list
    }

    return json.dumps(result)




def get_graph_input(input_list, graphType):
    '''
        A function to create a graph from the input.
        Parameters
        ----------
        input_list (list):
            List of tuples representing the edges of the graph
        graphType (str):
            The type of graph to create (directed or undirected)

        Returns
        ----------
        G: Graph/DiGraph
            Returns a graph object based on the input.
    '''

    if graphType == 'DIRECTED':
        G = nx.DiGraph()
    elif graphType == 'UNDIRECTED':
        G = nx.Graph()

    for u, v, w in input_list:
        G.add_edge(u, v, weight=float(w))

    return G

def plot_graph(G):
    '''
        A function to plot a weighted graph.
        ----------
        G (Graph/DiGraph):
            Inputted graph object

        Returns
        ----------
        img_data: str
            A base64 encoded image string of the graphs.
    '''

    plt.figure(figsize=(8, 6))
    pos = nx.spring_layout(G)  # Layout for visualization

    edge_labels = {(u, v): G[u][v]['weight'] for u, v in G.edges()}

    nx.draw(G, pos, with_labels=True, node_color='skyblue', edge_color='gray', node_size=2000, font_size=15, font_weight="bold", arrows=True)
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=12, font_color="red")  # Draw weights

    # Convert to base64 encoded image
    plt.title("Weighted Graph Visualization")
    img_buf = BytesIO()
    plt.savefig(img_buf, format='png', bbox_inches='tight')
    img_buf.seek(0)
    img_data = base64.b64encode(img_buf.getvalue()).decode('utf-8')
    print(img_data)
    plt.close()
    return img_data

def get_adjacency_matrix(G):
    '''
        A function to return the adjacency matrix form of the graph.
        ----------
        G (Graph/DiGraph):
            Inputted graph object

        Returns
        ----------
        nodes: list
            List of nodes in the graph
        adj_matrix: list[list[int]]
            Adjacency matrix representation of the graph
    '''

    nodes = list(G.nodes())  # Get node order
    node_index = {node: i for i, node in enumerate(nodes)}  # Assign index to nodes

    size = len(nodes)
    adj_matrix = [[0] * size for _ in range(size)]

    for u, v in G.edges():
        i, j = node_index[u], node_index[v]
        adj_matrix[i][j] = 1
        if not isinstance(G, nx.DiGraph):  # If undirected, make symmetric
            adj_matrix[j][i] = 1

    return nodes, adj_matrix

def get_adjacency_list(G):
    '''
        A function to return the adjacency list form of the graph.
        ----------
        G (Graph/DiGraph):
            Inputted graph object

        Returns
        ----------
        adj_list: dict
            Adjacency list representation of the graph
    '''
    adj_list = {node: list(G.neighbors(node)) for node in G.nodes()}
    return adj_list
