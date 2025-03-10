import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solveTreeNotation } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: TreeNotation.js
* Author: Parker Clark
* Description: Solver page for solving tree notation problems.
*/

const TreeNotation = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("TREE_NOTATION");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate input
    const isValid = validateInput(input);
    if (!isValid) {
      setError('Invalid input. Please enter a valid expression.');
      setLoading(false);
      return;
    }

    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveTreeNotation(input);

      trackResults(
        { input: input },
        result,
        performance.now() - startTime
      );

      setOutput(result);
    } catch (err) {

      trackResults(
        { input: input },
        {error: err.message || "Error solving Tree to Array"},
        performance.now() - startTime
      );

      setError('An error occurred while generating the notation.');
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
            Tree to Array
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Trees And Their Representations
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you convert binary trees to different notations in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            In computer science, binary trees can be represented in various notations such as pre-fix, post-fix, and in-fix. These notations are used to express the order in which nodes of the tree are visited.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Pre-fix notation (also known as Polish notation) is a way of writing expressions where the operator precedes their operands. For example, the expression (A + B) in pre-fix notation is written as +AB.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Post-fix notation (also known as Reverse Polish notation) is a way of writing expressions where the operator follows their operands. For example, the expression (A + B) in post-fix notation is written as AB+.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            In-fix notation is the most common way of writing expressions where the operator is placed between the operands. For example, the expression (A + B) in in-fix notation is written as A + B.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your binary tree below to generate and analyze its pre-fix, post-fix, and in-fix notations using this tool!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <TextInput 
                placeholder="Example: Enter your tree here (e.g., [1, 2, 3, 4, 5, 6, 7])"
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

export default TreeNotation;