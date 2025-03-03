'''----------------- 
# Title: controller.py
# Author: Parker Clark
# Date: 1/28/2025
# Description: MA controller to route requests to the appropriate function.
-----------------'''

#---Imports---#
from flask import Blueprint, request, jsonify

#---Imports for the solvers---#
from backend.solvers import wff_solver
from backend.solvers import propositional_solver
from backend.solvers import recursion_solver
from backend.solvers import properties_solver
from backend.solvers import closures_solver
from backend.solvers import equivalence_solver
from backend.solvers import special_solver
from backend.solvers import hasse_solver
<<<<<<< Updated upstream
=======
from backend.solvers import Warshall_solver
from solvers.util import exceptions
>>>>>>> Stashed changes

#---Imports for the reporter---#
from backend.reporter import send_email

# Define a Blueprint for the controller
controller_bp = Blueprint('controller', __name__)

@controller_bp.route('/solve/<solver_type>', methods=['POST'])
def solve(solver_type):
    '''
        An api endpoint to solve a problem and derive the specified algorithm.

        Parameters
        ----------
        solver_type (str): 
            The type of solver to use. Baked in to the api url

        Returns
        ----------
        result: json
            Returned the serialized json of the result and return to the client.
    '''
    try:
        data = request.json
        print(data)
        
        result = solve_algorithim(solver_type, data)
        return(jsonify(result))
    
    # If the solver encounters a defined error, return the error message to the user.
    except Exception as e:
        return jsonify({'Calculation Error': str(e)})


def solve_algorithim(solver_type, data):
    '''
        A function to deduce and call proper solver functions.

        Parameters
        ----------
        solver_type (str): 
            The type of solver to use passed in from solve()
        data (json): 
            The data input to be passed to the solver function

        Returns
        ----------
        result: json
            Returned the serialized json of the result and return to the client.
    '''
    if solver_type == 'wff':
        return wff_solver.solve(data['formula'])
    elif solver_type == 'propositional-logic':
        data = data["hypotheses"]
        return propositional_solver.solve(data['hypotheses'], data['conclusion'])
    elif solver_type == 'recursive-definitions':
        data = data["formula"]
        return recursion_solver.solve(data['formula'], data['baseCase'], data['n'])
    elif solver_type == 'basic-set-functions':
        return hasse_solver.solve(data["set"], data["relation"])
    elif solver_type == 'power-set':
        # Call the appropriate function for power set
        pass
    elif solver_type == 'set-complement':
        # Call the appropriate function for set complement
        pass
    elif solver_type == 'binary-unary-operators':
        # Call the appropriate function for binary and unary operators
        pass
    elif solver_type == 'cartesian-products':
        # Call the appropriate function for cartesian products
        pass
    elif solver_type == 'properties-of-relations':
        return properties_solver.solve(data["set"], data["relation"])
    elif solver_type == 'closure-axioms':
        return closures_solver.solve(data["set"], data["relation"])
    elif solver_type == 'equivalence-relations':
        return equivalence_solver.solve(data["set"], data["relation"])
    elif solver_type == 'partial-orderings':
        return special_solver.solve(data["set"], data["relation"])
    elif solver_type == 'hasse-diagrams':
        return hasse_solver.solve(data["set"], data["relation"])
    elif solver_type == 'critical-paths':
        # Call the appropriate function for Critical Paths
        pass
    elif solver_type == 'pert-diagrams':
        # Call the appropriate function for PERT Diagrams
        pass
    elif solver_type == 'topological-sorting':
        # Call the appropriate function for Topological Sorting
        pass
    elif solver_type == 'permutations-cycle':
        # Call the appropriate function for Permutations of a Cycle
        pass
    elif solver_type == 'compositions':
        # Call the appropriate function for Compositions
        pass
    elif solver_type == 'disjoint-cycles':
        # Call the appropriate function for Disjoint Cycles
        pass
    elif solver_type == 'order-of-magnitude':
        # Call the appropriate function for Order of Magnitude
        pass
    elif solver_type == 'master-theorem':
        # Call the appropriate function for Master Theorem
        pass
    elif solver_type == 'boolean-matrices':
        # Call the appropriate function for Boolean Matrices
        pass
    elif solver_type == 'matrice-operations':
        # Call the appropriate function for Matrice Operations
        pass
    elif solver_type == 'graphs':
        # Call the appropriate function for Graphs
        pass
    elif solver_type == 'adjacency-matrices-lists':
        # Call the appropriate function for Adjacency Matrices and Lists
        pass
    elif solver_type == 'weighted-graphs':
        # Call the appropriate function for Weighted Graphs
        pass
    elif solver_type == 'binary-trees':
        # Call the appropriate function for Binary Trees
        pass
    elif solver_type == 'array-to-tree':
        # Call the appropriate function for Array to Tree
        pass
    elif solver_type == 'tree-to-array':
        # Call the appropriate function for Array to Tree
        pass
    elif solver_type == 'tree-notation':
        # Call the appropriate function for Tree Notation
        pass
    elif solver_type == 'warshalls-algorithm':
        return Warshall_solver.solve(data["input"])
    else:
        return jsonify({'error': 'Unsupported solver type'}), 400

@controller_bp.route('/report-problem', methods=['POST'])
def report_problem():
    '''
        A function that calls the send_email function to send an email 
          to the webmaster with a report of a problem.

        Returns
        ----------
        None
    '''

    # Get the data from the request
    data = request.json

    # Send the email using the send_email function
    successful = send_email.send_email(data['email'], data['issue'])

    # Check if the email was sent successfully
    if successful:
        return jsonify({'message': 'Email sent successfully'}), 200
    else:
        return jsonify({'error': 'Failed to send email'}), 500