import math
import re

def replace_nested_sets(input_str):
    pattern = r"\{\{(.*?)\}\}"
    while re.search(pattern, input_str):
        input_str = re.sub(pattern, r"frozenset({\1})", input_str)
    return input_str

def parse_set(input_str):
    try:
        input_str = input_str.replace("π", "pi").replace("pi", "math.pi")
        input_str = replace_nested_sets(input_str)
        input_str = input_str.replace("{", "frozenset({").replace("}", "})")
        parsed = eval(input_str, {"__builtins__": None, "math": math, "frozenset": frozenset})
        if isinstance(parsed, set):
            parsed = frozenset(parsed)
        return parsed
    except Exception as e:
        print(f"Error parsing set: {e}")
        return frozenset()

def check_subset(A, B):
    # if A.isdigit():
    #     return False
    return A.issubset(B)

def check_proper_subset(A, B):
    return A < B

def check_element(x, A):
    return x in A

def check_equality(A, B):
    return A == B

def check_union(A, B):
    if isinstance(A, frozenset) and len(A) == 0:  # If A is empty
        return B
    if isinstance(B, frozenset) and len(B) == 0:  # If B is empty
        return A
    return A | B  # Regular union operation

def check_intersection(A, B):
    if isinstance(A, frozenset) and len(A) == 0:  # If A is empty
        return frozenset()
    if isinstance(B, frozenset) and len(B) == 0:  # If B is empty
        return frozenset()
    return A & B  # Regular intersection operation

def check_difference(A, B):
    if isinstance(A, frozenset) and len(A) == 0:  # If A is empty
        return frozenset()
    if isinstance(B, frozenset) and len(B) == 0:  # If B is empty
        return A  # A - ∅ should return A
    return A - B  # Regular difference operation


def check_cartesian_product(A, B):
    return frozenset((a, b) for a in A for b in B)

sets = {}
while True:
    
    name = input("Enter a name for the set (or type 'done' to stop adding sets): ").strip()
    if not name:
        print("Set name cannot be empty.")
        continue
    if name.lower() == "done":
        break
    if name in sets:
        print(f"Set '{name}' already exists.")
        continue
    set_input = input(f"Enter elements for {name} A (e.g., {{1, 2, 3}} or {{ {1, 3, 'pi'}, 1 }})): ").strip()
    if not set_input:
        print("Set cannot be empty.")
        continue
    sets[name] = parse_set(set_input)

print("\nDefined Sets:")
for name, value in sets.items():
    print(f"{name} = {value}")

statements = []
while True:
    expr = input("\nEnter a statement to check or type 'done' to finish: ").strip()
    if expr.lower() == "done":
        break
    try:
        if "⊆" in expr:
            A, B = expr.split("⊆")
            A, B = A.strip(), B.strip()

            # Troubleshooting Errors
            # print(f"Checking before: {A} ⊆ {B}")  # See what is being checked
            # print(f"A (type: {type(A)}):", A)
            # print(f"B (type: {type(B)}):", B)

            # Handle the empty set (∅)

            
            
            if A.isdigit():
                result = False  # A single number cannot be a subset of a set
                statements.append((expr, result)) # I need to do this every time
                continue
                
            # # Troubleshooting Errors
            # # **New Fix: Parse inline sets**
            if A.startswith("{") and A.endswith("}"):  
                A = parse_set(A)  # Convert inline set string to frozenset
            elif A in sets:
                A = sets[A]  # Fetch predefined set

            if B.startswith("{") and B.endswith("}"):  
                B = parse_set(B)  # Convert inline set string to frozenset
            elif B in sets:
                B = sets[B]  # Fetch predefined set
            
            if A == "∅":
                A = frozenset()
            if B == "∅":
                B = frozenset()
            # Debugging print statements
            # Troubleshooting Errors
            # print(f"Checking: {A} ⊆ {B}")  
            # print(f"A (type: {type(A)}):", A)
            # print(f"B (type: {type(B)}):", B)

            # If A is a single number, it's not a set, so return False instead of an error
            
            if A in sets and B in sets:
                result = check_subset(A, B)
            elif isinstance(A, frozenset) or isinstance(B, frozenset):  
                result = check_subset(A, B)
            # elif A.isdigit():
            #     result = False
            else:
                print("One of the sets does not exist.")
                continue
        elif "⊂" in expr:
            A, B = expr.split("⊂")
            A, B = A.strip(), B.strip()

            if A.isdigit():
                result = False  # A single number cannot be a subset of a set
                statements.append((expr, result)) # I need to do this every time
                continue
            
            # # **New Fix: Parse inline sets**
            if A.startswith("{") and A.endswith("}"):  
                A = parse_set(A)  # Convert inline set string to frozenset
            elif A in sets:
                A = sets[A]  # Fetch predefined set

            if B.startswith("{") and B.endswith("}"):  
                B = parse_set(B)  # Convert inline set string to frozenset
            elif B in sets:
                B = sets[B]  # Fetch predefined set
            #Handle the empty set (∅)
            
            if A == "∅":
                A = frozenset()
            if B == "∅":
                B = frozenset()
                
            elif A in sets and B in sets:
                result = check_proper_subset(sets[A], sets[B])
            elif isinstance(A, frozenset) or isinstance(B, frozenset):  
                result = check_proper_subset(A, B)
            else:
                print("One of the sets does not exist.")
                continue
        elif "∈" in expr:
            x, A = expr.split("∈")
            x, A = x.strip(), A.strip()

            # Replace '∅' with an actual empty frozenset()
            if x == "∅":
                x = frozenset()
            else:
                try:
                    x = eval(x, {"__builtins__": None, "math": math, "frozenset": frozenset, "pi": math.pi})
                except Exception as e:
                    print(f"Error evaluating statement: {e}")
                    continue
            if A == "∅":
                A = frozenset()
            # **New Fix: Parse inline sets**
            # if x.startswith("{") and x.endswith("}"):  
            #     x = parse_set(x)  # Convert inline set string to frozenset
            # elif x in sets:
            #     x = sets[x]  # Fetch predefined set

            # if A.startswith("{") and A.endswith("}"):  
            #     A = parse_set(A)  # Convert inline set string to frozenset
            # elif A in sets:
            #     A = sets[A]  # Fetch predefined set
            
            # Continuing with exaluation
            if A in sets:
                result = check_element(x, sets[A])
            else:
                print("Set does not exist.")
                continue
        elif "=" in expr:
            A, B = expr.split("=")
            A, B = A.strip(), B.strip()

            # Handle empty set (∅)
            if A == "∅":
                A = frozenset()
            if B == "∅":
                B = frozenset()
            
            # **New Fix: Parse inline sets**
            if A.startswith("{") and A.endswith("}"):  
                A = parse_set(A)  # Convert inline set string to frozenset
            elif A in sets:
                A = sets[A]  # Fetch predefined set

            if B.startswith("{") and B.endswith("}"):  
                B = parse_set(B)  # Convert inline set string to frozenset
            elif B in sets:
                B = sets[B]  # Fetch predefined set
            
            # Continuing with exaluation
            if A in sets and B in sets:
                result = check_equality(sets[A], sets[B])
            elif isinstance(A, frozenset) or isinstance(B, frozenset):
                result = check_equality(A, B)
            else:
                print("One of the sets does not exist.")
                continue

        elif "∪" in expr:
            A, B = expr.split("∪")
            A, B = A.strip(), B.strip()

            if A == "∅":
                A = frozenset()
            if B == "∅":
                B = frozenset()

            # **New Fix: Parse inline sets**
            if A.startswith("{") and A.endswith("}"):  
                A = parse_set(A)  # Convert inline set string to frozenset
            elif A in sets:
                A = sets[A]  # Fetch predefined set

            if B.startswith("{") and B.endswith("}"):  
                B = parse_set(B)  # Convert inline set string to frozenset
            elif B in sets:
                B = sets[B]  # Fetch predefined set
            
            # Continuing with exaluation
            if A in sets and B in sets:
                result = check_union(sets[A], sets[B])
            elif isinstance(A, frozenset) or isinstance(B, frozenset):
                result = check_union(A, B)
            else:
                print("One of the sets does not exist.")
                continue

        elif "∩" in expr:
            A, B = expr.split("∩")
            A, B = A.strip(), B.strip()

            if A == "∅":
                A = frozenset()
            if B == "∅":
                B = frozenset()
            
            # **New Fix: Parse inline sets**
            if A.startswith("{") and A.endswith("}"):  
                A = parse_set(A)  # Convert inline set string to frozenset
            elif A in sets:
                A = sets[A]  # Fetch predefined set

            if B.startswith("{") and B.endswith("}"):  
                B = parse_set(B)  # Convert inline set string to frozenset
            elif B in sets:
                B = sets[B]  # Fetch predefined set
            
            # Continuing with exaluation
            if A in sets and B in sets:
                result = check_intersection(sets[A], sets[B])
            elif isinstance(A, frozenset) or isinstance(B, frozenset):
                result = check_intersection(A, B)
            else:
                print("One of the sets does not exist.")
                continue

        elif "-" in expr:
            A, B = expr.split("-")
            A, B = A.strip(), B.strip()

            if A == "∅":
                A = frozenset()
            if B == "∅":
                B = frozenset()

            # **New Fix: Parse inline sets**
            if A.startswith("{") and A.endswith("}"):  
                A = parse_set(A)  # Convert inline set string to frozenset
            elif A in sets:
                A = sets[A]  # Fetch predefined set

            if B.startswith("{") and B.endswith("}"):  
                B = parse_set(B)  # Convert inline set string to frozenset
            elif B in sets:
                B = sets[B]  # Fetch predefined set
            
            # Continuing with exaluation
            if A in sets and B in sets:
                result = check_difference(sets[A], sets[B])
            elif isinstance(A, frozenset) or isinstance(B, frozenset):
                result = check_difference(A, B)
            else:
                print("One of the sets does not exist.")
                continue

        elif "×" in expr:
            A, B = expr.split("×")
            A, B = A.strip(), B.strip()

            if A == "∅":
                A = frozenset()
            if B == "∅":
                B = frozenset()

            # **New Fix: Parse inline sets**
            if A.startswith("{") and A.endswith("}"):  
                A = parse_set(A)  # Convert inline set string to frozenset
            elif A in sets:
                A = sets[A]  # Fetch predefined set

            if B.startswith("{") and B.endswith("}"):  
                B = parse_set(B)  # Convert inline set string to frozenset
            elif B in sets:
                B = sets[B]  # Fetch predefined set
            
            # Continuing with exaluation
            if A in sets and B in sets:
                result = check_cartesian_product(sets[A], sets[B])
            elif isinstance(A, frozenset) or isinstance(B, frozenset):
                result = check_cartesian_product(A, B)
            else:
                print("One of the sets does not exist.")
                continue

        else:
            print("Invalid format. Use 'A ⊆ B', 'A ⊂ B', 'x ∈ A', 'A = B', 'A ∪ B', 'A ∩ B', 'A - B', or 'A × B'.")
            continue
        statements.append((expr, result))
    except Exception as e:
        print(f"Error evaluating statement: {e}")


print("\nResults:")
for statement, result in statements:
    print(f"{statement}: {result}")
