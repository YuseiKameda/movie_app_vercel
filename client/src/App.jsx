import React from "react";
import MovieSearch from "./components/MovieSearch";
import Header from "./components/header";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div>
      <Header />
      <main>
        <h1>Movie Search App</h1>
        <MovieSearch />
      </main>
      <Footer />
    </div>
  );
};

export default App;
