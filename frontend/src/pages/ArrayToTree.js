import React, { useState } from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, TextArea, Spinner, Image, Table, TableHeader, TableBody, TableRow, TableCell, Collapsible, Tab, Tabs } from 'grommet';
import { solveArrayToTree } from '../api';
import { CircleInformation } from 'grommet-icons';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: ArrayToTree.js
* Description: Solver page for converting array representation to a binary tree.
*/

const ArrayToTree = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = React.useState(false);
  
  const { trackResults } = useDiagnostics("ARRAY_TO_TREE");

  const handleSolve = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    if (!input.trim()) {
      setError('Input cannot be empty.');
      setLoading(false);
      return;
    }

    // Validate input
    const validation = validateInput(input);
    if (!validation.isValid) {
      setError(validation.error);
      setLoading(false);
      setResult(null);
      return;
    }
    
    const startTime = performance.now();
    
    try {
      const response = await solveArrayToTree(input);
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Track results
      trackResults(
        { input },
        data,
        performance.now() - startTime
      );
      
      setResult(data);
    } catch (err) {
      console.error('Error converting array to tree:', err);
      setError('An error occurred while processing your input.');
      
      // Track exception
      trackResults(
        { input },
        { error: err.message || 'Unknown error' },
        performance.now() - startTime
      );
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (input) => {
    if (!input || !input.trim()) {
      return { isValid: false, error: 'Input cannot be empty.' };
    }
  
    const lines = input.trim().split('\n');
    const seenNodes = new Set();
    const childNodes = new Set();
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const tokens = line.split(/\s+/); // Split by any whitespace
  
      // Check if we have exactly 3 tokens per line
      if (tokens.length !== 3) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Each line must have exactly 3 values (node, leftChild, rightChild).` 
        };
      }
  
      const [node, leftChild, rightChild] = tokens;
  
      // Check if node is a single alphanumeric character
      if (!/^[a-zA-Z0-9]$/.test(node)) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Node value "${node}" must be a single alphanumeric character.` 
        };
      }
  
      // Check if node was already defined
      if (seenNodes.has(node)) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Node "${node}" is defined multiple times.` 
        };
      }
      seenNodes.add(node);
  
      // Check left child format (single alphanumeric or '0')
      if (leftChild !== '0' && !/^[a-zA-Z0-9]$/.test(leftChild)) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Left child "${leftChild}" must be a single alphanumeric character or '0'.` 
        };
      }
  
      // Check right child format (single alphanumeric or '0')
      if (rightChild !== '0' && !/^[a-zA-Z0-9]$/.test(rightChild)) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Right child "${rightChild}" must be a single alphanumeric character or '0'.` 
        };
      }

      // Check for self-referencing nodes (cycle detection)
      if (leftChild === node || rightChild === node) {
        return {
          isValid: false,
          error: `Line ${i + 1}: Node "${node}" cannot have itself as a child. This would create a cycle.`
        };
      }
  
      // Track child nodes for later validation
      if (leftChild !== '0') childNodes.add(leftChild);
      if (rightChild !== '0') childNodes.add(rightChild);
    }
  
    // Optional: Check if there's a consistent tree structure
    // First node should be the root (not a child of any other node)
    if (lines.length > 0) {
      const firstNode = lines[0].trim().split(/\s+/)[0];
      if (childNodes.has(firstNode)) {
        return { 
          isValid: false, 
          error: `Invalid tree structure: Root node "${firstNode}" is also a child of another node.` 
        };
      }
    }
  
    // Check that all non-root nodes are children of some node
    for (let i = 1; i < lines.length; i++) {
      const node = lines[i].trim().split(/\s+/)[0];
      if (!childNodes.has(node)) {
        return { 
          isValid: false, 
          error: `Invalid tree structure: Node "${node}" is not connected to the tree.` 
        };
      }
    }
  
    return { isValid: true };
  };

  // Then replace the renderOutput function with this tabbed version
  const renderOutput = () => {
    if (loading) {
      return <Spinner size="medium" />;
    }
    
    if (!result) {
      return <Text>Output will be displayed here!</Text>;
    }
    
    if (result.success === false) {
      return <Text color="status-critical">{result.error}</Text>;
    }
    
    return (
      <Tabs>
        {/* Tree Visualization Tab */}
        <Tab title="Tree Visualization">
          <Box pad="small">
            {result.image && (
              <Box>
                <Text weight="bold" margin={{ bottom: 'small' }}>Tree Visualization:</Text>
                <Box height="medium" overflow="auto" background="white" pad="small" round="small">
                  <Image 
                    src={`data:image/png;base64,${result.image}`}
                    fit="contain"
                    alt="Binary tree visualization"
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Tab>
        
        {/* Table Representation Tab */}
        <Tab title="Table Representation">
          <Box pad="small">
            {result.table && result.table.length > 0 && (
              <Box>
                <Text weight="bold" margin={{ bottom: 'small' }}>Node-Child Relationship Table:</Text>
                <Box background="white" pad="small" round="small" overflow="auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell scope="col" border="bottom" background="light-2">
                          <Text weight="bold">Node</Text>
                        </TableCell>
                        <TableCell scope="col" border="bottom" background="light-2">
                          <Text weight="bold">Left Child</Text>
                        </TableCell>
                        <TableCell scope="col" border="bottom" background="light-2">
                          <Text weight="bold">Right Child</Text>
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.table.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell><Text>{row.node}</Text></TableCell>
                          <TableCell><Text>{row.leftChild}</Text></TableCell>
                          <TableCell><Text>{row.rightChild}</Text></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            )}
          </Box>
        </Tab>
        
        {/* Node Listing Tab */}
        <Tab title="Node Listing">
          <Box pad="small">
            {result.nodes && result.nodes.length > 0 && (
              <Box>
                <Text weight="bold" margin={{ bottom: 'small' }}>Nodes (BFS order):</Text>
                <Box background="white" pad="small" round="small">
                  <Text>{result.nodes.join(', ')}</Text>
                </Box>
              </Box>
            )}
          </Box>
        </Tab>
      </Tabs>
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
              Array Representation to Binary Tree
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Tree Representations
            </Text>
          </Box>
          
          <Box align="center" justify="start" direction="column" width='large'>
            <Text margin={{ bottom: 'small' }} textAlign="center">
              Convert a table-based array representation of a binary tree to its visual tree structure.
            </Text>

            <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
              <Text margin={{"bottom":"small"}} textAlign="center">
                This tool converts array-based representations of binary trees into visual tree structures.
              </Text>
              <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                While binary trees are naturally visualized as connected nodes, they are often stored in computer memory using array-based representations. These array formats are efficient for storage and certain operations, but can be difficult to interpret visually.
              </Text>
              <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                The conversion process works by parsing the parent-child relationships defined in your array representation, then reconstructing the hierarchical structure of the tree. Each node from the array is placed in its proper position within the tree, connecting parent nodes to their children according to the relationships defined in your input.
              </Text>
              <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                This transformation is particularly useful in:
                <ul>
                  <li>Understanding complex tree structures stored in databases or memory</li>
                  <li>Visualizing algorithms that work with array-based tree representations</li>
                  <li>Verifying that your array correctly represents the intended tree structure</li>
                  <li>Converting between different tree representation formats</li>
                </ul>
              </Text>
              <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
                Recall that we use a notation called "left-child right-child" to represent the relationship between nodes in a binary tree. The representation is as follows:
              </Text>
              <Box background="light-1" pad="small" round="small" margin={{ vertical: "small" }}>
                <Text weight="bold" size="medium" margin={{ bottom: "xsmall" }}>Left-Child Right-Child Table Representation</Text>
                <Text textAlign="start" weight="normal" size="small">
                  This representation uses a table with three columns for each node:
                  <ul>
                    <li><strong>Node Value:</strong> The value stored in the node</li>
                    <li><strong>Left Child:</strong> The value of the node's left child (or 0 for None)</li>
                    <li><strong>Right Child:</strong> The value of the node's right child (or 0 for None)</li>
                  </ul>
                  This approach explicitly stores the parent-child relationships, making it intuitive for tree traversal and reconstruction.
                </Text>
              </Box>
              <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
                Enter your array-based tree representation below to generate the corresponding visual tree structure!
              </Text>
            </Box>
          </Box>
            
            
          
          <Card width="large" pad="medium" background={{ color: "light-1" }}>
            <CardBody pad="small">
              <Box margin={{bottom : "small" }}><Box direction="row" align="start" justify="start" margin={{ bottom: 'small' }} style={{ marginLeft: '-8px', marginTop: '-8px' }}>
                <Button icon={<CircleInformation />} onClick={() => setShowHelp(!showHelp)} plain />
              </Box>
              <Collapsible open={showHelp}>
                <Box background="light-3" pad="small" round="small" margin={{ vertical: "small" }}>
                  <Text weight="bold" size="medium" margin={{ bottom: "xsmall" }}>Input Format Guide</Text>
                  <Text textAlign="start" weight="normal" size="small">
                    Enter each node in the format: "node left_child right_child"
                    <ul>
                      <li>Each line represents one node and its children</li>
                      <li>Use '0' to indicate no child (NULL)</li>
                      <li>The first node is considered the root</li>
                    </ul>
                    Example:
                    <pre style={{ background: '#f8f8f8', padding: '8px', borderRadius: '4px' }}>
                      A B C<br />
                      B D E<br />
                      C F 0<br />
                      D 0 0<br />
                      E 0 0<br />
                      F 0 0
                    </pre>
                    This represents a tree where A is the root with children B and C, etc.
                  </Text>
                </Box>
              </Collapsible>
              <TextArea
                placeholder="Enter your tree table representation (e.g., 'A B C' on first line, etc.)"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={8}
                resize={false}
              />
              {error && <Text color="status-critical" margin={{ top: 'small' }}>{error}</Text>}
            </Box>
            </CardBody>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{ top: "small" }}>
              <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
            </CardFooter>
          </Card>
          
          <Card width="large" pad="medium" background={{ color: "light-2" }} margin={{ top: "medium" }}>
            <CardBody pad="small">
              <Text weight="bold">
                Output:
              </Text>
              <Box align="center" justify="center" pad={{ vertical: "small" }} background={{ color: "light-2" }} round="xsmall">
                {renderOutput()}
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

export default ArrayToTree;