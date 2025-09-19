import React, { useEffect, useRef, useState } from "react";
import "../styles/button.scss";
import "../styles/navbar.scss";

import logo from "../assets/mockedge logo 1.png";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/User.slice";
import { useLocation } from "react-router-dom";
import type { RootState } from "../store";

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const location = useLocation();

  // Check if current URL contains "dashboard"
  const isOnDashboard = location.pathname.includes("/dashboard");

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("accessToken");
    setMenuOpen(false); // Close menu on logout
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Determine if a nav item is active
  const isActiveRoute = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <a className="logoImages" href="/" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="MockEdge Logo" />
        </a>
        <a href="/" className="brand-text" onClick={() => setMenuOpen(false)}>
          MockEdge
        </a>
      </div>

      {/* Hamburger Button */}
      <button
        className={`navbar-burger ${menuOpen ? "is-active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Menu */}
      <div
        ref={menuRef}
        className={`navbar-menu ${menuOpen ? "is-active" : ""}`}
      >
        <div className="navbar-start">
          <a 
            className={`navbar-item ${isActiveRoute('/') ? 'active' : ''}`} 
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </a>
          <a 
            className={`navbar-item ${isActiveRoute('/about') ? 'active' : ''}`} 
            href="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </a>
          <a 
            className={`navbar-item ${isActiveRoute('/contact') ? 'active' : ''}`} 
            href="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>
        </div>
        
        <div className="navbar-end">
          {user === null || user.accessToken === null ? (
            <>
              <a 
                className="button secondary" 
                href="/login"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </a>
              <a 
                className="button primary" 
                href="/signup"
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </a>
            </>
          ) : (
            <>
              {!isOnDashboard && (
                <a 
                  className="button secondary" 
                  href={`/dashboard/${user.id}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </a>
              )}
              <button 
                className="button ghost" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div 
          className="navbar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
};