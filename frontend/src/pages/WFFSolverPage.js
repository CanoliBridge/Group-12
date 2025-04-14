import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Collapsible} from 'grommet';
import { StatusCritical, StatusGood, CircleInformation } from 'grommet-icons';
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

  // Function to render the WFF classification
  const renderClassification = (classification, description) => {
    if (!classification) return null;
    
    let color;
    let icon;
    
    switch (classification) {
      case 'tautology':
        color = '#43a047';  // Green
        icon = <StatusGood size="medium" color={color} />;
        break;
      case 'contradiction':
        color = '#e53935';  // Red
        icon = <StatusCritical size="medium" color={color} />;
        break;
      case 'contingency':
        color = '#1565c0';  // Blue
        icon = <CircleInformation size="medium" color={color} />;
        break;
      default:
        color = '#424242';  // Grey
        icon = '?';
    }

    return (
      <Box 
        background={{ color: 'light-2' }} 
        pad="medium" 
        margin={{ top: 'medium' }} 
        round="small"
        border={{ color, size: '2px' }}
      >
        <Box direction="row" gap="small" align="center">
          {icon}
          <Text size="large" weight="bold" color={color}>
            {classification.toUpperCase()}
          </Text>
        </Box>
        <Text margin={{ top: 'small' }}>{description}</Text>
      </Box>
    );
  };
 
  const validateInput = (input) => {
    // First, check if input is empty or only whitespace
    if (!input || !input.trim()) {
      return false;
    }
    
    // Check for balanced parentheses and brackets
    const balancedParentheses = (input.match(/\(/g) || []).length === (input.match(/\)/g) || []).length;
    const balancedBrackets = (input.match(/\[/g) || []).length === (input.match(/\]/g) || []).length;
    if (!balancedParentheses || !balancedBrackets) {
      return false;
    }
    
    // Sanitize the input - only allow valid logical operators, letters, and structural characters
    // Valid operators: and, or, not, implies, equivalent, negation
    // Valid symbols: ->, →, v, ∨, V, ~, S, `, ^, ∧, >, <>, 4, ↔, ¬, ', ′
    // Valid variables: A-Z (single uppercase letters)
    // Valid structural: (, ), [, ]
    
    // Replace all valid tokens with spaces to help check if any invalid characters remain
    let sanitized = input;
    
    // Replace all variables
    sanitized = sanitized.replace(/\b[A-Z]\b/g, ' ');
    
    // Replace all valid operators and symbols
    const validSymbols = [
      '->', '→', 'v', '∨', 'V', '~', 'S', '`', '^', '∧', '>', '<>', '4', '↔', '¬', "'", '′',
      'and', 'or', 'not'
    ];
    
    for (const symbol of validSymbols) {
      sanitized = sanitized.replace(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ' ');
    }
    
    // Replace structural characters
    sanitized = sanitized.replace(/[\(\)\[\]]/g, ' ');
    
    // Replace whitespace
    sanitized = sanitized.replace(/\s+/g, '');
    
    // If anything remains, it's an invalid character
    if (sanitized.length > 0) {
      return false;
    }
    
    // Check that we have at least one variable
    const hasVariable = /\b[A-Z]\b/.test(input);
    if (!hasVariable) {
      return false;
    }
    
    // Check that we have at least one operator (if more than one variable)
    // Otherwise, formulas like just "A" would be invalid, which seems wrong
    const variableMatches = input.match(/\b[A-Z]\b/g) || [];
    if (variableMatches.length > 1) {
      const containsOperator = /->|→|v|∨|V|~|S|`|>|\^|∧|<>|↔|4|not|¬|′/.test(input);
      if (!containsOperator) {
        return false;
      }
    }
    
    // Reject single pair of parentheses or brackets without operators
    const singlePairNoOperator = /^\([A-Z]\)$|^\[[A-Z]\]$/.test(input.trim());
    if (singlePairNoOperator) {
      return false;
    }
    
    return true;
  };

  return (
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <PageContent align="center" skeleton={false}>
        <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
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
          <Box 
            background="light-2" 
            pad="small" 
            margin={{ bottom: "medium" }} 
            round="small"
            border={{ color: "dark-3", size: "1px" }}
          >
            <Text weight="bold" size="small" color="dark-3">NOTE:</Text>
            <Text textAlign="start" size="small" color="dark-1">
              This solver uses left-to-right associativity for operations at the same precedence level. This means that expressions like "A ∧ B ∧ C" are evaluated as "(A ∧ B) ∧ C" rather than "A ∧ (B ∧ C)". Use parentheses to enforce specific grouping if needed.
            </Text>
          </Box>
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
                <Text margin={{ top: "small" }}>
                  Ensure that tokens and operators are delimited by spaces or parentheses.
                </Text>
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
              {output && output.classification && renderClassification(output.classification, output.description)}
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
