import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { createTask, sendSMSNotification } from '../services/api';

const TaskForm = ({ refreshTasks }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Please log in to create tasks');
      return;
    }

    if (!title.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        userId: user.id,
        title,
        completed: false
      });

      if (user.phoneNumber) {
        await sendSMSNotification({
          phoneNumber: user.phoneNumber,
          message: `New task created: ${title}`
        });
      }

      setTitle('');
      setError('');
      refreshTasks();
    } catch (err) {
      setError('Failed to create task');
      console.error('API Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Task Title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError('');
        }}
      />
      {error && <div className="error">{error}</div>}
      <button 
        type="submit" 
        disabled={isSubmitting || !title.trim()}
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
};

export default TaskForm;