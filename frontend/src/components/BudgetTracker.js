import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./BudgetTracker.css";

function BudgetTracker({ userId }) {
  const [username, setUsername] = useState("");
  const [budget, setBudget] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [expenditures, setExpenditures] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const responseExpenditures = await axios.get(
        `https://budget-tracker-backend-t9tw.onrender.com/get_expenditures/${userId}`
      );
      setExpenditures(responseExpenditures.data);

      const responseUser = await axios.get(
        `https://budget-tracker-backend-t9tw.onrender.com/get_user/${userId}`
      );
      setUsername(responseUser.data.username);
      setBudget(responseUser.data.budget);

      const totalExpenditures = responseExpenditures.data.reduce(
        (total, exp) => total + exp.amount,
        0
      );
      setRemainingBudget(responseUser.data.budget - totalExpenditures);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const handleSetBudget = async () => {
    try {
      await axios.post("https://budget-tracker-backend-t9tw.onrender.com/set_budget", {
        user_id: userId,
        budget,
      });

      // Add a log entry to expenditures for the budget update
      await axios.post("https://budget-tracker-backend-t9tw.onrender.com/add_expenditure", {
        user_id: userId,
        amount: 0, // No monetary value for setting a budget
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        note: `Budget set to $${budget}`,
      });

      alert("Budget updated!");
      fetchData();
      setBudget(""); // Clear the budget input field after submission
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpenditure = async () => {
    try {
      await axios.post("https://budget-tracker-backend-t9tw.onrender.com/add_expenditure", {
        user_id: userId,
        amount: parseFloat(amount),
        date,
        note,
      });
      alert("Expenditure added!");
      fetchData();
      setAmount(""); // Clear the amount input field after submission
      setDate(""); // Clear the date input field after submission
      setNote(""); // Clear the note input field after submission
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="tracker-container">
      <header className="tracker-header">
        <h1>Welcome, {username}</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="budget-summary">
        <h2>Total Budget: ${budget}</h2>
        <h3>Remaining Budget: ${remainingBudget}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent page reload on form submission
            handleSetBudget();
          }}
        >
          <input
            type="number"
            placeholder="Set New Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="button-primary">
            Update Budget
          </button>
        </form>
      </div>

      <div className="add-expenditure">
        <h2>Add Expenditure</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent page reload on form submission
            handleAddExpenditure();
          }}
        >
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="button-primary">
            Add Expenditure
          </button>
        </form>
      </div>

      <div className="expenditures-list">
        <h2>Expenditures</h2>
        {expenditures.length > 0 ? (
          expenditures.map((exp, index) => (
            <div key={index} className="expenditure-item">
              <p>
                ${exp.amount} - {exp.note} ({exp.date})
              </p>
            </div>
          ))
        ) : (
          <p>No expenditures yet.</p>
        )}
      </div>
    </div>
  );
}

export default BudgetTracker;
