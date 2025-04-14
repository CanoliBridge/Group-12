import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, Spinner, Select } from 'grommet';
import { solveBooleanMatrices } from '../api';
import MatrixOutput from '../components/MatrixOutput';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import MatrixTable from '../components/MatrixTable';
import MatrixToolbar from '../components/MatrixToolbar';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: BooleanMatrices.js
* Author: Parker Clark
* Description: Solver page for boolean matrices.
* Note: Each matrix will be parsed as a 2D array of strings.
*/

const BooleanMatrices = () => {
  const [matrix1, setMatrix1] = React.useState([['']]);
  const [matrix2, setMatrix2] = React.useState([['']]);
  const [operation, setOperation] = React.useState('MEET/JOIN');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("BOOLEAN_MATRICES");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    const validation = validateMatrices(matrix1, matrix2, operation);
    if (!validation.valid) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    setError('');
    
    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveBooleanMatrices(matrix1, matrix2, operation);

      // Tracking results for diagnostics
      trackResults(
        { matrix1: matrix1, matrix2: matrix2, operation: operation },
        result, 
        performance.now() - startTime
      )

      setOutput(result);
    } catch (err) {

      trackResults(
        { matrix1: matrix1, matrix2: matrix2, operation: operation },
        { error: err.message || "Error solving Boolean Matrices" },
        performance.now() - startTime
      );

      setError('An error occurred while generating the matrix.');
    } finally {
      setLoading(false);
    }
  }

  // Replace the validateMatrices function with this improved version:
  const validateMatrices = (matrix1, matrix2, operation) => {
    // Check if matrices contain only 0s and 1s
    const isValidContent = matrix => matrix.every(row => row.every(cell => cell === '0' || cell === '1'));
    
    if (!isValidContent(matrix1)) {
      return { valid: false, error: 'Matrix 1 should only contain 0s and 1s.' };
    }
    
    if (!isValidContent(matrix2)) {
      return { valid: false, error: 'Matrix 2 should only contain 0s and 1s.' };
    }

    // Check dimensions based on operation
    if (operation === 'MEET/JOIN') {
      if (matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) {
        return { 
          valid: false, 
          error: 'For MEET/JOIN operations, both matrices must have the same dimensions.' 
        };
      }
    } else if (operation === 'PRODUCT') {
      if (matrix1[0].length !== matrix2.length) {
        return { 
          valid: false, 
          error: 'For PRODUCT operation, the number of columns in Matrix 1 must equal the number of rows in Matrix 2.' 
        };
      }
    }
    
    // If we got here, everything is valid
    return { valid: true };
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
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">
              Boolean Matrices
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Matrices
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you generate and analyze Boolean matrices.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            A Boolean matrix is a matrix with entries from the Boolean domain {"{0, 1}"}. This tool allows you to input a Boolean matrix and perform various operations such as matrix multiplication, transposition, and finding the transitive closure.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By analyzing Boolean matrices, you can solve problems in graph theory, computer science, and combinatorics. This tool allows you to input a Boolean matrix and explore its properties through different operations.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your Boolean matrix below to generate and analyze its properties!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
                <MatrixTable label="Boolean Matrix 1" matrix={matrix1} setMatrix={setMatrix1} />
                <MatrixToolbar matrix={matrix1} setMatrix={setMatrix1} />
                <MatrixTable label="Boolean Matrix 2" matrix={matrix2} setMatrix={setMatrix2} />
                <MatrixToolbar matrix={matrix2} setMatrix={setMatrix2} />
            </CardBody>
            <Box align="center" justify="center" pad={{ vertical: 'small' }}>
              <Select
                options={['MEET/JOIN', 'PRODUCT']}
                value={operation}
                onChange={({ option }) => setOperation(option)}
              />
            </Box>
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

export default BooleanMatrices;