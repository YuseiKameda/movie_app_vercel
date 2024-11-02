import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MovieSearch from "./components/MovieSearch";
import Header from "./components/header";
import Footer from "./components/Footer";
import MovieDetail from "./components/MovieDetail";

const App = () => {
  return (
    <Router>
      <Header />
      <main>
        <h1>Movie Search App</h1>
        <Routes>
          <Route path="/" element={<MovieSearch />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
