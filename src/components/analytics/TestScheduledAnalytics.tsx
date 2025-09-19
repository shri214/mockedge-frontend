import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./TestScheduledAnalytics.scss";
import type { TestScheduledAnalytic } from "../../type/analytics.types";

interface TestScheduledAnalyticsProps {
  data: TestScheduledAnalytic;
  loading?: boolean;
  isMobile?:boolean;
  isTablet?:boolean;
}

const STATUS_COLORS = {
  SCHEDULED: "#3B82F6",
  IN_PROGRESS: "#F59E0B",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
  EXPIRED: "#6B7280",
};

const STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const TestScheduledAnalytics: React.FC<TestScheduledAnalyticsProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-skeleton">Loading...</div>
      </div>
    );
  }

  const pieData = Object.entries(data.statusCount).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6B7280",
  }));

  const barData = Object.entries(data.statusCount).map(([status, count]) => ({
    status: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    count,
    fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6B7280",
  }));

  const completionRate =
    data.totalTests > 0
      ? (((data.statusCount.COMPLETED || 0) / data.totalTests) * 100).toFixed(1)
      : "0";

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2 className="analytics-title">Test Scheduled Analytics</h2>
        <div className="analytics-summary">
          <div className="summary-card">
            <div className="summary-value">{data.totalTests}</div>
            <div className="summary-label">Total Tests</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{completionRate}%</div>
            <div className="summary-label">Completion Rate</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {data.statusCount.IN_PROGRESS || 0}
            </div>
            <div className="summary-label">In Progress</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="chart-title">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Status Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={{ stroke: "#D1D5DB" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={{ stroke: "#D1D5DB" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="test-list">
        <h3 className="list-title">Recent Tests</h3>
        <div className="test-grid">
          {data.tests.slice(0, 6).map((test) => (
            <div key={test.id} className="test-card">
              <div className="test-header">
                <h4 className="test-name">{test.testName}</h4>
                <span
                  className={`status-badge status-${test.status.toLowerCase()}`}
                  style={{ backgroundColor: STATUS_COLORS[test.status] }}
                >
                  {STATUS_LABELS[test.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
