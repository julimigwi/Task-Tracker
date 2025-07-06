import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import { AuthContext } from './AuthContext';
import { taskApi } from '../services/api';
import TaskForm from './TaskForm';
import './TaskDashboard.css';

const priorityColors = {
  high: '#F56565',
  medium: '#ECC94B',
  low: '#48BB78',
  default: '#E2E8F0'
};

const TaskItem = React.memo(({ task, onDelete, onToggleComplete, onEdit }) => {
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
        />
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-meta">
            {task.dueDate && (
              <span className="due-date">📅 {formatDate(task.dueDate)}</span>
            )}
            {task.priority && (
              <span
                className="priority-badge"
                style={{ backgroundColor: priorityColors[task.priority] || priorityColors.default }}
              >
                {task.priority}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => onEdit(task)} className="edit-btn">Edit</button>
        <button onClick={() => onDelete(task.id)} className="delete-btn">Delete</button>
      </div>
    </div>
  );
});

const TaskStatsDashboard = ({ tasks }) => {
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;
    return { completed, pending, high, medium, low };
  }, [tasks]);

  return (
    <div className="task-stats-dashboard">
      <div className="stats-card"><h3>Total</h3><p>{tasks.length}</p></div>
      <div className="stats-card"><h3>Completed</h3><p>{stats.completed}</p></div>
      <div className="stats-card"><h3>Pending</h3><p>{stats.pending}</p></div>
      <div className="stats-card">
        <h3>Priority</h3>
        <div className="priority-stats">
          <span style={{ color: priorityColors.high }}>High: {stats.high}</span>
          <span style={{ color: priorityColors.medium }}>Medium: {stats.medium}</span>
          <span style={{ color: priorityColors.low }}>Low: {stats.low}</span>
        </div>
      </div>
    </div>
  );
};

const TaskDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ Use navigate
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate');

  const fetchTasks = async () => {
    if (!user?.id) return setError('No user logged in');
    setIsLoading(true);
    try {
      const response = await taskApi.getAll(user.id);
      setTasks(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/'); // ✅ Redirect to home
  };

  const handleTaskUpdate = (action, payload) => {
    switch (action) {
      case 'delete':
        setTasks(prev => prev.filter(task => task.id !== payload));
        break;
      case 'update':
        setTasks(prev => prev.map(t => (t.id === payload.id ? payload : t)));
        break;
      case 'create':
        setTasks(prev => [...prev, payload]);
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = async (taskData) => {
    try {
      let result;
      if (taskData.id) {
        result = await taskApi.update(taskData.id, taskData);
        handleTaskUpdate('update', result);
      } else {
        result = await taskApi.create({ ...taskData, userId: user.id });
        handleTaskUpdate('create', result);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    }
  };

  const handleNewTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskApi.delete(id);
      handleTaskUpdate('delete', id);
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await taskApi.updateStatus(task.id, !task.completed, user.id);
      handleTaskUpdate('update', updated);
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch =
        activeTab === 'all' ||
        (activeTab === 'completed' && task.completed) ||
        (activeTab === 'pending' && !task.completed);
      const searchMatch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return statusMatch && searchMatch;
    });
  }, [tasks, activeTab, searchQuery]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
      if (sortBy === 'priority') {
        const order = { high: 1, medium: 2, low: 3 };
        return (order[a.priority] || 4) - (order[b.priority] || 4);
      }
      return a.title.localeCompare(b.title);
    });
  }, [filteredTasks, sortBy]);

  return (
    <div className="task-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Task Manager</h1>
          <div className="user-actions">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <TaskStatsDashboard tasks={tasks} />

        <div className="controls-section">
          <button onClick={handleNewTask} className="primary-btn">+ New Task</button>
        </div>

        {error && (
          <div className="error-alert">
            <p>{error}</p>
            <button onClick={fetchTasks} className="retry-btn">Retry</button>
          </div>
        )}

        <div className="filter-controls">
          <div className="filter-tabs">
            {['all', 'pending', 'completed'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort By:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" aria-busy="true" />
            <p>Loading tasks...</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="empty-state">
            <img
              src="https://media.istockphoto.com/id/2222107052/photo/blue-calendar-with-check-mark-and-pencil-on-light-blue-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=fvwa2jJYMesgCyF-ptL5jMFLE5WLkLqRXu3_03cKcv8="
              alt="No tasks found"
              className="empty-icon"
            />
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or add a new task.</p>
          </div>
        ) : (
          <div className="task-list">
            {sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2 className="modal-title">{currentTask ? 'Edit Task' : 'Create New Task'}</h2>
            <TaskForm
              taskToEdit={currentTask}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
