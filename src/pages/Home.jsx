import "../App.css";
import ContentCard from "../components/ContentCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
function Home() {
    const appName = "FilmSpace";
    const [searchText, setSearchText] = useState("");
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [sectionTitle, setSectionTitle] = useState("Trending");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [noResults, setNoResults] = useState(false);

    const loadTrendingContent = async () => {

        setLoading(true);
        setError("");
        setSearchText("");

        try {

            const movieResponse = await fetch(
                "http://localhost:8080/api/movies/trending"
            );
            const seriesResponse = await fetch(
                "http://localhost:8080/api/tv/trending");

            const movieData = await movieResponse.json();
            const seriesData = await seriesResponse.json();

            setMovies(movieData.results);
            setSeries(seriesData.results);
            setSectionTitle("Trending");
            setNoResults(false);

        } catch (error) {

            console.log(error);
            setError("Unable to load");

        } finally {

            setLoading(false);
        }
    };
    const handleSearch = async () => {
        console.log("Search Button Clicked");
        if(!searchText.trim()){
            return;
        }
        setLoading(true);
        setError("");
        setNoResults(false);
        try {
            const movieResponse = await fetch(
                `http://localhost:8080/api/movies/search?query=${encodeURIComponent(searchText)}`
            );
            const seriesResponse = await fetch(
                `http://localhost:8080/api/series/search?query=${encodeURIComponent(searchText)}`
            );
            if (!movieResponse.ok || !seriesResponse.ok) {
                throw new Error("Search failed");
            }
            const movieData = await movieResponse.json();
            const seriesData = await seriesResponse.json();
            const combinedResults = [
                ...movieData.results.map(movie => ({
                    ...movie,
                    type: "movie"
                })),

                ...seriesData.results.map(series => ({
                    ...series,
                    type: "series"
                }))
            ];
            console.log("Search Response", combinedResults);

            if (combinedResults.length === 0) {
                setNoResults(true);
                setSectionTitle("You may Like");
                const trendingResponse = await fetch("http://localhost:8080/api/movies/trending");
                const trendingData = await trendingResponse.json();
                setMovies(trendingData.results);
                return;
            }
            setSectionTitle("Search Results");
            setSearchResults(combinedResults);
        } catch (error) {
            console.log(error);
            setError("Unable to search results ");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {

        const loadTrending = async () => {

            setLoading(true);
            setError("");

            try {

                const movieResponse = await fetch(
                    "http://localhost:8080/api/movies/trending");
                const seriesResponse = await fetch(
                    "http://localhost:8080/api/series/trending");

                const movieData = await movieResponse.json();
                const seriesData = await seriesResponse.json();

                setMovies(movieData.results);
                setSeries(seriesData.results);

            } catch (error) {

                console.log(error);
                setError("Unable to load ");

            } finally {

                setLoading(false);
            }
        };

        loadTrending();

    }, []);
    return (
        <div>
            <header className="header">

                <h1 onClick={loadTrendingContent}>
                    <span className="film-text">Film</span>Space
                </h1>

                <SearchBar
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    onSearch={handleSearch}
                />

                <Link to="/game" className="game-link">
                    Face-Off
                </Link>

            </header>

            {noResults && (
                <p className="no-results">
                    No result found with "{searchText}"
                </p>
            )}
            {loading && <p>Loading ...</p>}

            {error && <p>{error}</p>}
            {sectionTitle === "Search Results" && (
                <div className="content-grid">
                    {searchResults.map(item => (
                        <ContentCard
                            key={item.id}
                            content={item}
                        />
                    ))}
                </div>
            )}

            {sectionTitle === "Trending" && (
                <>
                    <h2 className="section-title">
                        Trending Movies
                    </h2>

                    <div className="content-grid">
                        {movies.map(movie => (
                            <ContentCard
                                key={movie.id}
                                content={movie}
                                type= "movie"
                            />
                        ))}
                    </div>

                    <h2 className="section-title">
                        Trending Series
                    </h2>

                    <div className="content-grid">
                        {series.map(show => (
                            <ContentCard
                                key={show.id}
                                content={show}
                                type = "series"
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Home
