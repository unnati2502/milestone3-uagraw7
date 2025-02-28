import flask
import os
import requests
import random
from dotenv import find_dotenv, load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    login_required,
    logout_user,
    current_user,
)
from datetime import datetime
from flask_cors import CORS

# Load environment variables
load_dotenv(find_dotenv())

app = flask.Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000", "http://localhost:3001"],
)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://postgres:uag625@localhost:5432/postgres"
)
app.secret_key = "I am a secret key!"

# Database setup
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Movie API setup
API_KEY = os.getenv("API_KEY")
MOVIE_ID_LIST = [
    1241982,
    762509,
    402431,
    1011985,
    748783,
    519182,
    1022789,
    808,
    109445,
    62177,
]
BASE_URL = "https://api.themoviedb.org/3/movie"
WIKI_API_URL = "https://en.wikipedia.org/w/api.php"


# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    ratings = db.relationship("Rating", backref="user", lazy=True)


class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    movie_id = db.Column(db.Integer, nullable=False)
    rating_value = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Create tables
with app.app_context():
    db.create_all()


# Helper functions
def tmdb_data(movie_id):
    """Fetches movie data from TMDB API."""
    url = f"{BASE_URL}/{movie_id}?api_key={API_KEY}&language=en-US"
    response = requests.get(url)
    return response.json() if response.status_code == 200 else None


def wiki_data(movie_title):
    """Fetches Wikipedia URL for a movie title."""
    params = {
        "action": "query",
        "format": "json",
        "titles": movie_title,
        "prop": "info",
        "inprop": "url",
        "formatversion": 2,
    }

    response = requests.get(WIKI_API_URL, params=params)
    if response.status_code != 200:
        return "https://en.wikipedia.org/wiki/Main_Page"

    data = response.json()
    pages = data.get("query", {}).get("pages", [])

    return (
        pages[0].get("fullurl", "https://en.wikipedia.org/wiki/Main_Page")
        if pages
        else "https://en.wikipedia.org/wiki/Main_Page"
    )


# Routes
@app.route("/", methods=["GET"])
def index():
    if not current_user.is_authenticated:
        return flask.jsonify({"error": "Unauthorized"}), 401
    """Homepage displaying a random movie and user comments."""
    movie_id = random.choice(MOVIE_ID_LIST)
    movie_data = tmdb_data(movie_id)

    if not movie_data:
        return flask.jsonify({"error": "Could not fetch movie data"}), 500

    movie_info = {
        "title": movie_data.get("original_title", "Unknown Title"),
        "tagline": movie_data.get("tagline", ""),
        "genre": [g["name"] for g in movie_data.get("genres", [])],
        "poster_url": f"https://image.tmdb.org/t/p/w500{movie_data.get('poster_path', '')}",
        "movie_id": movie_id,
    }

    ratings = Rating.query.filter_by(movie_id=movie_id).all()

    rating_list = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "movie_id": r.movie_id,
            "rating_value": r.rating_value,
            "comment": r.comment,
            "timestamp": r.timestamp,
        }
        for r in ratings
    ]

    return flask.jsonify({"movie": movie_info, "ratings": rating_list})


@app.route("/signup", methods=["POST"])
def signup():
    data = flask.request.json
    if not data:
        return flask.jsonify({"error": "Invalid JSON data"}), 400

    username = data.get("username", "").strip()

    if not username:
        return flask.jsonify({"error": "Username cannot be empty"}), 400

    if User.query.filter_by(username=username).first():
        return flask.jsonify({"error": "Username already exists!"}), 400

    new_user = User(username=username)
    db.session.add(new_user)
    db.session.commit()

    return flask.jsonify({"message": "Signup successful! Please login."}), 201


@app.route("/login", methods=["POST"])
def login():
    # Login page where users authenticate using their username.
    data = flask.request.json
    username = data.get("username", "").strip()
    user = User.query.filter_by(username=username).first()

    if user:
        login_user(user)
        return flask.jsonify({"message": "Login successful!", "user_id": user.id}), 200
    else:
        return flask.jsonify({"error": "Invalid username"}), 401


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    # Logs the user out
    logout_user()
    return flask.jsonify({"message": "Logout successful"}), 200


@app.route("/comments", methods=["GET"])
def get_comments():
    """Fetches all comments and ratings."""
    ratings = Rating.query.all()
    rating_list = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "movie_id": r.movie_id,
            "rating_value": r.rating_value,
            "comment": r.comment,
            "timestamp": r.timestamp,
        }
        for r in ratings
    ]
    return flask.jsonify(rating_list), 200


@app.route("/comments", methods=["POST"], strict_slashes=False)
@login_required
def rate_movie():
    """Allows users to rate a movie and leave a comment."""
    data = flask.request.json
    movie_id = data.get("movie_id")
    rating_value = int(data.get("rating"))
    comment = data.get("comment", "").strip()

    existing_rating = Rating.query.filter_by(
        user_id=current_user.id, movie_id=movie_id
    ).first()

    if existing_rating:
        existing_rating.rating_value = rating_value
        existing_rating.comment = comment
    else:
        new_rating = Rating(
            user_id=current_user.id,
            movie_id=movie_id,
            rating_value=rating_value,
            comment=comment,
        )
        db.session.add(new_rating)

    db.session.commit()
    return flask.jsonify({"message": "Your rating has been saved!"}), 201


@app.route("/comments/<int:comment_id>", methods=["PUT"])
@login_required
def update_comment(comment_id):
    """Updates a user’s rating/comment."""
    data = flask.request.json
    rating_value = int(data.get("rating"))
    comment = data.get("comment", "").strip()

    rating = Rating.query.filter_by(id=comment_id, user_id=current_user.id).first()

    if not rating:
        return flask.jsonify({"error": "Comment not found"}), 404

    rating.rating_value = rating_value
    rating.comment = comment
    db.session.commit()

    return flask.jsonify({"message": "Comment updated successfully!"}), 200


@app.route("/comments/<int:comment_id>", methods=["DELETE"])
@login_required
def delete_comment(comment_id):
    # Deletes a user’s rating/comment.
    rating = Rating.query.filter_by(id=comment_id, user_id=current_user.id).first()

    if not rating:
        return flask.jsonify({"error": "Comment not found"}), 404

    db.session.delete(rating)
    db.session.commit()

    return flask.jsonify({"message": "Comment deleted successfully!"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=os.getenv("PORT", 8080), debug=True)
