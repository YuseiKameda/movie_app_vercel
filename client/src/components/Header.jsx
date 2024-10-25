import React from "react";

const Header = () => {
  return (
    <header>
      <nav>
        <h1>Movie App</h1>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/profile">Profile</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
