import {
    ArrowLeft,
    BrainCircuit,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/notFound.css";

const NotFound = () => {
    return (
        <main className="not-found-page">
            <div className="not-found-card">
                <div className="not-found-icon">
                    <BrainCircuit size={35} />
                </div>

                <p>404 error</p>

                <h1>Page not found</h1>

                <span>
                    The page you are looking for does not
                    exist or has been moved.
                </span>

                <Link to="/">
                    <ArrowLeft size={18} />
                    Back to home
                </Link>
            </div>
        </main>
    );
};

export default NotFound;