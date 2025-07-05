import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getUserTasks, deleteTask, updateTask } from '../services/api';

const TaskDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

  // Fetch tasks on component mount and when user changes
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getUserTasks(user.id);
        setTasks(response.data);
      } catch (error) {
        setError('Failed to load tasks. Please try again.');
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) fetchTasks();
  }, [user]);

  // Handle task deletion
  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  // Handle task completion toggle
  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task.id, updatedTask);
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (error) {
      setError('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return task.completed;
    return !task.completed;
  });

  // Styles object with enhanced hover states
  const styles = {
    dashboard: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
      color: '#2D3748',
      minHeight: '80vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1A202C',
      margin: 0
    },
    tabs: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: 'none',
      background: 'none'
    },
    activeTab: {
      backgroundColor: '#4299E1',
      color: 'white'
    },
    inactiveTab: {
      backgroundColor: 'transparent',
      color: '#4A5568',
      ':hover': {
        backgroundColor: '#EBF8FF'
      }
    },
    taskList: {
      display: 'grid',
      gap: '16px'
    },
    taskCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s ease',
      ':hover': {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    },
    taskInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1
    },
    taskStatus: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      flexShrink: 0
    },
    completedStatus: {
      backgroundColor: '#48BB78'
    },
    pendingStatus: {
      backgroundColor: '#ECC94B'
    },
    taskTitle: {
      fontSize: '16px',
      fontWeight: '500',
      textDecoration: (props) => props.completed ? 'line-through' : 'none',
      opacity: (props) => props.completed ? 0.7 : 1,
      wordBreak: 'break-word'
    },
    taskActions: {
      display: 'flex',
      gap: '12px',
      flexShrink: 0
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    deleteButton: {
      backgroundColor: '#FED7D7',
      color: '#E53E3E',
      ':hover': {
        backgroundColor: '#FEB2B2'
      }
    },
    completeButton: {
      backgroundColor: '#C6F6D5',
      color: '#38A169',
      ':hover': {
        backgroundColor: '#9AE6B4'
      }
    },
    primaryButton: {
      backgroundColor: '#4299E1',
      color: 'white',
      padding: '10px 20px',
      ':hover': {
        backgroundColor: '#3182CE'
      }
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#718096'
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px'
    },
    errorState: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#FED7D7',
      color: '#E53E3E',
      borderRadius: '8px',
      marginBottom: '20px'
    }
  };

  // Apply hover styles dynamically
  const applyHover = (baseStyle, hoverStyle) => ({
    ...baseStyle,
    ':hover': hoverStyle
  });

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Tasks</h1>
        <button 
          style={applyHover(
            { ...styles.button, ...styles.primaryButton },
            { backgroundColor: '#3182CE' }
          )}
          onClick={() => window.location.hash = '#/tasks/new'} // Update with your routing
        >
          + New Task
        </button>
      </div>

      {error && (
        <div style={styles.errorState}>
          <p>{error}</p>
          <button 
            style={{ 
              ...styles.button, 
              marginTop: '10px',
              backgroundColor: '#E53E3E',
              color: 'white'
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      <div style={styles.tabs}>
        <button
          style={activeTab === 'all' ? 
            styles.activeTab : 
            applyHover(styles.inactiveTab, { backgroundColor: '#EBF8FF' })}
          onClick={() => setActiveTab('all')}
        >
          All Tasks
        </button>
        <button
          style={activeTab === 'pending' ? 
            styles.activeTab : 
            applyHover(styles.inactiveTab, { backgroundColor: '#EBF8FF' })}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          style={activeTab === 'completed' ? 
            styles.activeTab : 
            applyHover(styles.inactiveTab, { backgroundColor: '#EBF8FF' })}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {isLoading ? (
        <div style={styles.loadingState}>
          <p>Loading tasks...</p>
        </div>
      ) : (
        <div style={styles.taskList}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskInfo}>
                  <div style={{ 
                    ...styles.taskStatus,
                    ...(task.completed ? styles.completedStatus : styles.pendingStatus)
                  }} />
                  <div style={{ 
                    ...styles.taskTitle,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.7 : 1
                  }}>
                    {task.title}
                  </div>
                </div>
                <div style={styles.taskActions}>
                  <button 
                    style={applyHover(
                      { ...styles.button, ...styles.completeButton },
                      { backgroundColor: '#9AE6B4' }
                    )}
                    onClick={() => handleToggleComplete(task)}
                  >
                    {task.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                  <button 
                    style={applyHover(
                      { ...styles.button, ...styles.deleteButton },
                      { backgroundColor: '#FEB2B2' }
                    )}
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <h3>No tasks found</h3>
              <p>{activeTab === 'all' ? 
                'Create your first task to get started' : 
                `No ${activeTab} tasks found`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;