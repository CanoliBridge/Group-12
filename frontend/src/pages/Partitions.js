import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Collapsible } from 'grommet';
import { solvePartitions } from '../api';
import { CircleInformation } from 'grommet-icons';
import ReportFooter from '../components/ReportFooter';
import HomeButton from '../components/HomeButton';
import Background from '../components/Background';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PartitionInput from '../components/PartitionInput';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: Partitions.js
* Author: Parker Clark
* Description: Solver page for equivalence relations.
*/

const Partitions = () => {
  const [set, setSet] = React.useState('');
  const [relation, setRelation] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const { trackResults } = useDiagnostics("PARTITIONS");

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
      
      // Do some conversion to display any backend errors
      let result = await solvePartitions(set, relation);

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
      setError('An error occurred while analyzing the Partition.');
    } finally {
      setLoading(false);
    }
  };

  // Validate that set conforms to format
  const validateSet = (input) => {
    // Tests if input is in the form {a, b, c, 23} or {}
    const setRegex = /^\{\s*\}$|^\{(\s*[a-zA-Z0-9]+\s*,)*\s*[a-zA-Z0-9]+\s*\}$/;
    return setRegex.test(input);
  };

  // Validate that relation conforms to format
  const validateRelation = (input, set) => {
    // Check if input starts with { and ends with }
    if (!input.startsWith('{') || !input.endsWith('}')) {
      return false;
    }
    
    // Handle empty relation case - just return true
    if (input === '{}') {
      return true;
    }
    
    try {
      // Remove outer braces
      const withoutOuterBraces = input.substring(1, input.length - 1);
      
      // Find individual partitions by properly parsing the nested braces
      const partitions = [];
      let bracketCount = 0;
      let currentPartition = '';
      
      for (let i = 0; i < withoutOuterBraces.length; i++) {
        const char = withoutOuterBraces[i];
        
        if (char === '{') bracketCount++;
        if (char === '}') bracketCount--;
        
        // We only split on commas that are at the top level between partitions
        if (char === ',' && bracketCount === 0) {
          partitions.push(currentPartition.trim());
          currentPartition = '';
        } else {
          currentPartition += char;
        }
      }
      
      // Add the last partition
      if (currentPartition.trim()) {
        partitions.push(currentPartition.trim());
      }
      
      // Check each partition starts with { and ends with }
      if (!partitions.every(p => p.startsWith('{') && p.endsWith('}'))) {
        return false;
      }
      
      // Extract all elements from the set for validation
      const setElements = set.replace(/[{}]/g, '').split(/\s*,\s*/).filter(Boolean);
      
      // Extract all elements from partitions (flattened)
      const partitionElements = [];
      for (const partition of partitions) {
        // Remove outer braces and split by commas
        const elements = partition.substring(1, partition.length - 1)
                                .split(/\s*,\s*/)
                                .filter(Boolean);
        partitionElements.push(...elements);
      }
      
      // Check if all elements in partitions are in the set
      return partitionElements.every(element => {
        // If the element contains braces, it's a nested structure
        // We should extract just the alphanumeric parts for checking
        const cleanElement = element.replace(/[{}]/g, '').trim();
        return setElements.includes(cleanElement);
      });
      
    } catch (e) {
      console.error("Error validating relation:", e);
      return false;
    }
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
    <PageTopScroller>
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <PageContent align="center" skeleton={false}>
        <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
            <HomeButton />
        </Box>
        <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
          <Text size="xxlarge" weight="bold">
            Partitions
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Relations
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
          <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze partitions and their corresponding equivalence relations.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            A partition of a set A is a collection of non-empty, disjoint subsets whose union equals A. Each subset in a partition is called a part or a block.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Every partition corresponds to a unique equivalence relation, where elements are related if and only if they belong to the same part of the partition. 
          </Text>
          <Box margin={{"bottom":"small"}} textAlign="start" weight="normal">
            <Text>An equivalence relation is a relation that is:</Text>
            <Text>- Reflexive: Every element is related to itself, i.e., (a, a) ∈ R for all a ∈ A.</Text>
            <Text>- Symmetric: For every (a, b) ∈ R, (b, a) ∈ R.</Text>
            <Text>- Transitive: For every (a, b) ∈ R and (b, c) ∈ R, (a, c) ∈ R.</Text>
          </Box>
          <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter a set and its partition below to generate the corresponding equivalence relation!
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
                  <strong>{'{a,b,c,d}'}</strong>
                </Text>
                <Text>
                  To input a partition, use the following format:
                </Text>
                <Text>
                  <strong>{'{{a,b},{c,d}}'}</strong>
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
              <PartitionInput
                value={relation}
                onChange={setRelation} />
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
    </PageTopScroller>
  );
};

export default Partitions;
