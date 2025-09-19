import React from "react";
import { Navbar } from "./navbar";
import "../styles/app.scss";
import "./home.scss";
import { useAppSelector } from "../redux/hook";
import type { RootState } from "../store";

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector(
    (state: RootState) => state.user
  );

  return (
    <>
      <Navbar />
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Master Your Skills with <span className="brand-highlight">MockEdge</span>
            </h1>
            <p className="hero-subtitle">
              Practice, Learn, and Excel with our comprehensive mock test platform
            </p>
            <p className="hero-description">
              Get exam-ready with realistic practice tests, detailed performance analytics, 
              and personalized feedback designed to boost your confidence and scores.
            </p>
            <div className="hero-actions">
              <a
                href={isAuthenticated ? `/dashboard/${user?.id}` : "/signup"}
                className="btn btn-primary"
              >
                Start Practice Tests
              </a>
              <a href="/about" className="btn btn-secondary">
                View Test Categories
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Students Prepared</span>
              </div>
              <div className="stat">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Practice Questions</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="test-preview-card">
              <div className="test-header">
                <div className="test-title">Practice Test - Mathematics</div>
                <div className="test-status">In Progress</div>
              </div>
              <div className="test-content">
                <div className="question-number">Question 5 of 20</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '25%'}}></div>
                </div>
                <div className="question-preview">
                  <div className="question-text">What is the value of x in...</div>
                  <div className="options">
                    <div className="option selected">A) 15</div>
                    <div className="option">B) 20</div>
                    <div className="option">C) 25</div>
                  </div>
                </div>
              </div>
              <div className="floating-elements">
                <div className="score-badge">Score: 85%</div>
                <div className="timer-badge">12:45</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose MockEdge for Test Preparation?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 11H7a4 4 0 0 1 4-4v2a2 2 0 0 0-2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 7v5l3 3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Timed Practice Tests</h3>
              <p>Simulate real exam conditions with authentic timing and difficulty levels</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3v18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Performance Analytics</h3>
              <p>Track your progress with detailed insights and identify areas for improvement</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <h3>Expert Solutions</h3>
              <p>Get detailed explanations and step-by-step solutions for every question</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 7h8M8 11h8M8 15h5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Multiple Subjects</h3>
              <p>Access practice tests across various subjects and competitive exams</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Instant Results</h3>
              <p>Get immediate feedback and scores right after completing your test</p>
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
                    d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Personalized Learning</h3>
              <p>Adaptive test recommendations based on your performance and goals</p>
            </div>
          </div>
        </div>
      </section>

      <section className="test-categories">
        <div className="container">
          <h2 className="section-title">Popular Test Categories</h2>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">📚</div>
              <h3>Academic Tests</h3>
              <p>SAT, ACT, GRE, GMAT</p>
              <div className="category-stats">200+ Tests</div>
            </div>
            <div className="category-card">
              <div className="category-icon">💼</div>
              <h3>Professional Exams</h3>
              <p>CPA, PMP, AWS, Google Cloud</p>
              <div className="category-stats">150+ Tests</div>
            </div>
            <div className="category-card">
              <div className="category-icon">🏛️</div>
              <h3>Government Jobs</h3>
              <p>UPSC, SSC, Banking, Railways</p>
              <div className="category-stats">300+ Tests</div>
            </div>
            <div className="category-card">
              <div className="category-icon">💻</div>
              <h3>Programming</h3>
              <p>Java, Python, JavaScript, DSA</p>
              <div className="category-stats">180+ Tests</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Ace Your Next Exam?</h2>
            <p>Join thousands of successful students who improved their scores with MockEdge</p>
            <div className="cta-actions">
              <a
                href={isAuthenticated ? `/dashboard/${user?.id}` : "/signup"}
                className="btn btn-primary btn-large"
              >
                Start Your Free Trial
              </a>
              <span className="cta-note">No credit card required • 7-day free trial</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};