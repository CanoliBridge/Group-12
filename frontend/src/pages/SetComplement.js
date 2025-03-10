import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solveSetComplement } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: SetComplement.js
* Author: Parker Clark
* Description: Solver page for calculating set complements.
*/

const SetComplement = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("SET_COMPLEMENT");

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

    //Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveSetComplement(input);

      trackResults(
        { input: input },
        result,
        performance.now() - startTime
      );

      setOutput(result);
    } catch (err) {

      trackResults(
        { input: input },
        { error: err.message || "Error solving Set Complement" },
        performance.now() - startTime
      );

      setError('An error occurred while finding the set\'s complement.');
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
            Set Complements
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Sets
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
                This tool helps you generate and analyze set complements.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                The complement of a set A, denoted by A', is the set of all elements in the universal set that are not in A. For example, if the universal set is {"{1, 2, 3, 4, 5}"} and set A is {"{1, 2, 3}"}, then the complement of A is {"{4, 5}"}.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                By finding the complement of a set, you can determine which elements are excluded from the set within the context of the universal set. This tool allows you to input a set and the universal set to generate the complement of the set.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
                Enter your set notation and the universal set below to generate the complement and analyze the results!
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

export default SetComplement;