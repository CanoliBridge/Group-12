'''----------------- 
# Title: power_set_solver.py
# Author: Michael Lowder
# Date: 3/15/2025
# Description: A solver for finding power sets.
-----------------'''


import re
from itertools import chain, combinations
import json

har_mapping = {
    "\u2205": "∅"
}

def replace_char(match):
    return har_mapping.get(match.group(0), match.group(0))

def power_set(iterable):
    s = list(iterable)
    return list(chain.from_iterable(combinations(s, r) for r in range(len(s) + 1)))

def format_math_set(obj):
    """Recursively format the set/tuple structure into mathematical set notation."""
    if isinstance(obj, frozenset):
        if len(obj) == 0:
            return '∅'
        else:
            return '{' + ', '.join(sorted([format_math_set(elem) for elem in obj], key=lambda x: (x.count('{'), x))) + '}'
    if isinstance(obj, (set, tuple, list)):
        if len(obj) == 0:
            return '∅'
        inner = ", ".join(sorted(format_math_set(item) for item in obj))
        return f"{{{inner}}}"
    else:
        return str(obj)

def parse_set_notation(s):
    s = s.replace(' ', '')  # Remove all whitespace

    def helper(index):
        result = set()
        token = ''
        while index < len(s):
            char = s[index]
            if char == '{':
                if token:
                    result.add(token)
                    token = ''
                inner, index = helper(index + 1)
                result.add(frozenset(inner))
            elif char == '∅':
                if token:
                    result.add(token)
                    token = ''
                result.add(frozenset())
                index += 1
            elif char == ',':
                if token:
                    result.add(token)
                    token = ''
                index += 1
            elif char == '}':
                if token:
                    result.add(token)
                    token = ''
                return result, index + 1
            else:
                token += char  # Collect letters or digits
                index += 1
        return result, index

    if s.startswith('{') and s.endswith('}'):
        parsed_set, _ = helper(1)  # start inside the first `{`
        return parsed_set
    else:
        raise ValueError("Input must start and end with braces {}")


def solve(input_text, power_sets):
    """
    Calculate power sets for a given set and return JSON result.
    
    Parameters:
    -----------
    input_text : str
        String representation of the input set (e.g., "{a, b, c}")
    power_sets : int
        Number of power set iterations to calculate
        
    Returns:
    --------
    str
        JSON string with the original set and calculated power sets
    """
    input_text = re.sub("|".join(map(re.escape, har_mapping.keys())), replace_char, input_text)
    
    # Parse the input set
    user_set = parse_set_notation(input_text)
    
    if '∅' in user_set:
        user_set.remove('∅')
        user_set.add(frozenset())
    
    # Initialize the result structure
    result = {
        "original_set": format_math_set(user_set),
        "power_sets": []
    }
    
    # Calculate power sets
    current_set = user_set
    for i in range(power_sets):
        # Calculate next power set
        current_set = power_set(current_set)
        
        # Format the power set for output
        formatted_subsets = []
        for subset in sorted(current_set, key=lambda x: (len(x), [str(e) for e in x])):
            formatted_subsets.append(format_math_set(subset))
        
        # Add to result
        result["power_sets"].append({
            "iteration": i + 1,
            "notation": f"𝒫^{i+1}(S)",
            "elements": formatted_subsets,
            "cardinality": len(formatted_subsets)
        })

    return json.dumps(result)
