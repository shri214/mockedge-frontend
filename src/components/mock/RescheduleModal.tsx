// RescheduleModal.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Clock, Save, AlertCircle } from "lucide-react";
import { DateTimePicker } from "./Datepicker";
import "./RescheduleModal.scss"

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (newDateTime: string) => Promise<void>;
  currentDateTime: string;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onReschedule,
  currentDateTime,
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(currentDateTime);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedDateTime) {
      setError("Please select a date and time");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onReschedule(selectedDateTime);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reschedule");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDateTime(currentDateTime);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="custom-modal">
      <div className="modal-backdrop" onClick={handleClose} />
      
      <div className="modal-content reschedule-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <Calendar size={20} />
            Reschedule Test
          </h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group-enhanced">
            <label className="label-enhanced">
              <Calendar size={16} />
              New Date & Time
            </label>

            <div className="datetime-container">
              <DateTimePicker
                value={selectedDateTime}
                onChange={setSelectedDateTime}
              />
            </div>

            {selectedDateTime && (
              <div className="datetime-preview-enhanced">
                <Clock size={20} />
                <div className="preview-content">
                  <p className="preview-label">New schedule:</p>
                  <p className="preview-time">
                    {new Date(selectedDateTime).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedDateTime}
            className="btn-success"
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Rescheduling...
              </>
            ) : (
              <>
                <Save size={16} />
                Reschedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};