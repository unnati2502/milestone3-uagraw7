import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://172.19.144.56:8080";

const Signup = () => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            // Configure axios defaults
            axios.defaults.withCredentials = true;

            const response = await axios.post(
                `${API_URL}/signup`,
                { username },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Signup response:", response);

            alert("Signup successful! Please login.");
            navigate("/login");
        } catch (error) {
            console.error("Signup error:", error);
            alert(
                "Signup failed! " +
                (error.response?.data?.error || error.message || "Something went wrong")
            );
        }
    };

    return (
        <div className="auth-container">
            <header>The Movie Explorer</header>
            <h2>Sign Up</h2>

            <form onSubmit={handleSignup}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>

            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
};

export default Signup;
