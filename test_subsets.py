import re
from fractions import Fraction
import cmath

def generate_set_from_builder(notation):
    notation = notation.strip("{}")  # Remove surrounding braces
    match = re.match(r"x\s*\|\s*x\s*∈\s*(\w+)\s+and\s+(.+)", notation)

    if not match:
        print("Invalid set notation.")
        return frozenset()

    domain, condition = match.groups()
    
    # Define a range for generating numbers
    lower_bound, upper_bound = -100, 100

    if domain == "N":  # Natural numbers (assuming N = {1, 2, 3, ...})
        numbers = range(1, upper_bound + 1)
    elif domain == "Z":  # Integers
        numbers = range(lower_bound, upper_bound + 1)
    elif domain == "Q":  # Rational numbers (using fractions)
        numbers = {Fraction(a, b) for a in range(lower_bound, upper_bound + 1) for b in range(1, upper_bound + 1)}
    elif domain == "R":  # Real numbers (simulated with floats)
        numbers = {x / 10 for x in range(lower_bound * 10, upper_bound * 10)}
    elif domain == "C":  # Complex numbers (simulated with real and imaginary parts)
        numbers = {complex(a / 10, b / 10) for a in range(-10, 11) for b in range(-10, 11)}
    else:
        print(f"Unsupported domain: {domain}")
        return frozenset()

    # Filter numbers based on the extracted condition
    generated_set = {x for x in numbers if eval(condition, {"x": x, "cmath": cmath})}

    return frozenset(generated_set)

# Example Usage
print(generate_set_from_builder("{x | x ∈ Q and 0 < x < 2}"))   # Rational numbers between 0 and 2
print(generate_set_from_builder("{x | x ∈ C and abs(x) <= 2}"))  # Complex numbers with magnitude ≤ 2
