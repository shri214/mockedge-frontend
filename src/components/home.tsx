import React, { useEffect } from "react";
import { Navbar } from "./navbar";
import "../styles/app.scss";
import "./home.scss";
import { useAppSelector } from "../redux/hook";
import type { RootState } from "../store";
import { getAttemptsByUser } from "../function/getAttemptsByUser";

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    const fetchAttempt = async () => {
      const res = await getAttemptsByUser(user?.id);
      console.log("res length ", res.data.length);
      console.log("res status ", res.data);
      res.data.map((val:any)=>{
        console.log(val.status)
      })
    };
    fetchAttempt();
  }, []);
  return (
    <>
      <Navbar />
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-highlight">MockEdge</span>
            </h1>
            <p className="hero-subtitle">
              Empowering businesses with cutting-edge solutions and innovative
              technology
            </p>
            <p className="hero-description">
              Transform your ideas into reality with our comprehensive suite of
              professional tools and services designed to accelerate your
              growth.
            </p>
            <div className="hero-actions">
              <a
                href={isAuthenticated ? `/dashboard/${user?.id}` : "/signup"}
                className="btn btn-primary"
              >
                Get Started
              </a>
              <a href="/about" className="btn btn-secondary">
                Learn More
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-header"></div>
              <div className="card-content">
                <div className="card-line"></div>
                <div className="card-line short"></div>
                <div className="card-line medium"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose MockEdge?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Lightning Fast</h3>
              <p>Built for speed and performance with modern technologies</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Secure</h3>
              <p>Enterprise-grade security to protect your valuable data</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M23 21v-2a4 4 0 0 0-3-3.87"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 3.13a4 4 0 0 1 0 7.75"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Collaborative</h3>
              <p>Work seamlessly with your team from anywhere in the world</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
