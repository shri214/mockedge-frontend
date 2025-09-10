// MoreVerticalIcon.tsx - Updated with your API function
import React, { useState, useEffect } from "react";
import { MoreVertical, CalendarClock, XCircle, Eye } from "lucide-react";
import { createPortal } from "react-dom";
import type { ICellRendererParams } from "ag-grid-community";
import "./MoreVerticalIcons.scss";
import { getDetailsMock } from "../../function/getDetails";
import { toast } from "react-toastify";
import { RescheduleModal } from "./RescheduleModal";
import { reScheduled } from "../../function/reScheduledMock";

// Global state to ensure only one modal is open at a time
let currentOpenModal: (() => void) | null = null;

export const MoreVerticalIcon: React.FC<ICellRendererParams> = (params) => {
  const testId = params.data.id;
  const userId = params.data.userId;

  const [open, setOpen] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const handleOpen = () => {
    // Close any other open modal first
    if (currentOpenModal) {
      currentOpenModal();
    }

    // Set current modal as the active one
    currentOpenModal = () => setOpen(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    currentOpenModal = null;
  };

  const handleViewDetails = async () => {
    try {
      const res = await getDetailsMock(userId, testId);
      console.log(res);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get details");
      handleClose();
    }
  };

  const handleRescheduleClick = () => {
    handleClose();
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (newDateTime: string) => {
    try {
      // Use your existing API function
      const response = await reScheduled(userId, testId, newDateTime);
      
      toast.success("Test rescheduled successfully!");
      
      // Update the grid data if needed
      if (params.api) {
        // Update the row data with new schedule
        const rowNode = params.node;
        if (rowNode && rowNode.data) {
          rowNode.setData({
            ...rowNode.data,
            scheduleMock: newDateTime
          });
        }
        
        // Refresh the specific row
        params.api.refreshCells({
          rowNodes: [params.node],
          force: true
        });
      }
      
      console.log("Rescheduled successfully:", response);
    } catch (err) {
      console.error("Reschedule error:", err);
      throw new Error(err instanceof Error ? err.message : "Failed to reschedule test");
    }
  };

  const handleCancelTest = async () => {
    try {
      // You can implement cancel functionality here if needed
      // const res = await cancelMock(userId, testId);
      console.log("Cancel test:", testId);
      
      // For now, just show confirmation
      if (window.confirm("Are you sure you want to cancel this test?")) {
        toast.success("Test cancelled successfully!");
        handleClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel test");
      handleClose();
    }
  };

  // Handle outside clicks and escape key
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".modal-content")) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Portal modal to avoid any ag-grid issues
  const modalContent = open
    ? createPortal(
        <div className="custom-modal">
          <div className="modal-backdrop" onClick={handleClose} />

          <div className="modal-content">
            <h3 className="modal-title">Actions</h3>

            <div className="modal-options">
              {params.data.scheduledStatus !== "COMPLETED" && (
                <button
                  className="modal-btn"
                  onClick={handleRescheduleClick}
                >
                  <CalendarClock size={18} /> Reschedule
                </button>
              )}

              {params.data.scheduledStatus !== "COMPLETED" && (
                <button
                  className="modal-btn danger"
                  onClick={handleCancelTest}
                >
                  <XCircle size={18} /> Cancel
                </button>
              )}

              <button className="modal-btn" onClick={handleViewDetails}>
                <Eye size={18} /> View Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* Action icon */}
      <MoreVertical
        size={18}
        className="more-vertical-icon"
        onClick={handleOpen}
      />
      {modalContent}
      
      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onReschedule={handleRescheduleSubmit}
        currentDateTime={params.data.scheduleMock || ""}
        testId={testId}
      />
    </>
  );
};