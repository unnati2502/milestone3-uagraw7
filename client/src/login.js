import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://172.19.144.56:8080";

const Login = ({ setUser }) => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            console.log("Attempting login for user:", username);

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            console.log("Login successful:", data);
            setUser(username);

            const authCheck = await fetch(`${API_URL}/check-auth`, {
                credentials: 'include'
            });

            if (authCheck.ok) {
                console.log("Authentication check passed");
                navigate("/");
            } else {
                console.warn("Login appeared successful but auth check failed");
                throw new Error("Authentication failed after login");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <header>The Movie Explorer</header>
            <h2>Login</h2>

            {error && <div className="error-message">{error}</div>}

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
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account? <a href="/signup">Sign up</a>
            </p>
        </div>
    );
};

export default Login;