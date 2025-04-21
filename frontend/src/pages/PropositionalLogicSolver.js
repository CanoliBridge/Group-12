import React, { useState } from 'react';
import { CheckBox, Button, Box, Text, TextInput } from 'grommet';
import PropositionalLogicOperationsTable from '../components/PropositionalLogicOperationsTable';
import { solvePropositionalLogic } from '../api';
import { useDiagnostics } from '../hooks/useDiagnostics';
import SolverPage from '../components/SolverPage';


/*
* Name: PropositionalLogicSolver.js
* Author: Parker Clark and Mathias Buchanan
* Description: Solver page for the propositional logic solver.
*/

const PropositionalLogicSolver = () => {
  const [isCaveman, setIsCaveman] = useState(false);
  const [hypotheses, setHypotheses] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [output, setOutput] = React.useState('');
  const [outputSymbol, setOutputSymbol] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const { trackResults } = useDiagnostics("PROPOSITIONAL_LOGIC");

  const SAMPLE_HYPOTHESES = "A → B ^ A";
  const SAMPLE_CONCLUSION = "B";
  
  const fillWithSample = () => {
    setHypotheses(SAMPLE_HYPOTHESES);
    setConclusion(SAMPLE_CONCLUSION);
  };

  const fillWithSampleTwo = () => {
    setHypotheses("A -> B ^ B → C")
    setConclusion("A > C")
  };

  const fillWithSampleThree = () => {
    setHypotheses("(C > D) > C")
    setConclusion("(C > D) > D")
  };

  const fillWithSampleFour = () => {
    setHypotheses("A > B ^ A ^ C")
    setConclusion("B")
  };

  const Info = () => {
    return (
      <>
        <Text weight="bold" margin={{ bottom: "xsmall" }}>
          Propositional Logic Syntax:
        </Text>
        <Text margin={{ bottom: "small" }}>
          Enter your hypotheses and conclusion in the appropriate fields.
        </Text>
        <Text margin={{ bottom: "small" }}>
          Use the following operators for logical expressions:
        </Text>
        <PropositionalLogicOperationsTable />
        <Text margin={{ top: "small" }}>
          Ensure that tokens and operators are delimited by spaces or parentheses.
        </Text>
        
        <Box margin={{ top: 'medium' }} align="center">
          <Button 
            label="Fill with Sample" 
            onClick={fillWithSample} 
            primary 
            onMouseDown={(e) => e.preventDefault()}
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with implies Sample" 
            onClick={fillWithSampleTwo} 
            primary 
            onMouseDown={(e) => e.preventDefault()}
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with special implies Sample" 
            onClick={fillWithSampleThree} 
            primary 
            onMouseDown={(e) => e.preventDefault()}
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with unused hypotheses Sample" 
            onClick={fillWithSampleFour} 
            primary 
            onMouseDown={(e) => e.preventDefault()}
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
        </Box>
      </>
    );
  };

  // Update the Input component:

  const Input = () => {
    return (
      <Box>
        <Box margin={{ bottom: "small" }}>
          <TextInput 
            placeholder="Example: Enter your hypotheses here (e.g., A → B ^ A)"
            value={hypotheses}
            onChange={(event) => setHypotheses(event.target.value)}
          />
        </Box>
        <Box margin={{ top: "small" }} direction="row" align="center">
          <Text margin={{ right: "small" }}>→</Text>
          <TextInput
            placeholder="Example: Enter your conclusion here (e.g., B)"
            value={conclusion}
            onChange={(event) => setConclusion(event.target.value)}
          />
        </Box>
      </Box>
    );
  };

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate input
    const isValidHypotheses = validateInput(hypotheses);
    const isValidConclusion = validateInput(conclusion);

    if (!isValidHypotheses || !isValidConclusion) {
      setError('Invalid input. Please enter a valid propositional logic statement.');
      setLoading(false);
      return;
    }

    setError('');
    const startTime = performance.now();
        
    try {
      const result = await solvePropositionalLogic({ hypotheses, conclusion });
      const parsedResult = JSON.parse(result); // Ensure it's properly parsed
    
      // Set output to the "String" entry
      setOutput(parsedResult.String || "No output available");
      setOutputSymbol(parsedResult.Symbol || "No output available");
    
      // Track successful execution with timing
      trackResults(
        { hypotheses, conclusion }, 
        {String: parsedResult.String, Symbol: parsedResult.Symbol },
        performance.now() - startTime
      );
    } catch (err) {
      // Handle errors
      trackResults(
        { hypotheses, conclusion },
        { error: err.message || 'Unknown error' },
        performance.now() - startTime
      );
    
      setError('An error occurred while solving the WFF.');
    } finally {
          setLoading(false);
        }
      }

  const betterText = [
    "Propositional logic is a branch of logic that determines whether a tautology is valid based on its premises. For example, consider the statement: \"If the grass is green, then the sky is blue. The grass is green, therefore, the sky is blue.\" This is a tautology. Typically, tautologies are expressed using logical variables, such as [(A → B) ∧ A] → B. However, not every logical statement is a tautology. To be a tautology, the premises must logically guarantee the conclusion. For instance, the statement: \"If I have a hat, then it is green. I have a TV, therefore, my house is blue.\" is not a tautology, as the conclusion does not logically follow from the premises.",
    "Propositional logic verifies whether given premises logically lead to a conclusion.",
    "Enter a tautology below to see a step-by-step proof."
  ];
  
  const cavemanText = [
    "Logic good. Logic check if big smart statement always true. Example: \"If grass green, then sky blue. Grass green. So, sky blue.\" That always true. That tautology. Smart people use letters to show tautology, like [(A → B) ∧ A] → B. But not all statement tautology. Must make sense. Example bad: \"If I have hat, hat is green. I have TV. So, house is blue.\" That not make sense. Not tautology.",
    "Logic check if words make sense. Put tautology below. See proof!",
    "Tool show fancy proof with steps so you understand tautology. Get smart!"
  ];

  const validateInput = (input) => {
    // Regular expression to validate WFF general form, excluding V and S as variables.
    const wffRegex = /^(\(*\[*\s*(not\s*)?(?![vS])[A-IK-UVWYZ]('|′|¬)?\s*\]*\)*(\s*(->|→|v|∨|~|`|\^|∧|>)\s*\(*\[*\s*(not\s*)?(?![vS])[A-IK-UVWYZ]('|′|¬)?\s*\]*\)*\)*)*)+|\(\s*.*\s*\)('|′|¬)?|\[\s*.*\s*\]('|′|¬)?$/;
  
    // Check for balanced parentheses and brackets
    const balancedParentheses = (input.match(/\(/g) || []).length === (input.match(/\)/g) || []).length;
    const balancedBrackets = (input.match(/\[/g) || []).length === (input.match(/\]/g) || []).length;
  
    // Check for at least one operator in the input
    const containsOperator = /->|→|v|∨|~|`|>|\^|∧|not|¬|′/.test(input);
  
    // Reject single pair of parentheses or brackets
    const singlePairParentheses = /^\([^()]*\)$/.test(input);
    const singlePairBrackets = /^\[[^[\]]*\]$/.test(input);
  
    // Allow single negated variables excluding V, v, and S
    const singleNegatedVariable = /^(not\s*)?(?![VvS])[A-IK-UWYZ]('|′|¬)?$/.test(input);
  
    // Allow negated expressions with parentheses or brackets
    const negatedExpressionWithParentheses = /^\(\s*.*\s*\)('|′|¬)?$/.test(input);
    const negatedExpressionWithBrackets = /^\[\s*.*\s*\]('|′|¬)?$/.test(input);
  
    return (wffRegex.test(input) && balancedParentheses && balancedBrackets && containsOperator && 
            !singlePairParentheses && !singlePairBrackets) || 
            singleNegatedVariable || negatedExpressionWithParentheses || negatedExpressionWithBrackets;

  
};

  const toggleCaveman = () => {
    setIsCaveman(!isCaveman);
  };

  const renderOutput = () => {
    return (
      <Box>
        <Box direction="row" align="center" margin={{ bottom: "small" }}>
          <CheckBox
            label="Use words instead of symbols"
            checked={showOutput}
            onChange={(event) => setShowOutput(event.target.checked)}
          />
        </Box>
        <Text style={{ whiteSpace: 'pre-wrap' }}>
          {output ? (showOutput ? output : outputSymbol) : "Output will be displayed here!"}
        </Text>
      </Box>
    );
  };


  return (
    <SolverPage
    title="Propositional Logic Validator"
    topic="Statement And Tautologies"
    description="This tool demonstrates the steps used to prove a tautology."
    paragraphs={isCaveman ? cavemanText : betterText}
    InfoText={Info}
    InputComponent={Input}
    input_props={null}
    error={error}
    handle_solve={handleSolve}
    loading={loading}
    render_output={renderOutput}
    topRightButton={toggleCaveman}
  />
  );
};

export default PropositionalLogicSolver;
