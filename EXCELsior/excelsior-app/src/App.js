import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import './styles.css'
import Home from "./components/Home";
import Download from "./components/Download";
import Upload from "./components/Upload";
import axios from "axios";



export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/download" element={<Download />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </Router>
    </>
  );
}
