import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { taskApi } from '../services/api';
import TaskForm from './TaskForm';

const priorityColors = {
  high: '#F56565',
  medium: '#ECC94B',
  low: '#48BB78',
  default: '#CBD5E1'
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
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '16px',
      borderRadius: '10px',
      marginTop: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task)}
          style={{ width: '18px', height: '18px' }}
        />
        <div>
          <h4 style={{ margin: 0, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</h4>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b' }}>{task.description}</p>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            📅 {formatDate(task.dueDate)}
            <span style={{
              marginLeft: '8px',
              backgroundColor: priorityColors[task.priority] || priorityColors.default,
              padding: '2px 8px',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>
      <div>
        <button onClick={() => onEdit(task)} style={{ marginRight: '8px', background: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>Edit</button>
        <button onClick={() => onDelete(task.id)} style={{ background: '#fecaca', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>Delete</button>
      </div>
    </div>
  );
});

const TaskDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

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
    navigate('/');
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

  const openFormModal = (task = null) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", backgroundColor: "#f8f9fc", minHeight: "100vh", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "24px", color: "#1e293b" }}>📋 Task Tracker</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", color: "#1e293b" }}>👤 {user?.name || 'Demo User'}</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "6px 14px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            ⏏ Logout
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(90deg, #3b82f6, #6366f1)",
        color: "#fff",
        padding: "24px",
        borderRadius: "10px",
        marginBottom: "24px"
      }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600" }}>Welcome back, {user?.name || 'Demo User'}!</h2>
        <p style={{ fontSize: "14px", margin: "8px 0 16px" }}>Ready to tackle your tasks? Let's make today productive!</p>
        <button
          onClick={() => openFormModal(null)}
          style={{
            backgroundColor: "#fff",
            color: "#3b82f6",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          ＋ Create New Task
        </button>
      </div>

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Tasks */}
        <div>
          <div style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            marginBottom: "20px"
          }}>
            <h3 style={{ fontWeight: "600", fontSize: "18px", color: "#1e293b" }}>Your Tasks</h3>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Manage and track your daily tasks</p>

            {isLoading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <p>Loading...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div style={{
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                padding: "32px",
                textAlign: "center",
                marginTop: "16px"
              }}>
                <h4 style={{ fontWeight: "500", color: "#64748b" }}>No tasks yet</h4>
                <p style={{ fontSize: "14px", color: "#94a3b8" }}>Create your first task to get started!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onEdit={openFormModal}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontWeight: "600", fontSize: "16px", color: "#0f172a" }}>Quick Actions</h3>
            <button
              onClick={() => openFormModal(null)}
              style={{
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                marginTop: "12px",
                cursor: "pointer",
                fontWeight: "500",
                width: "100%"
              }}
            >
              ＋ Add New Task
            </button>
          </div>

          <div style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontWeight: "600", fontSize: "16px", color: "#0f172a" }}>Tips</h3>
            <p style={{ fontSize: "13px", margin: "6px 0", color: "#475569" }}>Your Daily tasks should be your main priority</p>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              Keeping track of your tasks helps you stay organized and focused. Use the "Create New Task" button to add tasks, and mark them as complete when done.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 9999
        }} onClick={() => setIsModalOpen(false)}>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "500px"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setIsModalOpen(false)} style={{ float: "right", fontWeight: "bold", border: "none", background: "none" }}>×</button>
            <h2 style={{ marginTop: 0 }}>{currentTask ? 'Edit Task' : 'Create New Task'}</h2>
            <TaskForm
              taskToEdit={currentTask}
              onSubmitSuccess={(result) => {
                handleTaskUpdate(currentTask ? 'update' : 'create', result);
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
