import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Collapsible } from 'grommet';
import { CircleInformation } from 'grommet-icons';
import { solvePropertiesOfRelations } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: RelationProperties.js
* Author: Parker Clark
* Description: Solver page for properties of relations.
*/

const RelationProperties = () => {
  const [set, setSet] = React.useState('');
  const [relation, setRelation] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const { trackResults } = useDiagnostics("RELATION_PROPERTIES");

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
      let result = await solvePropertiesOfRelations(set, relation);
  
      // Parse result if it is a string
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
  
      // Check if there is an error key in the result
      const errorKey = Object.keys(result).find(key => key.toLowerCase().includes('error'));
      
      if (errorKey) {
        // Track result with error
        trackResults(
          { set, relation }, // Input data
          { error: result[errorKey] }, // Error result
          performance.now() - startTime // Execution time
        );
        setError(result[errorKey]);
      } else {
        // Track successful result
        trackResults(
          { set, relation }, // Input data
          result, // Success result
          performance.now() - startTime // Execution time
        );
        setOutput(result);
      }
    } catch (err) {
      // Track exception
      trackResults(
        { set, relation }, // Input data
        { error: err.message || 'Unknown error' }, // Error result
        performance.now() - startTime // Execution time
      );
      console.log(err);
      setError('An error occurred while analyzing the relations.');
    } finally {
      setLoading(false);
    }
  };

  // Validate that set conforms to format
  const validateSet = (input) => {
    // Allow both non-empty sets {a, b, c, 23} and empty sets {}
    const setRegex = /^\{(\s*[a-zA-Z0-9]+\s*,)*\s*[a-zA-Z0-9]+\s*\}$|^\{\s*\}$/;
    return setRegex.test(input);
  };

  // Validate that relation conforms to format
  const validateRelation = (input, set) => {
    // Check for empty relation
    if (input.trim() === '{}') {
      return true; // Empty relation is valid
    }

    // Tests if input is in the form {(a, b), (23, c)}
    const relationRegex = /^\{(\s*\(\s*[a-zA-Z0-9]+\s*,\s*[a-zA-Z0-9]+\s*\)\s*,)*\s*\(\s*[a-zA-Z0-9]+\s*,\s*[a-zA-Z0-9]+\s*\)\s*\}$/;
    if (!relationRegex.test(input)) {
      return false;
    }
    
    // If set is empty but relation isn't, the relation can't be valid
    if (set.trim() === '{}') {
      return false;
    }
    
    // Checks if all elements in the relation are in the set
    const setElements = set.replace(/[{}]/g, '').split(/\s*,\s*/).filter(Boolean);
    const relationElements = input.replace(/[{}()]/g, '').split(/\s*,\s*/).filter(Boolean);
    
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
            Properties of Relations
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Relations
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
                This tool helps you analyze the properties of relations.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                A relation on a set is a collection of ordered pairs of elements from the set. Relations can have various properties such as reflexivity, symmetry, transitivity, and antisymmetry. For example, a relation R on a set A is:
            </Text>
            <Box margin={{"bottom":"small"}} textAlign="start" weight="normal">
                <Text>- Reflexive if every element is related to itself, i.e., (a, a) ∈ R for all a ∈ A.</Text>
                <Text>- Irreflexive if no element is related to itself, i.e., (a, a) ∉ R for all a ∈ A.</Text>
                <Text>- Symmetric if for every (a, b) ∈ R, (b, a) ∈ R.</Text>
                <Text>- Asymmetric if for every (a, b) ∈ R, (b, a) ∉ R.</Text>
                <Text>- Antisymmetric if for every (a, b) ∈ R and (b, a) ∈ R, a = b.</Text>
                <Text>- Transitive if for every (a, b) ∈ R and (b, c) ∈ R, (a, c) ∈ R.</Text>
            </Box>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your relation below to analyze its properties and determine if it is reflexive, irreflexive, symmetric, asymmetric, antisymmetric, or transitive!
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

export default RelationProperties;