import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, Select, Collapsible } from 'grommet';
import { solveAdjacencyMatricesLists } from '../api';
import { CircleInformation } from 'grommet-icons';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import AdjacencyMatrix from '../components/AdjacencyMatrix';
import AdjacencyList from '../components/AdjacencyList';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: AdjacencyMatricesLists.js
* Author: Parker Clark
* Description: Solver page for adjacency matrices and adjacency lists.
*/

const AdjacencyMatricesLists = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [type, setType] = React.useState('UNDIRECTED');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const { trackResults } = useDiagnostics("ADJACENCY_MATRICES_LISTS");

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
        // Do some conversion to display any backend errors
        let result = await solveAdjacencyMatricesLists(input, type);
  
        // Parse result if it is a string
        if (typeof result === 'string') {
          result = JSON.parse(result);
        }
        
        // Check if there is an error key in the result
        const errorKey = Object.keys(result).find(key => key.toLowerCase().includes('error'));
        console.log(errorKey);
        if (errorKey) {

          trackResults(
            { input, type }, // Input data
            { error: result[errorKey] }, // Error result
            performance.now() - startTime // Execution time
          );

          setError(result[errorKey]);
        } else {

          trackResults(
            { input, type }, // Input data
            result, // Success result
            performance.now() - startTime // Execution time
          );

          setOutput(result);
        }
      } catch (err) {
        console.log(err);

        trackResults(
          { input, type }, // Input data
          { error: err.message || 'Unknown error' }, // Error result
          performance.now() - startTime // Execution time
        );

        setError('An error occurred while generating the Graph.');
      } finally {
        setLoading(false);
      }
    };

  const validateInput = (input) => {
    // Regular expression to match 'coordinate' pairs in the form of {(x1, y1), (x2, y2), ...}
    const graphRegex = /^\{\s*(\(\s*\d+\s*,\s*\d+\s*\)\s*,\s*)*(\(\s*\d+\s*,\s*\d+\s*\))\s*\}$/;
    return graphRegex.test(input);
  }

  // Render output for graph image, adjacency matrix, and adjacency list
  const renderOutput = () => {
    if (!output.Graph && !output.Matrix && !output.List) {
      return "Output will be displayed here!";
    }

    return (
      <Box>
        {output.Graph && (
          <Box align="center" justify="center" pad={{ vertical: 'small' }} background={{ color: 'light-3' }} round="xsmall">
            <img src={`data:image/png;base64,${output.Graph}`} alt="Graph" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        )}
        {output.Matrix && (
          <Box align="center" justify="center" pad={{ vertical: 'small' }} background={{ color: 'light-3' }} round="xsmall">
            <Text>Matrix Representation:</Text>
            <AdjacencyMatrix matrix={output.Matrix} />
          </Box>
        )}
        {output.List && (
          <Box align="center" justify="center" pad={{ vertical: 'small' }} background={{ color: 'light-3' }} round="xsmall">
            <Text>List Representation:</Text>
            <AdjacencyList list={output.List} />
          </Box>
        )}
      </Box>
    );
  };


  return (
    <PageTopScroller>
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '65%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <PageContent align="center" skeleton={false}>
          <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
            <HomeButton />
          </Box>
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">
              Adjacency Matrices and Adjacency Lists
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Graphs And Their Representations
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze graphs using adjacency matrices and adjacency lists.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Adjacency matrices and adjacency lists are two common ways to represent graphs. An adjacency matrix is a 2D array of size VxV where V is the number of vertices in a graph. Each cell in the matrix represents an edge between two vertices. If there is an edge between vertex i and vertex j, the cell at row i and column j will be 1 (or the weight of the edge), otherwise, it will be 0.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            An adjacency list, on the other hand, is an array of lists. The size of the array is equal to the number of vertices. Each element of the array is a list that contains all the vertices that are adjacent to the corresponding vertex. This representation is more space-efficient for sparse graphs.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By analyzing graphs using adjacency matrices and lists, you can understand the relationships and connections between different entities. This is useful in various applications such as network analysis, algorithm design, and optimization problems. This tool allows you to input a graph and explore its properties and representations.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your graph below to generate and analyze its properties using this tool!
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
                  To input a graph, use the following format:
                </Text>
                <Text>
                  <strong>{'{(x1, y1), (x2, y2), ...}'}</strong>
                </Text>
                <Text>
                  For example: <strong>{'{(0, 1), (1, 2), (2, 0)}'}</strong>
                </Text>
                <Text>
                  Each tuple represents a connection between two vertices. So (0, 1) represents an edge between vertex 0 and vertex 1.
                </Text>
              </Box>
            </Collapsible>
            <TextInput 
              placeholder="Example: Enter your notation here (e.g., {(0, 1), (1, 2), (2, 0)})"
              value={input}
              onChange={(event) => setInput(event.target.value)}
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

export default AdjacencyMatricesLists;