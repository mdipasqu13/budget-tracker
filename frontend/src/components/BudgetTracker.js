import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BudgetTracker({ userId }) {
  const [username, setUsername] = useState(""); // Store user's name
  const [budget, setBudget] = useState(0); // Total budget (constant)
  const [remainingBudget, setRemainingBudget] = useState(0); // Remaining budget
  const [amount, setAmount] = useState(""); // Expenditure amount
  const [date, setDate] = useState(""); // Expenditure date
  const [note, setNote] = useState(""); // Expenditure note
  const [expenditures, setExpenditures] = useState([]); // List of expenditures
  const navigate = useNavigate(); // Initialize navigate hook

  // Fetch user's budget and expenditures when component loads
  const fetchData = async () => {
    try {
      // Fetch all expenditures for the user
      const responseExpenditures = await axios.get(
        `https://budget-tracker-backend-t9tw.onrender.com/get_expenditures/${userId}`
      );
      setExpenditures(responseExpenditures.data);

      // Fetch the user's budget and username
      const responseUser = await axios.get(
        `https://budget-tracker-backend-t9tw.onrender.com/get_user/${userId}`
      );
      setUsername(responseUser.data.username); // Set username

      // Set total budget (constant)
      setBudget(responseUser.data.budget);

      // Calculate remaining budget by subtracting total expenditures from the total budget
      const totalExpenditures = responseExpenditures.data.reduce((total, exp) => total + exp.amount, 0);
      setRemainingBudget(responseUser.data.budget - totalExpenditures);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  // Handle setting a new budget
  const handleSetBudget = async () => {
    try {
      await axios.post("https://budget-tracker-backend-t9tw.onrender.com/set_budget", {
        user_id: userId,
        budget,
      });
      alert("Budget updated!");
      fetchData(); // Refresh data after updating the budget
    } catch (err) {
      console.error(err);
    }
  };

  // Handle adding a new expenditure
  const handleAddExpenditure = async () => {
    try {
      await axios.post("https://budget-tracker-backend-t9tw.onrender.com/add_expenditure", {
        user_id: userId,
        amount: parseFloat(amount),
        date,
        note,
      });
      alert("Expenditure added!");

      fetchData(); // Refresh expenditures and remaining budget after adding one
      setAmount("");
      setDate("");
      setNote("");
    } catch (err) {
      console.error(err);
    }
  };

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("userId"); // Remove userId from localStorage
    navigate("/"); // Redirect to login/register page
    window.location.reload(); // Optional: Reload the page to clear state
  };

  return (
    <div>
      {/* Display Username in Title */}
      <h2>{username ? `${username}'s Budget Tracker` : "Budget Tracker"}</h2>

      {/* Logout Button */}
      <button onClick={handleLogout} style={{ float: "right", marginTop: "10px" }}>
        Logout
      </button>

      {/* Display Total and Remaining Budget */}
      <div>
        <h3>Total Budget: ${budget.toFixed(2)}</h3>
        <h3>Remaining Budget: ${remainingBudget.toFixed(2)}</h3>
      </div>

      {/* Set Budget Section */}
      <div>
        <input
          type="number"
          placeholder="Set Budget"
          value={budget}
          onChange={(e) => setBudget(parseFloat(e.target.value))}
        />
        <button onClick={handleSetBudget}>Set Budget</button>
      </div>

      {/* Add Expenditure Section */}
      <div>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={handleAddExpenditure}>Add Expenditure</button>
      </div>

      {/* Expenditures Log */}
      <h3>Expenditures:</h3>
      <ul>
        {expenditures.map((exp) => (
          <li key={exp.id}>
            ${exp.amount.toFixed(2)} - {exp.date} ({exp.note})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BudgetTracker;