import React from 'react';
import { createPortal } from "react-dom";
import { X, Clock, User, Calendar, CheckCircle, XCircle, AlertCircle, FileText, Eye } from 'lucide-react';
import "./MockDetailsModal.scss";
import type { MockDetailsModalProps, QuestionDetail } from '../../Interface';



export const MockDetailsModal: React.FC<MockDetailsModalProps> = ({
  isOpen,
  onClose,
  mockData,
}) => {
  if (!isOpen || !mockData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="status-icon status-completed" />;
      case 'in_progress':
      case 'active':
        return <Clock className="status-icon status-active" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="status-icon status-failed" />;
      default:
        return <AlertCircle className="status-icon status-pending" />;
    }
  };

  const calculateScore = () => {
    if (!mockData.questionDetails) return null;
    
    const answeredQuestions = mockData.questionDetails.filter(q => q.givenAnswer !== null);
    const correctAnswers = mockData.questionDetails.filter(q => q.givenAnswer === q.correctAnswer).length;
    const totalQuestions = mockData.questionDetails.length;
    const percentage = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : "0";
    
    return { 
      correct: correctAnswers, 
      total: totalQuestions, 
      answered: answeredQuestions.length,
      percentage 
    };
  };

  const score = calculateScore();

  const getQuestionStatus = (question: QuestionDetail) => {
    if (question.givenAnswer === null) {
      return { status: 'unanswered', icon: <AlertCircle className="status-icon unanswered" /> };
    }
    if (question.givenAnswer === question.correctAnswer) {
      return { status: 'correct', icon: <CheckCircle className="status-icon correct" /> };
    }
    return { status: 'incorrect', icon: <XCircle className="status-icon incorrect" /> };
  };

  return createPortal(
    <div className="custom-modal">
      <div className="modal-backdrop" onClick={onClose} />
      
      <div className="modal-content mock-details-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <Eye size={20} />
            Mock Test Details
            {mockData.testScheduledDetails && (
              <span className="test-name-subtitle">
                - {mockData.testScheduledDetails.testName}
              </span>
            )}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-container">
            
            {/* Score Summary Card */}
            {score && (
              <div className="details-card score-card">
                <div className="card-header">
                  <CheckCircle className="header-icon" />
                  <h4>Score Summary</h4>
                </div>
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-percentage">{score.percentage}%</span>
                  </div>
                  <div className="score-details">
                    <p className="score-text">
                      {score.correct} correct out of {score.total} questions
                    </p>
                    <p className="answered-text">
                      ({score.answered} answered, {score.total - score.answered} unanswered)
                    </p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${score.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="info-cards-grid">
              {mockData.testScheduledDetails && (
                <div className="details-card">
                  <div className="card-header">
                    <Calendar className="header-icon" />
                    <h4>Test Schedule</h4>
                  </div>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="label">Test ID:</span>
                      <span className="value">{mockData.testScheduledDetails.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Scheduled:</span>
                      <span className="value">{formatDate(mockData.testScheduledDetails.scheduleMock)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Duration:</span>
                      <span className="value">{formatDuration(mockData.testScheduledDetails.durationSeconds)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Max Attempts:</span>
                      <span className="value">{mockData.testScheduledDetails.maxAttemptsPerDay}/day</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className="value status-badge">
                        {getStatusIcon(mockData.testScheduledDetails.scheduledStatus)}
                        {mockData.testScheduledDetails.scheduledStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {mockData.attemptDetails && (
                <div className="details-card">
                  <div className="card-header">
                    <User className="header-icon" />
                    <h4>Attempt Information</h4>
                  </div>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="label">Attempt ID:</span>
                      <span className="value">{mockData.attemptDetails.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">User:</span>
                      <span className="value">{mockData.attemptDetails.userName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Mock Name:</span>
                      <span className="value">{mockData.attemptDetails.mockName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Start Time:</span>
                      <span className="value">{formatDate(mockData.attemptDetails.startTime)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className="value status-badge">
                        {getStatusIcon(mockData.attemptDetails.status)}
                        {mockData.attemptDetails.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Joined:</span>
                      <span className="value">
                        {mockData.attemptDetails.isJoined ? (
                          <span className="joined-yes">Yes</span>
                        ) : (
                          <span className="joined-no">No</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {mockData.questionDetails && mockData.questionDetails.length > 0 && (
              <div className="details-card questions-card">
                <div className="card-header">
                  <FileText className="header-icon" />
                  <h4>Questions Analysis</h4>
                  <span className="question-count">{mockData.questionDetails.length} Questions</span>
                </div>
                <div className="questions-container">
                  {mockData.questionDetails.map((question, index) => {
                    const { status, icon } = getQuestionStatus(question);
                    return (
                      <div key={index} className={`question-item ${status}`}>
                        <div className="question-header">
                          <span className="question-number">Q{index + 1}</span>
                          {icon}
                        </div>
                        <div className="question-content">
                          <p className="question-text">{question.question}</p>
                          <div className="options-grid">
                            {question.options.map((option, optIndex) => {
                              const isCorrect = option === question.correctAnswer;
                              const isGiven = option === question.givenAnswer;
                              
                              return (
                                <div 
                                  key={optIndex} 
                                  className={`option ${isCorrect ? 'correct-answer' : ''} ${isGiven ? 'given-answer' : ''}`}
                                >
                                  <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                                  <span className="option-text">{option}</span>
                                  {isCorrect && <CheckCircle className="option-icon correct" size={16} />}
                                  {isGiven && !isCorrect && <XCircle className="option-icon incorrect" size={16} />}
                                </div>
                              );
                            })}
                          </div>
                          {question.givenAnswer === null && (
                            <div className="unanswered-notice">
                              <AlertCircle size={14} />
                              Not answered
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!mockData.testScheduledDetails && !mockData.attemptDetails && !mockData.questionDetails && (
              <div className="details-card no-data-card">
                <AlertCircle className="no-data-icon" />
                <h4>No Data Available</h4>
                <p>There are no details available for this mock test.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};