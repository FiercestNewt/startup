import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { Scores } from './scores/scores';
import { About } from './about/about';
import './app.css';

function Layout({ children }) {
  return (
    <>
      <header>
        <h1>Grow ur Stonks</h1>
        <nav>
          <menu>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/play">Play</NavLink></li>
            <li><NavLink to="/scores">Scores</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
          </menu>
        </nav>
        <hr />
      </header>
      {children}
      <footer>
        <hr />
        <span>Ethan Geslison</span>
        <a href="https://github.com/fiercestnewt/startup">GitHub</a>
      </footer>
    </>
  );
}

function NotFound() {
  return <main><h1>404: Page not found</h1></main>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/play" element={<Play />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
