import React, { useState, useEffect } from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner, RadioButtonGroup, FormField, Tab, Tabs, Collapsible } from 'grommet';
import { solveBinaryUnaryOperators } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import { CircleInformation } from 'grommet-icons';
import PageTopScroller from '../components/PageTopScroller';


 
const MAX_SET_SIZE = 7;
  
const BinaryUnaryOperators = () => {
  // State for input mode
  const [choice, setChoice] = useState('1'); // '1' for Table, '2' for Expression
  const [activeTab, setActiveTab] = useState(0);
  
  // State for table mode
  const [setInput, setSetInput] = useState('');
  const [tableMatrix, setTableMatrix] = useState([['']]);
  
  // State for expression mode
  const [expressionInput, setExpressionInput] = useState('');
  
  // Common state
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  

  const { trackResults } = useDiagnostics("BINARY_UNARY_OPERATORS");

  // Switch tabs when choice changes
  useEffect(() => {
    setActiveTab(choice === '1' ? 0 : 1);
  }, [choice]);


  // Update matrix size based on set elements
  const updateTableSize = (newSetInput) => {
    const setElements = newSetInput.trim().split(/\s+/).filter(Boolean);
    const newSize = setElements.length;
    
    if (newSize > 0) {
      // Create a properly sized matrix for the operation table
      const newMatrix = Array(newSize).fill().map(() => 
        Array(newSize).fill('')
      );
      
      // Preserve existing values where possible
      for (let i = 0; i < Math.min(newSize, tableMatrix.length); i++) {
        for (let j = 0; j < Math.min(newSize, tableMatrix[i].length); j++) {
          newMatrix[i][j] = tableMatrix[i][j];
        }
      }
      
      setTableMatrix(newMatrix);
    } else {
      setTableMatrix([['']]);
    }
  };
  
  // Update choice when tab changes
  const handleTabChange = (index) => {
    setActiveTab(index);
    setChoice(index === 0 ? '1' : '2');
    setError('');
  };

  // Then update the handleSetInputChange function
  const handleSetInputChange = (event) => {
    const newSetInput = event.target.value;
    const elements = newSetInput.trim().split(/\s+/).filter(Boolean);
    
    // Check if we're exceeding the maximum set size
    if (elements.length > MAX_SET_SIZE) {
      setError(`Set size is limited to ${MAX_SET_SIZE} elements.`);
      return;
    }
    
    setError(''); // Clear error when input is valid
    setSetInput(newSetInput);
    updateTableSize(newSetInput);
  };

  // Also update the validateTable function
  const validateTable = () => {
    // Make sure set has at least one element
    const setElements = setInput.trim().split(/\s+/).filter(Boolean);
    if (setElements.length === 0) {
      setError('Please enter at least one element in the set');
      return false;
    }
    
    // Check that we don't exceed maximum set size
    if (setElements.length > MAX_SET_SIZE) {
      setError(`Set size is limited to ${MAX_SET_SIZE} elements`);
      return false;
    }
    
    // Check if all cells in matrix are filled
    for (let i = 0; i < tableMatrix.length; i++) {
      for (let j = 0; j < tableMatrix[i].length; j++) {
        if (!tableMatrix[i][j].trim()) {
          setError(`Cell at row ${i+1}, column ${j+1} is empty`);
          return false;
        }
      }
    }
    
    // Check for valid matrix size
    if (tableMatrix.length !== setElements.length || 
        tableMatrix.some(row => row.length !== setElements.length)) {
      setError('The table size must match the number of elements in the set');
      return false;
    }
    
    return true;
  };

  const validateExpression = () => {
    // Check if expression matches expected format
    const expressionRegex = /^.+\s*=\s*.+;\s*S\s*=\s*.+$/;
    if (!expressionRegex.test(expressionInput.trim())) {
      setError('Invalid expression format. Use format like "x# = x^2; S = Z"');
      return false;
    }
    
    return true;
  };

  const handleSolve = async () => {
    setLoading(true);
    setOutput('');
    setError('');

    let isValid = false;
    let inputData = {};

    if (choice === '1') {
      isValid = validateTable();
      inputData = {
        choice,
        set: setInput,
        table: tableMatrix, // Send the matrix directly
      };
    } else {
      isValid = validateExpression();
      inputData = {
        choice,
        expression: expressionInput,
      };
    }

    if (!isValid) {
      setLoading(false);
      return;
    }

    const startTime = performance.now();

    try {
      const result = await solveBinaryUnaryOperators(
        inputData.choice,
        inputData.set || '',
        inputData.table || [],
        inputData.expression || ''
      );

      // Parse out the result cuz it returns a stringified JSON object from the backend
      let parsedResult;
      try {
        parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
        console.log("Parsed result:", parsedResult);
      } catch (parseError) {
        console.error("Failed to parse result:", parseError);
        parsedResult = { output: result }; // Fallback if parsing fails
      }

      if (parsedResult.error) {
        setError(parsedResult.error);
      } else {
        if (typeof parsedResult === 'string') {
          setOutput(parsedResult);
        } else if (parsedResult.output) {
          setOutput(parsedResult.output);
        } else {
          setOutput(JSON.stringify(parsedResult, null, 2));
        }
        console.log("Setting output to:", output);
      }

      trackResults(inputData, result, performance.now() - startTime);
    } catch (err) {
      setError('An error occurred while performing the operation.');
      trackResults(
        inputData,
        { error: err.message || "Error solving Binary/Unary Operators" },
        performance.now() - startTime
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate row and column headers based on set elements
  const getSetElements = () => {
    return setInput.trim().split(/\s+/).filter(Boolean);
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
            Binary & Unary Operators
          </Text>
        </Box>
        <Box align="center" justify="center">
          <Text size="large" margin="none" weight={500}>
            Topic: Sets
          </Text>
        </Box>
        <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{ "bottom": "small" }} textAlign="center">
                This tool helps you analyze binary and unary operations on sets.
            </Text>
            <Text margin={{ "bottom": "small" }} textAlign="start" weight="normal">
                Binary operations take two inputs from a set and return an output in the same set. 
                Examples include addition and multiplication on numbers.
            </Text>
            <Text margin={{ "bottom": "small" }} textAlign="start" weight="normal">
                Unary operations take one input from a set and return an output in the same set. 
                Examples include negation and squaring of numbers.
            </Text>
            <Text textAlign="start" weight="normal" margin={{ "bottom": "medium" }}>
                Choose an input method below to check if an operation is well-defined on a set!
            </Text>
        </Box>
        <Card width="large" pad="medium" background={{ "color": "light-1" }}>
          <CardBody pad="small">
          <Box direction="row" align="start" justify="start" margin={{ bottom: 'small' }} style={{ marginLeft: '-8px', marginTop: '-8px' }}>
              <Button icon={<CircleInformation />} onClick={() => setShowHelp(!showHelp)} plain />
            </Box>
            <Collapsible open={showHelp}>
              <Box pad="small" background="light-2" round="small" margin={{ bottom: "medium" }} width="large">
                <Text weight="bold" margin={{ bottom: 'xsmall' }}>Table Input Format:</Text>
                <Text margin={{ bottom: 'small' }}>
                  1. Enter space-separated elements for your set (e.g., <strong>1 2 3</strong> or <strong>a b c</strong>)
                </Text>
                <Text margin={{ bottom: 'small' }}>
                  2. Fill in the operation table with valid set elements
                </Text>
                <Box height="8px" />
                
                <Text weight="bold" margin={{ bottom: 'xsmall' }}>Expression Input Format:</Text>
                <Text margin={{ bottom: 'small' }}>
                  Use the format: <strong>operation = expression; S = set</strong>
                </Text>
                <Text margin={{ bottom: 'xsmall' }}>Examples:</Text>
                <Text margin={{ bottom: 'xsmall' }}>
                  • <strong>x# = x^2; S = Z</strong> (Unary operation squaring integers)
                </Text>
                <Text margin={{ bottom: 'xsmall' }}>
                  • <strong>x ⊕ y = (x + y) % 3; S = {"{0,1,2}"}</strong> (Binary operation on modular arithmetic)
                </Text>
              </Box>
            </Collapsible>
            <Box margin={{ "bottom": "medium" }}>
              <FormField label="Choose Input Type">
                <RadioButtonGroup
                  name="inputType"
                  options={[
                    { label: 'Table', value: '1' },
                    { label: 'Expression', value: '2' }
                  ]}
                  value={choice}
                  onChange={(event) => setChoice(event.target.value)}
                />
              </FormField>
            </Box>

            <Tabs activeIndex={activeTab} onActive={handleTabChange}>
              <Tab title="Table Input">
                <Box margin={{ top: 'small' }}>
                  <FormField label="Set Elements (space-separated)" required>
                    <TextInput
                      placeholder="e.g., 1 2 3"
                      value={setInput}
                      onChange={handleSetInputChange}
                    />
                  </FormField>
                  
                  {getSetElements().length > 0 && (
                    <Box margin={{ top: 'medium' }}>
                      <Text weight="bold" margin={{ bottom: 'small' }}>Operation Table:</Text>
                      
                      {/* Display row headers */}
                      <Box direction="row" margin={{ bottom: 'xsmall' }}>
                        <Box width="50px" margin={{ right: 'small' }}></Box>
                        {getSetElements().map((element, index) => (
                          <Box key={index} width="50px" align="center">
                            <Text weight="bold">{element}</Text>
                          </Box>
                        ))}
                      </Box>
                      
                      {/* Matrix with row headers */}
                      {getSetElements().map((rowElement, rowIndex) => (
                        <Box key={rowIndex} direction="row" margin={{ bottom: 'xsmall' }}>
                          <Box width="50px" align="center" margin={{ right: 'small' }}>
                            <Text weight="bold">{rowElement}</Text>
                          </Box>
                          <Box direction="row">
                            {tableMatrix[rowIndex]?.map((cell, colIndex) => (
                              <TextInput
                                key={colIndex}
                                value={cell}
                                onChange={(e) => {
                                  const newMatrix = [...tableMatrix];
                                  newMatrix[rowIndex][colIndex] = e.target.value;
                                  setTableMatrix(newMatrix);
                                }}
                                width="50px"
                                textAlign="center"
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Tab>
              
              <Tab title="Expression Input">
                <Box margin={{ top: 'small' }}>
                  <FormField label="Operation Expression" required>
                    <TextInput
                      placeholder="e.g., x# = x^2; S = Z"
                      value={expressionInput}
                      onChange={(e) => setExpressionInput(e.target.value)}
                    />
                  </FormField>
                </Box>
              </Tab>
            </Tabs>

            {error && <Text color="status-critical" margin={{ top: 'small' }}>{error}</Text>}
          </CardBody>
          <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{ "top": "small" }}>
            <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
          </CardFooter>
        </Card>
        <Card width="large" pad="medium" background={{ "color": "light-2" }} margin={{ "top": "medium" }}>
          <CardBody pad="small">
            <Text weight="bold">
              Output:
            </Text>
            <Box align="start" justify="center" pad={{ "vertical": "small" }} background={{ "color": "light-3" }} round="xsmall">
              <Text style={{ whiteSpace: 'pre-wrap', width: '100%', fontFamily: 'monospace' }}>
                {output ? output : "Output will be displayed here!"}
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

export default BinaryUnaryOperators;