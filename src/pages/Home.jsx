
import "../App.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ContentCard from "../components/ContentCard.jsx";

function Home() {
    const location = useLocation();

    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search results are passed from the shared Navbar.
    const searchResults = location.state?.searchResults;
    const searchText = location.state?.searchText || "";
    const isSearchPage = Array.isArray(searchResults);
    const hasSearchResults = isSearchPage && searchResults.length > 0;

    useEffect(() => {

        const loadTrendingContent = async () => {
            setLoading(true);
            setError("");

            try {
                const [movieResponse, seriesResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/movies/trending`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/series/trending`)
                ]);

                // Log only after both responses have been initialized.
                console.log("Movie response status:", movieResponse.status);
                console.log("Series response status:", seriesResponse.status);

                if (!movieResponse.ok || !seriesResponse.ok) {
                    throw new Error(
                        `Request failed: movies=${movieResponse.status}, series=${seriesResponse.status}`
                    );
                }

                const movieData = await movieResponse.json();
                const seriesData = await seriesResponse.json();

                console.log("Movie data:", movieData);
                console.log("Series data:", seriesData);

                setMovies(
                    Array.isArray(movieData)
                        ? movieData
                        : movieData.results || []
                );

                setSeries(
                    Array.isArray(seriesData)
                        ? seriesData
                        : seriesData.results || []
                );
            } catch (err) {
                console.error("Failed to load trending content:", err);
                setError(err.message || "Unable to load movies and TV shows.");
            } finally {
                setLoading(false);
            }
        };


        loadTrendingContent();

        
    }, []);

    if (loading) {
        return (
            <main className="home-page">
                <p className="home-status">Loading movies and TV shows...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="home-page">
                <p className="home-error">{error}</p>
                <button
                    className="home-retry-button"
                    onClick={() => window.location.reload()}
                >
                    Try again
                </button>
            </main>
        );
    }

    return (
        <main className="home-page">
            {isSearchPage ? (
                <>
                    <h2 className="section-title">
                        {hasSearchResults
                            ? `Search results for "${searchText}"`
                            : `No results found for "${searchText}"`}
                    </h2>

                    {hasSearchResults ? (
                        <div className="content-grid">
                            {searchResults.map((item) => (
                                <ContentCard
                                    key={`${item.type}-${item.id}`}
                                    content={item}
                                    type={item.type}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="home-status">
                            Try another title using the search bar above.
                        </p>
                    )}

                    <h2 className="section-title">Trending Movies</h2>
                    <div className="content-grid">
                        {movies.map((movie) => (
                            <ContentCard
                                key={`movie-${movie.id}`}
                                content={movie}
                                type="movie"
                            />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <h2 className="section-title">Trending Movies</h2>

                    {movies.length > 0 ? (
                        <div className="content-grid">
                            {movies.map((movie) => (
                                <ContentCard
                                    key={`movie-${movie.id}`}
                                    content={movie}
                                    type="movie"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="home-status">
                            No trending movies are available right now.
                        </p>
                    )}

                    <h2 className="section-title">Trending TV Shows</h2>

                    {series.length > 0 ? (
                        <div className="content-grid">
                            {series.map((show) => (
                                <ContentCard
                                    key={`series-${show.id}`}
                                    content={show}
                                    type="series"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="home-status">
                            No trending TV shows are available right now.
                        </p>
                    )}
                </>
            )}
        </main>
    );
}

export default Home;
