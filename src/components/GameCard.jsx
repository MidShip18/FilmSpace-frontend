function GameCard({ movie, onClick }) {

    return (
        <div
            className="content-card game-card"
            onClick={onClick}
        >
            <div className="content-card-image">

                <img
                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                    alt={movie.title}
                />

                <div className="content-card-content">
                    <h2>{movie.title}</h2>
                </div>

            </div>
        </div>
    );
}

export default GameCard;