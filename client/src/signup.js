import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://172.19.144.56:8080";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            console.log("Attempting signup for user:", username);

            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            console.log("Signup successful");
            alert("Signup successful! Please login.");
            navigate("/login");
        } catch (error) {
            console.error("Signup error:", error);
            setError(error.message || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <header>The Movie Explorer</header>
            <h2>Sign Up</h2>

            {error && <div className="error-message">{error}</div>}

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
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing up..." : "Sign Up"}
                </button>
            </form>

            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
};

export default Signup;
