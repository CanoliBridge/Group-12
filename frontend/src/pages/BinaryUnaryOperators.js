import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solveBinaryUnaryOperators } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: BinaryUnaryOperators.js
* Author: Parker Clark
* Description: Solver page for calculating binary/unary operations.
*/

const BinaryUnaryOperators = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("BINARY_UNARY_OPERATORS");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate input
    const isValid = validateInput(input);
    if (!isValid) {
      setError('Invalid input. Please enter a valid set.');
      setLoading(false);
      return;
    }

    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveBinaryUnaryOperators(input);

      trackResults(
        { input: input },
        result,
        performance.now() - startTime
      );

      setOutput(result);
    } catch (err) {

      trackResults(
        { input: input },
        {error: err.message || "Error solving Binary/Unary Operators"},
        performance.now() - startTime
      );

      setError('An error occurred while performing the operation.');
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
            Binary & Unary Operators
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Sets
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
                This tool helps you generate and analyze binary and unary operations on sets.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                Binary operations on sets include operations like union, intersection, and difference. For example, the union of sets A and B, denoted by A ∪ B, is the set of all elements that are in A, in B, or in both. The intersection of sets A and B, denoted by A ∩ B, is the set of all elements that are in both A and B. The difference of sets A and B, denoted by A - B, is the set of all elements that are in A but not in B.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                Unary operations on sets include operations like complement. The complement of a set A, denoted by A', is the set of all elements in the universal set that are not in A.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
                Enter your set notation below to perform binary or unary operations and analyze the results!
            </Text>
        </Box>
        <Card width="large" pad="medium" background={{"color":"light-1"}}>
          <CardBody pad="small">
            <TextInput 
              placeholder="Example: Enter your set notation here (e.g., A ∩ B)"
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

export default BinaryUnaryOperators;