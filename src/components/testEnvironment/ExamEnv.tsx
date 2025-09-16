import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SecureExamEnvironment from "./SecureEnv";
import { Shield, AlertTriangle, Loader, Camera, Mic, CheckCircle, XCircle } from "lucide-react";
import "./ExamEnv.scss";

type InitStep = "loading" | "permissions" | "ready" | "error";

interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt' | 'checking';
  microphone: 'granted' | 'denied' | 'prompt' | 'checking';
}

export const ExamEnv = () => {
  const { userId, testId } = useParams();
  const navigate = useNavigate();

  const [showSecureEnvironment, setShowSecureEnvironment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [initializationStep, setInitializationStep] = useState<InitStep>("loading");
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    camera: 'checking',
    microphone: 'checking'
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [needsPermissionPrompt, setNeedsPermissionPrompt] = useState(false);
  const [permissionInstructions, setPermissionInstructions] = useState<string>("");

  const checkMediaPermission = async (type: "camera" | "microphone"): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      // First, try the Permissions API
      const permissionName = type === "camera" ? "camera" : "microphone";
      const result = await navigator.permissions.query({
        name: permissionName as PermissionName,
      });
      
      if (result.state === "granted") {
        return "granted";
      } else if (result.state === "denied") {
        return "denied";
      }
      
      return "prompt";
    } catch (error) {
      console.log(`Permissions API not supported for ${type}, falling back to getUserMedia`);
      return "prompt"; // If Permissions API fails, we need to prompt
    }
  };

  const requestMediaAccess = async (type: "camera" | "microphone"): Promise<boolean> => {
    try {
      const constraints = type === "camera" 
        ? { video: { facingMode: "user" }, audio: false }
        : { video: false, audio: true };
        
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop the stream immediately since we're just checking permission
      stream.getTracks().forEach((track) => track.stop());
      
      return true;
    } catch (error: any) {
      console.error(`Failed to get ${type} access:`, error);
      
      // Check specific error types
      if (error.name === "NotAllowedError") {
        return false; // User denied permission
      } else if (error.name === "NotFoundError") {
        throw new Error(`${type === "camera" ? "Camera" : "Microphone"} device not found`);
      } else if (error.name === "NotReadableError") {
        throw new Error(`${type === "camera" ? "Camera" : "Microphone"} is already in use by another application`);
      }
      
      throw error;
    }
  };

  const checkSystemCapabilities = (): { hasCapabilities: boolean; missingFeatures: string[] } => {
    const missingFeatures: string[] = [];

    const hasFullscreen = !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).msRequestFullscreen
    );

    const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;
    const isSecureContext = window.isSecureContext || location.protocol === 'https:';

    if (!hasFullscreen) missingFeatures.push("Fullscreen API");
    if (!hasMediaDevices) missingFeatures.push("MediaDevices API");
    if (!isSecureContext) missingFeatures.push("Secure Context (HTTPS)");

    return {
      hasCapabilities: missingFeatures.length === 0,
      missingFeatures
    };
  };

  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setInitializationStep("permissions");
    setIsRequestingPermissions(true);

    try {
      // Check system capabilities first
      const { hasCapabilities, missingFeatures } = checkSystemCapabilities();
      
      if (!hasCapabilities) {
        setError(`Your browser/system is missing required features: ${missingFeatures.join(", ")}. Please use a modern browser with HTTPS.`);
        setInitializationStep("error");
        return false;
      }

      // Check initial permission states
      setPermissionStatus(prev => ({ ...prev, camera: 'checking', microphone: 'checking' }));
      
      const [cameraStatus, micStatus] = await Promise.all([
        checkMediaPermission("camera"),
        checkMediaPermission("microphone")
      ]);

      setPermissionStatus({
        camera: cameraStatus,
        microphone: micStatus
      });

      // If permissions are already granted, proceed
      if (cameraStatus === 'granted' && micStatus === 'granted') {
        setInitializationStep("ready");
        return true;
      }

      // If any permission is denied, show error
      if (cameraStatus === 'denied' || micStatus === 'denied') {
        const deniedPerms = [];
        if (cameraStatus === 'denied') deniedPerms.push('Camera');
        if (micStatus === 'denied') deniedPerms.push('Microphone');
        
        setError(`${deniedPerms.join(' and ')} access was denied. Please enable ${deniedPerms.join(' and ').toLowerCase()} permissions in your browser settings and refresh the page.`);
        setInitializationStep("error");
        return false;
      }

      // Request permissions that need prompting
      const permissionPromises: Promise<boolean>[] = [];
      
      if (cameraStatus === 'prompt') {
        permissionPromises.push(
          requestMediaAccess("camera").then(granted => {
            setPermissionStatus(prev => ({ ...prev, camera: granted ? 'granted' : 'denied' }));
            return granted;
          })
        );
      }
      
      if (micStatus === 'prompt') {
        permissionPromises.push(
          requestMediaAccess("microphone").then(granted => {
            setPermissionStatus(prev => ({ ...prev, microphone: granted ? 'granted' : 'denied' }));
            return granted;
          })
        );
      }

      // Wait for all permission requests
      const results = await Promise.all(permissionPromises);
      const allGranted = results.every(result => result);

      if (!allGranted) {
        setError("Camera and microphone access are required for secure exam monitoring. Please grant all permissions and try again.");
        setInitializationStep("error");
        return false;
      }

      // Final verification - request both together to ensure they work
      try {
        const finalStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true
        });
        finalStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Final verification failed:", error);
        setError("Failed to access camera and microphone together. Please check your device settings.");
        setInitializationStep("error");
        return false;
      }

      setInitializationStep("ready");
      return true;

    } catch (error: any) {
      console.error("Permission request failed:", error);
      setError(error.message || "Failed to request browser permissions. Please try again.");
      setInitializationStep("error");
      return false;
    } finally {
      setIsLoading(false);
      setIsRequestingPermissions(false);
    }
  }, [retryCount]);

  useEffect(() => {
    const initializeExam = async () => {
      const permissionsOk = await requestAllPermissions();
      if (permissionsOk) {
        // Add a small delay to ensure everything is properly set up
        setTimeout(() => {
          setShowSecureEnvironment(true);
        }, 500);
      }
    };

    initializeExam();
  }, [requestAllPermissions]);

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

      // Log security violation to backend
      try {
        await fetch("/api/security/violation", {
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
        });
      } catch (error) {
        console.error("Failed to log security violation:", error);
      }
    },
    [userId, testId]
  );

  const handleRetry = () => {
    setError("");
    setRetryCount(prev => prev + 1);
    setInitializationStep("loading");
    setPermissionStatus({ camera: 'checking', microphone: 'checking' });
    setNeedsPermissionPrompt(false);
    setPermissionInstructions("");
  };

  const handleGoBack = () => {
    navigate(`/dashboard/${userId}`);
  };

  const handleManualPermissions = () => {
    alert(`To manually enable permissions:
    
1. Click the camera/microphone icon in your browser's address bar
2. Select "Allow" for both camera and microphone
3. Refresh this page

Or go to your browser settings and enable camera/microphone permissions for this site.`);
  };

  if (showSecureEnvironment) {
    return (
      <SecureExamEnvironment
        onExitSecure={handleExitSecure}
        onSecurityViolation={handleSecurityViolation}
      />
    );
  }

  if (initializationStep === "loading" || (isLoading && !isRequestingPermissions)) {
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

  // Show permission prompt screen
  if (needsPermissionPrompt) {
    return (
      <div className="exam-env-permissions-container">
        <div className="exam-env-permissions-card">
          <Shield className="exam-env-permissions-icon" />
          <h2 className="exam-env-permissions-title">
            Camera and Microphone Access Required
          </h2>
          <p className="exam-env-permissions-text">
            {permissionInstructions}
          </p>
          
          <div className="exam-env-permissions-requirements">
            <div className="permission-requirement-item">
              <Camera className="permission-requirement-icon" />
              <div className="permission-requirement-text">
                <strong>Camera Access</strong>
                <span>For identity verification and monitoring</span>
              </div>
            </div>
            <div className="permission-requirement-item">
              <Mic className="permission-requirement-icon" />
              <div className="permission-requirement-text">
                <strong>Microphone Access</strong>
                <span>For audio monitoring during exam</span>
              </div>
            </div>
          </div>

          <div className="exam-env-permissions-notice">
            <p className="exam-env-permissions-notice-text">
              Your privacy is important to us. These permissions are only used during the exam for security purposes.
            </p>
          </div>

          <div className="exam-env-permissions-actions">
            <button onClick={handleGoBack} className="exam-env-cancel-btn">
              Cancel
            </button>
            <button 
              onClick={handleRequestPermissions} 
              className="exam-env-continue-btn"
              disabled={isRequestingPermissions}
            >
              {isRequestingPermissions ? "Requesting..." : "Continue & Grant Access"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (initializationStep === "permissions" || isRequestingPermissions) {
    return (
      <div className="exam-env-permissions-container">
        <div className="exam-env-permissions-card">
          <Shield className="exam-env-permissions-icon" />
          <h2 className="exam-env-permissions-title">
            Requesting Browser Permissions
          </h2>
          <p className="exam-env-permissions-text">
            Please allow camera and microphone access when prompted.
          </p>
          
          <div className="exam-env-permissions-status">
            <div className="permission-item">
              <Camera className="permission-icon" />
              <span className="permission-label">Camera:</span>
              <div className={`permission-status status-${permissionStatus.camera}`}>
                {permissionStatus.camera === 'granted' && <CheckCircle size={16} />}
                {permissionStatus.camera === 'denied' && <XCircle size={16} />}
                {permissionStatus.camera === 'checking' && <Loader size={16} className="spinning" />}
                <span className="permission-status-text">
                  {permissionStatus.camera === 'granted' ? 'Granted' : 
                   permissionStatus.camera === 'denied' ? 'Denied' :
                   permissionStatus.camera === 'prompt' ? 'Requesting...' : 'Checking...'}
                </span>
              </div>
            </div>
            
            <div className="permission-item">
              <Mic className="permission-icon" />
              <span className="permission-label">Microphone:</span>
              <div className={`permission-status status-${permissionStatus.microphone}`}>
                {permissionStatus.microphone === 'granted' && <CheckCircle size={16} />}
                {permissionStatus.microphone === 'denied' && <XCircle size={16} />}
                {permissionStatus.microphone === 'checking' && <Loader size={16} className="spinning" />}
                <span className="permission-status-text">
                  {permissionStatus.microphone === 'granted' ? 'Granted' : 
                   permissionStatus.microphone === 'denied' ? 'Denied' :
                   permissionStatus.microphone === 'prompt' ? 'Requesting...' : 'Checking...'}
                </span>
              </div>
            </div>
          </div>

          <div className="exam-env-permissions-notice">
            <p className="exam-env-permissions-notice-text">
              These permissions are required for secure exam monitoring and identity verification.
              If no popup appears, check if permissions are blocked in your browser settings.
            </p>
          </div>

          {(permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied') && (
            <button onClick={handleManualPermissions} className="manual-permissions-btn">
              How to Enable Permissions Manually
            </button>
          )}
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
          
          <div className="exam-env-error-help">
            <h4>Troubleshooting Tips:</h4>
            <ul>
              <li>Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Ensure the page is loaded over HTTPS</li>
              <li>Check that your camera and microphone are not being used by other applications</li>
              <li>Try refreshing the page and allowing permissions when prompted</li>
              <li>Check your browser's camera/microphone settings for this site</li>
            </ul>
          </div>
          
          <div className="exam-env-error-actions">
            <button onClick={handleGoBack} className="exam-env-error-back-btn">
              Go Back to Dashboard
            </button>
            <button onClick={handleManualPermissions} className="exam-env-error-help-btn">
              Permission Help
            </button>
            <button onClick={handleRetry} className="exam-env-error-retry-btn">
              Retry Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (initializationStep === "ready") {
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
                  All permissions granted. Launching secure exam environment...
                </p>
              </div>
            </div>
            <div className="exam-env-ready-permissions-summary">
              <div className="ready-permission-item">
                <Camera size={16} />
                <CheckCircle size={16} className="ready-check" />
                <span>Camera Ready</span>
              </div>
              <div className="ready-permission-item">
                <Mic size={16} />
                <CheckCircle size={16} className="ready-check" />
                <span>Microphone Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};