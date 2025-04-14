import React, { useState} from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, Spinner } from 'grommet';
import { solveWarshallsAlgorithm } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import MatrixTable from '../components/MatrixTable';
import MatrixToolbar from '../components/WarshallToolbar';
import HomeButton from '../components/HomeButton';
import MatrixOutput from '../components/MatrixOutput';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: WarshallsAlgorithm.js
* Author: Parker Clark and Mathias Buchanan
* Description: Solver page for solving Warhsall's Algorithm problems.
*/

const WarshallsAlgorithm = () => {
  const [isCaveman, setIsCaveman] = useState(false);
  const [matrix, setMatrix] = React.useState([['0']]);
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

  const toggleText = () => setIsCaveman(!isCaveman);
    
          const betterText = (
            <>
              <Box align="center" justify="center">
                <Text size="large" margin="none" weight={500}>
                  Topic: Directed Graphs, Binary Relations, and Warshall's Algorithm
                </Text>
              </Box>
              <Box align="center" justify="start" direction="column" cssGap={false} width="large">
                <Text margin={{ bottom: "small" }} textAlign="center">
                  This tool helps you analyze graphs using Warshall's Algorithm, a fundamental concept in discrete mathematics.
                </Text>
                
                <Text margin={{ bottom: "small" }} textAlign="start" weight="normal">
                  Warshall's Algorithm is used to compute the transitive closure of a directed graph. The transitive closure determines which vertices are reachable from others, making the algorithm especially useful for applications like network analysis and pathfinding.
                </Text>
                
                <Text margin={{ bottom: "small" }} textAlign="start" weight="normal">
                  The algorithm operates on the graph's adjacency matrix, iteratively updating it to reflect reachability. If a path exists from vertex <i>i</i> to vertex <i>j</i> through vertex <i>k</i>, the matrix is updated to show that <i>j</i> is reachable from <i>i</i>.
                </Text>
                
                <Text textAlign="start" weight="normal" margin={{ bottom: "medium" }}>
                  While not the most efficient algorithm due to its time complexity of O(n³), Warshall's Algorithm is one of the simplest to understand. It systematically processes each row of the matrix: for each intermediate vertex, it updates the reachability information by combining (OR-ing) relevant rows. This tool visually demonstrates each step of the algorithm, making it easier to follow how the matrix evolves.
                </Text>
                
                <Text textAlign="start" weight="normal" margin={{ bottom: "medium" }}>
                  Enter your graph below to generate and analyze its transitive closure using Warshall's Algorithm!
                </Text>
              </Box>
            </>
          );
        
          const cavemanText = (
            <>
              <Box align="center" justify="start" direction="column" cssGap={false} width="large">
                <Text margin={{ bottom: "small" }} textAlign="center">
                  This tool analyzes graphs using Warshall’s Algorithm which is definitely what any advanced starship crew would use unless you’re using the Force to guide you through graph theory which honestly makes more sense than some ancient Vulcan logic no offense to logic but like come on
                </Text>

                <Text margin={{ bottom: "small" }} textAlign="start" weight="normal">
                  Warshall’s Algorithm calculates the transitive closure of a directed graph which means it figures out which planets no nodes are reachable from others like plotting warp paths or maybe charting connections in the Jedi Council archive except this doesn’t involve any holocrons or dilithium just matrices so stop yelling
                </Text>

                <Text margin={{ bottom: "small" }} textAlign="start" weight="normal">
                  You start with an adjacency matrix then go row by row column by column whatever it updates itself to show if there’s a path from i to j through k and yes that sounds like a transporter buffer protocol but it’s also literally how droids map their target reach no it’s math pure math no Force ghosts involved just logic and OR operations
                </Text>

                <Text textAlign="start" weight="normal" margin={{ bottom: "medium" }}>
                  It’s got a time complexity of O(n³) which isn’t ideal but neither is getting tractor-beamed into a cube or accidentally jumping into a binary star system so it’s fine it works okay each step combines reachability info like merging nav charts or scanning for subspace anomalies or mind-merging with an ancient being that lives inside a matrix metaphorically not literally although that would be cool too
                </Text>

                <Text textAlign="start" weight="normal" margin={{ bottom: "medium" }}>
                  Just enter your graph already and watch the adjacency matrix evolve with every iteration yes like evolution on a galactic scale no like tactical recalibration in real time no like fate guiding every connection shut up it’s a matrix just press go
                </Text>
              </Box>
            </>
          );

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
    <PageTopScroller>
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <PageContent align="center" skeleton={false}>
          <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
            <HomeButton />
          </Box>
          <Box align="end" style={{ position: 'absolute', top: 0, right: 0, padding: '10px' }}>
            <Button label={isCaveman ? "Switch to Normal" : "Switch"} onClick={toggleText} style={{ color: 'white', border: '1px solid white' }}/>
          </Box>
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">
              Warshall's Algorithm Solver
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" width={'large'}>
            {isCaveman ? cavemanText : betterText}
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
    </PageTopScroller>
  );
};

export default WarshallsAlgorithm;
