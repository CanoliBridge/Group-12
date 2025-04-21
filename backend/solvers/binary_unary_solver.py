'''----------------- 
# Title: binary_unary_solver.py
# Author: Michael Lowder
# Date: 4/20/2025
# Updated by: ChatGPT
# Description: A solver for identifying Binary/Unary relations, supporting domains and custom sets, with property analysis for binary operations
-----------------'''

import re
import json
import os
import sys
import sympy as sp
from itertools import product
from fractions import Fraction

# Append the parent directory to the path so we can import utility
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from solvers.util.exceptions import CalculateError

### --- CONSTANTS --- ###

DOMAINS = ["Z", "N", "Q", "R", "C"]

SAMPLE_VALUES = {
    "Z": list(range(-5, 6)),
    "N": list(range(0, 6)),
    "Q": [i/2 for i in range(-5, 6)],
    "R": [i/2 for i in range(-5, 6)],
    "C": [complex(i, j) for i in range(-2, 3) for j in range(-2, 3)]
}

### --- HELPER FUNCTIONS --- ###

def parse_table_input(set_input, table_input):
    S = set(set_input.split())
    table = table_input
    return S, table

def is_binary_operation(S, table):
    if len(table) != len(S) or any(len(row) != len(S) for row in table):
        return False
    for row in table:
        for value in row:
            if value not in S:
                return False
    return True

def is_unary_operation(S, table):
    if len(table) != len(S) or any(len(row) != 1 for row in table):
        return False
    for row in table:
        if row[0] not in S:
            return False
    return True

def preprocess_expression(expression):
    # Insert multiplication signs where missing
    expression = re.sub(r'(?<=[0-9])(?=[a-zA-Z(])', '*', expression)  # 2x or 2(x
    expression = re.sub(r'(?<=[a-zA-Z)])(?=[a-zA-Z(0-9])', '*', expression)  # x2 or x( or )x or )(

    # Handle factorial shorthand
    expression = re.sub(r'(\\b[a-zA-Z]\\b)!', r'factorial(\\1)', expression)

    return expression

def parse_expression_input(expression):
    match = re.match(r"(.+)\s*=\s*(.+);\s*S\s*=\s*(.+)", expression)
    if not match:
        raise CalculateError("Invalid format. Use 'x# = x^2; S = Z' or 'x ⊕ y = (x + y) % 3; S = {0,1,2}'")
    
    lhs, rhs, set_definition = match.groups()

    lhs_vars = re.findall(r'\b[a-zA-Z]\b', lhs)
    if len(lhs_vars) == 1:
        op_type = "unary"
    elif len(lhs_vars) == 2:
        op_type = "binary"
    else:
        raise CalculateError("Invalid number of variables detected. Expected one (unary) or two (binary).")
    
    return set_definition.strip(), preprocess_expression(rhs.strip()), op_type

def parse_set(set_def):
    if set_def == "Z":
        return "Z", SAMPLE_VALUES["Z"]
    elif set_def == "N":
        return "N", SAMPLE_VALUES["N"]
    elif set_def == "Q":
        return "Q", SAMPLE_VALUES["Q"]
    elif set_def == "R":
        return "R", SAMPLE_VALUES["R"]
    elif set_def == "C":
        return "C", SAMPLE_VALUES["C"]
    elif set_def.startswith("{") and set_def.endswith("}"):
        custom_set = set(map(lambda x: int(x.strip()), set_def.strip("{}").split(",")))
        return "custom", custom_set
    else:
        raise CalculateError("Unsupported set format")

def is_valid_output(domain, output):
    if isinstance(output, sp.Basic):
        output = complex(output) if output.is_complex else float(output)

    if domain == "Z":
        return isinstance(output, (int, float)) and float(output).is_integer()
    elif domain == "N":
        return isinstance(output, (int, float)) and float(output).is_integer() and output >= 0
    elif domain == "Q":
        if isinstance(output, complex):
            return False
        try:
            _ = sp.nsimplify(output)
            return True
        except:
            return False
    elif domain == "R":
        return not isinstance(output, complex)
    elif domain == "C":
        return isinstance(output, (complex, float, int))
    else:
        return False

def parse_unary_operation(rhs_expr):
    x = sp.symbols('x')
    expr = sp.sympify(rhs_expr)
    def func(x_val):
        result = expr.subs(x, x_val)
        if isinstance(result, sp.Rational):
            result = float(result) if result.q != 1 else int(result)
        elif isinstance(result, sp.Basic):
            result = float(result) if result.is_real else result
        return result
    return func, expr

def parse_binary_operation(rhs_expr):
    x, y = sp.symbols('x y')
    expr = sp.sympify(rhs_expr)
    def func(a, b):
        result = expr.subs({x: a, y: b})
        if isinstance(result, sp.Rational):
            result = float(result) if result.q != 1 else int(result)
        elif isinstance(result, sp.Basic):
            result = float(result) if result.is_real else result
        return result
    return func, expr

def check_unary_well_defined(func, expr, domain, sample_set):
    for x_val in sample_set:
        try:
            result = func(x_val)
            if domain == "custom":
                if result not in sample_set:
                    return False
            else:
                if not is_valid_output(domain, result):
                    return False
        except Exception:
            return False
    return True

def check_binary_well_defined(func, expr, domain, sample_set):
    expr_str = str(expr)
    if "/y" in expr_str or "/x" in expr_str:
        return False

    for a, b in product(sample_set, repeat=2):
        try:
            result = func(a, b)
            if domain == "custom":
                if result not in sample_set:
                    return False
            else:
                if not is_valid_output(domain, result):
                    return False
        except Exception:
            return False
    return True

def check_binary_properties(func, sample_set):
    properties = []

    closed = all(func(x, y) in sample_set for x in sample_set for y in sample_set)
    if closed:
        properties.append("Closed over the set.")

    commutative = all(func(x, y) == func(y, x) for x in sample_set for y in sample_set)
    if commutative:
        properties.append("Commutative.")

    associative = all(
        func(func(x, y), z) == func(x, func(y, z))
        for x in sample_set for y in sample_set for z in sample_set
    )
    if associative:
        properties.append("Associative.")

    identity = None
    for e in sample_set:
        if all(func(x, e) == x and func(e, x) == x for x in sample_set):
            identity = e
            properties.append(f"Identity element: {e}")
            break

    if identity is not None:
        inverses_exist = True
        for x in sample_set:
            found = any(func(x, y) == identity and func(y, x) == identity for y in sample_set)
            if not found:
                inverses_exist = False
                break
        if inverses_exist:
            properties.append("Each element has an inverse.")

    idempotent = all(func(x, x) == x for x in sample_set)
    if idempotent:
        properties.append("Idempotent.")

    return properties

def format_readable_output(result):
    output = f"Operation Type: {result['operation_type']}\n"
    output += f"Well-defined: {'Yes' if result['is_well_defined'] else 'No'}\n\n"
    if result["properties"]:
        output += "Properties:\n"
        for prop in result["properties"]:
            output += f"• {prop}\n"
    return output

### --- MAIN SOLVE FUNCTION --- ###

def solve(choice_input, set_input, table_input, expr_input):
    try:
        result = {
            "operation_type": None,
            "is_well_defined": False,
            "properties": []
        }

        if choice_input == "1":
            S, table = parse_table_input(set_input, table_input)

            if not S:
                raise CalculateError("The set cannot be empty.")

            if is_binary_operation(S, table):
                result["operation_type"] = "Binary Operation"
                result["is_well_defined"] = True
                result["properties"] = [f"This is a binary operation on the set {{{', '.join(sorted(S))}}}."]
            elif is_unary_operation(S, table):
                result["operation_type"] = "Unary Operation"
                result["is_well_defined"] = True
                result["properties"] = [f"This is a unary operation on the set {{{', '.join(sorted(S))}}}."]
            else:
                result["operation_type"] = "Invalid Operation"
                result["is_well_defined"] = False
                result["properties"] = ["The operation is neither a valid binary nor unary operation on this set."]

        elif choice_input == "2":
            if not expr_input or not expr_input.strip():
                raise CalculateError("Please enter an expression.")

            set_def, rhs_expr, op_type = parse_expression_input(expr_input)
            domain_type, sample_set = parse_set(set_def)

            if op_type == "unary":
                func, expr = parse_unary_operation(rhs_expr)
                well_defined = check_unary_well_defined(func, expr, domain_type, sample_set)
            else:
                func, expr = parse_binary_operation(rhs_expr)
                well_defined = check_binary_well_defined(func, expr, domain_type, sample_set)

            result["operation_type"] = f"{op_type.capitalize()} Operation"
            result["is_well_defined"] = well_defined

            if well_defined:
                result["properties"].append(f"The operation is well-defined on {set_def}.")
                if op_type == "binary":
                    binary_props = check_binary_properties(func, sample_set)
                    result["properties"].extend(binary_props)
            else:
                result["properties"].append(f"The operation is NOT well-defined on {set_def}.")

        else:
            raise CalculateError("Invalid choice. Please select a valid input type (1 or 2).")

        output_str = format_readable_output(result)
        return json.dumps({"output": output_str})

    except CalculateError:
        raise
    except Exception as e:
        raise CalculateError(f"Error: {str(e)}")
