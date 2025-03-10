import React from 'react';
import { Page, PageContent, Box, Text, Card, CardBody, TextInput, CardFooter, Button, Spinner } from 'grommet';
import { solveTopologicalSorting } from '../api';
import ReportFooter from '../components/ReportFooter';
import Background from '../components/Background';
import HomeButton from '../components/HomeButton';
import { useDiagnostics } from '../hooks/useDiagnostics';
import TaskTableInput from '../components/TaskTableInput';

/*
* Name: TopologicalSorting.js
* Author: Parker Clark
* Description: Solver page for solving Topological Sorting.
*/

const TopologicalSorting = () => {
  
  const [tasks, setTasks] = React.useState([{ name: '', prerequisites: new Set(), time: 0 }]);
  const [isTimed, setIsTimed] = React.useState(true);
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { trackResults } = useDiagnostics("TOPOLOGICAL_SORTING");


  const formatTasksForBackend = () => {
    // Create an object to hold the formatted data
    const taskTable = {};
    
    // Process each task
    tasks.forEach(task => {
      if (task.name) {
        // Convert the Set to an array before serializing
        const prerequisitesArray = Array.from(task.prerequisites);
        
        // For debugging
        console.log(`Task ${task.name} depends on:`, prerequisitesArray);
        
        // Store the prerequisites as an array and the time as a number
        taskTable[task.name] = [prerequisitesArray, isTimed ? task.time : 0];
      }
    });
    
    console.log("Formatted table:", taskTable);
    return taskTable;
  };

  const validateInput = () => {

    // Check for empty task names
    if (tasks.some(task => !task.name.trim())) {
      setError('All tasks must have names.');
      return false;
    }
    
    // Check for duplicate task names
    const taskNames = tasks.map(t => t.name);
    if (new Set(taskNames).size !== taskNames.length) {
      setError('Task names must be unique.');
      return false;
    }
    
    // Check for negative times
    if (isTimed && tasks.some(task => task.time < 0)) {
      setError('Task times cannot be negative.');
      return false;
    }
    
    // Check for circular dependencies
    const taskGraph = {};
    tasks.forEach(task => {
      taskGraph[task.name] = [...task.prerequisites];
    });
    
    // Maintain a set of visited nodes and a temporary set for cycle detection
    const visited = new Set();
    const temp = new Set();
    
    // Modified DFS to detect cycles on the fly
    function hasCycle(node) {
      if (!visited.has(node)) {

        // Mark the current node as visited and add to temporary set
        temp.add(node);
        visited.add(node);
        
        // Check all neighbors for cycles
        for (const neighbor of taskGraph[node]) {
          if (!visited.has(neighbor) && hasCycle(neighbor)) {
            return true;
          } else if (temp.has(neighbor)) {
            return true;
          }
        }
      }
      temp.delete(node);
      return false;
    }
      
    // Check for cycles in each task
    for (const taskName of taskNames) {
      if (hasCycle(taskName)) {
        setError('Circular dependencies detected. Tasks cannot depend on each other cyclically.');
        return false;
      }
    }
    
    return true;
  };

  const handleSolve = async () => {
      setLoading(true);
      setOutput('');
      setError('');
  
      // Validate input
      if (!validateInput()) {
        setLoading(false);
        return;
      }
  
      // Format input to backend specification 
      const tableFormat = formatTasksForBackend();
      
      const startTime = performance.now();
      try {
        const result = await solveTopologicalSorting(tableFormat);

        console.log(result)
        setOutput(result);
        
        // Tracking results for diagnostics
        trackResults(
          { tasks: tableFormat, isTimed },
          result, 
          performance.now() - startTime
        );
      } catch (err) {
        trackResults(
          { tasks: tableFormat, isTimed },
          { error: err.message || "Error solving PERT diagram" },
          performance.now() - startTime
        );
        setError('An error occurred while generating the PERT Diagram.');
      } finally {
        setLoading(false);
      }
    };


  return (
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <PageContent align="center" skeleton={false}>
          <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '10px', background: 'white', borderRadius: '8px' }}>
            <HomeButton />
          </Box>
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">
              Topological Sorting
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: Topological Sorting
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
          <Text margin={{"bottom":"small"}} textAlign="center">
            This tool helps you analyze Topological Sorting in discrete mathematics.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            Topological sorting is a linear ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge u {"->"} v, vertex u comes before v in the ordering. This tool allows you to input a DAG and generate its topological sort.
            </Text>
            <Text margin={{"bottom":"small"}} textAlign="start" weight="normal">
            By analyzing topological sorts, you can understand the dependencies between tasks, identify critical paths, and optimize task scheduling. This tool allows you to input a set of tasks and their dependencies to generate the topological sort and analyze the critical paths.
            </Text>
            <Text textAlign="start" weight="normal" margin={{"bottom":"medium"}}>
            Enter your tasks and dependencies below to generate and analyze the topological sort and critical paths!
            </Text>
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <TaskTableInput 
                tasks={tasks} 
                setTasks={setTasks}
                isTimed={isTimed}
                setIsTimed={setIsTimed}
              />
              {error && <Text color="status-critical" margin={{ top: 'small' }}>{error}</Text>}
            </CardBody>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
              <Button label={loading ? <Spinner /> : "Solve"} onClick={handleSolve} disabled={loading} />
            </CardFooter>
          </Card>
          <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
            <CardBody pad="small">
              <Text weight="bold">
                Output:
              </Text>
              <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
                <Text>
                  {output ? output : "Output will be displayed here!"}
                </Text>
              </Box>
            </CardBody>
          </Card>
          <ReportFooter />
        </PageContent>
      </Box>
    </Page>
  );
};

export default TopologicalSorting;