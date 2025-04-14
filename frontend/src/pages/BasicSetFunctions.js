import React, { useState } from 'react';
import { 
  Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, 
  Spinner, Heading
} from 'grommet';
import { solveBasicSetFunctions } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import SetFunctionInput from '../components/SetFunctionInput';

/*
* Name: BasicSetFunctions.js
* Author: Parker Clark
* Description: Solver page for providing basic set functions.
*/

const BasicSetFunctions = () => {
  // State for sets and expressions
  const [sets, setSets] = useState([
    { name: "A", type: "regular", value: "" }
  ]);
  const [expressions, setExpressions] = useState([
    { leftOperand: "A", operator: "⊆", rightOperand: "" }
  ]);
  
  // Results state
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { trackResults } = useDiagnostics("BASIC_SET_FUNCTIONS");

  // Validate the entire input form
  const validateInput = () => {
    // Check if all sets have names and values
    for (const set of sets) {
      if (!set.name.trim()) {
        setError("All sets must have a name.");
        return false;
      }
      
      // Check for duplicate set names
      const names = sets.map(s => s.name);
      if (names.filter(name => name === set.name).length > 1) {
        setError(`Set name "${set.name}" is used multiple times.`);
        return false;
      }
      
      // Validate set values based on type
      if (set.type === "regular") {
        if (!set.value.trim()) {
          setError(`Set ${set.name} must have a value.`);
          return false;
        }
        
        // Basic validation for regular set notation
        if (!validateRegularSet(set.value)) {
          setError(`Set ${set.name} has invalid format. Use format like {1, 2, 3} or ∅.`);
          return false;
        }
      } else if (set.type === "builder") {
        if (!set.value.trim()) {
          setError(`Set ${set.name} must have a value.`);
          return false;
        }
        
        // Basic validation for set builder notation
        if (!validateSetBuilder(set.value)) {
          setError(`Set ${set.name} has invalid builder format. Use format like {x | x ∈ Z}.`);
          return false;
        }
      }
    }
    
    // Check if all expressions have operands and operators
    for (const expr of expressions) {
      if (!expr.leftOperand || !expr.operator || !expr.rightOperand) {
        setError("All expressions must have both operands and an operator.");
        return false;
      }
      
      // Validate that operands are defined as sets
      const setNames = sets.map(s => s.name);
      if (expr.operator !== "∈") {
        // For non-membership operations, both operands should be sets
        if (!setNames.includes(expr.leftOperand)) {
          setError(`Left operand "${expr.leftOperand}" is not defined as a set.`);
          return false;
        }
        if (!setNames.includes(expr.rightOperand)) {
          setError(`Right operand "${expr.rightOperand}" is not defined as a set.`);
          return false;
        }
      } else {
        // For membership operations, only right operand needs to be a set
        if (!setNames.includes(expr.rightOperand)) {
          setError(`Right operand "${expr.rightOperand}" is not defined as a set.`);
          return false;
        }
      }
    }
    
    return true;
  };

  // Validate regular set notation
  const validateRegularSet = (value) => {
    // Accept empty set
    if (value === "∅" || value === "{}") {
      return true;
    }
    
    // Check if it starts with { and ends with }
    if (!value.startsWith("{") || !value.endsWith("}")) {
      return false;
    }
    
    // Additional validation could check for proper comma separation, etc.
    return true;
  };

  // Validate set builder notation
  const validateSetBuilder = (value) => {
    // Basic validation for pattern {x | x ∈ Domain and condition}
    const pattern = /\{x\s*\|\s*x\s*∈\s*[NZQRC]\s+(and|for)\s+.*\}/;
    return pattern.test(value);
  };

  // Helper function to render the structured output
  const renderOutput = (output) => {
    try {
      let result;
      if (typeof output === 'string') {
        result = JSON.parse(output);
      } else {
        result = output;
      }
      
      return (
        <Box>
          {/* Display sets */}
          {result.sets && (
            <Box margin={{ bottom: "xxsmall" }}>
              <Heading level={5} margin={{ top: "none", bottom: "xsmall" }}>Sets:</Heading>
              {Object.entries(result.sets).map(([name, value]) => (
                <Box key={name} direction="row" margin={{ bottom: "xsmall" }}>
                  <Text weight="bold">{name} = </Text>
                  <Text>{value}</Text>
                </Box>
              ))}
            </Box>
          )}
          
          {/* Display statement results */}
          {result.statements && (
            <Box>
              <Heading level={5} margin={{ bottom: "xxsmall" }}>Results:</Heading>
              {result.statements.map((stmt, index) => (
                <Box key={index} direction="row" margin={{ bottom: "xsmall" }}>
                  <Text weight="bold">{stmt.expression}: </Text>
                  <Box margin={{ left: "xsmall" }}> {/* Add left margin for spacing */}
                    <Text>
                      {typeof stmt.result === 'boolean' 
                        ? (stmt.result ? "True" : "False") 
                        : stmt.result}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      );
    } catch (e) {
      return <Text>{String(output)}</Text>;
    }
  };

  const handleSolve = async () => {
    // Reset output and error
    setLoading(true);
    setOutput('');
    setError('');

    // Validate all inputs
    if (!validateInput()) {
      setLoading(false);
      return;
    }

    // Prepare payload
    const payload = {
      sets: {},
      statements: []
    };
    
    // Add sets to payload
    sets.forEach(set => {
      payload.sets[set.name] = {
        type: set.type,
        value: set.value
      };
    });
    
    // Add expressions to payload
    expressions.forEach(expr => {
      payload.statements.push({
        expression: `${expr.leftOperand} ${expr.operator} ${expr.rightOperand}`
      });
    });

    // Start timing for performance tracking
    const startTime = performance.now();

    try {
      const result = await solveBasicSetFunctions(payload);
      
      trackResults(
        payload,
        result,
        performance.now() - startTime
      );

      setOutput(result);
    } catch (err) {
      trackResults(
        payload,
        {error: err.message || "Error solving Basic Set Functions"},
        performance.now() - startTime
      );
      
      setError('An error occurred while solving the set functions.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '60%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <PageContent align="center" skeleton={false}>
        <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
          <HomeButton />
        </Box>
        <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
          <Text size="xxlarge" weight="bold">
            Basic Set Functions
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Sets
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
          <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you apply basic set functions.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            A set is a collection of distinct objects, considered as an object in its own right. Basic set functions include the ability to test if sets are a subset of another, and determine elements of the set.
          </Text>
          <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By applying set functions, you can identify relationships between sets, find common elements, and determine the differences between sets. This tool allows you to input sets and apply basic set functions to generate the corresponding results.
          </Text>
          <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Define your sets below and create expressions to evaluate!
          </Text>
        </Box>
        
        <Card width="full" pad="medium" background={{"color":"light-1"}}>
          <CardBody pad="small">
            <SetFunctionInput
              sets={sets}
              expressions={expressions}
              error={error}
              onSetsChange={setSets}
              onExpressionsChange={setExpressions}
              onValidate={validateInput}
            />
          </CardBody>
          <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
            <Button 
              label={loading ? <Spinner /> : "Solve"} 
              onClick={handleSolve} 
              disabled={loading} 
              primary
            />
          </CardFooter>
        </Card>
        
        <Card width="full" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
          <CardBody pad="small">
            <Text weight="bold">
              Output:
            </Text>
            <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
              {output ? (
                <Box pad="small" width="100%">
                  {renderOutput(output)}
                </Box>
              ) : (
                <Text>Output will be displayed here!</Text>
              )}
            </Box>
          </CardBody>
        </Card>
        <ReportFooter />
      </PageContent>
      </Box>
    </Page>
  );
};

export default BasicSetFunctions;