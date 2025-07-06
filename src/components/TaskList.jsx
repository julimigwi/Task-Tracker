import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './TaskList.css';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const TaskList = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5000/tasks?userId=${user.id}`)
        .then(res => setTasks(res.data))
        .catch(err => console.log(err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="task-list-container">
      <h2>Your Tasks</h2>
      <button onClick={handleLogout} className="btn" style={{ marginBottom: '1rem' }}>
        Logout
      </button>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
