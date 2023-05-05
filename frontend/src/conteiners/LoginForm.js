import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiInst } from '../utils/axios';

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        let userdata = {"username": username, "password": password };
        console.log(userdata)
        const response = apiInst.post('/login', userdata);
        // Cookies.set('user_id', response.data.user_id);
        onLogin();
        navigate("/");
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button type="submit">Log in</button>
      </form>
    );
  };

export default LoginForm;
