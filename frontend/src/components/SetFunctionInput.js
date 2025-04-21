import React from 'react';
import {
  Box, Text, Button, FormField, TextInput, Select,
  Heading
} from 'grommet';
import { Add, Trash} from 'grommet-icons';

/*
* Name: SetFunctionInput.js
* Author: Parker Clark
* Description: Main input for Set Function page
*/

// Set operators available for expressions
const SET_OPERATORS = [
  { label: "Subset (⊆)", value: "⊆" },
  { label: "Proper Subset (⊂)", value: "⊂" },
  { label: "Element Of (∈)", value: "∈" },
  { label: "Equality (=)", value: "=" },
  { label: "Union (∪)", value: "∪" },
  { label: "Intersection (∩)", value: "∩" },
  { label: "Difference (-)", value: "-" },
  { label: "Cartesian Product (×)", value: "×" }
];

// Default set types
const SET_TYPES = [
  { label: "Regular Set", value: "regular" },
  { label: "Set Builder", value: "builder" }
];

const SetFunctionInput = ({ 
  sets, 
  expressions, 
  error,
  onSetsChange, 
  onExpressionsChange, 
  onValidate 
}) => {

  // Add a new set definition
  const addSet = () => {
    // Generate next available set name (A, B, C, ...)
    const nextName = String.fromCharCode(65 + sets.length);
    const newSets = [...sets, { name: nextName, type: "regular", value: "" }];
    onSetsChange(newSets);
  };

  // Remove a set definition
  const removeSet = (index) => {
    if (sets.length <= 1) return; // Keep at least one set
    
    const newSets = [...sets];
    const removedName = newSets[index].name;
    newSets.splice(index, 1);
    
    // Update expressions that used the removed set
    const newExpressions = expressions.map(expr => {
      if (expr.leftOperand === removedName) {
        return { ...expr, leftOperand: newSets[0].name };
      }
      if (expr.rightOperand === removedName) {
        return { ...expr, rightOperand: newSets[0].name };
      }
      return expr;
    });
    
    onSetsChange(newSets);
    onExpressionsChange(newExpressions);
  };

  // Update a set definition
  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    onSetsChange(newSets);
  };

  // Add a new expression
  const addExpression = () => {
    const newExpressions = [...expressions, { 
      leftOperand: sets[0]?.name || "", 
      operator: "⊆", 
      rightOperand: sets[1]?.name || sets[0]?.name || "" 
    }];
    onExpressionsChange(newExpressions);
  };

  // Remove an expression
  const removeExpression = (index) => {
    if (expressions.length <= 1) return; // Keep at least one expression
    
    const newExpressions = [...expressions];
    newExpressions.splice(index, 1);
    onExpressionsChange(newExpressions);
  };

  // Update an expression
  const updateExpression = (index, field, value) => {
    const newExpressions = [...expressions];
    newExpressions[index] = { ...newExpressions[index], [field]: value };
    onExpressionsChange(newExpressions);
  };

  return (
    <>
      {/* Set Definitions Section */}
      <Box margin={{ bottom: "medium" }}>
        <Box direction="row" justify="between" align="center">
          <Heading level={4} margin={{ bottom: "small" }}>Define Your Sets</Heading>
          <Button 
            icon={<Add />} 
            label="Add Set" 
            onClick={addSet} 
            size="small"
          />
        </Box>
        
        {sets.map((set, index) => (
          <Box 
            key={index} 
            direction="row" 
            align="center" 
            gap="small" 
            margin={{ bottom: "small" }}
            background="light-2"
            pad="small"
            round="small"
          >
            <FormField label="Name" width="xsmall">
              <TextInput
                value={set.name}
                onChange={(e) => updateSet(index, 'name', e.target.value)}
                size="small"
              />
            </FormField>
            
            <FormField label="Type" width="small">
              <Select
                options={SET_TYPES}
                labelKey="label"
                valueKey={{ key: 'value', reduce: true }}
                value={set.type}
                onChange={({ value }) => updateSet(index, 'type', value)}
                dropProps={{ 
                  align: { top: 'bottom' },
                  overflow: "auto"
                }}
              />
            </FormField>
            
            <FormField label="Value" flex>
              <TextInput
                placeholder={set.type === "regular" ? "{1, 2, 3} or ∅" : "{x | x ∈ Z and x > 3}"}
                value={set.value}
                onChange={(e) => updateSet(index, 'value', e.target.value)}
              />
            </FormField>
            
            <Button
              icon={<Trash />}
              onClick={() => removeSet(index)}
              disabled={sets.length <= 1}
              plain
            />
          </Box>
        ))}
      </Box>
      
      {/* Expressions Section */}
      <Box margin={{ top: "medium", bottom: "medium" }}>
        <Box direction="row" justify="between" align="center">
          <Heading level={4} margin={{ bottom: "small" }}>Create Statements</Heading>
          <Button 
            icon={<Add />} 
            label="Add Statement" 
            onClick={addExpression} 
            size="small"
          />
        </Box>
        
        {expressions.map((expr, index) => (
          <Box 
            key={index} 
            direction="row" 
            align="center" 
            gap="small" 
            margin={{ bottom: "small" }}
            background="light-2"
            pad="small"
            round="small"
            wrap={false} // Prevent wrapping to ensure single line
          >
            <Box basis="25%" flex={false}>
              <TextInput
                value={expr.leftOperand}
                onChange={(e) => updateExpression(index, 'leftOperand', e.target.value)}
                placeholder="Enter element or set (e.g., 1, {1,2}, ∅)"
                size="small"
              />
            </Box>
            
            <Box basis="35%" flex={false}>
              <Select
                options={SET_OPERATORS}
                labelKey="label"
                valueKey={{ key: 'value', reduce: true }}
                value={expr.operator}
                onChange={({ value }) => updateExpression(index, 'operator', value)}
                dropProps={{ 
                  align: { top: 'bottom' },
                  overflow: "auto"
                }}
                valueLabel={
                  <Box pad="xsmall">
                    <Text size="small">{SET_OPERATORS.find(op => op.value === expr.operator)?.label || expr.operator}</Text>
                  </Box>
                }
              />
            </Box>
            
            <Box basis="25%" flex={false}>
            <TextInput
              value={expr.rightOperand}
              onChange={(e) => updateExpression(index, 'rightOperand', e.target.value)}
              placeholder="Enter element or set (e.g., 1, {1,2}, ∅)"
              size="small"
            />
            </Box>
            
            <Box basis="15%" flex={false} align="center">
              <Button
                icon={<Trash />}
                onClick={() => removeExpression(index)}
                disabled={expressions.length <= 1}
                plain
              />
            </Box>
          </Box>
        ))}
      </Box>
      
      {/* Error Display */}
      {error && (
        <Box background="status-critical" pad="small" round="small" margin={{ vertical: "small" }}>
          <Text color="white">{error}</Text>
        </Box>
      )}
    </>
  );
};

export default SetFunctionInput;