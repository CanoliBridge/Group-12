import { useEffect } from "react";
import diagnosticService from "../services/DiagnosticService";

/*
* Name: useDiagnostics.js
* Author: Parker Clark
* Description: Custom hook to integrate diagnostics tracking into solver pages
*/


export const useDiagnostics = (solverName) => {

    // Enable tracking of solver page access
    useEffect(() => {
        diagnosticService.trackSolverPage(solverName);
    }, [solverName]);

    // Expose tracking functions to frontend components
    return {
        trackResults: (input, result, executionTimeMs) => diagnosticService.trackResults(input, result, executionTimeMs)
    };
};