import React from 'react';
import { Box, Text, TextInput, Button } from 'grommet';
import Latex from 'react-latex-next';
import { solvePartitions } from '../api';
import { useDiagnostics } from '../hooks/useDiagnostics';
import PartitionInput from '../components/PartitionInput';
import SolverPage from '../components/SolverPage';
import LatexLine from '../components/LatexLine';

/*
* Name: Partitions.js
* Author: Parker Clark, Jacob Warren
* Description: Solver page for equivalence relations.
*/

const Partitions = () => {
  const [set, setSet] = React.useState('');
  const [relation, setRelation] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("PARTITIONS");

  const fillWithEmpty = () => {
    const SAMPLE_SET = "{}";
    const SAMPLE_PARTITION = "{}";
    setSet(SAMPLE_SET);
    setRelation(SAMPLE_PARTITION);
  };

  const fillWithWhole = () => {
    const SAMPLE_SET = "{a,b,c,d}";
    const SAMPLE_PARTITION = "{{a,b,c,d}}";
    setSet(SAMPLE_SET);
    setRelation(SAMPLE_PARTITION);
  };

  const fillWithSingletons = () => {
    const SAMPLE_SET = "{a,b,c,d}";
    const SAMPLE_PARTITION = "{{a},{b},{c},{d}}";
    setSet(SAMPLE_SET);
    setRelation(SAMPLE_PARTITION);
  };

  const fillWithHalf = () => {
    const SAMPLE_SET = "{a, b, c, d}";
    const SAMPLE_PARTITION = "{{a,b},{c,d}}";
    setSet(SAMPLE_SET);
    setRelation(SAMPLE_PARTITION);
  };

  const fillWithDuplicate = () => {
    const SAMPLE_SET = "{a, b, c, d, a}";
    const SAMPLE_PARTITION = "{{a,b,b},{c,c,d}}";
    setSet(SAMPLE_SET);
    setRelation(SAMPLE_PARTITION);
  };

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate input
    const isValidSet = validateSet(set);
    const isValidRelation = validateRelation(relation, set);
     
    if (!isValidRelation || !isValidSet) {
      setError('Invalid input. Please enter a valid relation/set.');
      setLoading(false);
      return;
    }

    setError('');

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      
      // Do some conversion to display any backend errors
      let result = await solvePartitions(set, relation);

      // Parse result if it is a string
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
      
      // Check if there is an error key in the result
      const errorKey = Object.keys(result).find(key => key.toLowerCase().includes('error'));
      console.log(errorKey);
      if (errorKey) {

        trackResults(
          { set, relation }, // Input data
          { error: result[errorKey] }, // Error result
          performance.now() - startTime // Execution time
        );

        setError(result[errorKey]);
      } else {

        trackResults(
          { set, relation }, // Input data
          result, // Success result
          performance.now() - startTime // Execution time
        );

        setOutput(result);
      }
    } catch (err) {

      trackResults(
        { set, relation }, // Input data
        { error: err.message || 'Unknown error' }, // Error result
        performance.now() - startTime // Execution time
      );

      console.log(err);
      setError('An error occurred while analyzing the Partition.');
    } finally {
      setLoading(false);
    }
  };

  // Validate that set conforms to format
  const validateSet = (input) => {
    // Tests if input is in the form {a, b, c, 23} or {}
    const setRegex = /^\{\s*\}$|^\{(\s*[a-zA-Z0-9]+\s*,)*\s*[a-zA-Z0-9]+\s*\}$/;
    return setRegex.test(input);
  };

  // Validate that relation conforms to format
  const validateRelation = (input, set) => {
    if (!input.startsWith('{') || !input.endsWith('}')) {
      return { isValid: false, invalidElements: [] };
    }
  
    if (input === '{}') {
      return { isValid: true, invalidElements: [] };
    }
  
    try {
      const withoutOuterBraces = input.substring(1, input.length - 1);
      const partitions = [];
      let bracketCount = 0;
      let currentPartition = '';
  
      for (let i = 0; i < withoutOuterBraces.length; i++) {
        const char = withoutOuterBraces[i];
  
        if (char === '{') bracketCount++;
        if (char === '}') bracketCount--;
  
        if (char === ',' && bracketCount === 0) {
          partitions.push(currentPartition.trim());
          currentPartition = '';
        } else {
          currentPartition += char;
        }
      }
  
      if (currentPartition.trim()) {
        partitions.push(currentPartition.trim());
      }
  
      if (!partitions.every(p => p.startsWith('{') && p.endsWith('}'))) {
        return { isValid: false, invalidElements: [] };
      }
  
      const setElements = set.replace(/[{}]/g, '').split(/\s*,\s*/).filter(Boolean);
      const partitionElements = [];
      for (const partition of partitions) {
        const elements = partition.substring(1, partition.length - 1)
                                .split(/\s*,\s*/)
                                .filter(Boolean);
        partitionElements.push(...elements);
      }
  
      const invalidElements = partitionElements
        .map(el => el.replace(/[{}]/g, '').trim())
        .filter(el => !setElements.includes(el));
  
      return {
        isValid: invalidElements.length === 0,
        invalidElements
      };
  
    } catch (e) {
      console.error("Error validating relation:", e);
      return { isValid: false, invalidElements: [] };
    }
  };

    const Info = () => {
        return (
          <>
            <Text>
              To input a set, use the following format:
            </Text>
            <Text>
              <strong>{'{a,b,c,d}'}</strong>
            </Text>
            <Text>
              To input a partition, use the following format:
            </Text>
            <Text>
              <strong>{'{{a,b},{c,d}}'}</strong>
            </Text>
            <Box margin={{ top: 'medium' }} align="center">
                <Button 
                  label="Fill with Empty" 
                  onClick={fillWithEmpty} 
                  primary 
                  size="small"
                  border={{ color: 'brand', size: '1px' }}
                  pad={{ vertical: 'xsmall', horizontal: 'small' }}
                />
                <Button 
                  label="Fill with Whole Set" 
                  onClick={fillWithWhole} 
                  primary 
                  size="small"
                  border={{ color: 'brand', size: '1px' }}
                  pad={{ vertical: 'xsmall', horizontal: 'small' }}
                />
                <Button 
                  label="Fill with Singletons" 
                  onClick={fillWithSingletons} 
                  primary 
                  size="small"
                  border={{ color: 'brand', size: '1px' }}
                  pad={{ vertical: 'xsmall', horizontal: 'small' }}
                />
                <Button 
                  label="Fill with Half" 
                  onClick={fillWithHalf} 
                  primary 
                  size="small"
                  border={{ color: 'brand', size: '1px' }}
                  pad={{ vertical: 'xsmall', horizontal: 'small' }}
                />
                <Button 
                  label="Fill with Duplicate Elements" 
                  onClick={fillWithDuplicate} 
                  primary 
                  size="small"
                  border={{ color: 'brand', size: '1px' }}
                  pad={{ vertical: 'xsmall', horizontal: 'small' }}
                />
            </Box>
          </>
        );
    };

  return (
    <SolverPage 
        title="Partitions"
        topic="Relations"
        description="This tool helps you analyze partitions and their corresponding equivalence relations."
        DescriptionComponent={Description}
        InfoText={Info}
        InputComponent={Input}
        input_props={{set, setSet, relation, setRelation}}
        error={error}
        handle_solve={handleSolve}
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
          string="A partition on a set $S$ is a collection of nonempty disjoint subsets of $S$ whose union equals $S$."
        />
        <Text weight="bold" margin={{"bottom": "small"}}>Equivalence Relation</Text>
        <LatexLine
          string="A partition on $S$ determines an equivalence relation and an equivalence relation on $S$ determines a partition. This solver determines an equivalence relation from a partition."
        />
        <LatexLine
          string="Enter your $S$ and partition below."
        />
      </div>
    );
}

const Input = ({set, relation, setSet, setRelation}) => {
    return (
      <>
        <Box margin={{ top: "small" }} direction="row" align="center">
          <Latex strict>{"$S=$"}</Latex>
          <TextInput 
            placeholder="Enter S here (e.g., {a, b, c, 23})"
            value={set}
            onChange={(event) => setSet(event.target.value)}
          />
        </Box>
        <Box margin={{top : "small" }}>
        <PartitionInput
            value={relation}
            wholeValue={set}
            onChange={setRelation}
          />
        </Box>
      </>
    );
};

const Output = ({output}) => {
    if (!output) {
      return "Output will be displayed here!";
    }

    // Parse out json object and return out elements one by one
    return (
      <Box>
        {Object.entries(output).map(([key, value]) => (
          <Text key={key}>{`${key}: ${value}`}</Text>
        ))}
      </Box>
    );
};

export default Partitions;
