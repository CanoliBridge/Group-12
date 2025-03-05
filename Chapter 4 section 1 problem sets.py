print("Chapter 4.1 Problems: First Set (11-16)\n\n")

import math
import re

def replace_nested_sets(input_str):
    """
    Replaces all occurrences of {{...}} with frozenset({...}) to allow nested sets.
    """
    pattern = r"\{\{(.*?)\}\}"
    while re.search(pattern, input_str):  # Continue replacing until all are converted
        input_str = re.sub(pattern, r"frozenset({\1})", input_str)
    return input_str

def parse_set(input_str):
    """
    Parses user input into a Python set, converting nested sets into frozensets automatically.
    """
    try:
        # Replace 'π' or 'pi' with 'pi' (math is already available in eval's namespace)
        input_str = input_str.replace("π", "pi").replace("pi", "pi")

        # Convert {{...}} to frozenset({...})
        input_str = replace_nested_sets(input_str)

        # Replace set syntax {} with frozenset({...}) to avoid unhashable set error
        input_str = input_str.replace("{", "frozenset({").replace("}", "})")

        # Now safely evaluate using eval
        # Restrict eval to only allow math and frozenset, disallowing other functions or dangerous calls
        parsed = eval(input_str, {"__builtins__": None, "math": math, "frozenset": frozenset, "pi": math.pi})

        # Ensure all nested sets are frozensets (backup check)
        if isinstance(parsed, set):
            parsed = frozenset(parsed)  # Convert top-level set into a frozenset

        return parsed
    except Exception as e:
        print(f"Error parsing set: {e}")
        return frozenset()  # Return an empty frozenset if there is an error

def check_subset(A, B):
    """Check if A is a subset of B (A ⊆ B)."""
    return A.issubset(B)

def check_proper_subset(A, B):
    """Check if A is a proper subset of B (A ⊂ B)."""
    return A < B

def check_element(x, A):
    """Check if x is an element of A (x ∈ A)."""
    return x in A

# Dictionary to store user-defined sets
sets = {}

# User enters sets
while True:
    name = input("Enter a name for the set (or type 'done' to stop adding sets): ").strip()

    # Prevent empty input
    if not name:
        print("Set name cannot be empty. Please enter a valid name.")
        continue

    if name.lower() == "done":
        break

    # Prevent duplicate set names
    if name in sets:
        print(f"Set '{name}' already exists. Choose a different name.")
        continue

    set_input = input(f"Enter elements for {name} (e.g., {{1, 2, 3}} or {{ {1, 3, 'pi'}, 1 }}): ").strip()

    # Prevent empty set inputs
    if not set_input:
        print("Set cannot be empty. Please enter a valid set.")
        continue

    sets[name] = parse_set(set_input)

# Display entered sets
print("\nDefined Sets:")
for name, value in sets.items():
    print(f"{name} = {value}")

# User enters statements to evaluate
statements = []
while True:
    expr = input("\nEnter a statement to check (e.g., 'A ⊆ B' or '1 ∈ A') or type 'done' to finish: ").strip()
    if expr.lower() == "done":
        break

    try:
        if "⊆" in expr:
            A, B = expr.split("⊆")
            A, B = A.strip(), B.strip()
            if A in sets and B in sets:
                result = check_subset(sets[A], sets[B])
            else:
                print("One of the sets does not exist.")
                continue
        
        elif "⊂" in expr:
            A, B = expr.split("⊂")
            A, B = A.strip(), B.strip()
            if A in sets and B in sets:
                result = check_proper_subset(sets[A], sets[B])
            else:
                print("One of the sets does not exist.")
                continue
        
        elif "∈" in expr:
            x, A = expr.split("∈")
            x, A = x.strip(), A.strip()
            if A in sets:
                result = check_element(eval(x, {"__builtins__": None, "math": math, "frozenset": frozenset, "pi": math.pi}), sets[A])
            else:
                print("Set does not exist.")
                continue
        
        else:
            print("Invalid format. Use 'A ⊆ B', 'A ⊂ B', or 'x ∈ A'.")
            continue
        
        statements.append((expr, result))
    
    except Exception as e:
        print(f"Error evaluating statement: {e}")

# Display results
print("\nResults:")
for statement, result in statements:
    print(f"{statement}: {'True' if result else 'False'}")
