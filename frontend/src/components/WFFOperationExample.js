import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow, Text, Box } from 'grommet';

/*
* Name: WFFOperationsTable.js
* Author: Parker Clark
* Description: Defines the WFFOperationsTable component for displaying a table of WFF operations.
*/

const WFFOperationsTable = () => {
  return (
    <Box margin={{"bottom":"medium"}}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell scope="col" border="bottom">
              <Text>Operator</Text>
            </TableCell>
            <TableCell scope="col" border="bottom">
              <Text>Symbol</Text>
            </TableCell>
            <TableCell scope="col" border="bottom">
              <Text>Description</Text>
            </TableCell>
            <TableCell scope="col" border="bottom">
              <Text>Example</Text>
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Text>AND</Text>
            </TableCell>
            <TableCell>
              <Text>^ | ∧ | `</Text>
            </TableCell>
            <TableCell>
              <Text>Logical conjunction</Text>
            </TableCell>
            <TableCell>
              <Text>A ^ B</Text>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Text>OR</Text>
            </TableCell>
            <TableCell>
              <Text>v | ∨ | ~ </Text>
            </TableCell>
            <TableCell>
              <Text>Logical disjunction</Text>
            </TableCell>
            <TableCell>
              <Text>A v B</Text>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Text>NOT</Text>
            </TableCell>
            <TableCell>
              <Text>' | ¬ | ′</Text>
            </TableCell>
            <TableCell>
              <Text>Logical negation</Text>
            </TableCell>
            <TableCell>
              <Text>¬A or A'</Text>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Text>IMPLIES</Text>
            </TableCell>
            <TableCell>
              <Text>-{'>'} | → | S </Text>
            </TableCell>
            <TableCell>
              <Text>Logical implication</Text>
            </TableCell>
            <TableCell>
              <Text>A → B</Text>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Text>IFF</Text>
            </TableCell>
            <TableCell>
              <Text>{'<>'} | ↔ | 4 </Text>
            </TableCell>
            <TableCell>
              <Text>Logical biconditional</Text>
            </TableCell>
            <TableCell>
              <Text>A ↔ B</Text>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default WFFOperationsTable;