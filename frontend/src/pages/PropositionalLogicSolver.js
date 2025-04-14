import React, { useState } from 'react';
import { CheckBox, Button, Box, Text } from 'grommet';
import { Page, PageContent, Card, CardBody, CardFooter, TextInput, Spinner, Collapsible } from 'grommet';
import { CircleInformation } from 'grommet-icons';
import HomeButton from '../components/HomeButton';
import WFFOperationsTable from '../components/PropositionalLogicOperationExample';
import Background from '../components/Background';
import ReportFooter from '../components/ReportFooter';
import { solvePropositionalLogic } from '../api';
import { useDiagnostics } from '../hooks/useDiagnostics';


/*
* Name: PropositionalLogicSolver.js
* Author: Parker Clark and Mathias Buchanan
* Description: Solver page for the propositional logic solver.
*/

const PropositionalLogicSolver = () => {
  const [isCaveman, setIsCaveman] = useState(false);
  const [hypotheses, setHypotheses] = React.useState('');
  const [conclusion, setConclusion] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [outputSymbol, setOutputSymbol] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [showOutput, setShowOutput] = useState(false);

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
      const result = await solvePropositionalLogic({ hypotheses, conclusion });
      const parsedResult = JSON.parse(result); // Ensure it's properly parsed
    
      // Set output to the "String" entry
      setOutput(parsedResult.String || "No output available");
      setOutputSymbol(parsedResult.Symbol || "No output available");
    
      // Track successful execution with timing
      trackResults(
        { hypotheses, conclusion }, 
        parsedResult.String,  // Only track the String output
        parsedResult.Symbol,
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

  const toggleText = () => setIsCaveman(!isCaveman);

      const betterText = (
        <>
          <Text margin={{"bottom":"small"}} textAlign="center">This tool demonstrates the steps used to prove a tautology.</Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Propositional logic is a branch of logic that determines whether a tautology is valid based on its premises. For example, consider the statement:  
            "If the grass is green, then the sky is blue. The grass is green, therefore, the sky is blue."  
            This is a tautology. Typically, tautologies are expressed using logical variables, such as [(A → B) ∧ A] → B.  
            However, not every logical statement is a tautology. To be a tautology, the premises must logically guarantee the conclusion.  
            For instance, the statement:  
            "If I have a hat, then it is green. I have a TV, therefore, my house is blue."  
            is not a tautology, as the conclusion does not logically follow from the premises.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Propositional logic verifies whether given premises logically lead to a conclusion. 
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="center" weight="normal"> 
            Enter a tautology below to see a step-by-step proof.
          </Text>
        </>
      );
    
      const cavemanText = (
        <>
          <Text margin={{"bottom":"small"}} textAlign="center">
            This tool show how to prove big smart statement true.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Logic good. Logic check if big smart statement always true. Example:  
            "If grass green, then sky blue. Grass green. So, sky blue."  
            That always true. That tautology.  
            Smart people use letters to show tautology, like [(A → B) ∧ A] → B.  
            But not all statement tautology. Must make sense.  
            Example bad:  
            "If I have hat, hat is green. I have TV. So, house is blue."  
            That not make sense. Not tautology.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="center" weight="normal">
            Logic check if words make sense. Put tautology below. See proof!
          </Text>
        </>
      );

  const validateInput = (input) => {
    // Regular expression to validate WFF general form, excluding V and S as variables.
    const wffRegex = /^(\(*\[*\s*(not\s*)?(?![VvS])[A-IK-UWYZ]('|′|¬)?\s*\]*\)*(\s*(->|→|v|∨|~|`|\^|∧|>)\s*\(*\[*\s*(not\s*)?(?![VvS])[A-IK-UWYZ]('|′|¬)?\s*\]*\)*\)*)*)+|\(\s*.*\s*\)('|′|¬)?|\[\s*.*\s*\]('|′|¬)?$/;
  
    // Check for balanced parentheses and brackets
    const balancedParentheses = (input.match(/\(/g) || []).length === (input.match(/\)/g) || []).length;
    const balancedBrackets = (input.match(/\[/g) || []).length === (input.match(/\]/g) || []).length;
  
    // Check for at least one operator in the input
    const containsOperator = /->|→|v|∨|V|~|`|>|\^|∧|¬|′|'|S|s/.test(input);
  
    // Reject single pair of parentheses or brackets
    const singlePairParentheses = /^\([^()]*\)$/.test(input);
    const singlePairBrackets = /^\[[^[\]]*\]$/.test(input);
  
    // Allow single negated variables excluding V, v, and S
    const singleNegatedVariable = /^(?:¬(?![VvS])[A-IK-UWYZ]|(?![VvS])[A-IK-UWYZ](?:'|′)?)$/.test(input);
  
    // Allow negated expressions with parentheses or brackets
    const negatedExpressionWithParentheses = /^\(\s*.*\s*\)('|′|¬)?$/.test(input);
    const negatedExpressionWithBrackets = /^\[\s*.*\s*\]('|′|¬)?$/.test(input);
  
    return (wffRegex.test(input) && balancedParentheses && balancedBrackets && containsOperator && 
            !singlePairParentheses && !singlePairBrackets) || 
            singleNegatedVariable || negatedExpressionWithParentheses || negatedExpressionWithBrackets;

  
};


  return (
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <PageContent align="center" skeleton={false}>
      <Box style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
            <HomeButton />
          </Box>
          <Box align="end" style={{ position: 'absolute', top: 0, right: 0, padding: '10px' }}>
            <Button label={isCaveman ? "Switch to Normal" : "Switch to Caveman"} onClick={toggleText} style={{ color: 'white', border: '1px solid white' }}/>
          </Box>
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">Propositional Logic Validator</Text>
          </Box>
          <Box align="center" justify="start" direction="column" width={'large'}>
            {isCaveman ? cavemanText : betterText}
          </Box>
        <Card width="large" pad="medium" background={{"color":"light-1"}}>
        <CardBody pad="small">
          <Box margin={{bottom : "small" }}><Box direction="row" align="start" justify="start" margin={{ bottom: 'small' }} style={{ marginLeft: '-8px', marginTop: '-8px' }}>
            <Button icon={<CircleInformation />} onClick={() => setShowHelp(!showHelp)} plain />
          </Box>
          <Collapsible open={showHelp}>
              <Box pad="small" background="light-2" round="small" margin={{ bottom: "medium" }} width="large">
                <Text>
                 Use the symbols from the table below to create your tautology. The solver supports keyboard, unicode, and book syntax.
                </Text>
                <WFFOperationsTable />
              </Box>
            </Collapsible>
          </Box>
          </CardBody>
          <CardBody pad="small">
            <Box margin={{bottom : "small" }}>
              <TextInput 
                placeholder="Example: Enter your hypotheses here (e.g., A > B ^ A)"
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
            {error && <Text color="status-critical">{error}</Text>}
          </CardBody>
          <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
            <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
          </CardFooter>
        </Card>
        <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
          <CardBody pad="small">
            <Box direction="row" align="center" margin={{"bottom":"small"}}>
              <CheckBox
                label="Use words instead of symbols"
                checked={showOutput}
                onChange={(event) => setShowOutput(event.target.checked)}
              />
            </Box>
            <Text weight="bold">Output:</Text>
            <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
              <Text style={{ whiteSpace: 'pre-wrap' }}>
              {output ? (showOutput ? output : outputSymbol) : "Output will be displayed here!"}
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
