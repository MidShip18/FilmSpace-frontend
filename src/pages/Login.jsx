import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import "../App.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);


        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({email, password})
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || "Login failed");
            }
            const token = typeof data === "string" ? data : data.token;
            if (!token) {
                throw new Error("Login Successful, but no token was returned.");
            }
            localStorage.setItem("token", token);
            navigate("/");
        } catch (err) {
            setError(err.message || "Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <header className="auth-header">
                <h1 onClick={() => navigate("/")}>
                    <span className="film-text">Film</span>Space
                </h1>
            </header>
            <div className="auth-card">
                <h2> Welcome Back</h2>
                <p className="auth-subtitle">
                    Sign in to rate movies and share your reviews.
                </p>
                <form onSubmit={handleLogin}>
                    <label htmlFor="email">Email</label>
                    <input id="email"
                           type="email"
                           placeholder="Enter email"
                           value={email}
                           onChange={(event) => setEmail(event.target.value)}
                           required/>

                    <label htmlFor="password">Password</label>
                    <input id="password"
                           type="password"
                           placeholder="Enter password"
                           value={password}
                           onChange={(event) => setPassword(event.target.value)}
                           required/>

                    {error && (<p className="auth-error"> {error}</p>
                    )}
                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer">
                    New to FilmSPace?{" "}
                    <Link to="/register"> Create an account</Link>
                </p>
            </div>
        </div>
    );
}
export default Login;
