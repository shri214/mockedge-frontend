import React from 'react';
import { Clock, User, Calendar, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import './MockDetailsPage.scss';

interface AttemptDetails {
  id: string;
  mockName: string;
  userName: string;
  status: string;
  startTime: string;
  isJoined: boolean;
}

interface QuestionDetail {
  question: string;
  options: string[];
  givenAnswer: string;
  correctAnswer: string;
}

interface TestScheduledDetails {
  id: string;
  userId: string;
  testName: string;
  scheduleMock: string;
  maxAttemptsPerDay: number;
  durationSeconds: number;
  isActive: boolean;
  createdAt: string;
  scheduledStatus: string;
}

interface MockDetailsData {
  attemptDetails?: AttemptDetails;
  questionDetails?: QuestionDetail[];
  testScheduledDetails?: TestScheduledDetails;
}

export const MockDetailsPage: React.FC = () => {
  // Sample data - replace with props or API call
  const mockData: MockDetailsData = {
    "attemptDetails": {
        "id": "5f0c3b79-b6ee-40d9-9e33-5885a5fe9004",
        "mockName": "java mock",
        "userName": "raju",
        "status": "COMPLETED",
        "startTime": "2025-09-16T14:50:08.938192Z",
        "isJoined": true
    },
    "questionDetails": [
        {
            "question": "Explain the difference between stack and queue data structures and provide real-world applications for each.",
            "options": [
                "Stack: FIFO, Queue: LIFO",
                "Stack: LIFO, Queue: FIFO",
                "Both follow same principle",
                "Neither has specific order"
            ],
            "givenAnswer": "Stack: LIFO, Queue: FIFO",
            "correctAnswer": "Stack: LIFO, Queue: FIFO"
        },
        {
            "question": "Derive the differential equation for RLC circuit and analyze its transient response for different damping conditions.",
            "options": [
                "Only underdamped possible",
                "Three types of damping",
                "Only overdamped possible",
                "Damping doesn't affect response"
            ],
            "givenAnswer": "Three types of damping",
            "correctAnswer": "Three types of damping"
        },
        {
            "question": "What is the derivative of sin(x)?",
            "options": [
                "cos(x)",
                "-cos(x)",
                "sin(x)",
                "-sin(x)"
            ],
            "givenAnswer": "-sin(x)",
            "correctAnswer": "cos(x)"
        },
        {
            "question": "What is the unit of force in SI system?",
            "options": [
                "Joule",
                "Newton",
                "Pascal",
                "Watt"
            ],
            "givenAnswer": "Joule",
            "correctAnswer": "Newton"
        },
        {
            "question": "What is Ohm's Law?",
            "options": [
                "V = I/R",
                "V = IR",
                "V = I + R",
                "V = I - R"
            ],
            "givenAnswer": "V = IR",
            "correctAnswer": "V = IR"
        },
        {
            "question": "What is the basic building block of digital circuits?",
            "options": [
                "Transistors",
                "Logic Gates",
                "Resistors",
                "Capacitors"
            ],
            "givenAnswer": "Transistors",
            "correctAnswer": "Logic Gates"
        },
        {
            "question": "Analyze the stress distribution in a thick-walled pressure vessel subjected to internal pressure using Lamé's theory and compare with thin-walled approximation.",
            "options": [
                "Thin-wall theory is always accurate",
                "Lamé's theory accounts for stress variation",
                "Both give same results",
                "Pressure doesn't affect stress"
            ],
            "givenAnswer": "Lamé's theory accounts for stress variation",
            "correctAnswer": "Lamé's theory accounts for stress variation"
        },
        {
            "question": "Calculate the equivalent resistance of a complex network with series and parallel combinations involving 6 resistors.",
            "options": [
                "Sum all resistances",
                "Use only parallel formula",
                "Combine series and parallel rules",
                "Use only series formula"
            ],
            "givenAnswer": "Combine series and parallel rules",
            "correctAnswer": "Combine series and parallel rules"
        },
        {
            "question": "What is the primary function of an operating system?",
            "options": [
                "Only file management",
                "Resource management and user interface",
                "Only memory management",
                "Only process scheduling"
            ],
            "givenAnswer": "Resource management and user interface",
            "correctAnswer": "Resource management and user interface"
        },
        {
            "question": "Explain the banker's algorithm for deadlock avoidance with an example scenario involving 5 processes and 3 resource types.",
            "options": [
                "Only prevents deadlock",
                "Avoids deadlock by safe state checking",
                "Detects deadlock only",
                "Recovers from deadlock"
            ],
            "givenAnswer": "Detects deadlock only",
            "correctAnswer": "Avoids deadlock by safe state checking"
        }
    ],
    "testScheduledDetails": {
        "id": "e0683df5-97c3-4236-9ada-1fc03fc08a21",
        "userId": "460cb179-530e-475a-b0b9-ed2a1b6e644b",
        "testName": "java mock",
        "scheduleMock": "2025-09-16T14:48:00Z",
        "maxAttemptsPerDay": 2,
        "durationSeconds": 3600,
        "isActive": false,
        "createdAt": "2025-09-16T14:23:58.557679Z",
        "scheduledStatus": "COMPLETED"
    }
  };

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
    
    const correct = mockData.questionDetails.filter(q => q.givenAnswer === q.correctAnswer).length;
    const total = mockData.questionDetails.length;
    const percentage = ((correct / total) * 100).toFixed(1);
    
    return { correct, total, percentage };
  };

  const score = calculateScore();

  return (
    <div className="mock-details-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Mock Test Details</h1>
          {mockData.testScheduledDetails && (
            <div className="test-name">
              <FileText className="icon" />
              {mockData.testScheduledDetails.testName}
            </div>
          )}
        </header>

        <div className="details-grid">
          {/* Test Scheduled Details */}
          {mockData.testScheduledDetails && (
            <div className="card scheduled-details">
              <div className="card-header">
                <Calendar className="header-icon" />
                <h2>Test Schedule Information</h2>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Test ID:</span>
                    <span className="value">{mockData.testScheduledDetails.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Scheduled Time:</span>
                    <span className="value">{formatDate(mockData.testScheduledDetails.scheduleMock)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Duration:</span>
                    <span className="value">{formatDuration(mockData.testScheduledDetails.durationSeconds)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Max Attempts/Day:</span>
                    <span className="value">{mockData.testScheduledDetails.maxAttemptsPerDay}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className="value status-badge">
                      {getStatusIcon(mockData.testScheduledDetails.scheduledStatus)}
                      {mockData.testScheduledDetails.scheduledStatus}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(mockData.testScheduledDetails.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attempt Details */}
          {mockData.attemptDetails && (
            <div className="card attempt-details">
              <div className="card-header">
                <User className="header-icon" />
                <h2>Attempt Information</h2>
              </div>
              <div className="card-content">
                <div className="info-grid">
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
            </div>
          )}

          {/* Score Summary */}
          {score && (
            <div className="card score-summary">
              <div className="card-header">
                <CheckCircle className="header-icon" />
                <h2>Score Summary</h2>
              </div>
              <div className="card-content">
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-percentage">{score.percentage}%</span>
                  </div>
                  <div className="score-details">
                    <p className="score-text">
                      {score.correct} out of {score.total} questions correct
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
            </div>
          )}
        </div>

        {/* Question Details */}
        {mockData.questionDetails && mockData.questionDetails.length > 0 && (
          <div className="card questions-section">
            <div className="card-header">
              <FileText className="header-icon" />
              <h2>Question Analysis</h2>
              <span className="question-count">{mockData.questionDetails.length} Questions</span>
            </div>
            <div className="card-content">
              <div className="questions-list">
                {mockData.questionDetails.map((question, index) => {
                  const isCorrect = question.givenAnswer === question.correctAnswer;
                  return (
                    <div key={index} className={`question-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="question-header">
                        <span className="question-number">Q{index + 1}</span>
                        <div className="question-status">
                          {isCorrect ? (
                            <CheckCircle className="status-icon correct" />
                          ) : (
                            <XCircle className="status-icon incorrect" />
                          )}
                        </div>
                      </div>
                      <div className="question-content">
                        <p className="question-text">{question.question}</p>
                        <div className="options-list">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className={`option ${
                                option === question.correctAnswer ? 'correct-answer' : ''
                              } ${
                                option === question.givenAnswer ? 'given-answer' : ''
                              }`}
                            >
                              <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                              <span className="option-text">{option}</span>
                              {option === question.correctAnswer && (
                                <CheckCircle className="option-icon correct" />
                              )}
                              {option === question.givenAnswer && option !== question.correctAnswer && (
                                <XCircle className="option-icon incorrect" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* No Data Messages */}
        {!mockData.testScheduledDetails && !mockData.attemptDetails && !mockData.questionDetails && (
          <div className="card no-data">
            <div className="card-content">
              <AlertCircle className="no-data-icon" />
              <h3>No Data Available</h3>
              <p>There are no details available for this mock test.</p>
            </div>
          </div>
        )}

        {mockData.testScheduledDetails && !mockData.attemptDetails && (
          <div className="card info-message">
            <div className="card-content">
              <AlertCircle className="info-icon" />
              <h3>Test Scheduled</h3>
              <p>This test has been scheduled but no attempt has been made yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

