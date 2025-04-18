import React, { useCallback, useEffect, useState} from 'react';
import { Box, Text, TextInput, Button } from 'grommet';
import { Add, Trash } from 'grommet-icons';

// Custom component for adding multiple partitions
const PartitionInput = ({ value, wholeValue, onChange }) => {
  // Parse the initial value if it exists
   // Parse the initial value if it exists - memoize this function
   const parseInitialPartitions = useCallback(() => {
    if (!value) return [''];  // Start with one empty partition by default
    try {
      // Remove outer braces and split by },{ to get individual partition sets
      const partitionsStr = value.substring(1, value.length - 1).split('},{');
      const result = partitionsStr.map(p => {
        // Clean up the individual partition strings
        return p.replace('{', '').replace('}', '').trim();
      });
      // Return at least one partition
      return result.length > 0 ? result : [''];
    } catch (e) {
      return [''];
    }
  }, [value]);

  const [partitions, setPartitions] = useState(parseInitialPartitions());

  useEffect(() => {
    // Only update internal state when value changes from outside
    if (value) {
      const parsedPartitions = parseInitialPartitions();
      setPartitions(parsedPartitions);
    }
  }, [value, parseInitialPartitions]); // Include both dependencies
  
  // Update the parent component when partitions change
  React.useEffect(() => {
    
    // Handle empty partitions - for empty partitions, represent as empty sets
    const formattedPartitions = partitions.map(p => {
      const trimmedValue = p.trim();
      
      // Case 1: Empty partition - represent as {}
      if (trimmedValue === '') {
        return '{}';
      }
      
      // Case 2: Already has outer braces - preserve as is
      if (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) {
        return trimmedValue;
      }
      
      // Case 3: Contains nested braces - parse carefully
      const hasBraces = trimmedValue.includes('{') || trimmedValue.includes('}');
      if (hasBraces) {
        // Split by commas but respect nested braces
        const elements = [];
        let bracketCount = 0;
        let currentElement = '';
        
        for (let i = 0; i < trimmedValue.length; i++) {
          const char = trimmedValue[i];
          
          if (char === '{') bracketCount++;
          if (char === '}') bracketCount--;
          
          if (char === ',' && bracketCount === 0) {
            elements.push(currentElement.trim());
            currentElement = '';
          } else {
            currentElement += char;
          }
        }
        
        // Add the last element
        if (currentElement.trim()) {
          elements.push(currentElement.trim());
        }
        
        return `{${elements.join(',')}}`;
      }
      
      // Case 4: Simple comma-separated list
      return `{${trimmedValue}}`;
    });
    
    // Join all partitions with commas and wrap in outer braces
    const formattedValue = `{${formattedPartitions.join(',')}}`;
    onChange(formattedValue);
  }, [partitions, onChange]);

  // Add a new empty partition
  const addPartition = () => {
    setPartitions([...partitions, '']);
  };

  // Remove a partition at specified index
  const removePartition = (index) => {
    // Don't remove if it's the last partition
    if (partitions.length <= 1) return;
    
    const newPartitions = [...partitions];
    newPartitions.splice(index, 1);
    setPartitions(newPartitions);
  };

  // Update a partition at specified index
  const updatePartition = (index, value) => {
    const newPartitions = [...partitions];
    newPartitions[index] = value;
    setPartitions(newPartitions);
  };

  return (
    <Box>
      <Text margin={{ bottom: 'xsmall' }}>Partition:</Text>
      
      {partitions.map((partition, index) => (
        <Box key={index} direction="row" align="center" margin={{ bottom: 'xsmall' }}>
          <Box flex={true} margin={{ right: 'small' }}>
            <TextInput
              placeholder={`Enter elements (e.g., a, b, c)`}
              value={partition}
              onChange={(e) => updatePartition(index, e.target.value)}
            />
          </Box>
          <Button
            icon={<Trash />}
            onClick={() => removePartition(index)}
            tip="Remove this partition"
            disabled={partitions.length <= 1}
          />
        </Box>
      ))}
      
      <Box margin={{ top: 'small' }}>
        <Button
          icon={<Add />}
          label="Add Part"
          onClick={addPartition}
          plain={false}
          primary
          size="small"
        />
      </Box>
      
      <Box margin={{ top: 'small' }} background="light-2" pad="small" round="small">
        <Text size="small">
          {
            (() => {
              const flattenSet = (setStr) => {
                if (typeof setStr !== 'string') return new Set();

                // Match everything between top-level braces
                const matches = [...setStr.matchAll(/\{([^{}]*)\}/g)];
                const elements = matches
                  .map(match => match[1]) // inner content of each {...}
                  .flatMap(part => part.split(',').map(e => e.trim())) // split & trim
                  .filter(e => e !== '');

                return new Set(elements);
              };

              const currentSet = flattenSet(value);
              const fullSet = flattenSet(wholeValue);
              const difference = [...fullSet].filter(e => !currentSet.has(e));

              return `Missing elements: {${difference.join(', ')}}`;
            })()
          }
        </Text>
      </Box>
    </Box>
  );
};

export default PartitionInput;
