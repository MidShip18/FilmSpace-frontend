import {useState} from "react";
import{Link, useNavigate} from "react-router-dom";
import "../App.css";

function Register() {
    const[username, setUsername] = useState("");
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[confirmPassword, setConfirmPassword] = useState("");
    const[error, setError] = useState("");
    const[message, setMessage] = useState("");
    const[loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if(password !== confirmPassword){
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username, email, password
                })
            });
            const data = await response.json().catch(() => ({}));
            if(!response.ok){
                throw new Error(data.message || data.error || "Registration failed.");
            }
            setMessage(typeof data === "string" ? data : data.message || "Account registered successfully.");
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        }
        catch(err){
            setError(err.message || "Unable to Connect to the server");
        }
        finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-page">
            <header className="auth-header">
                <h1 onClick={() => navigate("/")}>
                    <span className= "film-text">Film</span>Space
                </h1>
            </header>
            <div className="auth-card">
                <h2> Create Account</h2>
                <p className="auth-subtitle">
                    Join FilmSpace
                </p>
                <form onSubmit={handleRegister}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Choose a Username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required/>
                    <label htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required/>

                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={8}
                        required/>

                    <label
                        htmlFor="confirm-password">
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        minLength={8}
                        required/>

                    {error && (<p className="auth-error">{error}</p>)}
                    {message && (<p className="auth-success">{message}</p>)}

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>
                <p className="auth-footer">
                    Already have an account? {" "}<Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
export default Register;