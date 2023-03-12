import React from "react";
import { Link } from "react-router-dom";
const Home = () => {
    return (
        <div>
            <h1>Welcome to Excelsior</h1>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/download">Download</Link>
                </li>
                <li>
                    <Link to="/upload">Upload</Link>
                </li>
            </ul>
        </div>
    );
};
export default Home;