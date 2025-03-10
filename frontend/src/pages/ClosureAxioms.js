import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Collapsible } from 'grommet';
import { solveClosureAxioms } from '../api';
import { CircleInformation } from 'grommet-icons';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: ClosureAxioms.js
* Author: Parker Clark
* Description: Solver page for closure axioms.
*/

const ClosureAxioms = () => {
  const [set, setSet] = React.useState('');
  const [relation, setRelation] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const { trackResults } = useDiagnostics("CLOSURE_AXIOMS");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate input
    const isValidSet = validateSet(set);
    const isValidRelation = validateRelation(relation, set);
    
    if (!isValidRelation || !isValidSet) {
      setError('Invalid input. Please enter a valid relation/set.');
      setLoading(false);
      return;
    } 

    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      let result = await solveClosureAxioms(set, relation);

      // Parse result if it is a string
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }

      // Check if there is an error key in the result
      const errorKey = Object.keys(result).find(key => key.toLowerCase().includes('error'));
      console.log(errorKey);
      if (errorKey) {

        trackResults(
          { set, relation }, // Input data
          { error: result[errorKey] }, // Error result
          performance.now() - startTime // Execution time
        );

        setError(result[errorKey]);
      } else {

        trackResults(
          { set, relation }, // Input data
          result, // Success result
          performance.now() - startTime // Execution time
        );

        setOutput(result);
      }
    } catch (err) {
      
      trackResults(
        { set, relation }, // Input data
        { error: err.message || 'Unknown error' }, // Error result
        performance.now() - startTime // Execution time
      );

      console.log(err);
      setError('An error occurred while analyzing the closure axioms.');
    } finally {
      setLoading(false);
    }
  }

  // Validate that set conforms to format
  const validateSet = (input) => {

    // Tests if input is in the form {a, b, c, 23}
    const setRegex = /^\{(\s*[a-zA-Z0-9]+\s*,)*\s*[a-zA-Z0-9]+\s*\}$/;
    return setRegex.test(input);
  };

  // Validate that relation conforms to format
  const validateRelation = (input, set) => {

    // Tests if input is in the form {(a, b), (23, c)}
    const relationRegex = /^\{(\s*\(\s*[a-zA-Z0-9]+\s*,\s*[a-zA-Z0-9]+\s*\)\s*,)*\s*\(\s*[a-zA-Z0-9]+\s*,\s*[a-zA-Z0-9]+\s*\)\s*\}$/;
    if (!relationRegex.test(input)) {
      return false;
    }
    
    // Checks if all elements in the relation are in the set
    const setElements = set.replace(/[{}]/g, '').split(/\s*,\s*/);
    const relationElements = input.replace(/[{}()]/g, '').split(/\s*,\s*/);
  
    return relationElements.every(element => setElements.includes(element));
  };

  // Pretty print the output
  const renderOutput = () => {
    if (!output) {
      return "Output will be displayed here!";
    }

    // Parse out json object and return out elements one by one
    return (
      <Box>
        {Object.entries(output).map(([key, value]) => (
          <Text key={key}>{`${key}: ${value}`}</Text>
        ))}
      </Box>
    );
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
            Closure Axioms
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Relations
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
                This tool helps you analyze closure axioms.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                Closure axioms are properties that define how a set remains closed under certain operations. For example, a set is closed under an operation if performing that operation on elements of the set always produces an element that is also in the set. 
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                Common closure axioms include closure under addition, where the sum of any two elements in the set is also in the set, and closure under multiplication, where the product of any two elements in the set is also in the set. Other examples include closure under union, where the union of any two subsets is also a subset of the set, and closure under intersection, where the intersection of any two subsets is also a subset of the set.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
                Enter your set and operation below to analyze its closure properties!
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
                  To input a set, use the following format:
                </Text>
                <Text>
                  <strong>{'{a,b,c}'}</strong>
                </Text>
                <Text>
                  For example: <strong>{'{a,b,f,23}'}</strong>
                </Text>
                <Text>
                  To input a relation, use the following format:
                </Text>
                <Text>
                  <strong>{'{(a,b),(b,c),(c,a)}'}</strong>
                </Text>
                <Text>
                  For example: <strong>{'{(a,b),(b,f),(f,23),(a,a)}'}</strong>
                </Text>
              </Box>
            </Collapsible>
              <TextInput 
                placeholder="Example: Enter your set here (e.g., {a, b, c, 23})"
                value={set}
                onChange={(event) => setSet(event.target.value)}
              />
            </Box>
            <Box margin={{top : "small" }}>
              <TextInput 
                placeholder="Example: Enter your relation here (e.g., {(a, b), (23, c)})"
                value={relation}
                onChange={(event) => setRelation(event.target.value)}
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
              <Text>
                {renderOutput()}
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

export default ClosureAxioms;