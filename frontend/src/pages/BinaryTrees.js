import React from 'react';
import { Box, Text, TextInput, Button, Select} from 'grommet';
import { solveBinaryTrees } from '../api';
import SolverPage from '../components/SolverPage';
import { useDiagnostics } from '../hooks/useDiagnostics';

/*
* Name: BinaryTrees.js
* Author: Parker Clark
* Description: Solver page for binary trees and properties.
*/

const BinaryTrees = () => {
  const [input, setInput] = React.useState('');
  const [treeType, setTreeType] = React.useState('regular');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [properties, setProperties] = React.useState(null);
  const { trackResults } = useDiagnostics("BINARY_TREES");

  const SAMPLE_REGULAR_TREE = "A B C D E None F";
  const SAMPLE_MATH_EXPRESSION = "3*(x+4)";
  
  const fillWithSample = () => {
    setInput(treeType === 'regular' ? SAMPLE_REGULAR_TREE : SAMPLE_MATH_EXPRESSION);
  };

  const Info = () => {
    return (
      <>
        <Text weight="bold" margin={{ bottom: "xsmall" }}>
          Binary Tree Input:
        </Text>
        {treeType === 'regular' ? (
          <>
            <Text>
              For regular binary trees, enter nodes in level-order traversal (breadth-first).
            </Text>
            <Text>
              Each node should be a single character. Use 'None' for empty nodes.
            </Text>
            <Text>
              Example: <strong>A B C D E None F</strong>
            </Text>
            <Text margin={{ top: "xsmall" }}>
              This creates a tree with A as root, B and C as children of A, D and E as children of B, and F as the right child of C.
            </Text>
          </>
        ) : (
          <>
            <Text>
              For mathematical expressions, enter operators and operands with optional parentheses.
            </Text>
            <Text>
              Supported operators: +, -, *, /, ^ (exponentiation)
            </Text>
            <Text>
              Example: <strong>3*(x+4)</strong>
            </Text>
            <Text margin={{ top: "xsmall" }}>
              This generates an expression tree representing the mathematical formula.
            </Text>
          </>
        )}

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
        <Box margin={{ bottom: 'small' }}>
          <Text margin={{ bottom: 'xsmall' }}>Select Tree Type:</Text>
          <Select
            options={[
              { label: 'Regular Binary Tree (Level Order)', value: 'regular' },
              { label: 'Mathematical Expression', value: 'mathematical' }
            ]}
            value={treeType}
            labelKey="label"
            valueKey="value"
            onChange={({ value }) => setTreeType(value.value)}
          />
        </Box>
        
        <Text margin={{ bottom: 'xsmall' }}>Input Tree:</Text>
        <TextInput 
          placeholder={getPlaceholder()}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setProperties(null);
          }}          
        />
      </Box>
    );
  };

  const handleSolve = async () => {
    // Empty output and error messages
    setLoading(true);
    setOutput('');
    setError('');

    // Validate the input first 
    const validation = validateInput(input, treeType);
    if (!validation.isValid) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    setError('');

    // Determine the choice value based on tree type
    const choice = treeType === 'regular' ? 1 : 2;

    // Start timing for performance tracking
    const startTime = performance.now();

    try { 
      // Do some conversion to display any backend errors
      let result = await solveBinaryTrees(input, choice);

      // Parse result if it is a string
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
      
      // Check if there is an error key in the result
      const errorKey = Object.keys(result).find(key => key.toLowerCase().includes('error'));
      console.log(errorKey);
      if (errorKey) {

        // Track failed execution
        trackResults(
          { input: input, treeType: treeType},
          { error: result[errorKey] }, 
          performance.now() - startTime
        );

        setError(result[errorKey]);
      } else {

        // Track failed execution
        trackResults(
          { input: input, treeType: treeType },
          result, 
          performance.now() - startTime
        );

        setOutput(result["image"]);
        setProperties(result["properties"] || null);
      }
    } catch (err) {
      console.log(err);

      // Track exception
      trackResults(
        { input: input, treeType: treeType}, // Input data
        { error: err.message || 'Unknown error' }, // Error result
        performance.now() - startTime // Execution time
      );

      setError('An error occurred while generating the Tree.');
    } finally {
      setLoading(false);
    }
  }

  // Get placeholder text based on tree type
  const getPlaceholder = () => {
    if (treeType === 'regular') {
      return "Example: A B C D E None F (space-separated nodes in level order)";
    } else {
      return "Example: 2+(3+5-7) (mathematical expression)";
    }
  };

  // Convert base64 image string to image element
  const renderOutput = () => {
    if (!output) {
      return "Output will be displayed here!";
    }
  
    return (
      <Box>
        <img
          src={`data:image/png;base64,${output}`}
          alt="Graph"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        {properties && (
          <Box margin={{ top: 'medium' }}>
            <Text weight="bold" margin={{ bottom: 'small' }}>Tree Properties:</Text>
            {Object.entries(properties).map(([key, value]) => (
              <Text key={key}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:{" "}
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    );
  };  

  // Validate the input based on the tree type
  const validateInput = (input, treeType) => {
    if (!input || input.trim() === '') {
      return { isValid: false, error: 'Input cannot be empty.' };
    }

    if (treeType === 'regular') {
      // Validate for regular binary tree level representation
      const nodes = input.split(/\s+/);
      
      // Check if we have at least a root
      if (nodes.length === 0) {
        return { isValid: false, error: 'Tree must have at least a root node.' };
      }

      const invalidNodes = nodes.filter(node => 
        node !== 'None' && !(/^[A-Za-z0-9]$/.test(node))  // Changed from + to require exactly one character
      );
      
      if (invalidNodes.length > 0) {
        return { 
          isValid: false, 
          error: `Invalid node value(s): ${invalidNodes.join(', ')}. Use single letters, numbers, or 'None'.` 
        };
      }

      // Check for duplicate nodes (excluding 'None')
      const uniqueNodes = new Set();
      const duplicates = [];
      
      for (const node of nodes) {
        if (node !== 'None') {
          if (uniqueNodes.has(node)) {
            duplicates.push(node);
          } else {
            uniqueNodes.add(node);
          }
        }
      }
      
      if (duplicates.length > 0) {
        return { 
          isValid: false, 
          error: `Duplicate node value(s): ${duplicates.join(', ')}. Each node must be unique.` 
        };
      }

      return { isValid: true };
      
    } else if (treeType === 'mathematical') {

      // Check if it contains the "None" keyword which would indicate a level-order input
      if (input.includes('None')) {
        return { 
          isValid: false, 
          error: 'Your input appears to be a level-order tree format. Please select "Regular Binary Tree" option instead.' 
        };
      }
      
      // Check if it looks like space-separated single characters (typical of level-order format)
      const tokens = input.split(/\s+/);
      if (tokens.length > 2 && tokens.every(token => token.length === 1 && /^[A-Za-z0-9]$/.test(token))) {
        return { 
          isValid: false, 
          error: 'Your input appears to be single characters separated by spaces. For math expressions, use operators like +, -, *, / between values.' 
        };
      }
      
      // Check that it contains at least one operator for a valid expression
      if (!/[+\-*/^]/.test(input)) {
        return { 
          isValid: false, 
          error: 'Mathematical expression must contain at least one operator (+, -, *, /, ^).' 
        };
      }
      
      // Basic validation for mathematical expression characters
      if (!/^[0-9a-zA-Z+\-*/()^. ]+$/.test(input)) {
        return { 
          isValid: false, 
          error: 'Expression can only contain numbers, operators (+, -, *, /, ^), and parentheses.' 
        };
      }

      // Basic validation for mathematical expression
      if (!/^[0-9a-zA-Z+\-*/()^. ]+$/.test(input)) {
        return { 
          isValid: false, 
          error: 'Expression can only contain numbers, operators (+, -, *, /, ^), and parentheses.' 
        };
      }
      
      // Check for balanced parentheses
      let parenCount = 0;
      for (let char of input) {
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        
        if (parenCount < 0) {
          return { isValid: false, error: 'Unbalanced parentheses in expression.' };
        }
      }
      
      if (parenCount !== 0) {
        return { isValid: false, error: 'Unbalanced parentheses in expression.' };
      }
      
      return { isValid: true };
    }
    
    return { isValid: false, error: 'Invalid tree type.' };
  };

  return (
    <SolverPage
      title="Binary Trees and Their Properties"
      topic="Trees And Their Representations"
      description="This tool helps you analyze binary trees in discrete mathematics."
      paragraphs={[
        "Binary trees are a type of data structure in which each node has at most two children, referred to as the left child and the right child. Binary trees are used to implement binary search trees and binary heaps, and they are fundamental in various algorithms and applications.",
        "In a binary tree, each node contains a value, and references to its left and right children. This hierarchical structure allows for efficient searching, insertion, and deletion operations, making binary trees a crucial component in computer science.",
        "By analyzing binary trees, you can understand the relationships and connections between different nodes, and how they can be used to solve various computational problems. This tool allows you to input a binary tree and explore its properties and representations.",
        "Enter your binary tree below to generate and analyze its properties using this tool!"
      ]}
      InfoText={Info}
      InputComponent={Input}
      input_props={null}
      error={error}
      handle_solve={handleSolve}
      loading={loading}
      render_output={renderOutput}
    />
  );
};

export default BinaryTrees;