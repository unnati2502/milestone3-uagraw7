import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://172.19.144.56:8080";

const Login = ({ setUser }) => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Configure axios defaults for this request
        axios.defaults.withCredentials = true;

        try {
            const response = await axios.post(
                `${API_URL}/login`,
                { username },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Check if the response has user data
            if (response.data && response.data.username) {
                setUser(response.data.username);
            } else {
                // If backend doesn't return username, use the one from form
                setUser(username);
            }

            alert("Login successful!");
            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            alert(
                "Login failed! " +
                (error.response?.data?.error || error.message || "Something went wrong")
            );
        }
    };

    return (
        <div className="auth-container">
            <header>The Movie Explorer</header>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>

            <p>
                Don't have an account? <a href="/signup">Sign up</a>
            </p>
        </div>
    );
};

export default Login;