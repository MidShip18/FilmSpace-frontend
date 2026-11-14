
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Details from "./pages/Details.jsx";
import MovieGame from "./pages/MovieGame.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Navbar from "./components/Navbar.jsx";
import Watchlist from "./pages/Watchlist";
import MyRatings from "./pages/MyRatings";

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/details/:type/:id" element={<Details />} />
                <Route path="/game" element={<MovieGame />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/my-ratings" element={<MyRatings />} />
            </Routes>
        </>
    );
}

export default App;