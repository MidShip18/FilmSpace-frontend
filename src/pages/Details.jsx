import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import "../App.css"
function Details() {

    const {type, id} = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDetails = async () => {

            try {

                const response = await fetch(
                    `http://localhost:8080/api/details/${type}/${id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to load details");
                }

                const data = await response.json();

                console.log("Details:", data);

                setDetails(data);

            } catch (error) {

                console.log(error);
                setError("Unable to load details");

            } finally {

                setLoading(false);
            }
        };

        loadDetails();

    }, [type, id]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="details-page">

            <button
                className="back-button"
                onClick={() => navigate("/")}
            >
                Back
            </button>

            <div
                className="details-hero"
                style={{
                    backgroundImage: details.backdrop_path
                        ? `url(https://image.tmdb.org/t/p/original${details.backdrop_path})`
                        : "none"
                }}
            >

                <div className="details-overlay"></div>

                <div className="details-container">

                    <img
                        className="details-poster"
                        src={
                            details.poster_path
                                ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                                : "https://via.placeholder.com/500x750?text=No+Poster"
                        }
                        alt={details.title}
                    />

                    <div className="details-content">

                        <h1>{details.title}</h1>

                        <p>
                            Rating: {details.vote_average}
                        </p>

                        <p>
                            Release Date: {details.date}
                        </p>

                        <p>
                            Genres:{" "}
                            {details.genres
                                ?.map(genre => genre.name)
                                .join(", ")}
                        </p>

                        {type === "movie" && details.runtime && (
                            <p>
                                Runtime: {details.runtime} minutes
                            </p>
                        )}

                        {type === "series" && (
                            <>
                                <p>
                                    Seasons: {details.number_of_seasons}
                                </p>

                                <p>
                                    Episodes: {details.number_of_episodes}
                                </p>
                            </>
                        )}

                        <h2>Overview</h2>

                        <p>
                            {details.overview}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Details;