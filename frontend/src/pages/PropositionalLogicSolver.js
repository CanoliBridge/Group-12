import React from 'react';
import ReportFooter from '../components/ReportFooter';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solvePropositionalLogic } from '../api';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';


/*
* Name: PropositionalLogicSolver.js
* Author: Parker Clark
* Description: Solver page for the propositional logic solver.
*/

const PropositionalLogicSolver = () => {
  const [hypotheses, setHypotheses] = React.useState('');
  const [conclusion, setConclusion] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("PROPOSITIONAL_LOGIC");

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
          const result = await solvePropositionalLogic({hypotheses, conclusion});
          
          // Track successful execution with timing
          trackResults(
            { hypotheses: hypotheses, conclusion: conclusion }, // Input data
            result,       // Result data
            performance.now() - startTime      // Execution time in ms
          );
          
          setOutput(result);
        } catch (err) {
          // Track failed execution with timing
          trackResults(
            { hypotheses: hypotheses, conclusion: conclusion },
            { error: err.message || 'Unknown error' },
            performance.now() - startTime
          );
          
          setError('An error occurred while solving the WFF.');
        } finally {
          setLoading(false);
        }
      }

  const validateInput = (input) => {
    // Regular expression to validate WFF general form, including operators, NOT, parentheses, and brackets.
    // Regex accomodates for symbols used in unicode, keyboard and book format. To see a mapping of this check /backend/solvers/wff_solver.py
    const wffRegex = /^(\(*\[*\s*(not\s*)?[A-Z]('|′|¬)?\s*\]*\)*(\s*(->|→|v|∨|V|~|S|`|\^|∧|>)\s*\(*\[*\s*(not\s*)?[A-Z]('|′|¬)?\s*\]*\)*\)*)*)+|\(\s*.*\s*\)('|′|¬)?|\[\s*.*\s*\]('|′|¬)?$/;
  
    // Check for balanced parentheses and brackets
    const balancedParentheses = (input.match(/\(/g) || []).length === (input.match(/\)/g) || []).length;
    const balancedBrackets = (input.match(/\[/g) || []).length === (input.match(/\]/g) || []).length;
  
    // Check for at least one operator in the input
    const containsOperator = /->|→|v|∨|V|~|S|`|>|\^|∧|not|¬|′/.test(input);
  
    // Reject single pair of parentheses or brackets. Backend doesn't handle input like: (A V B), but does support A V B
    const singlePairParentheses = /^\([^()]*\)$/.test(input);
    const singlePairBrackets = /^\[[^\[\]]*\]$/.test(input);
  
    // Allow single negated variables like ¬A, A', and not A
    const singleNegatedVariable = /^(not\s*)?[A-Z]('|′|¬)?$/.test(input);
  
    // Allow negated expressions with parentheses or brackets like (A V B)' or [A V B]'
    const negatedExpressionWithParentheses = /^\(\s*.*\s*\)('|′|¬)?$/.test(input);
    const negatedExpressionWithBrackets = /^\[\s*.*\s*\]('|′|¬)?$/.test(input);
  
    return (wffRegex.test(input) && balancedParentheses && balancedBrackets && containsOperator && !singlePairParentheses && !singlePairBrackets) || singleNegatedVariable || negatedExpressionWithParentheses || negatedExpressionWithBrackets;
  };

  return (
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <PageContent align="center" skeleton={false}>
        <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '10px', background: 'white', borderRadius: '8px' }}>
          <HomeButton />
        </Box>
        <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
          <Text size="xxlarge" weight="bold">
            Propositional Logic Validator
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Propositional Logic
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width={'large'}>
          <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze propositional logic statements and their truth values
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Propositional logic is a branch of logic that deals with statements that can be either true or false. These statements are combined using logical operators such as AND, OR, NOT, and IMPLIES to form more complex expressions. By evaluating these expressions, we can determine their validity, consistency, and logical relationships.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            A truth table systematically lists all possible truth values of a logical expression based on its components. This helps in verifying logical equivalences, identifying contradictions, and understanding how different logical statements interact.
          </Text>
          <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your propositional logic hypotheses and conclusion below to generate its validity.
          </Text>
        </Box>
        <Card width="large" pad="medium" background={{"color":"light-1"}}>
          <CardBody pad="small">
            <Box margin={{bottom : "small" }}>
              <TextInput 
                placeholder="Example: Enter your hypotheses here (e.g., A > B)"
                value={hypotheses}
                onChange={(event) => setHypotheses(event.target.value)}
              />
            </Box>
            <Box margin={{top : "small" }}>
              <TextInput 
                placeholder="Example: Enter your conclusion here (e.g., B)"
                value={conclusion}
                onChange={(event) => setConclusion(event.target.value)}
              />
            </Box>
            {error && <Text color="status-critical">{error}</Text>}
          </CardBody>
          <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
            <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
          </CardFooter>
        </Card>
        <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
          <CardBody pad="small">
            <Text weight="bold">
              Output:
            </Text>
            <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {output ? output: "Output will be displayed here!"}
              </Text>
            </Box>
          </CardBody>
        </Card>
        <ReportFooter />
      </PageContent>
      </Box>
    </Page>
  );
};

export default PropositionalLogicSolver;