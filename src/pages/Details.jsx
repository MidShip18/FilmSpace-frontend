import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import RatingSection from "../components/RatingSection";

const API = `${import.meta.env.VITE_API_URL}`;
const IMAGE = "https://image.tmdb.org/t/p";

const questions = {
    feel: [
        "Didn't enjoy it",
        "Mixed",
        "Enjoyed it",
        "Really enjoyed it",
        "Loved it"
    ],
    story: [
        "Weak",
        "Average",
        "Good",
        "Strong",
        "Exceptional"
    ],
    impact: [
        "Forgot it immediately",
        "Somewhat memorable",
        "Memorable",
        "Very memorable",
        "Stayed with me"
    ]
};

function Details() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [details, setDetails] = useState(null);
    const [myRating, setMyRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [error, setError] = useState("");

    const [watchlistSaved, setWatchlistSaved] = useState(false);
    const [watchlistBusy, setWatchlistBusy] = useState(false);
    const [watchlistMessage, setWatchlistMessage] = useState("");

    // Load movie or series details.
    useEffect(() => {
        const controller = new AbortController();

        async function loadDetails() {
            setLoading(true);
            setError("");
            setDetails(null);

            try {
                const response = await fetch(
                    `${API}/api/details/${type}/${id}`,
{ signal: controller.signal }
);

if (!response.ok) {
    throw new Error("Unable to load movie details.");
}

const data = await response.json();

if (!controller.signal.aborted) {
    setDetails(data);
}
} catch (err) {
    if (err.name !== "AbortError" && !controller.signal.aborted) {
        setError(err.message);
    }
} finally {
    if (!controller.signal.aborted) {
        setLoading(false);
    }
}
}

loadDetails();

return () => controller.abort();
}, [type, id]);

// Load the current user's rating.
useEffect(() => {
    const controller = new AbortController();

    async function loadMyRating() {
        const token = localStorage.getItem("token");

        if (!token) {
            setMyRating(null);
            setRatingLoading(false);
            return;
        }

        setRatingLoading(true);

        try {
            const response = await fetch(
                `${API}/api/ratings/movie/${id}?mediaType=${type}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: controller.signal
                }
            );

            if (
                response.status === 404 ||
                response.status === 401 ||
                !response.ok
            ) {
                if (!controller.signal.aborted) {
                    setMyRating(null);
                }
                return;
            }

            const data = await response.json();

            if (!controller.signal.aborted) {
                setMyRating(data || null);
            }
        } catch (err) {
            if (err.name !== "AbortError" && !controller.signal.aborted) {
                console.error("Unable to load personal rating:", err);
            }
        } finally {
            if (!controller.signal.aborted) {
                setRatingLoading(false);
            }
        }
    }

    loadMyRating();

    return () => controller.abort();
}, [id, type]);

// Check whether the current movie or series is already saved.
// This hook must remain above all early returns.
useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !id || !type) {
        return;
    }

    const controller = new AbortController();

    async function checkWatchlist() {
        try {
            const response = await fetch(`${API}/api/watchlist`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                signal: controller.signal
            });

            if (!response.ok) {
                return;
            }

            const items = await response.json();

            if (controller.signal.aborted) {
                return;
            }

            const isSaved =
                Array.isArray(items) &&
                items.some(
                    (item) =>
                        Number(item.tmdbId) === Number(id) &&
                        item.mediaType === type
                );

            setWatchlistSaved(isSaved);
        } catch (err) {
            if (
                err.name !== "AbortError" &&
                !controller.signal.aborted
            ) {
                console.error("Unable to check watchlist status:", err);
            }
        }
    }

    checkWatchlist();

    return () => controller.abort();
}, [id, type]);

// Add or remove the current title from the watchlist.
const handleWatchlistToggle = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/login", {
            state: {
                from: location.pathname,
                message: "Please log in to manage your watchlist."
            }
        });
        return;
    }

    if (watchlistBusy) {
        return;
    }

    setWatchlistBusy(true);
    setWatchlistMessage("");

    try {
        const method = watchlistSaved ? "DELETE" : "POST";

        const response = await fetch(
            `${API}/api/watchlist/${id}?mediaType=${encodeURIComponent(type)}`,
            {
                method,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                setWatchlistMessage(
                    "Your session may have expired. Please log in again."
                );
            } else if (response.status === 403) {
                setWatchlistMessage(
                    "You are not authorized to change your watchlist."
                );
            } else {
                setWatchlistMessage(
                    watchlistSaved
                        ? "Unable to remove this title. Please try again."
                        : "Unable to add this title. Please try again."
                );
            }

            return;
        }

        const newSavedState = !watchlistSaved;

        setWatchlistSaved(newSavedState);
        setWatchlistMessage(
            newSavedState
                ? "Added to your watchlist."
                : "Removed from your watchlist."
        );
    } catch {
        setWatchlistMessage(
            "Unable to connect to the server. Please try again."
        );
    } finally {
        setWatchlistBusy(false);
    }
};

// All hooks are above these early returns.
if (loading) {
    return <div className="details-loading">Loading details...</div>;
}

if (error || !details) {
    return (
        <div className="details-error">
            {error || "Movie details not found."}
        </div>
    );
}

const title = details.title || details.name || "Untitled";
const date =
    details.date || details.release_date || details.first_air_date;
const genres = details.genres || [];
const isMovie = type === "movie";

const overall =
    myRating?.feelScore != null &&
    myRating?.storyScore != null &&
    myRating?.impactScore != null
        ? (
            (
                Number(myRating.feelScore) +
                Number(myRating.storyScore) +
                Number(myRating.impactScore)
            ) / 3
        ).toFixed(1)
        : null;

const feel = questions.feel[Number(myRating?.feelScore) - 1];
const story = questions.story[Number(myRating?.storyScore) - 1];
const impact = questions.impact[Number(myRating?.impactScore) - 1];

const actors = details.actors || details.cast || [];
const directors =
    details.directors ||
    (details.director ? [details.director] : []);

return (
    <main className="film-details-page">
        <section
            className="film-details-hero"
            style={{
                "--movie-backdrop": details.backdrop_path
                    ? `url("${IMAGE}/original${details.backdrop_path}")`
                    : "none"
            }}
        >
            <div className="film-details-layout">
                {/* Poster and watchlist button */}
                <div className="film-poster-wrap">
                    {details.poster_path ? (
                        <img
                            className="film-poster"
                            src={`${IMAGE}/w500${details.poster_path}`}
                            alt={`${title} poster`}
                        />
                    ) : (
                        <div className="watchlist-no-poster">
                            No poster available
                        </div>
                    )}


                    <button
                        type="button"
                        className={`watchlist-bookmark ${watchlistSaved ? "is-saved" : ""}`}
                        onClick={handleWatchlistToggle}
                        aria-label={
                            watchlistSaved ? "Remove from watchlist" : "Add to watchlist"
                        }
                        title={watchlistSaved ? "In Watchlist" : "Add to Watchlist"}
                    >
                        {watchlistSaved ? "✓" : "+"}
                    </button>


                    {watchlistMessage && (
                        <p
                            className="watchlist-action-message"
                            role="status"
                        >
                            {watchlistMessage}
                        </p>
                    )}
                </div>

                {/* Main movie or series information */}
                <div className="film-info">
                    <h1>{title}</h1>

                    <div className="film-tmdb-inline">
                        <span className="film-star">★</span>
                        <strong>
                            {Number(details.vote_average || 0).toFixed(1)}
                        </strong>
                        <span>/ 10</span>
                        <small>TMDB</small>
                    </div>

                    <div className="film-meta">
                        {date && (
                            <span>Release date: {date}</span>
                        )}

                        {genres.length > 0 && (
                            <span>
                                    Genres:{" "}
                                {genres
                                    .map((genre) => genre.name)
                                    .join(", ")}
                                </span>
                        )}

                        {isMovie && details.runtime > 0 && (
                            <span>
                                    Runtime: {details.runtime} minutes
                                </span>
                        )}

                        {!isMovie &&
                            details.number_of_seasons != null && (
                                <span>
                                        Seasons: {details.number_of_seasons}
                                    </span>
                            )}

                        {!isMovie &&
                            details.number_of_episodes != null && (
                                <span>
                                        Episodes: {details.number_of_episodes}
                                    </span>
                            )}
                    </div>

                    {details.overview && (
                        <p className="film-overview">
                            {details.overview}
                        </p>
                    )}

                    {(actors.length > 0 || directors.length > 0) && (
                        <div className="film-credits">
                            {actors.length > 0 && (
                                <div>
                                    <strong>Actors</strong>
                                    <p>
                                        {actors
                                            .slice(0, 6)
                                            .map((person) =>
                                                typeof person === "string"
                                                    ? person
                                                    : person.name
                                            )
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                </div>
                            )}

                            {directors.length > 0 && (
                                <div>
                                    <strong>Director(s)</strong>
                                    <p>
                                        {directors
                                            .map((person) =>
                                                typeof person === "string"
                                                    ? person
                                                    : person.name
                                            )
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Ratings sidebar */}
                <aside className="film-rating-sidebar">
                    <section className="film-rating-card tmdb-rating-card">
                        <h3>TMDB Rating</h3>

                        <div className="film-rating-number">
                            <span className="film-star">★</span>
                            <strong>
                                {Number(details.vote_average || 0).toFixed(1)}
                            </strong>
                            <span>/ 10</span>
                        </div>

                        <p>Based on TMDB ratings</p>
                    </section>

                    {!ratingLoading && myRating && (
                        <section className="film-rating-card personal-rating-card">
                            <h3>Your Rating</h3>

                            {overall !== null ? (
                                <div className="film-rating-number">
                                    <span className="film-star">★</span>
                                    <strong>{overall}</strong>
                                    <span>/ 5</span>
                                </div>
                            ) : (
                                <p>Your saved responses</p>
                            )}

                            <div className="personal-rating-answers">
                                {story && (
                                    <p>
                                        <span>Story</span>
                                        <strong>{story}</strong>
                                    </p>
                                )}

                                {feel && (
                                    <p>
                                        <span>Feel</span>
                                        <strong>{feel}</strong>
                                    </p>
                                )}

                                {impact && (
                                    <p>
                                        <span>Impact</span>
                                        <strong>{impact}</strong>
                                    </p>
                                )}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </section>

        <div className="film-below-hero">
            <RatingSection
                key={`${type}-${id}`}
                tmdbId={id}
                mediaType={type}
                genres={genres}
            />

            <section className="movie-review-section">
                <div className="movie-review-heading">
                    <div>
                        <h2>Reviews</h2>
                        <p>See what others think about this title.</p>
                    </div>
                </div>

                <p className="movie-review-placeholder">
                    Reviews will appear here.
                </p>
            </section>
        </div>
    </main>
);
}

export default Details;
