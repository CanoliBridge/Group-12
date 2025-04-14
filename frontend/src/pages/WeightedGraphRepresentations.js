import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Select, Collapsible, Tab, Tabs } from 'grommet';
import { solveWeightedGraphs } from '../api';
import { CircleInformation } from 'grommet-icons';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import AdjacencyMatrix from '../components/AdjacencyMatrix';
import AdjacencyList from '../components/AdjacencyList';
import { useDiagnostics } from '../hooks/useDiagnostics';
import WeightedGraphInput from '../components/WeightedGraphInput';

/*
* Name: WeightedGraphRepresentations.js
* Author: Parker Clark
* Description: Solver page for weighted graphs. Also includes AdjacencyMatrix and AdjacencyList component
*/

const WeightedGraphRepresentations = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [type, setType] = React.useState('UNDIRECTED');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  // Initialize diagnostic hook
  const { trackResults } = useDiagnostics("WEIGHTED_GRAPHS");

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

    const startTime = performance.now();

    try {
      const result = await solveWeightedGraphs(input, type);
      const parsedResult = JSON.parse(result);
      console.log(parsedResult);
      
      // Track successful execution with timing
      trackResults(
        { formula: input }, // Input data
        parsedResult,       // Result data
        performance.now() - startTime      // Execution time in ms
      );
      
      setOutput(parsedResult);
    } catch (err) {
      // Track failed execution with timing
      trackResults(
        { formula: input },
        { error: err.message || 'Unknown error' },
        performance.now() - startTime
      );
      
      setError('An error occurred while generating the weighted graph.');
    } finally {
      setLoading(false);
    }
  }

  const validateInput = (input) => {
    // Updated regex to allow alphanumeric characters (letters and numbers) for vertex names
    const graphRegex = /^\{\s*(\(\s*[a-zA-Z0-9]+\s*,\s*[a-zA-Z0-9]+\s*;\s*\d+\s*\)\s*,\s*)*(\(\s*[a-zA-Z0-9]+\s*,\s*[a-zA-Z0-9]+\s*;\s*\d+\s*\))\s*\}$/;
    return graphRegex.test(input);
  }

  // Render output for graph image, adjacency matrix, and adjacency list
  // Render output for graph image, adjacency matrix, and adjacency list
const renderOutput = () => {
  if (!output.Graph && !output.Matrix && !output.List) {
    return "Output will be displayed here!";
  }

  return (
    <Box>
      <Tabs>
        <Tab title="Graph Visualization">
          <Box pad="small">
            {output.Graph && (
              <Box align="center" justify="center" pad={{ vertical: 'small' }} background={{ color: 'white' }} round="small">
                <img src={`data:image/png;base64,${output.Graph}`} alt="Graph" style={{ maxWidth: '100%', height: 'auto' }} />
              </Box>
            )}
          </Box>
        </Tab>
        
        <Tab title="Matrix Representation">
          <Box pad="small">
            {output.Matrix && (
              <Box align="center" justify="center" pad={{ vertical: 'small' }} background={{ color: 'white' }} round="small">
                <AdjacencyMatrix matrix={output.Matrix} />
              </Box>
            )}
          </Box>
        </Tab>
        
        <Tab title="List Representation">
          <Box pad="small">
            {output.List && (
              <Box align="center" justify="center" pad={{ vertical: 'small' }} background={{ color: 'white' }} round="small">
                <AdjacencyList list={output.List} />
              </Box>
            )}
          </Box>
        </Tab>
      </Tabs>
    </Box>
  );
};

  return (
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <PageContent align="center" skeleton={false}>
          <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
            <HomeButton />
          </Box>
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">
            Weighted Graph Representations
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Graphs And Their Representations
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze weighted graphs in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Weighted graphs are a type of graph where each edge has an associated numerical value, called a weight. These weights can represent various quantities such as distances, costs, or capacities, depending on the context of the problem.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            In a weighted graph, the vertices (or nodes) are connected by edges that have weights. This allows for more detailed modeling of real-world problems, such as finding the shortest path in a transportation network, optimizing network flows, or analyzing social networks.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By analyzing weighted graphs, you can understand the relationships and connections between different entities, taking into account the significance of the connections. This is useful in various applications such as network analysis, algorithm design, and optimization problems. This tool allows you to input a weighted graph and explore its properties and representations.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your weighted graph below to generate and analyze its properties using this tool!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <Box direction="row" align="start" justify="start" margin={{ bottom: 'small' }} style={{ marginLeft: '-8px', marginTop: '-8px' }}>
                <Button icon={<CircleInformation />} onClick={() => setShowHelp(!showHelp)} plain />
              </Box>
              <Collapsible open={showHelp}>
                <Box pad="small" background="light-2" round="small" margin={{ bottom: "medium" }} width="large">
                  <Text>
                    To input a weighted graph, use the following format:
                  </Text>
                  <Text>
                    <strong>{'{(x1, y1; w1), (x2, y2: w2), ...}'}</strong>
                  </Text>
                  <Text>
                    For example: <strong>{'{(0, 1; 4), (1, 2; 2), (2, 0; 3)}'}</strong>
                  </Text>
                  <Text>
                    Each tuple represents a connection between two vertices with a weight. So (0, 1; 4) represents an edge between vertex 0 and vertex 1 with a weight of 4.
                  </Text>
                </Box>
              </Collapsible>
              <WeightedGraphInput 
                value={input}
                onChange={setInput}
              />
              {error && <Text color="status-critical">{error}</Text>}
            </CardBody>
            <Box align="center" justify="center" pad={{ vertical: 'small' }}>
              <Select
                options={['UNDIRECTED', 'DIRECTED']}
                value={type}
                onChange={({ option }) => setType(option)}
              />
            </Box>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
              <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
            </CardFooter>
          </Card>
          <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
            <CardBody pad="small">
              <Text weight="bold">
                Output:
              </Text>
              <Box>
                {loading ? (
                  <Box align="center" pad="medium">
                    <Spinner />
                  </Box>
                ) : (
                  renderOutput()
                )}
              </Box>
            </CardBody>
          </Card>
          <ReportFooter />
        </PageContent>
      </Box>
    </Page>
  );
};

export default WeightedGraphRepresentations;