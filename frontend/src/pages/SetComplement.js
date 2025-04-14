import React, { useState } from 'react';
import { 
  Page, PageContent, Box, Text, Card, CardBody, CardFooter, 
  Button, Spinner, Heading, Collapsible
} from 'grommet';
import { CircleInformation } from 'grommet-icons';
import { solveSetComplement } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import SetComplementInput from '../components/SetComplementInput';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: SetComplement.js
* Author: Parker Clark
* Description: Solver page for calculating set complements.
*/

const SetComplement = () => {
  const [universalSet, setUniversalSet] = useState('');
  const [subset, setSubset] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { trackResults } = useDiagnostics("SET_COMPLEMENT");

  const handleSolve = async () => {
    setLoading(true);
    setOutput('');
    setError('');

    // Validate inputs
    if (!validateInput()) {
      setLoading(false);
      return;
    }

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveSetComplement({
        universal_set: universalSet,
        subset: subset
      });

      // Diagnostics tracking
      trackResults(
        { universalSet, subset },
        result,
        performance.now() - startTime
      );

      setOutput(result);
    } catch (err) {
      trackResults(
        { universalSet, subset },
        { error: err.message || "Error solving Set Complement" },
        performance.now() - startTime
      );

      setError('An error occurred while finding the set\'s complement.');
    } finally {
      setLoading(false);
    }
  };

  const validateInput = () => {
    if (!universalSet.trim()) {
      setError('Please enter the universal set.');
      return false;
    }

    if (!subset.trim()) {
      setError('Please enter the subset.');
      return false;
    }

    // Basic set notation validation
    const setRegex = /^(\{.*\}|\∅)$/;
    
    if (!setRegex.test(universalSet)) {
      setError('Universal set must be in proper set notation: {1, 2, 3} or ∅');
      return false;
    }

    if (!setRegex.test(subset)) {
      setError('Subset must be in proper set notation: {1, 2, 3} or ∅');
      return false;
    }

    return true;
  };

  // React is weird to handle the inf symbol, so replace it with unicode.
  const formatMathNotation = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\(-oo/g, '(-∞').replace(/oo\)/g, '∞)');
  };

  // Format the output for display
  const renderOutput = (data) => {
    if (!data) return "Output will be displayed here!";
    
    try {
      // Handle if data is a string
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      return (
        <Box>
          {/* Handle multiple complement formats */}
          {result.complement_A && (
            <Box direction="row" margin={{ bottom: "small" }}>
              <Text weight="bold">Set Notation Complement: </Text>
              <Text>{formatMathNotation(result.complement_A)}</Text>
            </Box>
          )}
          
          {result.complement_B && (
            <Box direction="row" margin={{ bottom: "small" }}>
              <Text weight="bold">Interval Notation Complement: </Text>
              <Text>{formatMathNotation(result.complement_B)}</Text>
            </Box>
          )}
        </Box>
      );
    } catch (e) {
      return String(data);
    }
  };

  return (
    <PageTopScroller>
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '60%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <PageContent align="center" skeleton={false}>
        <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
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
            Enter your universal set and subset below to generate the complement!
          </Text>
        </Box>
        
        <Card width="full" pad="medium" background={{"color":"light-1"}}>
          <CardBody pad="small">
            <Box direction="row" align="center" margin={{ bottom: 'small' }}>
              <Button 
                icon={<CircleInformation />} 
                onClick={() => setShowHelp(!showHelp)} 
                plain 
                margin={{ right: 'small' }}
              />
              <Heading level={4} margin="none" weight="bold">Enter your sets below:</Heading>
            </Box>
            
            <Collapsible open={showHelp}>
              <Box pad="small" background="light-2" round="small" margin={{ bottom: "medium" }}>
                <Text margin={{ bottom: "xsmall" }} weight="bold">Set Notation Examples:</Text>
                <Text>• Empty set: ∅ or {"{}"}</Text>
                <Text>• Set with elements: {"{1, 2, 3}"} or {"{a, b, c}"}</Text>
                <Text>• Universal set example: {"{1, 2, 3, 4, 5}"}</Text>
                <Text>• Subset example: {"{1, 3}"}</Text>
                <Text>• Resulting complement: {"{2, 4, 5}"}</Text>
              </Box>
            </Collapsible>
            
            <SetComplementInput
              universalSet={universalSet}
              subset={subset}
              error={error}
              onUniversalSetChange={setUniversalSet}
              onSubsetChange={setSubset}
            />
          </CardBody>
          <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
            <Button 
              label={loading ? <Spinner /> : "Solve"} 
              onClick={handleSolve} 
              disabled={loading} 
              primary
            />
          </CardFooter>
        </Card>
        
        <Card width="full" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
          <CardBody pad="small">
            <Text weight="bold">
              Output:
            </Text>
            <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
              <Box pad="small" width="100%">
                {output ? renderOutput(output) : "Output will be displayed here!"}
              </Box>
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

export default SetComplement;