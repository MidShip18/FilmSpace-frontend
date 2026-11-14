
import { useEffect, useState } from "react";
import "../App.css";

const API = `${import.meta.env.VITE_API_URL}`;

function firstNumber(object, keys) {
    for (let i = 0; i < keys.length; i++) {
        const value = object?.[keys[i]];

        if (value !== null && value !== undefined && value !== "") {
            const number = Number(value);

            if (Number.isFinite(number)) {
                return number;
            }
        }
    }

    return null;
}

function RatingGauge({ value }) {
    const safeValue = value === null ? 0 : Math.max(0, Math.min(10, value));
    const circumference = 2 * Math.PI * 70;
    const dash = circumference * 0.75;
    const progress = dash * (safeValue / 10);

    return (
        <div className="tmdb-gauge">
            <svg viewBox="0 0 180 125" role="img"
                 aria-label={`TMDB rating ${value ?? "not available"} out of 10`}>
                <path
                    d="M 20 105 A 70 70 0 0 1 160 105"
                    fill="none"
                    stroke="#252d3a"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {value !== null && (
                    <path
                        d="M 20 105 A 70 70 0 0 1 160 105"
                        fill="none"
                        stroke="#12d6a0"
                        strokeWidth="12"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray={`${safeValue * 10} 100`}
                    />
                )}
                <text x="90" y="82" textAnchor="middle" className="gauge-number">
                    {value === null ? "—" : value.toFixed(1)}
                </text>
                <text x="90" y="105" textAnchor="middle" className="gauge-scale">
                    / 10
                </text>
            </svg>
            <p>TMDB rating</p>
        </div>
    );
}

function RatingBars({ items }) {
    const available = items.filter((item) => item.value !== null);

    if (available.length === 0) {
        return <p className="chart-empty">Community rating data will appear here as ratings are collected.</p>;
    }

    return (
        <div className="dashboard-bars">
            {available.map((item) => (
                <div className="dashboard-bar-row" key={item.label}>
                    <span>{item.label}</span>
                    <div className="dashboard-bar-track">
                        <div
                            className={`dashboard-bar-fill ${item.color}`}
                            style={{
                                width: `${Math.max(0, Math.min(100, item.value / 5 * 100))}%`
                            }}
                        />
                    </div>
                    <strong>{item.value.toFixed(1)}</strong>
                </div>
            ))}
        </div>
    );
}

function AudienceDonut({ counts }) {
    const colors = ["#05c879", "#83d34f", "#ffdb45", "#ff873b", "#f52250"];
    const labels = [
        "Loved it",
        "Really enjoyed it",
        "Enjoyed it",
        "Mixed",
        "Didn't enjoy it"
    ];

    const total = counts.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
        return (
            <div className="audience-empty">
                <div className="empty-donut">
                    <span>0</span>
                    <small>ratings</small>
                </div>
                <p>Audience breakdown will appear when community ratings are available.</p>
            </div>
        );
    }

    let cumulative = 0;

    const gradient = counts.map((count, index) => {
        const start = cumulative / total * 100;
        cumulative += count;
        const end = cumulative / total * 100;

        return `${colors[index]} ${start}% ${end}%`;
    }).join(", ");

    return (
        <div className="audience-chart-layout">
            <div
                className="audience-donut"
                style={{ background: `conic-gradient(${gradient})` }}
                role="img"
                aria-label={`Audience breakdown from ${total} ratings`}
            >
                <div className="audience-donut-center">
                    <strong>{total.toLocaleString()}</strong>
                    <span>ratings</span>
                </div>
            </div>

            <div className="audience-legend">
                {labels.map((label, index) => (
                    <div className="audience-legend-row" key={label}>
                        <span
                            className="audience-legend-dot"
                            style={{ background: colors[index] }}
                        />
                        <span>{label}</span>
                        <strong>{Math.round(counts[index] / total * 100)}%</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RatingDashboard({ details }) {
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadSummary() {
            setSummaryLoading(true);

            try {
                const response = await fetch(
                    `${API}/api/ratings/movie/${details.id}/summary?mediaType=${details.mediaType}`
                );

                if (!response.ok) {
                    throw new Error("Community summary unavailable");
                }

                const data = await response.json();

                if (!cancelled) {
                    setSummary(data);
                }
            } catch {
                if (!cancelled) {
                    setSummary(null);
                }
            } finally {
                if (!cancelled) {
                    setSummaryLoading(false);
                }
            }
        }

        loadSummary();

        return () => {
            cancelled = true;
        };
    }, [details.id, details.mediaType]);

    const tmdbRating = firstNumber(details, ["vote_average"]);

    const feelAverage = firstNumber(summary, [
        "feelAverage", "averageFeelScore", "avgFeelScore"
    ]);
    const storyAverage = firstNumber(summary, [
        "storyAverage", "averageStoryScore", "avgStoryScore"
    ]);
    const impactAverage = firstNumber(summary, [
        "impactAverage", "averageImpactScore", "avgImpactScore"
    ]);

    const audienceCounts = [
        firstNumber(summary, ["feel5Count", "lovedItCount", "score5Count"]) ?? 0,
        firstNumber(summary, ["feel4Count", "reallyEnjoyedCount", "score4Count"]) ?? 0,
        firstNumber(summary, ["feel3Count", "enjoyedItCount", "score3Count"]) ?? 0,
        firstNumber(summary, ["feel2Count", "mixedCount", "score2Count"]) ?? 0,
        firstNumber(summary, ["feel1Count", "didNotEnjoyCount", "score1Count"]) ?? 0
    ];

    const detailedItems = [
        { label: "Feel", value: feelAverage, color: "bar-pink" },
        { label: "Story", value: storyAverage, color: "bar-blue" },
        { label: "Impact", value: impactAverage, color: "bar-gold" }
    ];

    return (
        <div className="rating-dashboard">
            <section className="dashboard-card tmdb-card">
                <h2>TMDB Rating</h2>
                <RatingGauge value={tmdbRating} />
                <p className="dashboard-card-note">
                    Rating provided by TMDB, out of 10.
                </p>
            </section>

            <section className="dashboard-card detailed-card">
                <h2>Detailed Ratings</h2>
                {summaryLoading ? (
                    <p className="chart-empty">Loading community ratings...</p>
                ) : (
                    <RatingBars items={detailedItems} />
                )}
                <p className="dashboard-card-note">Community averages out of 5</p>
            </section>

            <section className="dashboard-card genre-card">
                <h2>Genre Performance</h2>
                <p className="chart-empty">
                    Genre averages will appear here when FilmSpace has
                    saved genre-rating statistics.
                </p>
                <div className="dashboard-genre-chips">
                    {(details.genres || []).map((genre) => (
                        <span key={genre.id}>{genre.name}</span>
                    ))}
                </div>
            </section>

            <section className="dashboard-card audience-card">
                <h2>Audience Breakdown</h2>
                {summaryLoading ? (
                    <p className="chart-empty">Loading audience data...</p>
                ) : (
                    <AudienceDonut counts={audienceCounts} />
                )}
                <p className="dashboard-card-note">
                    Based on Feel ratings from 1 to 5.
                </p>
            </section>
        </div>
    );
}

export default RatingDashboard;
