
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const API = import.meta.env.VITE_API_URL;;

const questions = [
    {
        key: "feel",
        question: "How did the movie feel?",
        options: [
            "Didn't enjoy it",
            "Mixed",
            "Enjoyed it",
            "Really enjoyed it",
            "Loved it"
        ]
    },
    {
        key: "story",
        question: "How strong was the story/concept?",
        options: [
            "Weak",
            "Average",
            "Good",
            "Strong",
            "Exceptional"
        ]
    },
    {
        key: "impact",
        question: "Did it stay with you?",
        options: [
            "Forgot it immediately",
            "Somewhat memorable",
            "Memorable",
            "Very memorable",
            "Stayed with me"
        ]
    }
];

function RatingSection({ tmdbId, mediaType, genres = [] }) {
    const [scores, setScores] = useState({
        feel: 0,
        story: 0,
        impact: 0
    });

    const [genreScores, setGenreScores] = useState({});
    const [genreOpen, setGenreOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const location = useLocation();

    const requireLogin = () => {
        if (!localStorage.getItem("token")) {
            navigate("/login", {
                state: {
                    from: location.pathname,
                    message: "Please log in to rate this movie."
                }
            });

            return false;
        }

        return true;
    };

    const overall =
        scores.feel && scores.story && scores.impact
            ? (
                (scores.feel + scores.story + scores.impact) / 3
            ).toFixed(2)
            : null;

    useEffect(() => {
        let cancelled = false;

        async function loadMyRating() {
            setLoading(true);
            setError("");

            try {
                if (!token) {
                    return;
                }

                const response = await fetch(
                    `${API}/api/ratings/movie/${tmdbId}?mediaType=${mediaType}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.ok) {
                    const rating = await response.json();

                    if (!cancelled && rating) {
                        setScores({
                            feel: rating.feelScore ?? 0,
                            story: rating.storyScore ?? 0,
                            impact: rating.impactScore ?? 0
                        });

                        // Restore genre scores if the backend returns them.
                        if (Array.isArray(rating.genreRatings)) {
                            const savedGenres = {};

                            rating.genreRatings.forEach((item) => {
                                savedGenres[item.genreId] = item.score;
                            });

                            setGenreScores(savedGenres);
                        }
                    }
                } else if (response.status !== 404) {
                    throw new Error("Unable to load your saved rating.");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load your rating.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMyRating();

        return () => {
            cancelled = true;
        };
    }, [tmdbId, mediaType, token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!requireLogin()) {
            return;
        }

        if (!scores.feel || !scores.story || !scores.impact) {
            setError("Please answer all three rating questions.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`${API}/api/ratings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    tmdbId: Number(tmdbId),
                    mediaType,
                    feelScore: scores.feel,
                    storyScore: scores.story,
                    impactScore: scores.impact,
                    genreRatings: Object.entries(genreScores).map(
                        ([genreId, score]) => ({
                            genreId: Number(genreId),
                            score: score
                        })
                    )
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to save your rating."
                );
            }
            setSaved(true);
            setMessage("Your rating has been saved.");
            {saved && (
                <div className="rating-saved-summary" role="status">
                    <h3>Your saved rating</h3>
                    <p>Feel: {questions[0].options[scores.feel - 1]}</p>
                    <p>Story: {questions[1].options[scores.story - 1]}</p>
                    <p>Impact: {questions[2].options[scores.impact - 1]}</p>

                    {overall !== null && (
                        <p>Overall rating: {overall}/5</p>
                    )}
                </div>
            )}
        } catch (err) {
            setError(err.message || "Unable to save your rating.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="rating-section">
            <div className="rating-sticky-header">
                <div className="rating-header-copy">
                    <p className="rating-eyebrow">YOUR EXPERIENCE</p>
                    <h2>Rate this movie</h2>
                    <p>
                        Share your thoughts and help others discover
                        great movies.
                    </p>
                </div>

                <button
                    type="submit"
                    form="filmspace-rating-form"
                    className="rating-submit rating-submit-top"
                    disabled={saving || loading}
                >
                    {saving ? "Saving..." : "Submit rating"}
                </button>
            </div>

            {!token && (
                <p className="rating-login-prompt">
                    <Link to="/login">Log in</Link> to submit or update
                    your rating.
                </p>
            )}

            {error && (
                <p className="rating-error" role="alert">
                    {error}
                </p>
            )}

            {message && (
                <p className="rating-success" role="status">
                    {message}
                </p>
            )}

            {loading ? (
                <p>Loading your rating...</p>
            ) : (
                <form
                    id="filmspace-rating-form"
                    onSubmit={handleSubmit}
                >
                    <div className="rating-questions">
                        {questions.map((question, index) => (
                            <div
                                className={`rating-question-card rating-${question.key}`}
                                key={question.key}
                            >
                                <div className="rating-question-title">
                                    <span className="rating-question-icon">
                                        {question.key === "feel"
                                            ? "♥"
                                            : question.key === "story"
                                                ? "▤"
                                                : "★"}
                                    </span>

                                    <h3>
                                        {index + 1}. {question.question}
                                    </h3>
                                </div>

                                <div
                                    className="rating-descriptive-options"
                                    role="group"
                                    aria-label={question.question}
                                >
                                    {question.options.map((option, i) => {
                                        const value = i + 1;
                                        const selected =
                                            scores[question.key] === value;

                                        return (
                                            <button
                                                type="button"
                                                key={option}
                                                className={
                                                    selected
                                                        ? "rating-description-option selected"
                                                        : "rating-description-option"
                                                }
                                                aria-pressed={selected}
                                                onClick={() => {
                                                    if (!requireLogin()) {
                                                        return;
                                                    }

                                                    setScores((previous) => ({
                                                        ...previous,
                                                        [question.key]: value
                                                    }));
                                                }}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="optional-genre-section">
                        <button
                            type="button"
                            className="genre-section-toggle"
                            aria-expanded={genreOpen}
                            onClick={() => setGenreOpen(!genreOpen)}
                        >
                            <span className="genre-section-copy">
                                <strong>Rate genres</strong>
                                <small>
                                    Optional · Give extra detail to your rating
                                </small>
                            </span>

                            <span className="genre-toggle-icon">
                                {genreOpen ? "−" : "+"}
                            </span>
                        </button>

                        {genreOpen && (
                            <div className="genre-rating-content">
                                <p>
                                    Rate the genres that stood out to you.
                                    You can skip any of them.
                                </p>

                                {genres.length === 0 ? (
                                    <p>
                                        No genres are available for this title.
                                    </p>
                                ) : (
                                    genres.map((genre) => (
                                        <div
                                            className="genre-rating-row"
                                            key={genre.id}
                                        >
                                            <span>{genre.name}</span>

                                            <div
                                                className="genre-star-options"
                                                role="group"
                                                aria-label={`${genre.name} rating`}
                                            >
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        className={
                                                            star <= (genreScores[genre.id] || 0)
                                                                ? "genre-star selected"
                                                                : "genre-star"
                                                        }
                                                        aria-label={`${star} out of 5 for ${genre.name}`}
                                                        aria-pressed={
                                                            genreScores[genre.id] === star
                                                        }
                                                        onClick={() =>{
                                                            if(!requireLogin()) {
                                                                return;
                                                        }
                                                            setGenreScores((previous) => ({
                                                                ...previous,
                                                                [genre.id]: star
                                                            }))
                                                        }}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {overall !== null && (
                        <p className="rating-overall-preview">
                            Your selected average: <strong>{overall}/5</strong>
                        </p>
                    )}
                </form>
            )}
        </section>
    );
}

export default RatingSection;
