'''----------------- 
# Title: recursion_solver.py
# Author: Michael Lowder
# Date: 2/18/2025
# Description: A solver for recursive formulas to calculate f(n) values.
-----------------'''

#---Imports---#
import json
import re 

# Homework problems 1-12
def solve(formula, base_case, n):
    """
    Evaluates a recursive formula for a given input n and prints all values from the base case to n.

    :param formula: The recursive formula as a string, e.g., "2 * f(n-1) + 1"
    :param base_case: A string representing the base case(s), e.g., "{0: 1, 1: 2}"
    :param n: The value of n to calculate f(n) for.
    :return: A list of results from f(0) to f(n).
    """
    try:
        # Convert base_case string to dictionary
        base_case = re.sub(r'(\d+):', r'"\1":', base_case)
        base_case = json.loads(base_case)
        base_case = {int(k): v for k, v in base_case.items()}

        # Convert n to integer
        n = int(n)

        # Memoization to store computed values
        memo = {}

        def f(n):
            # Check if n is in the base case
            if n in base_case:
                return base_case[n]
            
            # Check if n is already computed
            if n in memo:
                return memo[n]

            # Safely evaluate the formula using eval
            result = eval(formula, {"n": n, "f": f})
            memo[n] = result
            return result

        # Compute all values from the smallest base case to n
        min_base = min(base_case.keys())
        results = [f(i) for i in range(min_base, n + 1)]

        # pretty print the results
        pretty_results = pretty_print_results(results, start_index=min_base)

        return {"success": True, "results": pretty_results}

    except Exception as e:
        return {"success": False, "error": str(e)}

def pretty_print_results(results, start_index=0):
    """
    Formats the results as a dictionary with keys in the format f(n), starting from start_index.

    :param results: A list of results from f(start_index) to f(n).
    :param start_index: The starting index of the results list.
    :return: A dictionary with keys in the format f(n) and corresponding values.
    """
    return {f"f({i})": result for i, result in zip(range(start_index, start_index + len(results)), results)}

