# Running the initial implementation with the provided example data

# Define the quantifier functions
def forall(collection, predicate):
    return all(predicate(x) for x in collection)

def exists(collection, predicate):
    return any(predicate(x) for x in collection)

def exists_unique(collection, predicate):
    return sum(1 for x in collection if predicate(x)) == 1

def not_exists(collection, predicate):
    return not any(predicate(x) for x in collection)

def forall_implies_exists(collection_x, collection_y, condition):
    return all(any(condition(x, y) for y in collection_y) for x in collection_x)

def exists_implies_forall(collection_x, collection_y, condition):
    return any(all(condition(x, y) for y in collection_y) for x in collection_x)

def exists_exactly_one(collection, predicate):
    return sum(1 for x in collection if predicate(x)) == 1

def forall_exists_exactly_one(collection_x, collection_y, condition):
    return all(sum(1 for y in collection_y if condition(x, y)) == 1 for x in collection_x)

# Example inputs
numbers = [1, 2, 3, 4, 5]
other_numbers = [10, 20, 30, 40, 50]

# Test cases
results = {
    "forall(numbers > 0)": forall(numbers, lambda x: x > 0),
    "exists(numbers % 2 == 0)": exists(numbers, lambda x: x % 2 == 0),
    "exists_unique(numbers == 3)": exists_unique(numbers, lambda x: x == 3),
    "not_exists(numbers < 0)": not_exists(numbers, lambda x: x < 0),
    "forall_implies_exists(numbers, other_numbers, x + y == 11)": forall_implies_exists(numbers, other_numbers, lambda x, y: x + y == 11),
    "exists_implies_forall(numbers, other_numbers, x + y > 10)": exists_implies_forall(numbers, other_numbers, lambda x, y: x + y > 10),
    "exists_exactly_one(numbers > 4)": exists_exactly_one(numbers, lambda x: x > 4),
    "forall_exists_exactly_one(numbers, other_numbers, x + y == 11)": forall_exists_exactly_one(numbers, other_numbers, lambda x, y: x + y == 11)
}

results

for expression, result in results.items():
    print(f"{expression}: {result}")


# Negation (¬)
def negation(p):
    return not p

# Conjunction (∧)
def conjunction(p, q):
    return p and q

# Disjunction (∨)
def disjunction(p, q):
    return p or q

# Implication (→)
def implication(p, q):
    return not p or q  # equivalent to "if p then q"

# Equivalence (↔)
def if_and_only_if(p, q):
    return p == q  # p and q must both be either True or False

# New binary logical connectives

# NAND (↑)
def nand(p, q):
    return not (p and q)  # P ↑ Q ≡ ¬(P ∧ Q)

# NOR (↓)
def nor(p, q):
    return not (p or q)  # P ↓ Q ≡ ¬(P ∨ Q)

# Converse Implication (←)
def converse_implication(p, q):
    return not q or p  # P ← Q ≡ ¬Q ∨ P (if Q, then P)

# Biconditional (↔)
def biconditional(p, q):
    return (not p or q) and (not q or p)  # P ↔ Q ≡ (P → Q) ∧ (P ← Q)

p = True
q = False

# Test cases
results = {
    "(¬) negation(p)": negation(p),
    "(∧) conjunction(p, q)": conjunction(p, q),
    "(∨) disjunction(p, q)": disjunction(p, q),
    "(→) implication(p, q)": implication(p, q),
    "(↔) if_and_only_if(p, q)": if_and_only_if(p, q),
    "nand(p, q)": nand(p, q),
    "nor(p, q)": nor(p, q),
    "converse_implication(p, q)": converse_implication(p, q),
    "biconditional(p, q)": biconditional(p, q),
    "\nrandom example: disjunction(p, q) or implication(p, q)": (disjunction(p, q) or implication(p, q))
}

print("\n\n")
for expression, result in results.items():
    print(f"{expression}: {result}")

