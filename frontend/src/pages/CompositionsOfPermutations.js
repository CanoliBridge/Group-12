import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solveCompositions } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: CompositionOfPermutations.js
* Author: Parker Clark
* Description: Solver page for ganalyzing permutations of a cycle.
*/

const CompositionOfPermutations = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("COMPOSITION_PERMUTATIONS");

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

    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveCompositions(input);

      trackResults(
        { input: input },
        result,
        performance.now() - startTime
      )

      setOutput(result);
    } catch (err) {

      trackResults(
        { input: input },
        {error: err.message || "Error solving Composition of Permutations"},
        performance.now() - startTime
      )

      setError('An error occurred while generating the composition.');
    } finally {
      setLoading(false);
    }
  }

  const validateInput = (input) => {
    // TODO: Change regex here based on input pattern
    const wffRegex = /^[A-Z](\s*->\s*[A-Z])?$/;
    return wffRegex.test(input);
  }

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
              Composition Of Permutations
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Functions
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze the composition of permutations in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            The composition of permutations involves combining two or more permutations to form a new permutation. This tool allows you to input multiple permutations and generate their composition.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By analyzing the composition of permutations, you can understand how different permutations interact and combine to form new arrangements. This is useful in various applications such as group theory, cryptography, and combinatorial optimization. This tool allows you to input multiple permutations and explore their composition.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your permutations below to generate and analyze their composition!
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
                <Text>
                  {output ? JSON.stringify(output) : "Output will be displayed here!"}
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

export default CompositionOfPermutations;