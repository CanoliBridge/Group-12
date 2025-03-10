import { sendDiagnostics  } from "../api";

/*
* Name: DiagnosticService.js
* Author: Parker Clark
* Description: Service for tracking user interactions with solver pages
*/

class DiagnosticService {
    constructor() {

        // Establish current time as the beginning of user login session
        this.beginSessionTime = new Date();

        // Keep a list of 'interactions' with the solver pages
        this.interactions = [];

        // Track the current solver page
        this.currentSolver = null;

        this.lastSendTime = new Date();

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this._intervalId = setInterval(() => {
            console.log("5-minute interval triggered");
            this.sendData(true);  // This function doesn't exist
        }, 300000);
        
        window.addEventListener('beforeunload', () => {
            console.log("Page unload - sending final data");
            this.sendData(true);  // This function doesn't exist
        });
    }

     // Alias to fix the error
    async sendData(force = false) {
        return this.sendPayload();
    }

    // Add this alias method to fix the error
    async sendDiagnostics() {
        return this.sendPayload();
    }

    // Track solvers that the user is accessing
    trackSolverPage(solverName) {

        console.log("Tracking solver page: ", solverName);
        this.currentSolver = solverName;

        // Push the solver page interaction to the list
        this.interactions.push({
            type: 'SOLVER_ACCESS',
            solver: this.currentSolver,
            timestamp: new Date().toISOString()
        });
    }

    // Track user input on the solver page
    trackUserInput(input, inputType) {

        // If the user is on a solver, log their input
        if (this.currentSolver) {
            this.interactions.push({
                type: 'USER_INPUT',
                solver: this.currentSolver,
                input: input,
                inputType: inputType,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Track results user gets from the solver return
    trackResults(input, result, executionTimeMs) {

        // Push resolution data from solver interaction
        if (this.currentSolver) {
            this.interactions.push({
                type: 'SOLVER_RESULT',
                solver: this.currentSolver,
                input: input,
                hasError: result && result.error !== undefined,
                executionTimeMs: executionTimeMs,
                timestamp: new Date().toISOString()
            });
        }
    }

    

    // Function to send diagnostic payload to the backend
    async sendPayload() {

        // Return early if there are no interactions
        if (this.interactions.length === 0) return;
        
        console.log("Tracking data of length:", this.interactions.length);

        // Create a diagnostic payload to send to the backend
        const payload = {

            // Log duration of session
            duration: new Date() - this.beginSessionTime,
            
            // Log each interaction
            interactions: [...this.interactions],

            // Log user agent ID and current language
            userAgent: navigator.userAgent,
            Language: navigator.language,

            // Generate a timestamp at when the diagnostics are sent
            timestamp: new Date().toISOString()
        };

        try {
            // Send the diagnostics to the backend
            const response = await sendDiagnostics(payload);
            console.log("Diagnostics sent:", response);
            // Empty interactions after a successful retrieval
            if (response && response.status === 200) {
                this.interactions = [];
                this.lastSendTime = new Date();
            }
        } catch (error) {
            console.error('Error sending diagnostics:', error);
        }
    }
}

// Create a singleton instance to manage interactions
const diagnosticService = new DiagnosticService();

export default diagnosticService;