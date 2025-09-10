import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SecureExamEnvironment from "./SecureEnv";
import { Shield, AlertTriangle, Loader } from "lucide-react";
import "./ExamEnv.scss";

type InitStep = "loading" | "permissions" | "ready" | "error";

export const ExamEnv = () => {
  const { userId, testId } = useParams();
  const navigate = useNavigate();


  const [showSecureEnvironment, setShowSecureEnvironment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [initializationStep, setInitializationStep] =
    useState<InitStep>("loading");

  const checkMediaPermission = async (
    type: "camera" | "microphone"
  ): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({
        name: type as PermissionName,
      });
      return result.state === "granted";
    } catch {
      try {
        const constraints =
          type === "camera" ? { video: true } : { audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch {
        return false;
      }
    }
  };

  const checkSystemCapabilities = (): boolean => {
    const hasFullscreen = !!(
      document.documentElement.requestFullscreen ||
      (
        document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        }
      ).webkitRequestFullscreen ||
      (
        document.documentElement as HTMLElement & {
          msRequestFullscreen?: () => Promise<void>;
        }
      ).msRequestFullscreen
    );

    const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;

    return hasFullscreen && hasMediaDevices;
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setInitializationStep("permissions");

    try {
      if (!checkSystemCapabilities()) {
        alert(
          "Your browser does not support required features for secure exams."
        );
        setInitializationStep("error");
        return false;
      }

      const [cameraGranted, micGranted] = await Promise.all([
        checkMediaPermission("camera"),
        checkMediaPermission("microphone"),
      ]);

      if (!cameraGranted) {
        alert(
          "Camera access is required for secure exam monitoring. Please grant permission when prompted."
        );
        return false;
      }

      if (!micGranted) {
        alert("Microphone access is required for secure exam monitoring.");
        return false;
      }

      setInitializationStep("ready");
      return true;
    } catch (error) {
      console.error("Permission check failed:", error);
      alert("Failed to verify browser permissions. Please try again.");
      setInitializationStep("error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeExam = async () => {
      const permissionsOk = await requestPermissions();
      if (permissionsOk) {
        setShowSecureEnvironment(true);
      }
    };

    initializeExam();
  }, [requestPermissions]);

  const handleExitSecure = useCallback(() => {
    setShowSecureEnvironment(false);
    navigate(`/dashboard/${userId}`, {
      replace: true,
      state: { message: "Exam session terminated" },
    });
  }, [navigate, userId]);

  const handleSecurityViolation = useCallback(
    async (violation: string, severity: "warning" | "critical") => {
      console.log(`Security violation [${severity}]:`, violation);

      fetch("/api/security/violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          testId,
          violation,
          severity,
          timestamp: new Date().toISOString(),
          sessionInfo: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
          },
        }),
      }).catch(console.error);

      // if (severity === "critical") {
      //   toast.error(
      //     `Critical security violation: ${violation}\nExam will be terminated.`
      //   );
      //   try {
      //     await MockSubmission(questionQuery.attemptId, userId);
      //     handleExitSecure();
      //   } catch (err) {
      //     console.log(err);
      //     handleExitSecure();
      //   }
      // }
    },
    [userId, testId]
  );

  const handleRetry = () => {
    setError("");
    setInitializationStep("loading");
  };

  const handleGoBack = () => {
    navigate(`/dashboard/${userId}`);
  };

  if (showSecureEnvironment) {
    return (
      <SecureExamEnvironment
        onExitSecure={handleExitSecure}
        onSecurityViolation={handleSecurityViolation}
      />
    );
  }

  if (initializationStep === "loading" || isLoading) {
    return (
      <div className="exam-env-loading-container">
        <div className="exam-env-loading-card">
          <Loader className="exam-env-loading-icon" />
          <h2 className="exam-env-loading-title">
            Initializing Exam Environment
          </h2>
          <p className="exam-env-loading-text">
            Loading test data and checking system requirements...
          </p>
        </div>
      </div>
    );
  }

  if (initializationStep === "error" || error) {
    return (
      <div className="exam-env-error-container">
        <div className="exam-env-error-card">
          <AlertTriangle className="exam-env-error-icon" />
          <h2 className="exam-env-error-title">Setup Failed</h2>
          <p className="exam-env-error-text">
            {error ||
              "Failed to initialize exam environment. Please check your browser permissions and try again."}
          </p>
          <div className="exam-env-error-actions">
            <button onClick={handleGoBack} className="exam-env-error-back-btn">
              Go Back
            </button>
            <button onClick={handleRetry} className="exam-env-error-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (initializationStep === "permissions") {
    return (
      <div className="exam-env-permissions-container">
        <div className="exam-env-permissions-card">
          <Shield className="exam-env-permissions-icon" />
          <h2 className="exam-env-permissions-title">
            Checking Browser Permissions
          </h2>
          <p className="exam-env-permissions-text">
            Please allow camera and microphone access when prompted.
          </p>
          <div className="exam-env-permissions-notice">
            <p className="exam-env-permissions-notice-text">
              These permissions are required for secure exam monitoring and
              identity verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-env-ready-container">
      <div className="exam-env-ready-card">
        <div className="exam-env-ready-notice">
          <div className="exam-env-ready-notice-content">
            <Shield className="exam-env-ready-icon" />
            <div className="exam-env-ready-text-content">
              <h4 className="exam-env-ready-notice-title">
                Secure Exam Mode Ready
              </h4>
              <p className="exam-env-ready-notice-text">
                All permissions granted. Preparing secure exam environment...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
