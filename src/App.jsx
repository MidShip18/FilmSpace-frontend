import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Details from "./pages/Details.jsx";
import MovieGame from "./pages/MovieGame.jsx";

function App() {

    return (
        <Routes>

            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/details/:type/:id"
                element={<Details />}
            />

            <Route
                path="/game"
                element={<MovieGame />}
            />

        </Routes>
    );
}

export default App;