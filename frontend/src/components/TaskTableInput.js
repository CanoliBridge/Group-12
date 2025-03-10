import React, { useState } from 'react';
import { Box, Text, TextInput, Button, CheckBox, Table, TableRow, TableCell, TableHeader, TableBody } from 'grommet';
import { Add, Trash } from 'grommet-icons';

/*
* Name: TaskTableInput.js
* Author: Parker Clark
* Description: Input component for task tables used in PERT Diagrams.
*/

const TaskTableInput = ({ tasks, setTasks, isTimed, setIsTimed }) => {

  // Add a new empty task
  const addTask = () => {
    setTasks([...tasks, { name: '', prerequisites: new Set(), time: 0 }]);
  };

  // Remove a task by index
  const removeTask = (indexToRemove) => {
    const newTasks = tasks.filter((_, index) => index !== indexToRemove);
    
    // Update prerequisites - bookeep to remove any references to the removed task
    const updatedTasks = newTasks.map(task => {
      const updatedPrereqs = new Set(
        [...task.prerequisites].filter(prereq => 
          newTasks.some((t, i) => i !== indexToRemove && t.name === prereq)
        )
      );
      // Update the task with the new prerequisites
      return { ...task, prerequisites: updatedPrereqs };
    });
    
    setTasks(updatedTasks);
  };

  // Update task name
  const updateTaskName = (index, newName) => {
    const updatedTasks = [...tasks];
    const oldName = updatedTasks[index].name;

    // Set the new name to the proper task index in the array
    updatedTasks[index].name = newName;
    
    // Itertate through all tasks to update each prerequisite
    if (oldName && oldName !== newName) {
      updatedTasks.forEach(task => {
        if (task.prerequisites.has(oldName)) {
          task.prerequisites.delete(oldName);
          if (newName) task.prerequisites.add(newName);
        }
      });
    }
    
    setTasks(updatedTasks);
  };

  // Update task time
  const updateTaskTime = (index, newTime) => {

    // Ternary to ensure time is a positive integer
    const timeValue = newTime === '' ? 0 : Math.max(0, parseInt(newTime) || 0);

    // Set the new time to the proper task index in the array
    const updatedTasks = [...tasks];
    updatedTasks[index].time = timeValue;
    setTasks(updatedTasks);
  };

  // Toggle prerequisite selection
  const togglePrerequisite = (taskIndex, prereqName) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    
    // If the task already has the prerequisite, remove it. Otherwise, add it.
    if (task.prerequisites.has(prereqName)) {
      task.prerequisites.delete(prereqName);
    } else {
      task.prerequisites.add(prereqName);
    }
    
    setTasks(updatedTasks);
  };

  return (
    <Box gap="medium">
      <Box direction="row" align="center" gap="small">
        <CheckBox
          label="Include task times"
          checked={isTimed}
          onChange={(e) => setIsTimed(e.target.checked)}
        />
        <Button icon={<Add />} label="Add Task" onClick={addTask} />
      </Box>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell scope="col" border="bottom">
              <strong>Task Name</strong>
            </TableCell>
            <TableCell scope="col" border="bottom">
              <strong>Prerequisites</strong>
            </TableCell>
            {isTimed && (
              <TableCell scope="col" border="bottom">
                <strong>Time</strong>
              </TableCell>
            )}
            <TableCell scope="col" border="bottom">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextInput
                  value={task.name}
                  onChange={(e) => updateTaskName(index, e.target.value)}
                  placeholder="Task name"
                />
              </TableCell>
              <TableCell>
                <Box direction="row" gap="xsmall" wrap>
                  {tasks
                    .filter((t, i) => i !== index && t.name) // Filter out current task and empty names
                    .map((t, i) => (
                      <CheckBox
                        key={i}
                        label={t.name}
                        checked={task.prerequisites.has(t.name)}
                        onChange={() => togglePrerequisite(index, t.name)}
                      />
                    ))}
                  {tasks.filter((t, i) => i !== index && t.name).length === 0 && (
                    <Text color="dark-3">No other tasks available</Text>
                  )}
                </Box>
              </TableCell>
              {isTimed && (
                <TableCell>
                  <TextInput
                    type="number"
                    min="0"
                    value={task.time}
                    onChange={(e) => updateTaskTime(index, e.target.value)}
                    placeholder="0"
                  />
                </TableCell>
              )}
              <TableCell>
                <Button
                  icon={<Trash />}
                  onClick={() => removeTask(index)}
                  tip="Remove this task"
                />
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={isTimed ? 4 : 3}>
                <Text textAlign="center">No tasks added yet. Click "Add Task" to start.</Text>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default TaskTableInput;