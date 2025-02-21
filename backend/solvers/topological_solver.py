# File: topological_solver.py
# Author: Jacob Warren
# Solves: 5.2.9-5.2.14

import table_solver

from util import methods

'''
==========
parameters
==========
table: a table of timed tasks represented by
       a dictionary with keys equal to the task name and with
       data equal to a tuple of the set of prerequisite task 
       names and the time for the task
    - example: {"ADB": ({"1"}, 3), "1": (set(), 4)}
    - restrictions: the prereqs must be pulled from the other tasks
                    in the table, task times must be non-negative, and
                    untimed tables are represented by all 0 time tasks
======
result
======
relation_string: a string of the total relation generated by the table
'''
def solve(table):
    set_list, total_relation = not_string(table)
    
    relation_string = "{"

    for i in range(0, len(total_relation)):
        for j in range(i, len(total_relation)):
            relation_string += f"({set_list[total_relation[i]]}, {set_list[total_relation[j]]}), "

    if total_relation:
        relation_string = relation_string[:-2]

    relation_string += "}"

    return relation_string

def not_string(table):
    set_list, relation = table_solver.not_string(table) 
    set_ = {i for i in range(0, len(set_list))}
    total_relation = []

    relation |= methods.transitive_closure(relation)
    relation |= methods.reflexive_closure(set_, relation)
    
    for i in range(0, len(set_)):
        for m in methods.minimal_elements(set_ - set(total_relation), relation):
            total_relation.append(m)
            break
    
    return set_list, total_relation
