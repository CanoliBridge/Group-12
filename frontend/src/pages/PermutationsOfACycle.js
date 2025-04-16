import React from 'react';
import { Box, Text, Button } from 'grommet';
import { solvePermutationsCycle } from '../api';
import { useDiagnostics } from '../hooks/useDiagnostics';
import SolverPage from '../components/SolverPage';
import MatrixTable from '../components/PermutationsInput';
import MatrixToolbar from '../components/PermutatinsToolbar';
import LatexLine from '../components/LatexLine';

/*
* Name: PermutationsOfACycle.js
* Author: Parker Clark, Jacob Warren
* Description: Solver page for analyzing permutations of a cycle.
*/

const PermutationsOfACycle = () => {
  const [matrix, setMatrix] = React.useState([['']]);
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("PERMUTATIONS_CYCLE");
  
  const fillWithSingle = () => {
      const SAMPLE_MATRIX = [
        ['1', '2', '3', '4'],
        ['2', '3', '4', '1']
      ];

    setMatrix(SAMPLE_MATRIX);
  };

  const fillWithTwo = () => {
      const SAMPLE_MATRIX = [
        ['1', '2', '3', '4'],
        ['2', '1', '4', '3']
      ];

    setMatrix(SAMPLE_MATRIX);
  };

  const fillWithThree = () => {
      const SAMPLE_MATRIX = [
        ['l', '2', '3', '4', 'p', '54', '1'],
        ['2', 'l', '4', 'p', '3', '1', '54']
      ];

    setMatrix(SAMPLE_MATRIX);
  };

  const fillWithIdentity = () => {
      const SAMPLE_MATRIX = [
        ['1', '2', '3'],
        ['1', '2', '3']
      ];

    setMatrix(SAMPLE_MATRIX);
  };

  const Info = () => {
    return (
      <>
        <Text weight="bold" margin={{ bottom: "xsmall" }}>
          Permutation Cycles:
        </Text>
        <Text>
          To input a permutation:
        </Text>
        <Text margin={{ top: "xsmall" }}>
          1. First row: Enter the domain elements (e.g., 1 2 3 4)
        </Text>
        <Text>
          2. Second row: Enter where each element maps to (e.g., 2 3 4 1)
        </Text>
        <Text margin={{ top: "xsmall" }}>
          The example above represents the cycle (1 2 3 4) where 1→2, 2→3, 3→4, and 4→1.
        </Text>
        
        <Box margin={{ top: 'medium' }} align="center">
          <Button 
            label="Fill with Single Cycle" 
            onClick={fillWithSingle} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with Two Cycle" 
            onClick={fillWithTwo} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with Three Cycle" 
            onClick={fillWithThree} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with Identity" 
            onClick={fillWithIdentity} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
        </Box>
      </>
    );
  };

  const handleSolvePermutations = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');
    
    // Start timing for performance tracking
    const startTime = performance.now();
  
    // Validate that the matrix has exactly 2 rows
    if (matrix.length !== 2) {
      setLoading(false);
      setError('Matrix must have exactly 2 rows.');
      return;
    }
    
    const top = []
    const bottom = []

    for (let i = 0; i < matrix[0].length; i++) {
        if (top.includes(matrix[0][i])) {
            setError("Can't have duplicate inputs:" + matrix[0][i]);
        }

        if (bottom.includes(matrix[1][i])) {
            setError("Can't have duplicate outputs:" + matrix[1][i]);
        }

        top.push(matrix[0][i]);
        bottom.push(matrix[1][i]);
    }

    try {
      const result = await solvePermutationsCycle(matrix);
      
      // Tracking results for diagnostics
      trackResults(
        { matrix: matrix },
        result, 
        performance.now() - startTime
      );
  
      // Check if the response contains an error
      if (result.error) {
        throw new Error(result.error);
      }
  
      setOutput(result);
    } catch (err) {
      if (err.message.includes("Not a permutation.")) {
        setError("Not a permutation. Please ensure your input is a valid bijection.");
        // Tracking failures for diagnostics
        trackResults(
          { matrix: matrix },
          { error: err.message || "Error solving PERT diagram" },
          performance.now() - startTime
        );
        return;
      } else {
        setError("Not a permutation. Please ensure your input is a valid bijection.");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SolverPage
      title="Permutations"
      topic="Functions"
      description="This tool produces the cycle form of a permutation."
      DescriptionComponent={Description}
      InfoText={Info}
      InputComponent={Input}
      input_props={{matrix, setMatrix}}
      error={error}
      handle_solve={handleSolvePermutations}
      loading={loading}
      OutputComponent={Output}
      output_props={{output}}
    />
  );
};

const Description = () => {
    return(
      <div style={{textAlign: "left"}}>
        <LatexLine
          string="Given a set $S$, a permutation of $S$ is a bijective function $f:S\to S$."
        />
        <Text weight="bold" margin={{"bottom": "small"}}>Array Form</Text>
        <LatexLine
          string="For finite sets, the array form of a permutation is is a two rowed matrix where the top row is your domain, and a bottom row entry corresponds to the image under the permutation for the element above."
        />
        <Text weight="bold" margin={{"bottom": "small"}}>Cycle Form</Text>
        <LatexLine
          string="The cycle form of a permutation expresses the permutation as a composition of disjoint cycles, where each element maps to the element to its right (wrapping at the end). Every permutation on finite sets, besides the identity permutation, can be represented this way (with a single element cycle (a) representing the identity, for output purposes). Example: $$ (1\ 2\ 3)\circ (4\ 5)$$"
        />
        <LatexLine
          string="Enter your permutation of $S$ in array form below."
        />
      </div>
    );
}

const Input = ({ matrix, setMatrix }) => {
    return (
      <Box>
        <MatrixTable label="Input Matrix" matrix={matrix} setMatrix={setMatrix} />
        <MatrixToolbar matrix={matrix} setMatrix={setMatrix} combined addRemoveBoth />
      </Box>
    );
};

const Output = ({ output }) => {
    if (!output) {
      return "Output will be displayed here!";
    }

    const results = typeof output === 'string' ? JSON.parse(output) : output;
    return (
        <Text>
            {Object.entries(results).map(([key, value]) => `${key}: ${value}`).join(', ')}
        </Text>
    )
};

export default PermutationsOfACycle;
