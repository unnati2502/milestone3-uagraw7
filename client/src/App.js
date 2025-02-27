
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login.js";
import Signup from "./signup.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<h1>Welcome to Movie Ratings</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
