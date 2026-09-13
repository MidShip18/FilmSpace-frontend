function SearchBar(props) {
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Search Bar Submitted");
        props.onSearch();
    };
    return (
        <form className= "search-bar" onSubmit={handleSubmit}>
        <input
            value={props.searchText}
            placeholder= "Search..."
            onChange={event => props.onSearchChange(event.target.value)}
            />
            <button type="submit">Search</button>
            </form>
    );
}
export default SearchBar;