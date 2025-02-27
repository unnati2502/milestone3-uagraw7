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

# Load environment variables
load_dotenv(find_dotenv())

# Flask app setup
app = flask.Flask(__name__)

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
@app.route("/")
@login_required
def index():
    """Homepage displaying a random movie and user comments."""
    movie_id = random.choice(MOVIE_ID_LIST)
    movie_data = tmdb_data(movie_id)

    if not movie_data:
        return "Error: Could not fetch movie data", 500

    movie_title = movie_data.get("original_title", "Unknown Title")
    tagline = movie_data.get("tagline", "")
    genre = (
        ", ".join([g["name"] for g in movie_data.get("genres", [])]) or "Unknown Genre"
    )
    poster_url = f"https://image.tmdb.org/t/p/w500{movie_data.get('poster_path', '')}"
    wiki_url = wiki_data(movie_title)

    ratings = Rating.query.filter_by(movie_id=movie_id).all()

    return flask.render_template(
        "index.html",
        title=movie_title,
        tagline=tagline,
        genre=genre,
        poster_url=poster_url,
        wiki_url=wiki_url,
        movie_id=movie_id,
        ratings=ratings,
    )


@app.route("/signup", methods=["GET", "POST"])
def signup():
    """Signup page where users can create an account."""
    if flask.request.method == "POST":
        username = flask.request.form.get("username").strip()
        if not username:
            flask.flash("Username cannot be empty", "danger")
            return flask.redirect(flask.url_for("signup"))

        if User.query.filter_by(username=username).first():
            flask.flash("Username already exists!", "danger")
            return flask.redirect(flask.url_for("signup"))

        new_user = User(username=username)
        db.session.add(new_user)
        db.session.commit()

        flask.flash("Signup successful! Please login.", "success")
        return flask.redirect(flask.url_for("login"))

    return flask.render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Login page where users authenticate using only their username."""
    if flask.request.method == "POST":
        username = flask.request.form.get("username").strip()
        user = User.query.filter_by(username=username).first()

        if user:
            login_user(user)
            flask.flash("Login successful!", "success")
            return flask.redirect(flask.url_for("index"))
        else:
            flask.flash("Invalid username", "danger")
            return flask.redirect(flask.url_for("login"))

    return flask.render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    """Logs the user out and redirects to login."""
    logout_user()
    return flask.redirect(flask.url_for("login"))


@app.route("/rate", methods=["POST"])
@login_required
def rate_movie():
    """Allows users to rate a movie and leave a comment."""
    movie_id = flask.request.form.get("movie_id")
    rating_value = int(flask.request.form.get("rating"))
    comment = flask.request.form.get("comment").strip()

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
    flask.flash("Your rating has been saved!", "success")
    return flask.redirect(flask.url_for("index"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=os.getenv("PORT", 8080))
