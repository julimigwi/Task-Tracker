import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { taskApi } from '../services/api';
import './TaskList.css';

const priorityColors = {
  high: '#F56565',
  medium: '#ECC94B',
  low: '#48BB78',
  default: '#E2E8F0'
};

const TaskItem = React.memo(({ 
  task, 
  onDelete, 
  onToggleComplete,
  onEdit 
}) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        />
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-meta">
            {task.dueDate && (
              <span className="due-date">
                <i className="icon" aria-hidden="true">📅</i> 
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.priority && (
              <span 
                className="priority-badge"
                style={{ 
                  backgroundColor: priorityColors[task.priority] || priorityColors.default 
                }}
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
          aria-label={`Edit task ${task.title}`}
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="delete-btn"
          aria-label={`Delete task ${task.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
});

const TaskList = ({ 
  tasks = [], 
  onTaskUpdate,
  onEditTask,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const { user } = useContext(AuthContext);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskApi.delete(id);
      onTaskUpdate('delete', id);
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert(`Failed to delete task: ${err.message || 'Please try again'}`);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskApi.updateStatus(
        task.id, 
        !task.completed,
        user.id // Pass user ID for verification
      );
      onTaskUpdate('update', updatedTask);
    } catch (err) {
      console.error('Failed to update task:', err);
      alert(`Failed to update task: ${err.message || 'Please try again'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" aria-busy="true"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={onRetry} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <img 
          src="/empty-tasks.svg" 
          alt="No tasks" 
          className="empty-icon" 
        />
        <h3>No tasks found</h3>
        <p>Create your first task to get started</p>
      </div>
    );
  }

  return (
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
  );
};

export default React.memo(TaskList);