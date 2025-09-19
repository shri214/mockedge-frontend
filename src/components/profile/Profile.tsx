import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Award,
  BookOpen,
  Eye,
  EyeOff,
  Key,
  Trash2,
} from "lucide-react";
import { changePassUser } from "../../function/changePassUser";
import { useAppSelector } from "../../redux/hook";
import type { RootState } from "../../store";
import "./Profile.scss";
import { toast } from "react-toastify";
import { formatDate } from "../../function/func/dateFormat";
import { getAvatar } from "../../function/getAvatar";
import { uploadAvatar } from "../../function/uploadAvatar"; // Import the upload function

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  avatar: string;
  bio: string;
  joinDate: string;
  examStats: {
    totalExams: number;
    passedExams: number;
    averageScore: number;
  };
}

export const Profile: React.FC = () => {
  const user = useAppSelector((state: RootState) => state.user.user);

  const email = user?.email;
  const updatedAt = user?.updatedAt;
  const name = user?.name;
  const [firstName, lastName] = name?.split(" ") ?? [];

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getAvatar(user.id)
        .then((url) => setAvatarUrl(url))
        .catch((err) => {
          console.error("Error fetching avatar:", err);
          // Set a default avatar if none exists
          setAvatarUrl("/api/placeholder/150/150");
        });
    }
  }, [user?.id]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName,
    lastName,
    email: email ? email : "N/A",
    dateOfBirth: "1990-05-15",
    avatar: avatarUrl || "/api/placeholder/150/150",
    bio: "Passionate learner and exam enthusiast. Always striving to improve and achieve new certifications.",
    joinDate: "2022-01-15",
    examStats: {
      totalExams: 24,
      passedExams: 22,
      averageScore: 87.5,
    }
  });

  // Update userProfile when avatarUrl changes
  useEffect(() => {
    setUserProfile(prev => ({
      ...prev,
      avatar: avatarUrl || "/api/placeholder/150/150"
    }));
  }, [avatarUrl]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [activeTab, setActiveTab] = useState<
    "personal" | "security" | "activity"
  >("personal");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirm: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(userProfile);
  };

  const handleSave = () => {
    setUserProfile(editedProfile);
    setIsEditing(false);
    console.log("Saving profile:", editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile((prev) => {
      if (field.includes(".")) {
        const keys = field.split(".");
        const updated = { ...prev };
        let current: any = updated;

        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        return updated;
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Upload the avatar
      const message = await uploadAvatar(user.id, file);
      
      // Create a temporary URL for immediate display
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);
      
      // Update the profile state
      setUserProfile(prev => ({
        ...prev,
        avatar: tempUrl
      }));
      
      if (isEditing) {
        setEditedProfile(prev => ({
          ...prev,
          avatar: tempUrl
        }));
      }

      toast.success(message || 'Avatar uploaded successfully');
      
      // Refresh the avatar from server after a short delay
      setTimeout(async () => {
        try {
          const newUrl = await getAvatar(user.id);
          setAvatarUrl(newUrl);
          setUserProfile(prev => ({
            ...prev,
            avatar: newUrl
          }));
          if (isEditing) {
            setEditedProfile(prev => ({
              ...prev,
              avatar: newUrl
            }));
          }
          // Clean up the temporary URL
          URL.revokeObjectURL(tempUrl);
        } catch (error) {
          console.error('Error refreshing avatar:', error);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    
    try {
      await changePassUser({
        email: email ? email : "",
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({ oldPassword: "", newPassword: "", confirm: "" });
      setShowChangePassword(false);
      toast.success("Password changed successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Failed to change password");
    }
  };

  const togglePasswordVisibility = (
    field: "oldPassword" | "newPassword" | "confirm"
  ) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      console.log("Deleting account...");
      // Implement account deletion logic here
    }
  };

  const renderPersonalTab = () => (
    <div className="profile-tab-content">
      <div className="profile-section">
        <div className="profile-section-header">
          <h3>Personal Information</h3>
          {!isEditing ? (
            <button onClick={handleEdit} className="btn-secondary">
              <Edit3 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={handleSave} className="btn-primary">
                <Save size={16} />
                Save
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-avatar-section">
          <div className="avatar-container">
            <img
              src={avatarUrl || userProfile.avatar}
              alt="Profile Avatar"
              className="profile-avatar"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                (e.target as HTMLImageElement).src = "/api/placeholder/150/150";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="avatar-edit-btn"
              disabled={isUploadingAvatar}
              title="Change Avatar"
            >
              {isUploadingAvatar ? (
                <div className="loading-spinner" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>
          <div className="avatar-info">
            <h2>
              {userProfile.firstName} {userProfile.lastName}
            </h2>
            <p className="join-date">
              Member since {new Date(userProfile.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={
                  isEditing ? editedProfile.firstName : userProfile.firstName
                }
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={
                  isEditing ? editedProfile.lastName : userProfile.lastName
                }
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                value={isEditing ? editedProfile.email : userProfile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <div className="input-with-icon">
              <Calendar className="input-icon" size={20} />
              <input
                id="dateOfBirth"
                type="date"
                value={
                  isEditing
                    ? editedProfile.dateOfBirth
                    : userProfile.dateOfBirth
                }
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={4}
              value={isEditing ? editedProfile.bio : userProfile.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="profile-tab-content">
      <div className="profile-section">
        <div className="profile-section-header">
          <h3>Security Settings</h3>
          <Shield className="section-icon" size={24} />
        </div>

        <div className="security-item">
          <div className="security-info">
            <h4>Password</h4>
            <p>Last changed: {updatedAt ? formatDate(updatedAt) : "N/A"}</p>
          </div>
          <button
            onClick={() => setShowChangePassword(true)}
            className="btn-secondary"
          >
            <Key size={16} />
            Change Password
          </button>
        </div>

        {showChangePassword && (
          <div className="password-change-form">
            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <div className="password-input">
                <input
                  id="oldPassword"
                  type={showPasswords.oldPassword ? "text" : "password"}
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      oldPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("oldPassword")}
                  className="password-toggle"
                >
                  {showPasswords.oldPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input">
                <input
                  id="newPassword"
                  type={showPasswords.newPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  className="password-toggle"
                >
                  {showPasswords.newPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="password-toggle"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="password-form-actions">
              <button 
                onClick={handlePasswordChange} 
                className="btn-primary"
                disabled={!passwords.oldPassword || !passwords.newPassword || !passwords.confirm}
              >
                Update Password
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswords({ oldPassword: "", newPassword: "", confirm: "" });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="security-item danger-zone">
          <div className="security-info">
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all associated data</p>
          </div>
          <button onClick={handleDeleteAccount} className="btn-danger">
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="profile-tab-content">
      <div className="profile-section">
        <div className="profile-section-header">
          <h3>Activity & Statistics</h3>
          <Award className="section-icon" size={24} />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <BookOpen className="stat-icon" size={24} />
            <div className="stat-info">
              <h4>{userProfile.examStats.totalExams}</h4>
              <p>Total Exams</p>
            </div>
          </div>
          <div className="stat-card">
            <Award className="stat-icon" size={24} />
            <div className="stat-info">
              <h4>{userProfile.examStats.passedExams}</h4>
              <p>Passed Exams</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon percent">
              {Math.round(
                (userProfile.examStats.passedExams /
                  userProfile.examStats.totalExams) *
                  100
              )}
              %
            </div>
            <div className="stat-info">
              <h4>Pass Rate</h4>
              <p>Success Rate</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon score">
              {userProfile.examStats.averageScore}
            </div>
            <div className="stat-info">
              <h4>Average Score</h4>
              <p>Overall Performance</p>
            </div>
          </div>
        </div>

        <div className="activity-info">
          <h4>Recent Activity</h4>
          <p>
            <strong>Account Created:</strong>{" "}
            {new Date(userProfile.joinDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Profile Completion:</strong> 85%
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <User size={20} />
          Personal Info
        </button>
        <button
          className={`tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Shield size={20} />
          Security
        </button>

        <button
          className={`tab ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <Award size={20} />
          Activity
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "personal" && renderPersonalTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "activity" && renderActivityTab()}
      </div>
    </div>
  );
};