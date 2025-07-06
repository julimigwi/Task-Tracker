import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { taskApi } from '../services/api';
import './TaskList.css';

const TaskItem = ({ 
  task, 
  onDelete, 
  onToggleComplete,
  onEdit 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F56565';
      case 'medium': return '#ECC94B';
      case 'low': return '#48BB78';
      default: return '#E2E8F0';
    }
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-main">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task)}
          className="task-checkbox"
        />
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-meta">
            {task.dueDate && (
              <span className="due-date">
                <i className="icon">📅</i> {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.priority && (
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="task-actions">
        <button 
          onClick={() => onEdit(task)}
          className="edit-btn"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const TaskList = ({ 
  tasks, 
  onTaskUpdate,
  onEditTask,
  isLoading,
  error,
  onRetry
}) => {
  const { user } = useContext(AuthContext);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskApi.delete(id);
      onTaskUpdate('delete', id);
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskApi.updateStatus(task.id, !task.completed);
      onTaskUpdate('update', updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task');
    }
  };

  return (
    <div className="task-list-container">
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={onRetry} className="retry-btn">
            Retry
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <img src="/empty-tasks.svg" alt="No tasks" className="empty-icon" />
          <h3>No tasks found</h3>
          <p>Create your first task to get started</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              onEdit={onEditTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;