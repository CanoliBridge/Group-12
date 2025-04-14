import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solveDisjointCycles } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: DisjointCycles.js
* Author: Parker Clark
* Description: Solver page for analyzing disjoint cycles.
*/

const DisjointCycles = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("DISJOINT_CYCLES");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate input
    const isValid = validateInput(input);
    if (!isValid) {
      setError('Invalid input. Please enter a valid permutation.');
      setLoading(false);
      return;
    }

    const formatOutput = (input) => {
      const results = typeof input === 'string' ? JSON.parse(input) : input;
      return Object.entries(results)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    };

    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveDisjointCycles(input);

      trackResults(
        { input: input },
        result, 
        performance.now() - startTime
      );

      setOutput(formatOutput(result));

    } catch (err) {

      trackResults(
        { input: input },
        { error: err.message || "Error solving Disjoint Cycle" },
        performance.now() - startTime
      );

      setError('An error occurred while generating the Disjoint Cycle.');
    } finally {
      setLoading(false);
    }
  }

  const validateInput = (input) => {
    // Reject input if it contains a plus sign
    if (/\+/.test(input)) {
      return false;
    }
  
    // Improved regex to match cycles with space or comma separators
    const regex = /\(\s*([a-zA-Z0-9]+(?:\s*,\s*|\s+)[a-zA-Z0-9]+(?:(?:\s*,\s*|\s+)[a-zA-Z0-9]+)*)\s*\)/g;
  
    // Remove composition symbols before matching
    const cleanedInput = input.replace(/\s*\∘\s*/g, ' '); // Unicode composition symbol only
  
    // Find all matches
    const matches = cleanedInput.match(regex);
  
    // Check if there are at least two valid cycles
    return matches && matches.length >= 2;
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
              Permutations Expressed
            </Text>
            <Text size="xxlarge" weight="bold">
              As Disjoint Cycles
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Functions
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
              This tool helps you analyze permutations as disjoint cycles in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              A permutation can be decomposed into a product of disjoint cycles. This tool allows you to input a permutation and generate its disjoint cycle representation.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              By analyzing permutations as disjoint cycles, you can understand the structure of permutations and how elements are mapped within cycles. This is useful in various applications such as group theory, cryptography, and combinatorial optimization. This tool allows you to input a permutation and explore its disjoint cycle decomposition.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
              Enter your permutation below to generate and analyze its disjoint cycles!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <TextInput 
                placeholder="Example: Enter your permutations here (e.g., (1 2 3)(4 5))"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
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
                  {output ? output : "Output will be displayed here!"}
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

export default DisjointCycles;