import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { taskApi } from '../services/api';
import TaskForm from './TaskForm';
import './TaskDashboard.css';

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
  isLoading,
  error,
  onRetry,
  onDelete,
  onToggleComplete,
  onEdit
}) => {
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
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const fetchTasks = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const tasks = await taskApi.getAll(user.id);
      setTasks(tasks);
    } catch (error) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskApi.delete(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskApi.updateStatus(task.id, !task.completed);
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (error) {
      setError('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleNewTask = () => {
    setCurrentTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (newOrUpdatedTask) => {
    setIsFormOpen(false);
    if (currentTask) {
      setTasks(tasks.map(t => t.id === newOrUpdatedTask.id ? newOrUpdatedTask : t));
    } else {
      setTasks([...tasks, newOrUpdatedTask]);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = 
      activeTab === 'all' || 
      (activeTab === 'completed' && task.completed) || 
      (activeTab === 'pending' && !task.completed);
    
    const searchMatch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

  return (
    <div className="task-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Task Pulse</h1>
          <div className="user-actions">
            <span className="welcome-message">Welcome, {user?.name}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              <i className="search-icon">🔍</i>
            </button>
          </div>

          <div className="action-buttons">
            <button onClick={handleNewTask} className="primary-btn">
              + New Task
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <p>{error}</p>
            <button onClick={fetchTasks} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        <div className="filter-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Tasks
          </button>
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          error={error}
          onRetry={fetchTasks}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
        />
      </main>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => setIsFormOpen(false)}
            >
              &times;
            </button>
            <TaskForm 
              taskToEdit={currentTask}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;