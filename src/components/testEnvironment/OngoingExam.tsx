import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Save, Clock, CheckCircle, 
  AlertCircle, Loader, FileText,
  AlertTriangle, X
} from "lucide-react";
import "./OngoingExam.scss";
import { useAppSelector } from "../../redux/hook";
import type { RootState } from "../../store";
import { AssignQuestionApi } from "../../function/assignQuestion";
import { GetQuestion } from "../../function/getQuestions";
import { UpdateAnswer } from "../../function/updateAnswer";
import { MockSubmission } from "../../function/mockSubmission";
import { toast } from "react-toastify";
import type {
  ApiResponse,
  OngoingExamProps,
  Question,
  UnifiedDto,
} from "../../Interface";

interface ExamState {
  isLoading: boolean;
  currentPage: number;
  selectedAnswer: string;
  timeSpent: number;
  error: string | null;
}

interface QuestionData {
  question: Question | null;
  totalQuestions: number;
  hasNext: boolean;
}

interface SubmitModalState {
  isOpen: boolean;
  isSubmitting: boolean;
}

export const OngoingExam: React.FC<OngoingExamProps> = ({
  cleanupSecureMode,
  onExitSecure,
  setIsSubmitted,
  onSubmissionStart,
  onSubmissionEnd,
  violations,
}) => {
  const  questionQuery  = useAppSelector((state: RootState) => state.questionQuery);
  const userId=useAppSelector((state:RootState)=>state.user.user?.id);
  const hasInitialized = useRef(false);
  const [examStartTime] = useState(Date.now());

  const [examState, setExamState] = useState<ExamState>({
    isLoading: true,
    currentPage: 0,
    selectedAnswer: "",
    timeSpent: 0,
    error: null,
  });

  const [questionData, setQuestionData] = useState<QuestionData>({
    question: null,
    totalQuestions: 0,
    hasNext: false,
  });

  const [submitModal, setSubmitModal] = useState<SubmitModalState>({
    isOpen: false,
    isSubmitting: false,
  });

  // Timer for tracking time
  useEffect(() => {
    const timer = setInterval(() => {
      setExamState(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - examStartTime) / 1000),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [examStartTime]);

  // Initialize exam - runs only once
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initExam = async () => {
      if (!questionQuery?.attemptId) {
        setExamState(prev => ({
          ...prev,
          error: "No attempt ID found. Please restart the exam.",
          isLoading: false,
        }));
        return;
      }

      try {
        // Assign questions first
        const config: Partial<UnifiedDto> = Object.fromEntries(
          Object.entries(questionQuery).filter(
            ([, value]) => value !== "" && value !== undefined && value !== null
          )
        );

        await AssignQuestionApi(config);
        
        // Load first question
        await loadQuestion(0);
      } catch (error) {
        console.error("Exam initialization failed:", error);
        setExamState(prev => ({
          ...prev,
          error: "Failed to initialize exam. Please try again.",
          isLoading: false,
        }));
      }
    };

    initExam();
  }, []);

  const loadQuestion = async (page: number) => {
    setExamState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await GetQuestion(questionQuery.attemptId, page) as ApiResponse;

      if (!response?.questions?.length) {
        throw new Error("No questions found");
      }

      const question = response.questions[0];
      
      setQuestionData({
        question,
        totalQuestions: response.totalQuestions ?? 0,
        hasNext: response.hasNext ?? false,
      });

      setExamState(prev => ({
        ...prev,
        isLoading: false,
        currentPage: page,
        selectedAnswer: question.givenAnswer || "",
      }));
    } catch (error) {
      console.error("Failed to load question:", error);
      setExamState(prev => ({
        ...prev,
        error: "Failed to load question. Please try again.",
        isLoading: false,
      }));
    }
  };

  const saveAnswer = async (answer: string) => {
    if (!questionData.question) return false;

    try {
      await UpdateAnswer(
        questionQuery.attemptId,
        questionData.question.questionId,
        answer
      );

      // Update question data to reflect saved answer
      setQuestionData(prev => ({
        ...prev,
        question: prev.question ? {
          ...prev.question,
          givenAnswer: answer,
          isAnswered: true,
        } : null,
      }));

      return true;
    } catch (error) {
      console.error("Failed to save answer:", error);
      toast.error("Failed to save answer");
      return false;
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setExamState(prev => ({ ...prev, selectedAnswer: answer }));
  };

  const handleNavigation = async (direction: "prev" | "next") => {
    const newPage = direction === "prev" 
      ? examState.currentPage - 1 
      : examState.currentPage + 1;

    // Save current answer if selected and different from saved
    if (examState.selectedAnswer && 
        examState.selectedAnswer !== questionData.question?.givenAnswer) {
      await saveAnswer(examState.selectedAnswer);
    }

    await loadQuestion(newPage);
  };

  const openSubmitModal = () => {
    setSubmitModal({ isOpen: true, isSubmitting: false });
  };

  const closeSubmitModal = () => {
    setSubmitModal({ isOpen: false, isSubmitting: false });
    // Reset submission state when modal is cancelled
    setIsSubmitted?.(false);
    onSubmissionEnd?.();
  };

  const confirmSubmit = async () => {
    setSubmitModal(prev => ({ ...prev, isSubmitting: true }));
    setIsSubmitted?.(true);
    onSubmissionStart?.();

    try {
      // Save current answer if any
      if (examState.selectedAnswer && 
          examState.selectedAnswer !== questionData.question?.givenAnswer) {
        await saveAnswer(examState.selectedAnswer);
      }

      const result = await MockSubmission(questionQuery.attemptId, userId);
      
      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Exam submitted successfully!");
      
      // Close modal first
      setSubmitModal({ isOpen: false, isSubmitting: false });
      
      // Small delay before cleanup to ensure toast is visible
      setTimeout(() => {
        cleanupSecureMode();
        onExitSecure();
      }, 1500);
      
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit exam. Please try again.");
      setSubmitModal({ isOpen: false, isSubmitting: false });
      onSubmissionEnd?.();
      setIsSubmitted?.(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (examState.isLoading && !questionData.question) {
    return (
      <div className="exam-container">
        <div className="loading-spinner">
          <Loader className="animate-spin" size={32} />
          <p>Loading exam questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (examState.error) {
    return (
      <div className="exam-container">
        <div className="error-message">
          <AlertCircle size={24} className="text-red-500" />
          <p>{examState.error}</p>
          <button onClick={() => loadQuestion(examState.currentPage)} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No question state
  if (!questionData.question) {
    return (
      <div className="exam-container">
        <div className="error-message">
          <FileText size={24} />
          <p>No questions available.</p>
        </div>
      </div>
    );
  }

  const { question } = questionData;
  const canGoPrevious = examState.currentPage > 0;
  const canGoNext = questionData.hasNext;
  const currentQuestionNumber = examState.currentPage + 1;
  const progressPercentage = (currentQuestionNumber / Math.max(questionData.totalQuestions, 1)) * 100;

  return (
    <div className="exam-container">
      {/* Submit Confirmation Modal */}
      {submitModal.isOpen && (
        <div className="submit-modal-overlay">
          <div className="submit-modal-container">
            <div className="submit-modal-header">
              <h2 className="submit-modal-title">Submit Exam</h2>
              <button 
                className="submit-modal-close-btn"
                onClick={closeSubmitModal}
                disabled={submitModal.isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="submit-modal-content">
              <div className="submit-modal-icon">
                <AlertTriangle size={48} className="text-orange-500" />
              </div>
              
              <div className="submit-modal-message">
                <p className="submit-modal-primary-text">
                  Are you sure you want to submit your exam?
                </p>
                <p className="submit-modal-secondary-text">
                  This action cannot be undone. Once submitted, you will not be able to make any changes to your answers.
                </p>
              </div>

              <div className="submit-modal-exam-info">
                <div className="submit-modal-info-row">
                  <span>Questions Completed:</span>
                  <span>{currentQuestionNumber} of {questionData.totalQuestions}</span>
                </div>
                <div className="submit-modal-info-row">
                  <span>Time Spent:</span>
                  <span>{formatTime(examState.timeSpent)}</span>
                </div>
                <div className="submit-modal-info-row">
                  <span>Current Answer:</span>
                  <span className={examState.selectedAnswer || question.givenAnswer ? "text-green-600" : "text-red-600"}>
                    {examState.selectedAnswer || question.givenAnswer || "No answer selected"}
                  </span>
                </div>
              </div>
            </div>

            <div className="submit-modal-actions">
              <button
                className="submit-modal-cancel-btn"
                onClick={closeSubmitModal}
                disabled={submitModal.isSubmitting}
              >
                Cancel
              </button>
              <button
                className="submit-modal-confirm-btn"
                onClick={confirmSubmit}
                disabled={submitModal.isSubmitting}
              >
                {submitModal.isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Confirm Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="exam-header">
        <div className="exam-title">
          <h1>MCQ Examination</h1>
          <div className="question-counter">
            Question {currentQuestionNumber} of {questionData.totalQuestions}
          </div>
        </div>
        <div className="violation">
          <AlertTriangle size={20} color="red"/>
          <span>{violations?.length}</span>
        </div>
        <div className="exam-info">
          <div className="time-info">
            <Clock size={20} />
            <span>Time: {formatTime(examState.timeSpent)}</span>
          </div>
          {question.isAnswered && (
            <div className="answered-status">
              <CheckCircle size={20} className="text-green-500" />
              <span>Answered</span>
            </div>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="question-container">
        <div className="question-header">
          <h2 className="question-text">{question.questionText}</h2>
        </div>

        <div className="options-container">
          {question.options.map((option, index) => (
            <div
              key={`${question.questionId}-${index}`}
              className={`option-item ${
                examState.selectedAnswer === option ? "selected" : ""
              } ${
                question.givenAnswer === option ? "previously-answered" : ""
              }`}
              onClick={() => handleAnswerSelect(option)}
            >
              <div className="option-radio">
                <input
                  type="radio"
                  name={`question-${question.questionId}`}
                  value={option}
                  checked={examState.selectedAnswer === option || question.givenAnswer === option}
                  onChange={() => handleAnswerSelect(option)}
                />
              </div>
              <div className="option-text">{option}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-container">
        <button
          className="nav-button prev-button"
          onClick={() => handleNavigation("prev")}
          disabled={!canGoPrevious || examState.isLoading}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="center-actions">
          <span className="navigation-info">
            {examState.selectedAnswer 
              ? examState.selectedAnswer !== question.givenAnswer 
                ? "Answer will be saved" 
                : "Answer saved"
              : "Select an answer"}
          </span>
        </div>

        <button
          className="nav-button next-button"
          onClick={() => handleNavigation("next")}
          disabled={!canGoNext || examState.isLoading}
        >
          {examState.selectedAnswer ? "Save & Next" : "Skip & Next"}
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="question-progress">
        <div className="progress-info">
          <span>Progress: {Math.round(progressPercentage)}% complete</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="submit-container">
        <button
          className="submit-button"
          onClick={openSubmitModal}
          disabled={examState.isLoading}
        >
          <Save size={18} />
          Submit Exam
        </button>
      </div>
    </div>
  );
};