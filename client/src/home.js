import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://172.19.144.56:8080";

const Home = ({ currentUser, onLogout }) => {
    const [movie, setMovie] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogout = useCallback(async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            if (onLogout) onLogout();
            navigate("/login");
        }
    }, [onLogout, navigate]);

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            try {
                const authResponse = await fetch(`${API_URL}/check-auth`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!authResponse.ok) {
                    throw new Error('Not authenticated');
                }

                // Now fetch the movie data
                const dataResponse = await fetch(`${API_URL}/`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!dataResponse.ok) {
                    throw new Error('Failed to fetch movie data');
                }

                const data = await dataResponse.json();

                if (data && data.movie) {
                    setMovie(data.movie);
                    setRatings(data.ratings || []);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.error("Error:", error);
                setError(error.message);

                if (error.message === 'Not authenticated') {
                    handleLogout();
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [handleLogout]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!movie) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    movie_id: movie.movie_id,
                    rating: rating,
                    comment: comment
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit rating');
            }

            alert("Rating submitted!");
            setRating("");
            setComment("");

            // Refresh ratings after submission
            const refreshResponse = await fetch(`${API_URL}/`, {
                method: 'GET',
                credentials: 'include',
            });

            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData && refreshData.ratings) {
                    setRatings(refreshData.ratings);
                }
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("Error submitting rating: " + (error.message || "Unknown error"));

            // If we get a 401, we should log out
            if (error.message === 'Unauthorized') {
                handleLogout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <h2>Loading movie details...</h2>;
    if (error) return <h2>Error: {error}</h2>;
    if (!movie) return <h2>No movie data available</h2>;

    return (
        <div className="movie-container">
            <header>
                The Movie Explorer
                {currentUser && (
                    <div className="user-info">
                        Welcome, {currentUser} | <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </header>

            <h1>{movie.title}</h1>
            <h2>{movie.tagline}</h2>
            <p className="genre">
                <strong>Genre:</strong> {movie.genre && Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
            </p>
            <img src={movie.poster_url} alt="Movie Poster" />

            <div className="rating-section">
                <h3>Rate this Movie</h3>
                <form onSubmit={handleSubmit} className="rating-form">
                    <div className="form-group">
                        <label htmlFor="rating">Rating (1-10):</label>
                        <input
                            type="number"
                            id="rating"
                            name="rating"
                            min="1"
                            max="10"
                            required
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">Comment:</label>
                        <textarea
                            id="comment"
                            name="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isLoading}
                        ></textarea>
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Rating"}
                    </button>
                </form>
                <div className="ratings-link">
                    <a href="/ratings">View My Ratings</a>
                </div>
            </div>

            <div className="ratings-display">
                <h3>User Ratings</h3>
                {ratings.length > 0 ? (
                    ratings.map((rating, index) => (
                        <div className="rating-item" key={index}>
                            <p>
                                <strong>User {rating.user_id}</strong> rated it {rating.rating_value}/10
                            </p>
                            {rating.comment && <p className="comment">{rating.comment}</p>}
                        </div>
                    ))
                ) : (
                    <p>No ratings yet. Be the first one to rate this movie!</p>
                )}
            </div>
        </div>
    );
};

export default Home;