import { useNavigate } from "react-router-dom";

function ContentCard({ content, type }) {

    const navigate = useNavigate();

    const title = content.title || content.name;

    const date = content.release_date || content.first_air_date;

    const year = date ? date.substring(0, 4) : "";

    const rating = content.vote_average
        ? content.vote_average.toFixed(1)
        : "N/A";

    const handleClick = () => {
        navigate(`/details/${type}/${content.id}`);
    };

    return (
        <div
            className="content-card"
            onClick={handleClick}
        >

            <div className="content-card-image">

                <img
                    src={
                        content.poster_path
                            ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
                            : "https://via.placeholder.com/500x750?text=No+Image"
                    }
                    alt={title}
                />

                <div className="rating-badge">
                    <span>★</span>
                    {rating}
                </div>

                <div className="content-card-bottom">

                    <h3>
                        {title}
                    </h3>

                    <p>
                        {year}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default ContentCard;