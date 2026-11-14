import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API = `${import.meta.env.VITE_API_URL}`;
const IMAGE = "https://image.tmdb.org/t/p/w500";

function MyRatings() {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        async function loadRatings() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login", {
                    state: {
                        from: "/my-ratings",
                        message: "Please log in to view your ratings."
                    }
                });
                return;
            }

            try {
                const response = await fetch(`${API}/api/ratings/my`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: controller.signal
                });

                if (response.status === 401 || response.status === 403) {
                    setError(
                        "Your session may have expired. Please log in again."
                    );
                    return;
                }

                if (!response.ok) {
                    throw new Error("Unable to load your ratings.");
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setRatings(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(
                        err.message || "Unable to connect to the server."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadRatings();

        return () => controller.abort();
    }, [navigate]);

    if (loading) {
        return (
            <main className="my-ratings-page">
                <div className="my-ratings-status">
                    <div className="my-ratings-loader" />
                    <p>Loading your ratings...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="my-ratings-page">
                <div className="my-ratings-status">
                    <h2>Couldn't load your ratings</h2>
                    <p>{error}</p>

                    {error.includes("session") && (
                        <button
                            className="my-ratings-primary-button"
                            onClick={() =>
                                navigate("/login", {
                                    state: {
                                        from: "/my-ratings",
                                        message: error
                                    }
                                })
                            }
                        >
                            Log In Again
                        </button>
                    )}

                    <button
                        className="my-ratings-secondary-button"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="my-ratings-page">
            <section className="my-ratings-container">
                <header className="my-ratings-header">
                    <div>
                        <p className="my-ratings-eyebrow">
                            YOUR COLLECTION
                        </p>
                        <h1>My Ratings</h1>
                        <p className="my-ratings-subtitle">
                            Every movie and series you've rated.
                        </p>
                    </div>

                    <div className="my-ratings-count">
                        <span>{ratings.length}</span>
                        <span>
                            {ratings.length === 1 ? "Title rated" : "Titles rated"}
                        </span>
                    </div>
                </header>

                {ratings.length === 0 ? (
                    <section className="my-ratings-empty">
                        <div className="my-ratings-empty-icon">
                            <span>★</span>
                        </div>

                        <h2>Your ratings start here</h2>
                        <p>
                            Rate the movies and series you've watched.
                            They'll appear here so you can revisit your opinions.
                        </p>

                        <Link
                            to="/"
                            className="my-ratings-primary-button"
                        >
                            Explore Movies & Series
                        </Link>
                    </section>
                ) : (
                    <section className="my-ratings-grid">
                        {ratings.map((item) => {
                            const title = item.title || item.name || "Untitled";

                            const overall =
                                item.overallRating != null
                                    ? Number(item.overallRating).toFixed(2)
                                    : (
                                        (
                                            Number(item.feelScore) +
                                            Number(item.storyScore) +
                                            Number(item.impactScore)
                                        ) / 3
                                    ).toFixed(2);

                            const year = item.releaseDate
                                ? String(item.releaseDate).slice(0, 4)
                                : "";

                            const mediaType =
                                item.mediaType === "series"
                                    ? "TV Series"
                                    : "Movie";

                            return (
                                <article
                                    className="my-rating-card"
                                    key={item.id}
                                >
                                    <Link
                                        to={`/details/${item.mediaType}/${item.tmdbId}`}
                                        className="my-rating-poster-link"
                                        aria-label={`View ${title} details`}
                                    >
                                        {item.posterPath ? (
                                            <img
                                                className="my-rating-poster"
                                                src={`${IMAGE}${item.posterPath}`}
                                                alt={`${title} poster`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="my-rating-no-poster">
                                                No poster available
                                            </div>
                                        )}

                                        <span className="my-rating-badge">
                                            <span>★</span> {overall}
                                        </span>
                                    </Link>

                                    <div className="my-rating-content">
                                        <p className="my-rating-type">
                                            {mediaType}
                                            {year ? ` · ${year}` : ""}
                                        </p>

                                        <Link
                                            to={`/details/${item.mediaType}/${item.tmdbId}`}
                                            className="my-rating-title"
                                        >
                                            {title}
                                        </Link>

                                        <div className="my-rating-score">
                                            <span className="my-rating-star">
                                                ★
                                            </span>
                                            <span>{overall}</span>
                                            <span className="my-rating-out-of">
                                                / 5
                                            </span>
                                        </div>

                                        <p className="my-rating-label">
                                            Your FilmSpace rating
                                        </p>

                                        <div className="my-rating-breakdown">
                                            <div>
                                                <span>Feel</span>
                                                <strong>
                                                    {item.feelScore}/5
                                                </strong>
                                            </div>
                                            <div>
                                                <span>Story</span>
                                                <strong>
                                                    {item.storyScore}/5
                                                </strong>
                                            </div>
                                            <div>
                                                <span>Impact</span>
                                                <strong>
                                                    {item.impactScore}/5
                                                </strong>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/details/${item.mediaType}/${item.tmdbId}`}
                                            className="my-rating-details-link"
                                        >
                                            View details
                                            <span aria-hidden="true"> →</span>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </section>
        </main>
    );
}

export default MyRatings;