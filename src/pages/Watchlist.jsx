import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API = `${import.meta.env.VITE_API_URL}`;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function Watchlist() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", {
                state: {
                    from: "/watchlist",
                    message: "Please log in to view your watchlist."
                }
            });
            return;
        }

        const controller = new AbortController();

        const loadWatchlist = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API}/api/watchlist`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: controller.signal
                });

                if (response.status === 401) {
                    setError("Your session may have expired. Please log in again.");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Unable to load your watchlist.");
                }

                const data = await response.json();
                setItems(Array.isArray(data) ? data : []);
            } catch {
                if (!controller.signal.aborted) {
                    setError("Unable to load your watchlist. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadWatchlist();

        return () => controller.abort();
    }, [navigate]);

    if (loading) {
        return (
            <main className="watchlist-page">
                <p className="watchlist-status">Loading your watchlist...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="watchlist-page">
                <section className="watchlist-message">
                    <h2>Couldn't load your watchlist</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        Try again
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="watchlist-page">
            <header className="watchlist-heading">
                <p className="watchlist-eyebrow">YOUR COLLECTION</p>
                <h1>My Watchlist</h1>
                <p>Everything you want to watch, all in one place.</p>
            </header>

            {items.length === 0 ? (
                <section className="watchlist-message">
                    <div className="watchlist-empty-icon" aria-hidden="true">
                        +
                    </div>

                    <h2>Your watchlist is empty</h2>
                    <p>
                        Save movies and TV shows you're interested in,
                        and they'll appear here.
                    </p>

                    <Link to="/" className="watchlist-explore-button">
                        Explore movies and shows
                    </Link>
                </section>
            ) : (
                <>
                    <p className="watchlist-count">
                        {items.length} {items.length === 1 ? "title" : "titles"} saved
                    </p>

                    <div className="watchlist-grid">
                        {items.map((item) => (
                            <Link
                                to={`/details/${item.mediaType}/${item.tmdbId}`}
className="watchlist-card"
key={`${item.mediaType}-${item.tmdbId}`}
>
<div className="watchlist-poster-wrap">
    {item.posterPath ? (
            <img
                src={`${IMAGE_BASE}${item.posterPath}`}
                alt={item.title || "Saved title"}
                className="watchlist-poster"
                loading="lazy"
            />
        ) : (
            <div className="watchlist-no-poster">
                No poster available
            </div>
        )}

<span className="watchlist-media-type">
                                        {item.mediaType === "series"
                                            ? "TV SERIES"
                                            : "MOVIE"}
                                    </span>
</div>

<div className="watchlist-card-info">
    <h3>{item.title || "Untitled"}</h3>

    <div className="watchlist-card-meta">
                                        <span>
                                            {item.releaseDate
                                                ? item.releaseDate.slice(0, 4)
                                                : "Year unavailable"}
                                        </span>

        {item.rating != null && (
            <span>
                                                TMDB {Number(item.rating).toFixed(1)}/10
                                            </span>
        )}
    </div>
</div>
</Link>
))}
</div>
</>
)}
</main>
);
}

export default Watchlist;