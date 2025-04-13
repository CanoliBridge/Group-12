import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Heading, Collapsible } from 'grommet';
import { solveRecursion } from '../api';
import { CircleInformation } from 'grommet-icons';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import BaseCaseInput from '../components/BaseCaseInput';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: RecursiveDefinitions.js
* Author: Parker Clark
* Description: Solver page for solving recursive definitions.
*/

const RecursiveDefinitions = () => {
  const [formula, setFormula] = React.useState('');
  const [baseCases, setBaseCases] = React.useState([{ n: 0, value: '' }]);
  const [n, setN] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const { trackResults } = useDiagnostics("RECURSIVE_DEFINITIONS");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');
  
    // Format base cases into the required string format
    const formattedBaseCases = baseCases
      .map(bc => `${bc.n}:${bc.value}`)
      .join(', ');
    
    const baseCase = `{${formattedBaseCases}}`;
  
    // Validate input
    const isValidFormula = validateFormula(formula);
    const isValidBaseCase = validateBaseCase(baseCase);
    const isValidN = validateN(n);
  
    if (!isValidFormula || !isValidBaseCase || !isValidN) {
      setError('Invalid input. Please enter a valid recursive statement.');
      setLoading(false);
      return;
    }
  
    setError('');
    const startTime = performance.now();
        
    try {
      // Log the request for debugging
      console.log("Sending request with:", { formula, baseCase, n });
      
      const result = await solveRecursion(formula, baseCase, n);
      console.log("Raw API result:", result);
      
      // Handle if result is already an object
      let parsedResult;
      if (typeof result === 'string') {
        try {
          parsedResult = JSON.parse(result);
        } catch (parseErr) {
          console.error("JSON parsing error:", parseErr);
          // If parsing fails, use the raw result
          parsedResult = { success: false, error: "Invalid result format" };
        }
      } else {
        parsedResult = result;
      }
      
      console.log("Processed result:", parsedResult);
      
      // Check if the response contains an error
      if (!parsedResult.success && parsedResult.error) {
        setError(`Calculation error: ${parsedResult.error}`);
        
        trackResults(
          { formula, baseCase, n },
          parsedResult,
          performance.now() - startTime
        );
      } else {
        setOutput(parsedResult);
        
        trackResults(
          { formula, baseCase, n },
          parsedResult,
          performance.now() - startTime
        );
      }
    } catch (err) {
      // Log the full error object for debugging
      console.error("Error in recursion solver:", err);
      
      // Track failed execution with networking/unexpected error
      trackResults(
        { formula, baseCase, n },
        { success: false, error: err.message || 'Unknown error' },
        performance.now() - startTime
      );
      
      setError(`API error: ${err.message || 'An unexpected error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const validateFormula = (input) => {
    // Regex to validate the recursive formula (e.g., 2 * f(n-1) + 1)
    const formulaRegex = /^[0-9+\-*/() f(n-\d)]+$/;
    return formulaRegex.test(input);
  }

  const validateBaseCase = (input) => {
    // Regex to validate the base case input (e.g., "0:1, 1:2")
    const baseCaseRegex = /^\{(\d+:\d+(\.\d+)?)(,\s*\d+:\d+(\.\d+)?)*\}$/;
    return baseCaseRegex.test(input);
  }

  const validateN = (input) => {
    // Regex to validate the value of n (e.g., 5)
    const nRegex = /^\d+$/;
    return nRegex.test(input);
  }

  const renderOutput = (data) => {
    if (!data) return "Output will be displayed here!";
    
    try {
      // Handle both string and object data formats
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Format the result object into human-readable output
      if (result.success && result.results) {
        // Extract and format the recursive function results
        const steps = Object.entries(result.results)
          .sort((a, b) => {
            const aNum = parseInt(a[0].match(/\d+/)[0], 10);
            const bNum = parseInt(b[0].match(/\d+/)[0], 10);
            return aNum - bNum;
          })
          .map(([key, value]) => `${key} = ${value}`)
          .join('\n');

        
        return steps;
      } else if (result.error) {
        // Handle error messages from the backend
        return `Error: ${result.error}`;
      } else {
        // Fallback for other formats
        return JSON.stringify(result, null, 2);
      }
    } catch (e) {
      // If parsing fails, return the raw string
      console.error("Error rendering output:", e);
      return String(data);
    }
  };

  return (
    <PageTopScroller>
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <PageContent align="center" skeleton={false}>
          <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '10px', background: 'white', borderRadius: '8px' }}>
            <HomeButton />
          </Box>
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">
              Recursive Definitions Solver
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Recursive Definitions
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width={'large'}>
            <Text margin={{"bottom":"small"}} textAlign="center">
              This tool helps you solve recursive definitions.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              A recursive definition is a way of defining a function or a sequence in terms of itself. It consists of base cases and recursive cases. The base cases provide the initial values, and the recursive cases define the values in terms of previous values.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
             In this solver, you can enter your recursive formula, base cases, and the value of n to calculate. The solver will generate the values of the recursive function in terms of the recursive formula and base cases.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
              Enter your recursive definition below to generate its values and analyze its properties!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
             <Box margin={{bottom : "small" }}><Box direction="row" align="start" justify="start" margin={{ bottom: 'small' }} style={{ marginLeft: '-8px', marginTop: '-8px' }}>
                <Button icon={<CircleInformation />} onClick={() => setShowHelp(!showHelp)} plain />
              </Box>
              <Collapsible open={showHelp}>
                <Box pad="small" background="light-2" round="small" margin={{ bottom: "medium" }} width="large">
                  <Text weight="bold" margin={{ top: "small", bottom: "xsmall" }}>Recursive Formula:</Text>
                  <Text>
                    Enter a formula using f(n-1), f(n-2), etc. to reference previous terms.
                  </Text>
                  <Text margin={{ vertical: "xsmall" }}>
                    <strong>Examples:</strong>
                  </Text>
                  <Text margin={{ bottom: "xsmall" }}>• <strong>2 * f(n-1) + 1</strong> - Each term is twice the previous term plus 1</Text>
                  <Text margin={{ bottom: "xsmall" }}>• <strong>f(n-1) + f(n-2)</strong> - Fibonacci sequence (each term is the sum of the two preceding terms)</Text>
                  <Text margin={{ bottom: "xsmall" }}>• <strong>3 * f(n-1) - 2</strong> - Each term is three times the previous term minus 2</Text>
                  
                  <Text weight="bold" margin={{ top: "medium", bottom: "xsmall" }}>Base Cases:</Text>
                  <Text>
                    Define initial values for your sequence. You can add multiple base cases as needed.
                  </Text>
                  <Text margin={{ vertical: "xsmall" }}>
                    <strong>Examples:</strong>
                  </Text>
                  <Text margin={{ bottom: "xsmall" }}>• For Fibonacci: f(0) = 0, f(1) = 1, etc</Text>
                  <Text margin={{ bottom: "xsmall" }}>• For geometric sequence: f(0) = 1, etc </Text>
                  
                  <Text weight="bold" margin={{ top: "medium", bottom: "xsmall" }}>Value of n:</Text>
                  <Text>
                    Enter the term number you want to calculate up to.
                  </Text>
                  <Text margin={{ bottom: "xsmall" }}>
                    The solver will show all values from the base cases up to f(n).
                  </Text>
                </Box>
              </Collapsible>
            </Box>
              <Box margin={{bottom : "small" }}>
                <TextInput 
                  placeholder="Example: Enter your recursive formula here (e.g., 2 * f(n-1) + 1)"
                  value={formula}
                  onChange={(event) => setFormula(event.target.value)}
                />
              </Box>
              
              <BaseCaseInput
                baseCases={baseCases}
                onChange={setBaseCases}
              />
              
              <Box margin={{top : "small" }}>
                <TextInput 
                  placeholder="Example: Enter your value of 'n' to calculate (e.g., 5)"
                  value={n}
                  onChange={(event) => setN(event.target.value)}
                />
              </Box>
              {error && <Text color="status-critical">{error}</Text>}
            </CardBody>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
              <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} />
            </CardFooter>
          </Card>
          <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
            <CardBody pad="small">
              <Text weight="bold">
                Output:
              </Text>
              <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {output ? renderOutput(output) : "Output will be displayed here!"}
                </pre>
              </Box>
            </CardBody>
          </Card>
          <ReportFooter />
        </PageContent>
      </Box>
    </Page>
    </PageTopScroller>
  );
};

export default RecursiveDefinitions;