import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, Spinner } from 'grommet';
import { solveOrderOfMagnitude } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import PolynomialInput from '../components/PolynomialInput';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: OrderOfMagnitude.js
* Author: Parker Clark
* Description: Solver page for analyzing order of magnitude.
*/

const OrderOfMagnitude = () => {

  // Default order on page to 2
  const [order, setOrder] = React.useState('2');
  const [coefficients, setCoefficients] = React.useState([]);
  const [coefficients2, setCoefficients2] = React.useState([]);
  const [useLog, setUseLog] = React.useState(false);
  const [useRoot, setUseRoot] = React.useState(false);
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Reference to the PolynomialInput field for validation
  const polynomialInputRef = React.useRef(null);

  // Track diagnostics
  const { trackResults } = useDiagnostics("ORDER_OF_MAGNITUDE");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate inputs using the reference to the component's validation method
    if (polynomialInputRef.current && !polynomialInputRef.current.validate()) {
      setLoading(false);
      return;
    }

    setError('');

    // Define a 'payload' or input 'collection' to call API.
    const payload = {
      order: parseInt(order, 10),
      coefficients1: coefficients.map(c => parseFloat(c)),
      coefficients2: coefficients2.map(c => parseFloat(c)),
      useLog,
      useRoot
    };


    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      
      // Call the backend solver with the payload
      const result = await solveOrderOfMagnitude(payload);

      // Track successful execution
      trackResults(
        payload, // Input data
        result, // Success result
        performance.now() - startTime // Execution time
      );

      setOutput(result);
    } catch (err) {

      trackResults(
        {payload: payload}, // Input data
        { error: err.message || 'Unknown error' }, // Error result
        performance.now() - startTime // Execution time
      );

      setError('An error occurred while calculating the Order of Magnitude.');

    } finally {
      setLoading(false);
    }
  };

  const renderOutput = () => {
    // If no output, return a default message
    if (!output) {
      return "Output will be displayed here!";
    }
  
    try {
      // Parse JSON if it's a string
      let result;
      if (typeof output === 'string') {
        try {
          result = JSON.parse(output);
        } catch (e) {
          // If not valid JSON, use the string directly
          result = output;
        }
      } else {
        result = output;
      }
  
      // Extract the LaTeX content
      let latexContent;
      if (typeof result === 'object' && result !== null && result.Result) {
        // Format the equation with proper LaTeX delimiters
        latexContent = `$${result.Result}$`;
      } else {
        // Fallback to string representation
        latexContent = `$${typeof result === 'string' ? result : JSON.stringify(result)}$`;
      }
      console.log(latexContent);
      // Return the LaTeX component directly (not wrapped in Text)
      return <Latex>{latexContent}</Latex>;
    } catch (err) {
      console.error("Error rendering LaTeX:", err);
      return `Error: ${err.message}`;
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
              Order Of Magnitude
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Order of Magnitude
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
              This tool helps you analyze the order of magnitude in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              The order of magnitude is a way to express the scale or size of a value in powers of ten. This tool allows you to input a polynomial function and determine its order of magnitude.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              By analyzing the order of magnitude, you can understand the relative size of functions and compare their growth rates. This is useful in various applications such as algorithm analysis and computational complexity.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
              Enter your polynomial function below to analyze its order of magnitude!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
            <PolynomialInput
              order={order}
              setOrder={setOrder}
              coefficients={coefficients}
              setCoefficients={setCoefficients}
              coefficients2={coefficients2} 
              setCoefficients2={setCoefficients2}
              useLog={useLog}
              setUseLog={setUseLog}
              useRoot={useRoot}
              setUseRoot={setUseRoot}
              setError={setError}
              label1="First Polynomial (f)"
              label2="Second Polynomial (g)"
            />
                        
              {error && <Text color="status-critical">{error}</Text>}
            </CardBody>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
              <Button label={loading ? <Spinner /> : "Analyze"} onClick={handleSolve} disabled={loading} />
            </CardFooter>
          </Card>
          <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
            <CardBody pad="small">
              <Text weight="bold">
                Output:
              </Text>
              <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
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

export default OrderOfMagnitude;