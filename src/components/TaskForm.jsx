import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { taskApi, notifyApi } from '../services/api';
import './TaskForm.css';

const TaskForm = ({ taskToEdit, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || '',
    description: taskToEdit?.description || '',
    dueDate: taskToEdit?.dueDate || '',
    priority: taskToEdit?.priority || 'medium',
    completed: taskToEdit?.completed || false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationPreference, setNotificationPreference] = useState({
    sms: true,
    email: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNotificationChange = (type) => {
    setNotificationPreference(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user?.id) return;

    setIsSubmitting(true);
    
    try {
      const taskData = {
        userId: user.id,
        ...formData
      };

      let result;
      if (taskToEdit) {
        result = await taskApi.update(taskToEdit.id, taskData);
      } else {
        result = await taskApi.create(taskData);
      }

      // Send notifications if enabled
      if (notificationPreference.sms && user.phoneNumber) {
        try {
          await notifyApi.sms({
            phoneNumber: user.phoneNumber,
            message: taskToEdit 
              ? `Task updated: ${formData.title}` 
              : `New task created: ${formData.title}`
          });
        } catch (smsError) {
          console.error('SMS notification failed:', smsError);
        }
      }

      // Reset form if not editing
      if (!taskToEdit) {
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          completed: false
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Task submission error:', error);
      setErrors({
        server: error.message || 'Failed to save task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="task-form-container">
      <div className="task-form-card">
        <h2>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
        
        {errors.server && (
          <div className="form-error">
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error-input' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? 'error-input' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {taskToEdit && (
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="completed"
                name="completed"
                checked={formData.completed}
                onChange={handleChange}
              />
              <label htmlFor="completed">Task Completed</label>
            </div>
          )}

          {!taskToEdit && user?.phoneNumber && (
            <div className="notification-preferences">
              <h4>Notification Preferences</h4>
              <div className="preference-options">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="sms-notification"
                    checked={notificationPreference.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <label htmlFor="sms-notification">SMS Notification</label>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="email-notification"
                    checked={notificationPreference.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <label htmlFor="email-notification">Email Notification</label>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="secondary-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  {taskToEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                taskToEdit ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;