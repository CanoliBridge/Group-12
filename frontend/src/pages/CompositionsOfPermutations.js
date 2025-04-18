import React, { useState } from 'react';
import { Box, Text, Button, TextInput } from 'grommet';
import { solveCompositions } from '../api';
import SolverPage from '../components/SolverPage';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: CompositionOfPermutations.js
* Author: Parker Clark and Mathias Buchanan
* Description: Solver page for ganalyzing permutations of a cycle.
*/

const CompositionOfPermutations = () => {
  const [isCaveman, setIsCaveman] = useState(false);
  const [setOne, setSetOne] = React.useState('');
  const [setTwo, setSetTwo] = React.useState('');
  const [perm, setPerm] = React.useState('');
  const [comp, setComp] = React.useState('');
  const [denom, setDenom] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("COMPOSITION_PERMUTATIONS");

  const SAMPLE_SET_SIZE = "5";
  const SAMPLE_ELEMENTS = "3";
  
  const fillWithSample = () => {
    setSetOne(SAMPLE_SET_SIZE);
    setSetTwo(SAMPLE_ELEMENTS);
  };

  const handleSolve = async () => {
    // Reset states
    setLoading(true);
    setPerm('');
    setComp('');
    setDenom('');
    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();
  
    // Validate input
    const isValid = validateInput(setOne, setTwo);
    if (!isValid) {
      setError('Invalid input. Please enter 2 positive integers less than 1001.');
      setLoading(false);
      return;
    }
    
    const isBigger = validateSizes(setOne, setTwo);
    if (!isBigger) {
      setError('Invalid input. Please ensure that the set has more items than is being selected.');
      setLoading(false);
      return;
    }
  
    try {
      const result = await solveCompositions({ setOne, setTwo });
  
      // If result is a JSON string, parse it
      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
  
      // Ensure it contains the expected properties
      if (parsedResult && parsedResult.perm !== undefined && parsedResult.comp !== undefined) {
        setPerm(parsedResult.perm); // Assign the correct perm value
        setComp(parsedResult.comp); // Assign the correct comp value
        setDenom(parsedResult.denom); // Assign the correct comp value
      } else {
        setError('Invalid response structure.');
      }

    } catch (err) {

      trackResults(
        { setOne: setOne },
        { setTwo: setTwo },
        {error: err.message || "Error solving Composition of Permutations"},
        performance.now() - startTime
      )

      setError('An error occurred while generating the composition.');
    } finally {
      setLoading(false);
    }
  };

  const Info = () => {
    return (
      <>
        <Text weight="bold" margin={{ bottom: "xsmall" }}>
          Permutations and Combinations:
        </Text>
        <Text margin={{ bottom: "small" }}>
          When working with permutations and combinations:
        </Text>
        <Text>• Permutations: Order matters</Text>
        <Text>• Combinations: Order does not matter</Text>
        <Text margin={{ top: "small" }}>
          For a set of size n selecting r elements:
        </Text>
        <Text margin={{ bottom: "xsmall" }}>
          • Permutations formula: P(n,r) = n!/(n-r)!
        </Text>
        <Text margin={{ bottom: "small" }}>
          • Combinations formula: C(n,r) = n!/((n-r)!r!)
        </Text>
        
        <Box margin={{ top: 'medium' }} align="center">
          <Button 
            label="Fill with Sample" 
            onClick={fillWithSample} 
            primary 
            size="small"
            border={{ color: 'black', size: '2px' }}
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
          />
        </Box>
      </>
    );
  };

  const Input = () => {
    return (
      <Box>
        <Box margin={{ bottom: "small" }}>
          <Text>
            Set size:
          </Text>
          <TextInput 
            placeholder="Example: Enter the size of your first set here (e.g., 5)"
            value={setOne}
            onChange={(event) => setSetOne(event.target.value)}
          />
        </Box>
        <Box margin={{ top: "small" }}>
          <Text>
            Number of elements:
          </Text>
          <TextInput 
            placeholder="Example: Enter the number of elements (e.g., 3)"
            value={setTwo}
            onChange={(event) => setSetTwo(event.target.value)}
          />
        </Box>
      </Box>
    );
  };

  const betterText = [
    "When given a set of numbers, you can form multiple permutations by selecting a few or all of the elements from the set. A permutation refers to an arrangement of elements in a specific order. For example, consider the set (1,2,3). If we want to select 2 elements at a time, there are 6 possible permutations: (1,2), (1,3), (2,1), (2,3), (3,1), (3,2).",
    "The formula for calculating the number of permutations of r elements from a set of n elements is: P(n, r) = n!/(n - r)! Where n! (n factorial) is the product of all positive integers up to n, and r is the number of elements you want to arrange.",
    "In contrast, a combination refers to selecting elements where the order does not matter. For example, in combinations, (1,3) is considered the same as (3,1). The formula to calculate the number of combinations of r elements chosen from a set of n elements is: C(n, r) = n!/((n - r)!(r!))",
    "Using the tool provided on this website, we will show you how to calculate the amount of compositions and permutations, although performing the math is left up to you. Simply enter the total number of elements in your set and the number of elements you want to select per permutation or combination. The tool will then compute the results for you based on the formulas above."
  ];

  const cavemanText = [
    "Hey, uh, hi—this is DougDoug, professional streamer, fast food tournament bracketologist, and yes, a guy with a computer science degree. Today we're diving into permutations. That's like... when order matters. Not like my hairline—ORDER matters here.",
    "So like, let's say we have the set (1, 2, 3). If we want to pick two numbers at a time and care about the order—which we DO, Chat, unlike your attempts at mod applications—then there are exactly 6 ways to do that: (1,2), (1,3), (2,1), (2,3), (3,1), (3,2). See? That's all the possible *permutations* of picking 2 numbers from (1,2,3). You rearrange them, and it totally changes the result. That's what we mean by \"order matters.\" Unlike in my stream schedule. Or my platforming skills.",
    "The formula is: P(n, r) = n! / (n - r)! Where n is the number of items in the full set, and r is how many you're choosing. Factorials mean you multiply n by every number under it. It's like stacking Whoppers—just, uh, with math.",
    "*[TTS INTERRUPTS]* \"Hey Doug, if permutations are about order, can you finally order some skill in 2D platformers? Also bald. GOTTEM. Alright bye Doug I love you.\" Mods, send him out back. Now—combinations are like, same idea, but you don't care about order. So (1,3) and (3,1) are just one thing now. It's lazier, but sometimes that's all Chat can handle. The formula for combinations is: C(n, r) = n! / ((n - r)! * r!)",
    "So this tool I made will handle all that messy math for you. You just input the total elements and how many you want to pick. That's it. It's not rigged. Why are you saying RIGGED. It's literally just math. Chat. Stop. It's factorials, not Mario. Stop saying rigged."
  ];

  const renderOutput = () => {
    return (
      <Box gap="medium">
        <Box>
          <Text weight="bold">Number of Permutations:</Text>
          <Box 
            align="center" 
            justify="center" 
            pad={{ vertical: "small" }} 
            background={{ color: "light-3" }} 
            margin={{ bottom: "medium" }}
            round="small"
          >
            <Text>
              {perm
                ? perm.split(' ').map((word, i) => (
                    <span key={i} style={{ textDecoration: word.includes('\u0336') ? 'line-through' : 'none' }}>
                      {word.replace(/\u0336/g, '') + ' '}
                    </span>
                  ))
                : "Output will be displayed here!"}
            </Text>
          </Box>
        </Box>

        <Box>
          <Text weight="bold">Number of Combinations:</Text>
          <Box 
            align="center" 
            justify="center" 
            pad={{ vertical: "small" }} 
            background={{ color: "light-3" }}
            round="small"
          >
          <div style={{ textAlign: 'center', margin: '2rem auto' }}>
            {/* Numerator */}
            <Text style={{ display: 'block', textAlign: 'center' }}>
              {comp
                ? comp.split(' ').map((word, i) => (
                    <span key={i} style={{ textDecoration: word.includes('\u0336') ? 'line-through' : 'none' }}>
                      {word.replace(/\u0336/g, '') + ' '}
                    </span>
                  ))
                : "Output will be displayed here!"}
            </Text>

            {/* Fraction Line */}
            <div style={{
              borderTop: '2px solid black',
              width: '80%',
              margin: '0.5rem auto'
            }}></div>

            {/* Denominator */}
            <Text style={{ display: 'block', textAlign: 'center' }}>
              {denom
                ? denom.split(' ').map((word, i) => (
                    <span key={i} style={{ textDecoration: word.includes('\u0336') ? 'line-through' : 'none' }}>
                      {word.replace(/\u0336/g, '') + ' '}
                    </span>
                  ))
                : ""}
            </Text>
          </div>
          </Box>
        </Box>
      </Box>
    );
  };

  const validateInput = (setOne, setTwo) => {
    // Convert inputs to numbers
    const numOne = Number(setOne);
    const numTwo = Number(setTwo);
  
    // Check if both values are positive integers
    return Number.isInteger(numOne) && Number.isInteger(numTwo) && numOne > 0 && numTwo > 0 && numOne <= 1000;
  };

  const toggleCaveman = () => {
    setIsCaveman(!isCaveman);
  };

  const validateSizes = (setOne, setTwo) => {
    return Number(setOne) >= Number(setTwo);
  }

  return (
    <SolverPage
      title="Composition Of Permutations"
      topic="Functions"
      description="This tool helps you calculate permutations and combinations."
      paragraphs={isCaveman ? cavemanText : betterText}
      InfoText={Info}
      InputComponent={Input}
      input_props={null}
      error={error}
      handle_solve={handleSolve}
      loading={loading}
      render_output={renderOutput}
      topRightButton={toggleCaveman}
    />
  );
};

export default CompositionOfPermutations;