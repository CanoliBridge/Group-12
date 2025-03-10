import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, Text, TextInput, CheckBox, FormField, Grid } from 'grommet';

/*
* Name: PolynomialInput.js
* Author: Parker Clark
* Description: Reusable component for polynomial function input with dynamic coefficients
*/

// Using a forwardRef in this component for the parent to call it's validation method.
const PolynomialInput = forwardRef((props, ref) => {

  // State variables for the polynomial input
  const { 
    order, 
    setOrder, 
    coefficients, 
    setCoefficients, 
    useLog, 
    setUseLog, 
    useRoot, 
    setUseRoot,
    setError 
  } = props;
  
  // Update coefficients array on user input of order change
  useEffect(() => {

    let orderNum = parseInt(order, 10);

    // Enforce a maximum order of 20 on user update
    // Note: This is so that the user doesn't enter an obscenely large number which would crash the page.
    //  This can be changed if needed, but 20 is a reasonable limit for most use cases.
    if (orderNum > 20) {
        setError && setError('Maximum order is 20.');
        orderNum = 20;
        setOrder('20');
    }

    if (!isNaN(orderNum) && orderNum >= 0) {
      
      // Adjust the array to match the new order generated
      const newCoefficients = Array(orderNum + 1).fill('');
      
      // Preserve existing coefficient values when possible
      for (let i = 0; i < Math.min(coefficients.length, newCoefficients.length); i++) {
        newCoefficients[i] = coefficients[i];
      }
      
      // Set the new coefficients array
      setCoefficients(newCoefficients);
    }
  }, [order, coefficients, setCoefficients]);


  // Call handlers for manipulating coefficient array
  const handleCoefficientChange = (index, value) => {
    const newCoefficients = [...coefficients];
    newCoefficients[index] = value;
    setCoefficients(newCoefficients);
  };

  // Generate polynomial display text
  const generatePolynomialText = () => {

    // If no coefficients, return empty string
    if (coefficients.length === 0) return "";
    

    // Generate the polynomial text based on the coefficients with proper position
    return coefficients.map((coef, index) => {
      const power = coefficients.length - 1 - index;
      
      // Adjust coefficient powers for display
      if (power === 0) {
        return coef || '0';
      } else if (power === 1) {
        return `${coef || '0'}x`;
      } else {
        return `${coef || '0'}x^${power}`;
      }
    }).join(' + ');
  };

  // Validator that can be called from parent
  // NOTE: Not a fan of doing it this way, I prefer to keep this logic in the page itself, but 
  //   because this input is such a pain in the butt to maintain and bookeep, it makes more sense
  //   for the page to access and validate input this way on the fly. 
  const validateInputs = () => {

    // Validate order is a natural number via ensuring it is a non-negative integer
    const orderNum = parseInt(order, 10);
    if (isNaN(orderNum) || orderNum < 0 || !Number.isInteger(orderNum)) {
      setError && setError('Order must be a non-negative integer.');
      return false;
    }

    // Validate all coefficients are valid numbers
    for (let i = 0; i < coefficients.length; i++) {
      if (coefficients[i].trim() === '') {
        setError && setError(`Coefficient for x^${coefficients.length - 1 - i} cannot be empty.`);
        return false;
      }
      
      // If the coefficent is not a number, return false
      const value = parseFloat(coefficients[i]);
      if (isNaN(value)) {
        setError && setError(`Invalid number for coefficient of x^${coefficients.length - 1 - i}.`);
        return false;
      }
    }

    return true;
  };

  // Expose the validation method via ref
  useImperativeHandle(ref, () => ({
    validate: validateInputs
  }));

  return (
    <Box margin={{ bottom: 'medium' }}>
      <FormField label="Order (non-negative integer)" margin={{ bottom: 'small' }}>
        <TextInput
          placeholder="Enter the order (e.g., 2)"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        />
      </FormField>
      
      <Box direction="row" gap="medium" margin={{ bottom: 'medium' }}>
        <CheckBox
          label="Use Logarithm"
          checked={useLog}
          onChange={(e) => setUseLog(e.target.checked)}
        />
        <CheckBox
          label="Use Root"
          checked={useRoot}
          onChange={(e) => setUseRoot(e.target.checked)}
        />
      </Box>
      
      <Box margin={{ top: 'medium', bottom: 'small' }}>
        <Text weight="bold">Coefficients:</Text>
        <Text size="small">Enter the coefficients for your polynomial:</Text>
      </Box>
      
      <Grid columns={{ count: 'fit', size: 'small' }} gap="small">
        {coefficients.map((coef, index) => {
          const power = coefficients.length - 1 - index;
          return (
            <FormField 
              key={index} 
              label={power === 0 ? 'Constant term' : power === 1 ? 'x' : `x^${power}`}
            >
              <TextInput
                placeholder={`Coefficient`}
                value={coef}
                onChange={(e) => handleCoefficientChange(index, e.target.value)}
              />
            </FormField>
          );
        })}
      </Grid>
      
      <Box margin={{ top: 'medium', bottom: 'small' }} align="center">
        <Text weight="bold">Your polynomial:</Text>
        <Text>{generatePolynomialText()}</Text>
      </Box>
    </Box>
  );
});

export default PolynomialInput;