
#Example 1 (ex 3)

# Define sets
A = {1, 7, 9, 15}
B = {7, 9}
C = {7, 9, 15, 20}

# Verify and print the statements
print(f"B ⊆ C : {B.issubset(C)}")      # B is a subset of C
print(f"B ⊆ A : {B.issubset(A)}")      # B is a subset of A
print(f"15 ∈ C : {15 in C}")           # 15 is an element of C
print(f"{{7, 9}} ⊆ B : {{7, 9}} ⊆ B")  # {7, 9} is a subset of B (written as set notation)
print(f"B ⊂ A : {B < A}")              # B is a proper subset of A
print(f"{{7}} ⊂ A : {{7}} ⊂ A")        # {7} is a subset of A (written explicitly)
print(f"4 ∉ C : {4 not in C}")         # 4 is not an element of C
print(f"∅ ⊆ C : {set().issubset(C)}")  # The empty set is a subset of C

#Example 2 (set definitions)

A = {7, 9}
B = {7, 9, 10}

# (⊂)

# Using the < operator
is_proper_subset = A < B  

# Using issubset() with extra condition
is_proper_subset_alt = A.issubset(B) and A != B  

print(f"\nA ⊂ B : {is_proper_subset}")  # Output: True
print(f"A ⊂ B (alternative method) : {is_proper_subset_alt}")  # Output: True

# Check if A is a subset (⊆) of B
is_subset = A <= B  # or A.issubset(B)

print(f"A ⊆ B : {is_subset}")  # Expected Output: True

# Check if an element is in B
element = 9
is_element_of_B = element in B
print(f"{element} ∈ B : {is_element_of_B}")  # Expected Output: True

# Define mathematical sets

from fractions import Fraction
import math
import cmath

# ℕ - Set of all nonnegative integers {0, 1, 2, 3, ...}
def is_natural(n):
    return isinstance(n, int) and n >= 0

# ℤ - Set of all integers {..., -2, -1, 0, 1, 2, ...}
def is_integer(n):
    return isinstance(n, int)

# ℚ - Set of all rational numbers (fractions)
def is_rational(n):
    if isinstance(n, int):
        return True  # Integers are rational
    if isinstance(n, Fraction):
        return True  # Explicit fractions are rational
    if isinstance(n, float):
        try:
            fraction_rep = Fraction(n).limit_denominator(1000000)  # Approximate as fraction
            return fraction_rep.denominator < 10**6 and float(fraction_rep) == n
        except OverflowError:
            return False  # Large denominator → irrational number
    return False  # Complex numbers or non-numeric types


# ℝ - Set of all real numbers (includes rationals & irrationals)
def is_real(n):
    return isinstance(n, (int, float)) and math.isfinite(n)

# ℂ - Set of all complex numbers (includes real + imaginary numbers)
def is_complex(n):
    return isinstance(n, complex) or isinstance(n, (int, float))

# Test cases
test_values = [0, 1, -1, 1.5, math.pi, math.e, math.sqrt(2), cmath.sqrt(-1), 2/3]

for value in test_values:
    print(f"\n{value} ∈ ℕ : {is_natural(value)}")
    print(f"{value} ∈ ℤ : {is_integer(value)}")
    print(f"{value} ∈ ℚ : {is_rational(value)}")
    print(f"{value} ∈ ℝ : {is_real(value)}")
    print(f"{value} ∈ ℂ : {is_complex(value)}")
    print("-" * 20)


from fractions import Fraction
import math

# N: Set of nonnegative integers (including 0)
def is_nonnegative_integer(x):
    return isinstance(x, int) and x >= 0

# Z: Set of all integers
def is_integer(x):
    return isinstance(x, int)

# Q: Set of rational numbers
def is_rational(x):
    return isinstance(x, Fraction)

# R: Set of real numbers
def is_real(x):
    return isinstance(x, (int, float))

# C: Set of complex numbers
def is_complex(x):
    return isinstance(x, complex)

# Example of how these could be used
print(is_nonnegative_integer(5))  # True
print(is_integer(-3))             # True
print(is_rational(math.pi))  # True
print(is_real(3.14))              # True
print(is_complex(3 + 4j))         # True






