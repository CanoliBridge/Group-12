import React from 'react';
import { PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Select, Tab, Tabs } from 'grommet';
import { solveTreeToArray } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import TreeToArrayOutput from '../components/TreeToArrayOutput';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: TreeToArray.js
* Author: Parker Clark
* Description: Solver page for converting binary tree to array.
*/

const TreeToArray = () => {

  const [input, setInput] = React.useState('');
  const [treeType, setTreeType] = React.useState('regular');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [treeData, setTreeData] = React.useState(null); // Add state for full tree data

  const { trackResults } = useDiagnostics("TREE_TO_ARRAY");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');
    setTreeData(null); // Clear previous tree data
  
    // Validate the input first
    const validation = validateInput(input, treeType);
    if (!validation.isValid) {
      setError(validation.error);
      setLoading(false);
      return;
    }
  
    // Determine the choice value based on tree type
    const choice = treeType === 'regular' ? 1 : 2;
  
    // Start timing for performance tracking
    const startTime = performance.now();
  
    try {
      // Call the API
      const response = await solveTreeToArray(input, choice);
      
      // Parse JSON if it's a string
      let result;
      try {
        result = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (e) {
        setError('Invalid response format from server');
        return;
      }
  
      // Check for success flag or error in the result
      if (!result.success) {
        const errorMessage = result.error || 'An unknown error occurred';
        
        // Track failed execution
        trackResults(
          { input, treeType },
          { error: errorMessage },
          performance.now() - startTime
        );
  
        setError(errorMessage);
        return;
      }
  
      // Success path - track results
      trackResults(
        { input, treeType },
        { success: true, type: result.type },
        performance.now() - startTime
      );
  
      // Store the image and full data for the visualizer
      setOutput(result.image);
      setTreeData(result);
      
    } catch (err) {
      console.error("Error in tree-to-array solver:", err);
      
      // Track exception
      trackResults(
        { input, treeType },
        { error: err.message || 'Unknown error' },
        performance.now() - startTime
      );
  
      setError('An error occurred while generating the array representation.');
    } finally {
      setLoading(false);
    }
  };

  // Get placeholder text based on tree type
  const getPlaceholder = () => {
    if (treeType === 'regular') {
      return "Example: A B C D E None (space separated nodes in level order)";
    } else {
      return "Example: 2+(3+5-7) (mathematical expression)";
    }
  };

  // Update the renderOutput function
  const renderOutput = () => {
    if (!output && !treeData) {
      return <Text>Output will be displayed here!</Text>;
    }

    return (
      <Tabs>
        {/* Tree Visualization Tab */}
        <Tab title="Tree Visualization">
          <Box pad="small">
            {output && (
              <Box>
                <Text weight="bold" margin={{ bottom: 'small' }}>Tree Structure:</Text>
                <Box background="white" pad="small" round="small">
                  <img 
                    src={`data:image/png;base64,${output}`} 
                    alt="Tree structure visualization" 
                    style={{ maxWidth: '100%', height: 'auto' }} 
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Tab>

        {/* Pointer Diagram Tab */}
        <Tab title="Memory Representation">
          <Box pad="small">
            {treeData && treeData.pointerDiagram && (
              <Box>
                <Text weight="bold" margin={{ bottom: 'small' }}>
                  Pointer Memory Representation:
                </Text>
                <Box background="white" pad="small" round="small">
                  <img 
                    src={`data:image/png;base64,${treeData.pointerDiagram}`} 
                    alt="Pointer memory representation" 
                    style={{ maxWidth: '100%', height: 'auto' }} 
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Tab>

        {/* Array Representation Tab */}
        <Tab title="Array Representation">
          <Box pad="small">
            {treeData && treeData.childArray && (
              <Box>
                <Box background="white" pad="small" round="small">
                  <TreeToArrayOutput
                    childArray={treeData.childArray}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Tab>
      </Tabs>
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

      // Check for invalid node values (allowing single letters, numbers, or 'None')
      const invalidNodes = nodes.filter(node => 
        node !== 'None' && !(/^[A-Za-z0-9]$/.test(node)) 
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
          <Background />
          <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <PageContent align="center" skeleton={false}>
              <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
                  <HomeButton />
                </Box>
                <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
                  <Text size="xxlarge" weight="bold">
                  Tree to Array Representations
                  </Text>
                </Box>
                <Box align="center" justify="center">
                  <Text size="large" margin="none" weight={500}>
                    Topic: Trees And Their Representations
                  </Text>
                </Box>
                <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
                <Text margin={{"bottom":"small"}} textAlign="center">
                  This tool helps you convert binary trees to their array representations.
                </Text>
                <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                  While binary trees are often visualized with nodes and connecting lines, they can also be represented using arrays. Array representations provide efficient storage and access methods for tree structures and are fundamental in many computational applications.
                </Text>

                <Text margin={{"bottom":"small"}} textAlign="center" weight="normal">
                  There are two common array representations for binary trees:
                </Text>

                {/* Explanation of Left-Child-Right-Child Representation */}
                <Box background="light-1" pad="small" round="small" margin={{ vertical: "small" }}>
                  <Text weight="bold" size="medium" margin={{ bottom: "xsmall" }}>Left Child-Right Child Representation</Text>
                  <Text textAlign="start" weight="normal" size="small">
                    This representation uses a table with three columns for each node:
                    <ul>
                      <li><strong>Node Value:</strong> The value stored in the node</li>
                      <li><strong>Left Child:</strong> The value of the node's left child (or None)</li>
                      <li><strong>Right Child:</strong> The value of the node's right child (or None)</li>
                    </ul>
                    This approach explicitly records the parent-child relationships for every node, making it intuitive to understand. It's particularly useful for educational purposes and when tree manipulation operations are frequent, as the relationships between nodes are directly accessible.
                  </Text>
                </Box>

                {/* Explanation of Pointer Representation */}
                <Box background="light-1" pad="small" round="small" margin={{ vertical: "small" }}>
                  <Text weight="bold" size="medium" margin={{ bottom: "xsmall" }}>Pointer Memory Representation</Text>
                  <Text textAlign="start" weight="normal" size="small">
                    This visualization models how trees are typically stored in computer memory using pointers:
                    <ul>
                      <li><strong>Value Field:</strong> Contains the actual node value</li>
                      <li><strong>Left Pointer:</strong> References the memory location of the left child</li>
                      <li><strong>Right Pointer:</strong> References the memory location of the right child</li>
                    </ul>
                    Each node is drawn as a block of three connected cells, mirroring how nodes would be implemented in languages like C or C++. The arrows visually demonstrate how pointers connect nodes in memory, which might be stored in non-contiguous memory locations. This representation is closer to real-world implementations in many programming languages.
                  </Text>
                </Box>

                <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                  Array representations have practical advantages in certain algorithms and memory-constrained environments. They can simplify tree operations, provide constant-time access to nodes, and reduce the overhead of storing explicit pointer data structures.
                </Text>
                <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
                  Enter your binary tree below to generate both the visual tree and its equivalent array representations!
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
                  <TextInput 
                    placeholder={getPlaceholder()}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  {error && <Text color="status-critical" margin={{ top: 'small' }}>{error}</Text>}
                </CardBody>
                <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
                  <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
                </CardFooter>
              </Card>
              
              <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
                <CardBody pad="small">
                  <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-2"}} round="xsmall">
                    {renderOutput()}
                  </Box>
                </CardBody>
              </Card>
              <ReportFooter />
            </PageContent>
          </Box>
        </PageTopScroller>
      
  );
};

export default TreeToArray;