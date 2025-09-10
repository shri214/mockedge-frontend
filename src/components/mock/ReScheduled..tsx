// Reschedule.tsx - Updated for initial scheduling
import React from "react";
import { AlertCircle, Calendar, Clock, Save } from "lucide-react";
import { DateTimePicker } from "./Datepicker";

interface RescheduleProps {
  formData: {
    scheduleMock: string;
  };
  handleScheduleChange: (date: string) => void;
  handleSubmit: () => void;
  prevStep: () => void;
  errors: {
    scheduleMock?: string;
  };
  isLoading: boolean;
  isRescheduling?: boolean; // Optional prop to differentiate between create and reschedule
}

export const Reschedule: React.FC<RescheduleProps> = ({
  formData,
  handleScheduleChange,
  handleSubmit,
  prevStep,
  errors,
  isLoading,
  isRescheduling = false
}) => {
  return (
    <div className="step-container">
      <div className="step-header">
        <Calendar className="step-icon" />
        <h2 className="step-title">
          {isRescheduling ? "Reschedule Test" : "Schedule Test"}
        </h2>
        <p className="step-subtitle">
          {isRescheduling 
            ? "Choose a new time for your mock test" 
            : "Choose when you want to take this mock test"
          }
        </p>
      </div>

      <div className="form-group-enhanced">
        <label className="label-enhanced">
          <Calendar size={16} />
          Date & Time
        </label>

        <div className="datetime-container">
          <DateTimePicker
            value={formData.scheduleMock}
            onChange={handleScheduleChange}
          />
        </div>

        {formData.scheduleMock && (
          <div className="datetime-preview-enhanced">
            <Clock size={20} />
            <div className="preview-content">
              <p className="preview-label">
                {isRescheduling ? "New schedule:" : "Scheduled for:"}
              </p>
              <p className="preview-time">
                {new Date(formData.scheduleMock).toLocaleString("en-US", {
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

        {errors.scheduleMock && (
          <div className="error-message">
            <AlertCircle size={14} />
            {errors.scheduleMock}
          </div>
        )}
      </div>

      <div className="step-actions-split">
        <button onClick={prevStep} className="btn-secondary">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !formData.scheduleMock}
          className="btn-success"
        >
          {isLoading ? (
            <>
              <div className="spinner"></div>
              {isRescheduling ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save size={16} />
              {isRescheduling ? "Update Schedule" : "Create Mock Test"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};