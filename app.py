'''----------------- 
# Title: app.py
# Author: Parker Clark
# Date: 1/26/2025
# Description: Main API endpoint for the application.
-----------------'''

#---Imports---#
from flask import Flask
from flask_cors import CORS
from backend.controller import controller_bp
from backend.diagnostics import diagnostics_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(controller_bp)
app.register_blueprint(diagnostics_bp)

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000, debug = True)
