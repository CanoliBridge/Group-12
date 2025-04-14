import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Select } from 'grommet';
import { solveBinaryTrees } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: BinaryTrees.js
* Author: Parker Clark
* Description: Solver page for binary trees and properties.
*/

const BinaryTrees = () => {
  const [input, setInput] = React.useState('');
  const [treeType, setTreeType] = React.useState('regular');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("BINARY_TREES");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate the input first
    const validation = validateInput(input, treeType);
    if (!validation.isValid) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    setError('');

    // Determine the choice value based on tree type
    const choice = treeType === 'regular' ? 1 : 2;

    // Start timing for performance tracking
    const startTime = performance.now();

    try { 
      // Do some conversion to display any backend errors
      let result = await solveBinaryTrees(input, choice);

      // Parse result if it is a string
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
      
      // Check if there is an error key in the result
      const errorKey = Object.keys(result).find(key => key.toLowerCase().includes('error'));
      console.log(errorKey);
      if (errorKey) {

        // Track failed execution
        trackResults(
          { input: input, treeType: treeType},
          { error: result[errorKey] }, 
          performance.now() - startTime
        );

        setError(result[errorKey]);
      } else {

        // Track failed execution
        trackResults(
          { input: input, treeType: treeType },
          result, 
          performance.now() - startTime
        );

        setOutput(result["image"]);
      }
    } catch (err) {
      console.log(err);

      // Track exception
      trackResults(
        { input: input, treeType: treeType}, // Input data
        { error: err.message || 'Unknown error' }, // Error result
        performance.now() - startTime // Execution time
      );

      setError('An error occurred while generating the Tree.');
    } finally {
      setLoading(false);
    }
  }

  // Get placeholder text based on tree type
  const getPlaceholder = () => {
    if (treeType === 'regular') {
      return "Example: A B C D E None F (space-separated nodes in level order)";
    } else {
      return "Example: 2+(3+5-7) (mathematical expression)";
    }
  };

  // Convert base64 image string to image element
  const renderOutput = () => {
    if (!output) {
      return "Output will be displayed here!";
    }

    // Parse out json object and return out elements one by one
    return (
      <Box>
        <img src={`data:image/png;base64,${output}`} alt="Graph" style={{ maxWidth: '100%', height: 'auto' }} />
      </Box>
    );
  };

  // Validate the input based on the tree type
  const validateInput = (input, treeType) => {
    if (!input || input.trim() === '') {
      return { isValid: false, error: 'Input cannot be empty.' };
    }

    if (treeType === 'regular') {
      // Validate for regular binary tree level representation
      const nodes = input.split(/\s+/);
      
      // Check if we have at least a root
      if (nodes.length === 0) {
        return { isValid: false, error: 'Tree must have at least a root node.' };
      }

      const invalidNodes = nodes.filter(node => 
        node !== 'None' && !(/^[A-Za-z0-9]$/.test(node))  // Changed from + to require exactly one character
      );
      
      if (invalidNodes.length > 0) {
        return { 
          isValid: false, 
          error: `Invalid node value(s): ${invalidNodes.join(', ')}. Use single letters, numbers, or 'None'.` 
        };
      }

      // Check for duplicate nodes (excluding 'None')
      const uniqueNodes = new Set();
      const duplicates = [];
      
      for (const node of nodes) {
        if (node !== 'None') {
          if (uniqueNodes.has(node)) {
            duplicates.push(node);
          } else {
            uniqueNodes.add(node);
          }
        }
      }
      
      if (duplicates.length > 0) {
        return { 
          isValid: false, 
          error: `Duplicate node value(s): ${duplicates.join(', ')}. Each node must be unique.` 
        };
      }

      return { isValid: true };
      
    } else if (treeType === 'mathematical') {
      // Basic validation for mathematical expression
      if (!/^[0-9a-zA-Z+\-*/()^. ]+$/.test(input)) {
        return { 
          isValid: false, 
          error: 'Expression can only contain numbers, operators (+, -, *, /, ^), and parentheses.' 
        };
      }
      
      // Check for balanced parentheses
      let parenCount = 0;
      for (let char of input) {
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        
        if (parenCount < 0) {
          return { isValid: false, error: 'Unbalanced parentheses in expression.' };
        }
      }
      
      if (parenCount !== 0) {
        return { isValid: false, error: 'Unbalanced parentheses in expression.' };
      }
      
      return { isValid: true };
    }
    
    return { isValid: false, error: 'Invalid tree type.' };
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
            Binary Trees and Their Properties
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Trees And Their Representations
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze binary trees in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Binary trees are a type of data structure in which each node has at most two children, referred to as the left child and the right child. Binary trees are used to implement binary search trees and binary heaps, and they are fundamental in various algorithms and applications.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            In a binary tree, each node contains a value, and references to its left and right children. This hierarchical structure allows for efficient searching, insertion, and deletion operations, making binary trees a crucial component in computer science.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By analyzing binary trees, you can understand the relationships and connections between different nodes, and how they can be used to solve various computational problems. This tool allows you to input a binary tree and explore its properties and representations.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your binary tree below to generate and analyze its properties using this tool!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <Box margin={{ bottom: 'small' }}>
                <Text margin={{ bottom: 'xsmall' }}>Select Tree Type:</Text>
                <Select
                  options={[
                    { label: 'Regular Binary Tree (Level Order)', value: 'regular' },
                    { label: 'Mathematical Expression', value: 'mathematical' }
                  ]}
                  value={treeType}
                  labelKey="label"
                  valueKey="value"
                  onChange={({ value }) => setTreeType(value.value)}
                />
              </Box>
              <Text margin={{ bottom: 'xsmall' }}>Input Tree:</Text>
              <TextInput 
                placeholder={getPlaceholder()}
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

export default BinaryTrees;