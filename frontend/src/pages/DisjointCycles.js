import React from 'react';
import { Box, Text, TextInput, Button} from 'grommet';
import { solveDisjointCycles } from '../api';
import { useDiagnostics } from '../hooks/useDiagnostics';
import SolverPage from '../components/SolverPage';
import LatexLine from '../components/LatexLine';

/*
* Name: DisjointCycles.js
* Author: Parker Clark, Jacob Warren
* Description: Solver page for analyzing disjoint cycles.
*/

const DisjointCycles = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("DISJOINT_CYCLES");

  
  const fillWithSingle = () => {
    const SAMPLE_INPUT = "(1)";
    setInput(SAMPLE_INPUT);
  };

  const fillWithTwo = () => {
    const SAMPLE_INPUT = "(1 2 3)(3 4)";
    setInput(SAMPLE_INPUT);
  };

  const fillWithFour = () => {
    const SAMPLE_INPUT = "(1 2 3)(4 5)(4 2)(7 5)";
    setInput(SAMPLE_INPUT);
  };

  const fillWithNoOverlap = () => {
    const SAMPLE_INPUT = "(1 2 3)(4 5)";
    setInput(SAMPLE_INPUT);
  };

  const Info = () => {
    return (
      <>
        <Text weight="bold" margin={{ bottom: "xsmall" }}>
          Disjoint Cycles:
        </Text>
        <Text>
          To input a permutation in a cycle form, use the following format:
        </Text>
        <Text>
          <strong>(a b c)(d e f)</strong>
        </Text>

        <Box margin={{ top: 'medium' }} align="center">
          <Button 
            label="Fill with Single Element" 
            onClick={fillWithSingle} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with Two Cycles" 
            onClick={fillWithTwo} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with Four Cycles" 
            onClick={fillWithFour} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
          <Button 
            label="Fill with Disjoint" 
            onClick={fillWithNoOverlap} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
        </Box>
      </>
    );
  };

  const renderOutput = () => {
    if (!output) {
      return "Output will be displayed here!";
    }
    
    // If output is already a formatted string, return it directly
    if (typeof output === 'string') {
      return output;
    }
    
    // Otherwise parse and format the object
    const results = output;
    return Object.entries(results)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };
            
  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate input
    const isValid = validateInput(input);
    if (!isValid) {
      setError('Invalid input. Please enter a valid permutation.');
      setLoading(false);
      return;
    }

    const formatOutput = (input) => {
      const results = typeof input === 'string' ? JSON.parse(input) : input;
      return Object.entries(results)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    };

    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveDisjointCycles(input);

      trackResults(
        { input: input },
        result, 
        performance.now() - startTime
      );

      setOutput(formatOutput(result));

    } catch (err) {

      trackResults(
        { input: input },
        { error: err.message || "Error solving Disjoint Cycle" },
        performance.now() - startTime
      );

      setError('An error occurred while generating the Disjoint Cycle.');
    } finally {
      setLoading(false);
    }
  }

  const validateInput = (input) => {
    // Reject input if it contains a plus sign
    if (/\+/.test(input)) {
      return false;
    }
  
    // Match cycles with one or more elements inside parentheses
    const regex = /\(\s*([a-zA-Z0-9]+(?:\s*(?:,|\s)\s*[a-zA-Z0-9]+)*)\s*\)/g;
  
    // Remove composition symbols before matching
    const cleanedInput = input.replace(/\s*∘\s*/g, ' '); // Unicode composition symbol only
  
    // Find all matches
    const matches = cleanedInput.match(regex);
  
    // Valid if there's at least one valid cycle
    return matches && matches.length >= 1;
  };

  return (
    <SolverPage
    title="Disjoint Cycles"
    topic="Functions"
    description="This tool converts any cycle form of a permutation to its disjoint cycle form."
    DescriptionComponent={Description}
    InfoText={Info}
    InputComponent={Input}
    input_props={{input, setInput}}
    error={error}
    handle_solve={handleSolve}
    loading={loading}
    render_output={renderOutput}
    />
  );
};

const Description = () => {
    return(
      <div style={{textAlign: "left"}}>
        <LatexLine
          string="Given a set $S$, a permutation of $S$ is a bijective function $f:S\to S$."
        />
        <Text weight="bold" margin={{"bottom": "small"}}>Cycle Form</Text>
        <LatexLine
          string="The cycle form of a permutation expresses the permutation as a composition of disjoint cycles, where each element maps to the element to its right (wrapping at the end). Every permutation on finite sets, besides the identity permutation, can be represented this way (with a single element cycle (a) representing the identity, for output purposes). The solver takes a potentially non-disjoint composition of cycles to a disjoint one. Example of non-disjoint: $$ (1\ 2\ 3)\circ (3\ 4)$$"
        />
        <LatexLine
          string="Enter your composition of cycles below."
        />
      </div>
    );
}

const Input = ({ input, setInput }) => {
    return (
      <TextInput 
        placeholder="Enter your cycles here (e.g., (1 2 3)(4 5))"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
    );
};

export default DisjointCycles;
