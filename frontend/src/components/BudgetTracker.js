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
    if (budget <= 0) {
      alert("Please enter a valid budget.");
      return;
    }
    try {
      await axios.post("https://budget-tracker-backend-t9tw.onrender.com/set_budget", {
        user_id: userId,
        budget,
      });
      alert("Budget updated!");

      setRemainingBudget(budget);

      const currentDate = new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
      setExpenditures([
        ...expenditures,
        { amount: 0, note: `New budget set to $${budget}`, date: currentDate },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpenditure = async () => {
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("Please enter a valid expenditure amount.");
      return;
    }
    if (parseFloat(amount) > remainingBudget) {
      alert("Expenditure exceeds remaining budget!");
      return;
    }
    try {
      const expenditureAmount = parseFloat(amount);
      await axios.post("https://budget-tracker-backend-t9tw.onrender.com/add_expenditure", {
        user_id: userId,
        amount: expenditureAmount,
        date,
        note,
      });
      alert("Expenditure added!");

      setExpenditures([...expenditures, { amount: expenditureAmount, date, note }]);
      setRemainingBudget((prev) => prev - expenditureAmount);

      setAmount("");
      setDate("");
      setNote("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPressSetBudget = (e) => {
    if (e.key === "Enter") handleSetBudget();
  };

  const handleKeyPressAddExpenditure = (e) => {
    if (e.key === "Enter") handleAddExpenditure();
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="container">
      <h1>Welcome, {username}!</h1>

      <div className="budget-section">
        <h2>Set Your Budget</h2>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(parseFloat(e.target.value))}
          onKeyPress={handleKeyPressSetBudget}
          placeholder="Enter your budget"
        />
        <button onClick={handleSetBudget}>Set Budget</button>
        <p>Remaining Budget: ${remainingBudget.toFixed(2)}</p>
      </div>

      <div className="expenditure-section">
        <h2>Add Expenditure</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyPress={handleKeyPressAddExpenditure}
          placeholder="Enter amount"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Enter date"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyPress={handleKeyPressAddExpenditure}
          placeholder="Enter note"
        />
        <button onClick={handleAddExpenditure}>Add Expenditure</button>
      </div>

      <div className="expenditure-log">
        <h2>Expenditure Log</h2>
        {expenditures.length > 0 ? (
          expenditures.map((exp, index) => (
            <p key={index}>
              ${exp.amount} - {exp.note} ({exp.date})
            </p>
          ))
        ) : (
          <p>No expenditures yet.</p>
        )}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default BudgetTracker;
