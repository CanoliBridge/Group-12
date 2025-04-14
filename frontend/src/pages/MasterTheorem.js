import React, { useRef } from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, Spinner } from 'grommet';
import { solveMasterTheorem } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import MasterTheoremInput from '../components/MasterTheoremInput';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: MasterTheorem.js
* Author: Parker Clark
* Description: Solver page for analyzing the Master's Theorem.
*/

const MasterTheorem = () => {
  const [a, setA] = React.useState('');
  const [b, setB] = React.useState('');
  const [c, setC] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  // Create a ref to access the validation method
  const inputRef = useRef();

  // Diagnostics tracking
  const { trackResults } = useDiagnostics("MASTER_THEOREM");

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate inputs using the reference to the component's validation method
    if (inputRef.current && !inputRef.current.validate()) {
      setLoading(false);
      return;
    }

    setError('');

    // Define payload with parameter values
    const payload = {
      a: parseInt(a, 10),
      b: parseInt(b, 10),
      c: parseFloat(c)
    };

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveMasterTheorem(payload);

      // Track successful execution
      trackResults(
        payload,
        result,
        performance.now() - startTime
      );

      setOutput(result);
    } catch (err) {
      // Track failed execution
      trackResults(
        payload,
        { error: err.message || 'Unknown error' },
        performance.now() - startTime
      );

      setError('An error occurred while analyzing the Master Theorem.');
    } finally {
      setLoading(false);
    }
  };

  // Function to render the output with LaTeX
  const renderOutput = () => {
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
          result = output;
        }
      } else {
        result = output;
      }

      // Extract the LaTeX content
      let latexContent;
      if (typeof result === 'object' && result !== null && result.Result) {
        latexContent = `$${result.Result}$`;
      } else {
        latexContent = `$${typeof result === 'string' ? result : JSON.stringify(result)}$`;
      }

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
              The Master Theorem
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Order of Magnitude
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
              This tool helps you analyze the Master Theorem in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              The Master Theorem provides a straightforward way to determine the asymptotic behavior of recurrence relations that arise in the analysis of divide-and-conquer algorithms. This tool allows you to input a recurrence relation and determine its asymptotic complexity.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
              By analyzing recurrence relations using the Master Theorem, you can understand the time complexity of algorithms and compare their efficiency. This is useful in various applications such as algorithm design, computational complexity, and performance analysis.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
              Enter the parameters of your recurrence relation below to analyze its asymptotic complexity using the Master Theorem!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <MasterTheoremInput
                ref={inputRef}
                a={a}
                setA={setA}
                b={b}
                setB={setB}
                c={c}
                setC={setC}
                setError={setError}
              />
              {error && <Text color="status-critical">{error}</Text>}
            </CardBody>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"xxsmall"}}>
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

export default MasterTheorem;