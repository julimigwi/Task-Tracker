import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getUserTasks, deleteTask } from '../services/api';

const TaskItem = ({ task, onDelete }) => (
  <div style={{ 
    marginBottom: '1rem',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <p style={{ margin: 0 }}>{task.title}</p>
    <button 
      onClick={() => onDelete(task.id)}
      style={{
        background: '#ff4444',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Delete
    </button>
  </div>
);

const TaskList = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    getUserTasks(user.id)
      .then(res => {
        setTasks(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load tasks. Please try again.');
        setIsLoading(false);
        console.error('Error:', err);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleDelete = (id) => {
    const previousTasks = [...tasks];
    setTasks(tasks.filter(task => task.id !== id));
    
    deleteTask(id)
      .catch(err => {
        setTasks(previousTasks);
        setError('Failed to delete task');
      });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#333' }}>Your Tasks</h2>
      
      {isLoading && <p>Loading tasks...</p>}
      {error && (
        <p style={{ color: '#ff4444', margin: '1rem 0' }}>
          {error} 
          <button 
            onClick={fetchTasks}
            style={{ marginLeft: '1rem' }}
          >
            Retry
          </button>
        </p>
      )}
      
      {tasks.length === 0 && !isLoading ? (
        <p>No tasks found. Create your first task!</p>
      ) : (
        tasks.map(task => (
          <TaskItem key={task.id} task={task} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
};

export default TaskList;