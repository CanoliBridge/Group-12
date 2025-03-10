import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, Spinner } from 'grommet';
import { solveWarshallsAlgorithm } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import MatrixTable from '../components/MatrixTable';
import MatrixToolbar from '../components/MatrixToolbar';
import HomeButton from '../components/HomeButton';
import MatrixOutput from '../components/MatrixOutput';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: WarshallsAlgorithm.js
* Author: Parker Clark
* Description: Solver page for solving Warhsall's Algorithm problems.
*/

const WarshallsAlgorithm = () => {
  const [matrix, setMatrix] = React.useState([['']]);
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Add diagnostics
  const { trackResults } = useDiagnostics("WARSHALLS_ALGORITHM");

  const handleSolve = async () => {
    setLoading(true);
    setOutput('');
    setError('');


    // Validate input
    if (!validateMatrices(matrix)) {
      setError('Invalid input. Please ensure both matrix only contain only 0s and 1s and is square.');
      setLoading(false);
      return;
    }

    const startTime = performance.now();
    
    try {
      const result = await solveWarshallsAlgorithm(matrix);
      const parsedResult = JSON.parse(result);
      console.log(parsedResult);
      
      // Track successful execution with timing
      trackResults(
        { formula: matrix }, // Input data
        parsedResult,       // Result data
        performance.now() - startTime      // Execution time in ms
      );
      
      setOutput(parsedResult);
    } catch (err) {
      // Track failed execution with timing
      trackResults(
        { formula: matrix },
        { error: err.message || 'Unknown error' },
        performance.now() - startTime
      );
      
      setError('An error occurred while generating the weighted graph.');
    } finally {
      setLoading(false);
    }
  };

  const validateMatrices = (matrix) => {

    // Check for empty matrix
    if (!matrix || matrix.length === 0) {
      return false;
    }
    
    // Check if the matrix is square
    const columns = matrix[0].length;
    const isSquareMatrix = matrix.length === columns;

    // Check to make sure all cells are either 0 or 1
    const isValidMatrix = matrix.every(row => row.every(cell => cell === '0' || cell === '1'));

    return isSquareMatrix && isValidMatrix;
  };

  const renderOutput = () => {
    if (!output) {
      return "Output will be displayed here.";
    }
    
    try {
      // Parse output if it's a JSON string
      const matrices = typeof output === 'string' ? JSON.parse(output) : output;
      return <MatrixOutput matrices={matrices} />;
    } catch (e) {
      console.error("Error rendering matrix output:", e);
      return "Error rendering matrices.";
    }
  };

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
              Warshall's Algorithm Solver
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Directed Graphs, Binary Relations, and Warshall's Algorithm
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
              This tool helps you analyze graphs using Warshall's Algorithm in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              Warshall's Algorithm is used to find the transitive closure of a directed graph. The transitive closure of a graph is a measure of which vertices are reachable from other vertices. This algorithm is useful in various applications such as finding the reachability of nodes in a network.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              In Warshall's Algorithm, we start with the adjacency matrix of the graph. The algorithm iteratively updates the matrix to reflect the reachability of vertices. If there is a path from vertex i to vertex j through vertex k, the algorithm updates the matrix to indicate that vertex j is reachable from vertex i.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
              By analyzing graphs using Warshall's Algorithm, you can understand the reachability and connectivity of different nodes in a graph. This is useful in various applications such as network analysis, algorithm design, and optimization problems. This tool allows you to input a graph and explore its transitive closure using Warshall's Algorithm.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
              Enter your graph below to generate and analyze its transitive closure using Warshall's Algorithm!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <MatrixTable label="Adjacency Matrix" matrix={matrix} setMatrix={setMatrix} />
              <MatrixToolbar matrix={matrix} setMatrix={setMatrix} combined addRemoveBoth />
            </CardBody>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
              <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
            </CardFooter>
          </Card>
          {error && (
            <Text color="status-critical" margin={{"top":"small"}}>
              {error}
            </Text>
          )}
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
  );
};

export default WarshallsAlgorithm;
