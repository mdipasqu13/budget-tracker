import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/login" : "/register";
    try {
      const response = await axios.post(
        `https://budget-tracker-backend-t9tw.onrender.com${endpoint}`,
        { username, password }
      );
      alert(response.data.message);
      if (response.data.user_id) {
        setUserId(response.data.user_id);
        navigate("/tracker");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during authentication.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="auth-container">
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown} 
      >
        <h2>{isLogin ? "Log In" : "Register"}</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Log In" : "Register"}</button>
      </form>
      <div className="auth-toggle">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register here." : "Log in here."}
        </span>
      </div>
    </div>
  );
}

export default Auth;
