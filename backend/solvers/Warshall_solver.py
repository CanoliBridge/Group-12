'''----------------- 
# Title: Warshall_solver.py
# Author: Mathias Buchanan 
# Date: 3/5/2025
# Description: A solver for Warhsall's algorithm.
-----------------'''

import math
import json

def solve(matrix):
    V = len(matrix)
    print("beginning graph:")
    print(matrix)
    print("\n")
    print("intermediate graphs")
    matriix = []
    
    for k in range(V):
        for i in range (V):
            for j in range(V):
                if matrix[i][j] == "0" and matrix[i][k] == "1" and matrix[k][j] == "1":
                    matrix[i][j] = "1"
        newMatr = []
        for i in range(V):
            line = []
            for j in range(V):
                line.append(matrix[i][j])
            newMatr.append(line)
        matriix.append(newMatr)

    # Prepare the truth table as a JSON object
    truth_table = {}

    noOfMatrix = 1
    # Add the rows to the truth table
    for row in matriix:
        truth_table["Matrix" + str(noOfMatrix)] = row
        noOfMatrix += 1

    return json.dumps(truth_table)
