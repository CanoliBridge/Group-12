# File: table_solver.py
# Author: Jacob Warren
# Solves: 5.2.3 and 5.2.4

import json
import os
import sys

# Append the parent directory to the path so we can import in utility
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from solvers.util import exceptions

'''
==========
parameters
==========
table: a table of timed tasks represented by
       a dictionary with keys equal to the task name and with
       data equal to a tuple of the set of prerequisite task 
       names and the time for the task
    - example: {"ADB": ({"1"}, 3), "1": ({}, 4)}
    - restrictions: the prereqs must be pulled from the other tasks
                    in the table, task times must be non-negative, and
                    untimed tables are represented by having all 0-time tasks
======
result
======
relation_string: a string of the relation representing the table
'''
def solve(table):
    print(f"Table: {table}")
    set_list, relation = not_string(table)
    
    relation_string = "{"

    for pair in relation:
        relation_string += f"({set_list[pair[0]]}, {set_list[pair[1]]}), "

    if relation:
        relation_string = relation_string[:-2]

    relation_string += "}"
    
    # json stuff
    result = {
        "Relation": relation_string 
    }

    return json.dumps(result)

def not_string(table):
    set_list = list(table.keys())
    relation = set()

    for task in table:
        if table[task][1] < 0:
            raise exceptions.CalculateError(f"{task} has a negative time.")

        for prereq in table[task][0]:
            if prereq == task:
                raise exceptions.CalculateError(f"{task} can not be its own prereq.")
            
            try:
                relation.add((set_list.index(prereq), set_list.index(task)))
            except ValueError:
                raise exceptions.CalculateError(f"{task} has a non-existent prereq.")

    return set_list, relation
