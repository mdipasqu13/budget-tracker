import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Auth({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/login" : "/register";

    try {
    //   const response = await axios.post(`http://localhost:5001${endpoint}`, {
    //     username,
    //     password,
    //   });
      const response = await axios.post(`https://budget-tracker-backend.onrender.com${endpoint}`, {
        username,
        password,
      });
      alert(response.data.message);

      if (response.data.user_id) {
        setUserId(response.data.user_id); // Save user ID
        navigate("/tracker");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during authentication.");
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? "Register" : "Login"}
      </button>
    </div>
  );
}

export default Auth;
