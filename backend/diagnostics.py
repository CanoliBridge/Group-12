'''----------------- 
# Title: diagnostics.py
# Author: Parker Clark
# Date: 3/5/2025
# Description: Blueprint for the diagnostics endpoints.
-----------------'''

#---Imports---#
from flask import Blueprint, request, jsonify
from datetime import datetime
import os 
import json

# Init the blueprint
diagnostics_bp = Blueprint('diagnostics', __name__)

# Create a logs directory if its not there
LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../logs/diagnostics')
os.makedirs(LOGS_DIR, exist_ok=True)

print(LOGS_DIR)

@diagnostics_bp.route('/diagnostics', methods=['POST'])
def receive_diagnostics():
    '''
        An api endpoint to store/send diagnositcs.

        Parameters
        ----------
        None

        Returns
        ----------
        result: json
            Reesponse of if the call was successful or not.
    '''

    try:
        # Extract diagnostic payload
        diagnostic_data = request.json

        # Generate a unique filename w/ timestamp and add it to log path
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        filename = f"log_{timestamp}.json"
        filepath = os.path.join(LOGS_DIR, filename)

        print(filepath)

        # TODO: Good place to call DB API to store diagnostics before dump to log file

        with open(filepath, 'w') as file:
            json.dump(diagnostic_data, file, indent=2)
        
        return jsonify({"status": "Diagnostics Received"})

    except Exception as e:
        print(f"Error processing diagnostics: {str(e)}")
        return jsonify({"status": "Diagnostic Error", "message": str(e)}), 500