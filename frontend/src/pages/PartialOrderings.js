import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solvePartialOrderings } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';

/*
* Name: PartialOrderings.js
* Author: Parker Clark
* Description: Solver page for partial orderings.
*/

const PartialOrderings = () => {
  const [set, setSet] = React.useState('');
  const [relation, setRelation] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

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
    try {
      const result = await solvePartialOrderings(set, relation);
      setOutput(result);
    } catch (err) {
      setError('An error occurred while analyzing the partial ordering.');
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
    const parsedOutput = JSON.parse(output);
    return (
      <Box>
        {Object.entries(parsedOutput).map(([key, value]) => (
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
            Partial Orderings
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Relations
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
          <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze partial orderings in a relation.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            A partial ordering is a binary relation over a set that is reflexive, antisymmetric, and transitive. This tool allows you to test if a given relation is a partial ordering and to explore its properties.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By analyzing partial orderings, you can identify hierarchical structures within sets, find minimal and maximal elements, and determine the comparability of elements. This tool allows you to input a relation and apply partial ordering analysis to generate the corresponding results.
          </Text>
          <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your relation below to analyze partial orderings and explore the results!
          </Text>
        </Box>
        <Card width="large" pad="medium" background={{"color":"light-1"}}>
          <CardBody pad="small">
            <Box margin={{bottom : "small" }}>
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

export default PartialOrderings;