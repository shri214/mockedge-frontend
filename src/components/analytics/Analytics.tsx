import React, { useState, useEffect, useCallback } from "react";
import "./Analytics.scss";
import type {
  AttemptAnalytic,
  TestScheduledAnalytic,
} from "../../type/analytics.types";
import { useParams } from "react-router-dom";
import { TestScheduledAnalytics } from "./TestScheduledAnalytics";
import { AttemptAnalytics } from "./AttemptAnalytics";
import { testScheduledAnalytic } from "../../function/testScheduledAnalytics";
import { attemptAnalytic } from "../../function/attemptAnalytics";

interface AnalyticsDashboardProps {
  userId: string;
}

export const Analytics: React.FC<AnalyticsDashboardProps> = () => {
  const { userId } = useParams();

  // State management
  const [activeTab, setActiveTab] = useState<"scheduled" | "attempts">("scheduled");
  const [scheduledData, setScheduledData] = useState<TestScheduledAnalytic | null>(null);
  const [attemptData, setAttemptData] = useState<AttemptAnalytic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Screen size detection for responsive behavior
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

  // Handle window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnline && error && retryAttempts > 0) {
      const timeoutId = setTimeout(() => {
        fetchAnalytics();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, error, retryAttempts]);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  // Optimized fetch function with retry logic
  const fetchAnalytics = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    if (!isOnline) {
      setError("No internet connection. Please check your network and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch both analytics data with timeout
      const fetchWithTimeout = (promise: Promise<any>, timeout: number) => {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          ),
        ]);
      };

      const [scheduledResponse, attemptResponse] = await Promise.allSettled([
        fetchWithTimeout(testScheduledAnalytic(userId), 15000).catch(err => {
          console.error("Failed to fetch scheduled analytics:", err);
          return null;
        }),
        fetchWithTimeout(attemptAnalytic(userId), 15000).catch(err => {
          console.error("Failed to fetch attempt analytics:", err);
          return null;
        }),
      ]);

      // Handle scheduled data
      let validScheduledData = null;
      if (scheduledResponse.status === 'fulfilled' && scheduledResponse.value && typeof scheduledResponse.value === 'object') {
        validScheduledData = {
          totalTests: scheduledResponse.value.totalTests || 0,
          statusCount: scheduledResponse.value.statusCount || {},
          tests: Array.isArray(scheduledResponse.value.tests) ? scheduledResponse.value.tests : []
        };
      } else {
        validScheduledData = {
          totalTests: 0,
          statusCount: {},
          tests: []
        };
      }
      setScheduledData(validScheduledData);

      // Handle attempt data
      let validAttemptData = null;
      if (attemptResponse.status === 'fulfilled' && attemptResponse.value && typeof attemptResponse.value === 'object') {
        validAttemptData = {
          totalAttempt: attemptResponse.value.totalAttempt || 0,
          statusCount: attemptResponse.value.statusCount || {},
          attempt: Array.isArray(attemptResponse.value.attempt) ? attemptResponse.value.attempt : []
        };
      } else {
        validAttemptData = {
          totalAttempt: 0,
          statusCount: {},
          attempt: []
        };
      }
      setAttemptData(validAttemptData);

      // Check if both requests failed
      if (scheduledResponse.status === 'rejected' && attemptResponse.status === 'rejected') {
        throw new Error('Failed to fetch both analytics datasets');
      }

      setRetryAttempts(0); // Reset retry attempts on success

    } catch (error) {
      console.error("Error fetching analytics:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      if (errorMessage.includes('timeout')) {
        setError("Request timed out. Please check your connection and try again.");
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Failed to fetch analytics data. Please try again.");
      }
      
      setRetryAttempts(prev => prev + 1);
      
      // Set empty data to prevent crashes
      if (!scheduledData) {
        setScheduledData({
          totalTests: 0,
          statusCount: {},
          tests: []
        });
      }
      if (!attemptData) {
        setAttemptData({
          totalAttempt: 0,
          statusCount: {},
          attempt: []
        });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, isOnline, scheduledData, attemptData]);

  // Handle tab change with mobile optimization
  const handleTabChange = useCallback((tab: "scheduled" | "attempts") => {
    setActiveTab(tab);
    
    // Scroll to top on mobile after tab change
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [isMobile]);

  // Render loading state
  const renderLoadingState = () => (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading analytics data...</p>
      {!isOnline && (
        <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
          Waiting for internet connection...
        </p>
      )}
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="error-container">
      <div className="error-card">
        <h2>Failed to Load Analytics</h2>
        <p>{error}</p>
        {!isOnline && (
          <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>
            You appear to be offline. Please check your internet connection.
          </p>
        )}
        <button 
          onClick={fetchAnalytics} 
          className="retry-button"
          disabled={loading || !isOnline}
        >
          {loading ? "Retrying..." : "Retry"}
        </button>
        {retryAttempts > 0 && (
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
            Retry attempts: {retryAttempts}
          </p>
        )}
      </div>
    </div>
  );

  // Handle missing user ID
  if (!userId) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <div className="error-card">
            <h2>User ID Required</h2>
            <p>Please provide a valid user ID to view analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error && !loading) {
    return (
      <div className="dashboard-container">
        {renderErrorState()}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="analytics-dashboard-header">
        <h1 className="dashboard-title">
          {isMobile ? "Analytics" : "Analytics Dashboard"}
        </h1>
        <button
          className="refresh-button"
          onClick={fetchAnalytics}
          disabled={loading || !isOnline}
          title={!isOnline ? "No internet connection" : "Refresh data"}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <nav className="tab-navigation" role="tablist">
        <button
          className={`tab-button ${activeTab === "scheduled" ? "active" : ""}`}
          onClick={() => handleTabChange("scheduled")}
          role="tab"
          aria-selected={activeTab === "scheduled"}
          aria-controls="scheduled-panel"
        >
          {isMobile ? "Tests" : "Test Scheduled Analytics"}
        </button>
        <button
          className={`tab-button ${activeTab === "attempts" ? "active" : ""}`}
          onClick={() => handleTabChange("attempts")}
          role="tab"
          aria-selected={activeTab === "attempts"}
          aria-controls="attempts-panel"
        >
          {isMobile ? "Attempts" : "Attempt Analytics"}
        </button>
      </nav>

      <main className="tab-content">
        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {activeTab === "scheduled" && scheduledData && (
              <div 
                id="scheduled-panel" 
                role="tabpanel" 
                aria-labelledby="scheduled-tab"
              >
                <TestScheduledAnalytics 
                  data={scheduledData} 
                  loading={false} 
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              </div>
            )}
            {activeTab === "attempts" && attemptData && (
              <div 
                id="attempts-panel" 
                role="tabpanel" 
                aria-labelledby="attempts-tab"
              >
                <AttemptAnalytics 
                  data={attemptData} 
                  loading={false} 
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              </div>
            )}
          </>
        )}
      </main>

      {!isOnline && (
        <div 
          style={{
            position: 'fixed',
            bottom: isMobile ? '1rem' : '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
            zIndex: 1000,
          }}
        >
          📡 You're offline
        </div>
      )}
    </div>
  );
};