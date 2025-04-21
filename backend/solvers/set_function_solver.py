'''----------------- 
# Title: set_function_solver.py
# Author: Michael Lowder
# Date: 3/15/2025
# Description: A solver for applying basic set functions
-----------------'''

# -*- coding: utf-8 -*-
import math
import re
from fractions import Fraction
import cmath
import json
import sys
import os

# Append the parent directory to the path so we can import in utility
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from solvers.util import exceptions

# Import cartesian product solver
from solvers.cartesian_product_solver import format_element, check_cartesian_product

# Character mappings for set element representation
char_mapping = {
    "a": "1", "b": "2", "c": "3", "d": "4", "e": "5", "f": "6",
    "g": "7", "h": "8", "i": "9", "j": "10", "k": "11", "l": "12",
    "m": "13", "n": "14", "o": "15", "p": "16", "q": "17", "r": "18",
    "s": "19", "t": "20", "u": "21", "v": "22", "w": "23", "x": "24",
    "y": "25", "z": "26", "\u2205": "∅"
}

# Mapping for numbers to characters
number_mapping = {
    "1": "a", "2": "b", "3": "c", "4": "d", "5": "e", "6": "f", "7": "g", 
    "8": "h", "9": "i", "10": "j", "11": "k", "12": "l", "13": "m", "14": "n", 
    "15": "o", "16": "p", "17": "q", "18": "r", "19": "s", "20": "t", 
    "21": "u", "22": "v", "23": "w", "24": "x", "25": "y", "26": "z"
}

def replace_char(match):
    """Replace characters with their mapped values"""
    return char_mapping.get(match.group(0), match.group(0))

def replace_numbers_with_chars(input_str):
    """Replace numbers with their character equivalents"""
    def replace_number(match):
        return number_mapping.get(match.group(0), match.group(0))
    return re.sub(r'\d', replace_number, input_str)

# Set classification functions
def is_whole_number(n):
    return isinstance(n, int) and n >= 0

def is_natural_number(n):
    return isinstance(n, int) and n > 0

def is_integer(n):
    return isinstance(n, int)

def is_rational_number(n):
    if isinstance(n, int):
        return True
    if isinstance(n, float):
        return not math.isnan(n) and math.isfinite(n)
    return False

def is_irrational_number(n):
    known_irrationals = {math.pi, math.e}
    if n in known_irrationals:
        return True
    if isinstance(n, float):
        return math.isfinite(n) and not is_rational_number(n)
    return False

def is_real_number(n):
    return isinstance(n, (int, float)) and not math.isnan(n)

def is_complex_number(n):
    return isinstance(n, complex)

# Set builder notation parser
def parse_input(input_str):
    match = re.match(r"\{x\s*\|\s*x\s*∈\s*(\w+)\s+and\s+(.+)\}", input_str.strip())
    if match:
        domain, condition = match.groups()
        return domain, condition
    else:
        return None, None

def preprocess_condition(condition):
    return condition.replace("^", "**")

def generate_set_from_builder(input_str, lower_bound=-100, upper_bound=100):
    domain, condition = parse_input(input_str)

    if domain is None or condition is None:
        return frozenset()

    condition = preprocess_condition(condition)

    # Define domain ranges
    if domain == "N":  # Natural numbers
        numbers = range(1, upper_bound + 1)
    elif domain == "Z":  # Integers
        numbers = range(lower_bound, upper_bound + 1)
    elif domain == "Q":  # Rational numbers
        numbers = {Fraction(a, b) for a in range(lower_bound, upper_bound + 1) 
                   for b in range(1, upper_bound + 1) 
                   if lower_bound <= a / b <= upper_bound}
    elif domain == "R":  # Real numbers
        numbers = {x / 10.0 for x in range(lower_bound * 10, upper_bound * 10 + 1)}
    elif domain == "C":  # Complex numbers
        numbers = {complex(a / 10, b / 10) for a in range(-10, 11) for b in range(-10, 11)}
    else:
        return frozenset()

    # Evaluate the condition
    try:
        generated_set = {x for x in numbers if eval(condition, 
                                                 {"x": x, "cmath": cmath, "math": math, 
                                                  "sqrt": math.sqrt, "abs": abs, "pow": pow})}
    except Exception as e:
        return frozenset()
    
    return frozenset(generated_set)

# Set parsing functions
def replace_nested_sets(input_str):
    pattern = r"\{\{(.*?)\}\}"
    while re.search(pattern, input_str):
        input_str = re.sub(pattern, r"frozenset({\1})", input_str)
    return input_str

def parse_set(input_str):
    try:
        if not isinstance(input_str, str):
            raise ValueError("Input must be a string")

        input_str = input_str.replace("π", "pi").replace("pi", "math.pi")
        input_str = re.sub(r'[a-zA-Z]', replace_char, input_str)
        input_str = input_str.replace("\u2205", "frozenset()")
        
        # Clean input for safe evaluation
        input_str = re.sub(r'[^a-zA-Z0-9\+\-\*/\(\)\[\]\{\}\.\^=,]', '', input_str)
        input_str = replace_nested_sets(input_str)
        input_str = input_str.replace("{", "frozenset({").replace("}", "})")
        
        parsed = eval(input_str, {"__builtins__": None, "math": math, "frozenset": frozenset, 
                                "sqrt": math.sqrt, "pi": math.pi})
        if isinstance(parsed, set):
            parsed = frozenset(parsed)
        return parsed
    except Exception as e:
        return frozenset()

# Set operations
def check_subset(A, B):
    return A.issubset(B)

def check_proper_subset(A, B):
    return A < B

def check_element(x, A):
    return x in A

def check_equality(A, B):
    return A == B

def check_union(A, B):
    if isinstance(A, frozenset) and len(A) == 0:
        return B
    if isinstance(B, frozenset) and len(B) == 0:
        return A
    return A | B

def check_intersection(A, B):
    if isinstance(A, frozenset) and len(A) == 0:
        return frozenset()
    if isinstance(B, frozenset) and len(B) == 0:
        return frozenset()
    return A & B

def check_difference(A, B):
    if isinstance(A, frozenset) and len(A) == 0:
        return frozenset()
    if isinstance(B, frozenset) and len(B) == 0:
        return A
    return A - B

def check_cartesian_product(A, B):
    return frozenset((a, b) for a in A for b in B)

def format_set_for_display(set_obj):
    """Format a set for display in output with better handling for cartesian products"""
    if isinstance(set_obj, frozenset):
        if len(set_obj) == 0:
            return "∅"
        
        try:
            # Sort numerically if possible
            elements = sorted(set_obj, key=lambda x: (float(x) if isinstance(x, (int, float, Fraction)) else str(x)))
        except Exception:
            # Fallback to string sorting
            elements = sorted(set_obj, key=lambda x: str(x))

        is_cartesian = any(isinstance(e, tuple) and len(e) == 2 for e in elements)

        if len(elements) > 10:
            if is_cartesian:
                formatted_elements = [f"({format_element(e[0])}, {format_element(e[1])})" if isinstance(e, tuple) else str(e) for e in elements[:5]]
                formatted_elements_end = [f"({format_element(e[0])}, {format_element(e[1])})" if isinstance(e, tuple) else str(e) for e in elements[-5:]]
                elements_str = ", ".join(formatted_elements) + ", ..., " + ", ".join(formatted_elements_end)
            else:
                elements_str = ", ".join(str(e) for e in elements[:5]) + ", ..., " + ", ".join(str(e) for e in elements[-5:])
        else:
            if is_cartesian:
                elements_str = ", ".join(f"({format_element(e[0])}, {format_element(e[1])})" if isinstance(e, tuple) else str(e) for e in elements)
            else:
                elements_str = ", ".join(str(e) for e in elements)
        
        return "{" + elements_str + "}"
    else:
        return str(set_obj)

def solve(data):
    """
    Main solver function for set operations.
    
    Parameters
    ----------
    data : dict
        A dictionary containing:
        - 'sets': A dictionary mapping set names to set definitions
        - 'statements': A list of statements to evaluate
        
    Returns
    ----------
    str
        JSON string with evaluation results
    """
    results = {"sets": {}, "statements": []}
    
    # Parse all the sets first
    sets = {}
    for name, set_def in data.get("sets", {}).items():
        if set_def.get("type") == "builder":
            sets[name] = generate_set_from_builder(set_def.get("value", ""))
        else:  # Regular set
            sets[name] = parse_set(set_def.get("value", ""))
        
        # Add formatted set to results
        results["sets"][name] = format_set_for_display(sets[name])
    
    # Evaluate each statement
    for stmt in data.get("statements", []):
        expr = stmt.get("expression", "")
        try:
            if "⊆" in expr:
                A, B = expr.split("⊆")
                A, B = A.strip(), B.strip()
                
                # Parse A and B
                set_A = sets.get(A, parse_set(A) if A.startswith("{") else frozenset())
                set_B = sets.get(B, parse_set(B) if B.startswith("{") else frozenset())
                
                if A == "∅":
                    set_A = frozenset()
                if B == "∅":
                    set_B = frozenset()
                    
                result = check_subset(set_A, set_B)
                
            elif "⊂" in expr:
                # Similar processing for proper subset
                A, B = expr.split("⊂")
                A, B = A.strip(), B.strip()
                
                set_A = sets.get(A, parse_set(A) if A.startswith("{") else frozenset())
                set_B = sets.get(B, parse_set(B) if B.startswith("{") else frozenset())
                
                if A == "∅":
                    set_A = frozenset()
                if B == "∅":
                    set_B = frozenset()
                    
                result = check_proper_subset(set_A, set_B)
                
            elif "∈" in expr:
                # Element membership
                x, A = expr.split("∈")
                x, A = x.strip(), A.strip()
                
                # Parse element x
                if x.startswith("{"):
                    element_x = parse_set(x)
                elif x == "∅":
                    element_x = frozenset()
                else:
                    try:
                        element_x = eval(x, {"__builtins__": None, "math": math, "pi": math.pi, "sqrt": math.sqrt})
                    except:
                        element_x = x  # Keep as string if can't evaluate
                
                set_A = sets.get(A, frozenset())
                result = check_element(element_x, set_A)
                
            # Continue with other operations: =, ∪, ∩, -, ×
            elif "=" in expr:
                A, B = expr.split("=")
                A, B = A.strip(), B.strip()
                
                set_A = sets.get(A, parse_set(A) if A.startswith("{") else frozenset())
                set_B = sets.get(B, parse_set(B) if B.startswith("{") else frozenset())
                
                if A == "∅":
                    set_A = frozenset()
                if B == "∅":
                    set_B = frozenset()
                    
                result = check_equality(set_A, set_B)
                
            elif "∪" in expr:
                A, B = expr.split("∪")
                A, B = A.strip(), B.strip()
                
                set_A = sets.get(A, parse_set(A) if A.startswith("{") else frozenset())
                set_B = sets.get(B, parse_set(B) if B.startswith("{") else frozenset())
                
                if A == "∅":
                    set_A = frozenset()
                if B == "∅":
                    set_B = frozenset()
                    
                result = check_union(set_A, set_B)
                result = format_set_for_display(result)
                
            elif "∩" in expr:
                A, B = expr.split("∩")
                A, B = A.strip(), B.strip()
                
                set_A = sets.get(A, parse_set(A) if A.startswith("{") else frozenset())
                set_B = sets.get(B, parse_set(B) if B.startswith("{") else frozenset())
                
                if A == "∅":
                    set_A = frozenset()
                if B == "∅":
                    set_B = frozenset()
                    
                result = check_intersection(set_A, set_B)
                result = format_set_for_display(result)
                
            elif "-" in expr:
                A, B = expr.split("-")
                A, B = A.strip(), B.strip()
                
                set_A = sets.get(A, parse_set(A) if A.startswith("{") else frozenset())
                set_B = sets.get(B, parse_set(B) if B.startswith("{") else frozenset())
                
                if A == "∅":
                    set_A = frozenset()
                if B == "∅":
                    set_B = frozenset()
                    
                result = check_difference(set_A, set_B)
                result = format_set_for_display(result)
                
            elif "×" in expr:
                A, B = expr.split("×")
                A, B = A.strip(), B.strip()
                
                set_A = sets.get(A, parse_set(A) if A.startswith("{") else frozenset())
                set_B = sets.get(B, parse_set(B) if B.startswith("{") else frozenset())
                
                if A == "∅":
                    set_A = frozenset()
                if B == "∅":
                    set_B = frozenset()
                    
                # Use the imported check_cartesian_product function
                result = check_cartesian_product(set_A, set_B)
                result = format_set_for_display(result)
                
                # Add as a statement with more metadata
                results["statements"].append({
                    "expression": expr,
                    "result": result,
                    "type": "cartesian_product",
                    "set_a": format_set_for_display(set_A),
                    "set_b": format_set_for_display(set_B)
                })
                continue
                            
            else:
                raise exceptions.CalculateError(f"Invalid expression: {expr}")
                
            results["statements"].append({
                "expression": expr,
                "result": result
            })
            
        except Exception as e:
            result = {"error": "An unknown error has occured"}
    
    return json.dumps(results)