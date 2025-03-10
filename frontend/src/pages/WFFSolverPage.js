import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Collapsible} from 'grommet';
import { CircleInformation } from 'grommet-icons';
import { solveWFF } from '../api';
import ReportFooter from '../components/ReportFooter';
import TruthTable from '../components/TruthTable';
import Background from '../components/Background';
import WFFOperationsTable from '../components/WFFOperationExample';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: WFFSolverPage.js
* Author: Parker Clark
* Description: Solver page for the WFF to Truth Table.
*/

const WFFSolverPage = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  // Initialize diagnostic hook
  const { trackResults } = useDiagnostics("WFF_SOLVER");

  // Wrap input to enable diagnostic tracking
  const handleInput = (event) => {
    const newInput = event.target.value;
    setInput(newInput);
  }

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput(null);
    setError('');

    // Validate input
    const isValid = validateInput(input);
    if (!isValid) {
      setError('Invalid input. Please enter a valid logical statement.');
      setLoading(false);
      return;
    }

    setError('');

    const startTime = performance.now();
    
    try {
      const result = await solveWFF(input);
      const parsedResult = JSON.parse(result);
      console.log(parsedResult);
      
      // Track successful execution with timing
      trackResults(
        { formula: input }, // Input data
        parsedResult,       // Result data
        performance.now() - startTime      // Execution time in ms
      );
      
      setOutput(parsedResult);
    } catch (err) {
      // Track failed execution with timing
      trackResults(
        { formula: input },
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
    const wffRegex = /^(\(*\[*\s*(not\s*)?[A-Z]('|′|¬)?\s*\]*\)*(\s*(->|→|v|∨|V|~|S|`|\^|∧|>|<>|4|↔)\s*\(*\[*\s*(not\s*)?[A-Z]('|′|¬)?\s*\]*\)*\)*)*)+|\(\s*.*\s*\)('|′|¬)?|\[\s*.*\s*\]('|′|¬)?$/;
  
    // Check for balanced parentheses and brackets
    const balancedParentheses = (input.match(/\(/g) || []).length === (input.match(/\)/g) || []).length;
    const balancedBrackets = (input.match(/\[/g) || []).length === (input.match(/\]/g) || []).length;
  
    // Check for at least one operator in the input
    const containsOperator = /->|→|v|∨|V|~|S|`|>|\^|∧|<>|↔|4|not|¬|′/.test(input);
  
    // Reject single pair of parentheses or brackets. Backend doesn't handle input like: (A V B), but does support A V B
    const singlePairParentheses = /^\([^()]*\)$/.test(input);
    // eslint-disable-next-line
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
            WFF to Truth Table Solver
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Statement And Tautologies
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width={'large'}>
          <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you work with well-formed formulas (wffs) and truth tables.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            A WFF is a valid expression in propositional logic that is constructed using logical operators (like AND, OR, NOT, IMPLIES) and propositions (like A, B, C). These formulas strictly adhere to the syntax rules of logic, making them suitable for mathematical reasoning.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            A truth table is a systematic way to list all possible truth values for a given logical expression. It shows how the truth value of the entire formula depends on the truth values of its components. Truth tables are especially useful for verifying tautologies (statements that are always true) or contradictions (statements that are always false).
          </Text>
          <Text textAlign="center" weight="normal" margin={{"bottom":"medium"}}>
            Enter your logical statement below, by using the list of symbols to generate its truth table and analyze its properties!
          </Text>
        </Box>
        <Card width="large" pad="medium" background={{"color":"light-1"}}>
          <CardBody pad="small">
          <Box margin={{bottom : "small" }}><Box direction="row" align="start" justify="start" margin={{ bottom: 'small' }} style={{ marginLeft: '-8px', marginTop: '-8px' }}>
            <Button icon={<CircleInformation />} onClick={() => setShowHelp(!showHelp)} plain />
          </Box>
          <Collapsible open={showHelp}>
              <Box pad="small" background="light-2" round="small" margin={{ bottom: "medium" }} width="large">
                <Text>
                 Use the symbols from the table below to create your wff. In the symbol column, from left to right, the solver supports keyboard, unicode, and book syntax.
                </Text>
                <WFFOperationsTable />
              </Box>
            </Collapsible>

            <TextInput 
              placeholder="Example: Enter your formula here (e.g., A V B)"
              value={input}
              onChange={handleInput}
            />
            {error && <Text color="status-critical">{error}</Text>}
          </Box>
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
              {output ? <TruthTable headers={output.headers} rows={output.rows} /> : <Text>Output will be displayed here!</Text>}
            </Box>
          </CardBody>
        </Card>
        <ReportFooter />
      </PageContent>
      </Box>
    </Page>
  );
};

export default WFFSolverPage;