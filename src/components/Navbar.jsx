import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [searchText, setSearchText] = useState("");
    const [accountOpen, setAccountOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const handleSearch = async (event) => {
        event.preventDefault();

        if (!searchText.trim()) return;

        setSearching(true);
        setError("");

        try {
            const query = encodeURIComponent(searchText.trim());

            const [movieResponse, seriesResponse] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/movies/search?query=${query}`),
    fetch(`${import.meta.env.VITE_API_URL}/api/series/search?query=${query}`)
]);

if (!movieResponse.ok || !seriesResponse.ok) {
    throw new Error("Search failed");
}

const movieData = await movieResponse.json();
const seriesData = await seriesResponse.json();

const results = [
    ...(movieData.results || []).map((movie) => ({
        ...movie,
        type: "movie"
    })),
    ...(seriesData.results || []).map((series) => ({
        ...series,
        type: "series"
    }))
];

navigate("/", {
    state: {
        searchResults: results,
        searchText: searchText.trim()
    }
});
} catch  {
    setError("Unable to search. Please try again.");
} finally {
    setSearching(false);
}
};

const handleLogout = () => {
    localStorage.removeItem("token");
    setAccountOpen(false);
    navigate("/login");
    window.location.reload();
};

const openWatchlist = () => {
    setAccountOpen(false);
    navigate("/watchlist");
};

return (
    <header className="header global-navbar">
        <h1 onClick={() => navigate("/")}>
            <span className="film-text">Film</span>Space
        </h1>

        <nav className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/">Movies</Link>
            <Link to="/">TV Shows</Link>
        </nav>

        <form className="navbar-search" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Search movies, shows..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
            />

            <button type="submit" disabled={searching}>
                {searching ? "..." : "Search"}
            </button>
        </form>

        <Link to="/game" className="game-link">
            Face-Off
        </Link>

        <div className="account-menu">
            <button
                className="account-button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
            >
                    <span className="account-avatar">
                        {token ? "U" : "?"}
                    </span>

                {token ? "My account" : "Guest"}
                <span>⌄</span>
            </button>

            {accountOpen && (
                <div className="account-dropdown">
                    {token ? (
                        <>
                            <button
                                type="button"
                                onClick={openWatchlist}
                            >
                                My Watchlist
                            </button>

                            <button onClick={() => navigate("/my-ratings")}>
                                My Ratings
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/login", {
                                        state: {
                                            from: location.pathname
                                        }
                                    })
                                }
                            >
                                Log in
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                            >
                                Create account
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>

        {error && (
            <span className="navbar-error">{error}</span>
        )}
    </header>
);
}

export default Navbar;
