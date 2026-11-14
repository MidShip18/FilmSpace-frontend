import { useEffect, useState } from "react";
import GameCard from "../components/GameCard.jsx";
import "./MovieGame.css";
import { Link } from "react-router-dom";

function MovieGame() {

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const startGame = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/game/start`,
                {
                    method: "POST"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to start game");
            }

            const data = await response.json();

            setGame(data);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };


    const handleGuess = async (choice) => {

        try {

            setSubmitting(true);
            setError("");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/game/guess`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        gameId: game.gameId,
                        choice: choice
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit guess");
            }

            const data = await response.json();

            setGame(data);

        } catch (error) {

            setError(error.message);

        } finally {

            setSubmitting(false);
        }
    };


    useEffect(() => {

        const loadGame = async () => {

            try {

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/game/start`,
                    {
                        method: "POST"
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to start game");
                }

                const data = await response.json();

                setGame(data);

            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);
            }
        };

        loadGame();

    }, []);


    if (loading) {
        return (
            <div className="game-page">
                <div className="game-loading">
                    Loading game...
                </div>
            </div>
        );
    }


    if (error) {
        return (
            <div className="game-page">
                <div className="game-error">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <div className="game-page">

            <div className="game-topbar">

                <Link to="/" className="game-home-link">
                    FilmSpace
                </Link>

            </div>

            <div className="game-header">

                <p className="game-label">
                    MOVIE CHALLENGE
                </p>

                <h1>
                    Higher or Lower
                </h1>

                <p className="game-description">
                    Which movie has the higher TMDB rating?
                </p>

            </div>


            <div className="score-container">

                <span>
                    SCORE
                </span>

                <strong>
                    {game.score}
                </strong>

            </div>


            <div className="game-board">

                <GameCard
                    movie={game.movie1}
                    onClick={() =>
                        !submitting &&
                        !game.gameOver &&
                        handleGuess("movie1")
                    }
                />


                <div className="vs-container">

                    <div className="vs-line"></div>

                    <span className="vs">
                        VS
                    </span>

                    <div className="vs-line"></div>

                </div>


                <GameCard
                    movie={game.movie2}
                    onClick={() =>
                        !submitting &&
                        !game.gameOver &&
                        handleGuess("movie2")
                    }
                />

            </div>


            {!game.gameOver && (
                <p className="game-hint">
                    Click the movie you think has the higher rating
                </p>
            )}


            {game.gameOver && (

                <div className="game-over">

                    <p className="game-over-label">
                        GAME OVER
                    </p>

                    <h2>
                        Final Score: {game.score}
                    </h2>

                    <button
                        className="play-again-btn"
                        onClick={startGame}
                    >
                        Play Again
                    </button>

                </div>

            )}

        </div>
    );
}

export default MovieGame;