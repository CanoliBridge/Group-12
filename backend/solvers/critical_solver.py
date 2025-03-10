# File: critical_solver.py
# Author: Jacob Warren
# Solves: 5.2.5 and 5.2.6

import json
import os
import sys

# Append the parent directory to the path so we can import in utility
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from solvers import topological_solver

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
critical_string: a string that is a comma-separated list of the
                 of the ciritcal path, in order
minimum_time: the time it takes for the critical path
'''
def solve(table):
    if not table:
        return "", 0

    latest_finish = {}

    set_list, sorted_tasks = topological_solver.not_string(table)

    for task in sorted_tasks:
        latest_finish[task] = table[set_list[task]][1]

        for prereq in table[set_list[task]][0]:
            latest_finish[task] = max(latest_finish[set_list.index(prereq)] + table[set_list[task]][1], latest_finish[task])
    
    task = sorted_tasks[-1]
    critical_path = [task]
    time = latest_finish[task] - table[set_list[task]][1]

    while time > 0:
        for prereq in table[set_list[task]][0]:
            if latest_finish[task] - table[set_list[task]][1] == latest_finish[set_list.index(prereq)]:
                critical_path.append(set_list.index(prereq))
                time -= table[prereq][1]
                task = set_list.index(prereq)
                break

    critical_path = list(reversed(critical_path))

    critical_string = ""

    for task in critical_path:
        critical_string += f"{set_list[task]}, "

    if critical_path:
        critical_string = critical_string[:-2]

    minimum_time = latest_finish[sorted_tasks[-1]]

    # json stuff
    result = {
        "Critical Path": critical_string,
        "Minimum Time": minimum_time
    }

    return json.dumps(result)
