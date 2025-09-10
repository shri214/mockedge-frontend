import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import "./Analytics.scss";
import { getAttemptsByUser } from "../../function/getAttemptsByUser";
import { useAppSelector } from "../../redux/hook";
import type { RootState } from "../../store";

// Types
interface AnalyticsData {
  testName: string;
  scheduleMock: string;
  maxAttemptsPerDay: number;
  durationSeconds: number;
  isActive: boolean;
  createdAt: string;
  status: "COMPLETED" | "IN_PROGRESS" | "NOT_ATTEMPTED";
}

interface Stats {
  totalAttempts: number;
  completed: number;
  inProgress: number;
  notAttempted: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface TimelineDataItem {
  date: string;
  attempts: number;
}

// Constants
const STATUS_COLORS = {
  COMPLETED: "#10B981",
  IN_PROGRESS: "#3B82F6",
  NOT_ATTEMPTED: "#9CA3AF",
} as const;

const CHART_CONFIG = {
  pieChart: {
    innerRadius: 60,
    outerRadius: 120,
    paddingAngle: 5,
  },
  timeline: {
    height: 250,
    daysToShow: 7,
  },
} as const;

// Custom Hooks
const useAnalyticsData = (userId: string | undefined) => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getAttemptsByUser(userId);
        setData(response.data || []);
      } catch (err) {
        console.error("Error fetching attempts:", err);
        setError("Failed to load analytics data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { data, loading, error };
};

// Utility Functions
const calculateStats = (data: AnalyticsData[]): Stats => {
  const stats = {
    totalAttempts: data.length,
    completed: 0,
    inProgress: 0,
    notAttempted: 0,
  };

  data.forEach((item) => {
    switch (item.status) {
      case "COMPLETED":
        stats.completed++;
        break;
      case "IN_PROGRESS":
        stats.inProgress++;
        break;
      case "NOT_ATTEMPTED":
        stats.notAttempted++;
        break;
    }
  });

  return stats;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const calculateCompletionRate = (stats: Stats): number => {
  return stats.totalAttempts === 0 
    ? 0 
    : Math.round((stats.completed / stats.totalAttempts) * 100);
};

const calculateSuccessRate = (stats: Stats): number => {
  const attemptedTests = stats.totalAttempts - stats.notAttempted;
  return attemptedTests === 0 
    ? 0 
    : Math.round((stats.completed / attemptedTests) * 100);
};

const calculateAverageDuration = (data: AnalyticsData[]): number => {
  if (data.length === 0) return 0;
  const totalDuration = data.reduce((sum, item) => sum + item.durationSeconds, 0);
  return totalDuration / data.length;
};

const prepareChartData = (stats: Stats): ChartDataItem[] => {
  return [
    { name: "Completed", value: stats.completed, color: STATUS_COLORS.COMPLETED },
    { name: "In Progress", value: stats.inProgress, color: STATUS_COLORS.IN_PROGRESS },
    { name: "Not Attempted", value: stats.notAttempted, color: STATUS_COLORS.NOT_ATTEMPTED },
  ].filter(item => item.value > 0);
};

const prepareBarData = (stats: Stats) => [
  { status: "Completed", count: stats.completed },
  { status: "In Progress", count: stats.inProgress },
  { status: "Not Attempted", count: stats.notAttempted },
];

const prepareTimelineData = (data: AnalyticsData[]): TimelineDataItem[] => {
  const dateMap = new Map<string, number>();
  
  data.forEach(item => {
    const date = new Date(item.createdAt).toLocaleDateString();
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  return Array.from(dateMap.entries())
    .map(([date, attempts]) => ({ date, attempts }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-CHART_CONFIG.timeline.daysToShow);
};

// Components
const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading analytics...</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="empty-state">
    <div className="empty-content">
      <div className="empty-icon">📈</div>
      <h3>No test attempts yet</h3>
      <p>Start taking tests to see your analytics and progress here.</p>
    </div>
  </div>
);

const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: string;
  className: string;
}> = ({ title, value, icon, className }) => (
  <div className={`summary-card ${className}`}>
    <div className="card-content">
      <h3>{title}</h3>
      <span className="number">{value}</span>
    </div>
    <div className="card-icon">{icon}</div>
  </div>
);

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  description?: string;
  className: string;
  showProgressBar?: boolean;
  progressValue?: number;
}> = ({ title, value, description, className, showProgressBar, progressValue }) => (
  <div className={`metric-card ${className}`}>
    <div className="metric-content">
      <h3>{title}</h3>
      <span className="percentage">{value}{typeof value === 'number' ? '%' : ''}</span>
      {description && <p className="metric-description">{description}</p>}
      {showProgressBar && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressValue || 0}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

const ChartSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = "" }) => (
  <div className={`chart-section ${className}`}>
    <h3>{title}</h3>
    {children}
  </div>
);

// Main Component
export const Analytics: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.user);
  const { data: analyticsData, loading, error } = useAnalyticsData(user?.id);

  // Memoized calculations
  const stats = useMemo(() => calculateStats(analyticsData), [analyticsData]);
  const chartData = useMemo(() => prepareChartData(stats), [stats]);
  const barData = useMemo(() => prepareBarData(stats), [stats]);
  const timelineData = useMemo(() => prepareTimelineData(analyticsData), [analyticsData]);
  
  const completionRate = useMemo(() => calculateCompletionRate(stats), [stats]);
  const successRate = useMemo(() => calculateSuccessRate(stats), [stats]);
  const averageDuration = useMemo(() => calculateAverageDuration(analyticsData), [analyticsData]);

  if (loading) {
    return (
      <div className="analytics-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Track your test performance and progress</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <SummaryCard
          title="Total Attempts"
          value={stats.totalAttempts}
          icon="📊"
          className="total"
        />
        <SummaryCard
          title="Completed"
          value={stats.completed}
          icon="✅"
          className="completed"
        />
        <SummaryCard
          title="In Progress"
          value={stats.inProgress}
          icon="🔄"
          className="in-progress"
        />
        <SummaryCard
          title="Not Attempted"
          value={stats.notAttempted}
          icon="⏸️"
          className="not-attempted"
        />
      </div>

      {/* Key Metrics */}
      <div className="metrics-cards">
        <MetricCard
          title="Completion Rate"
          value={completionRate}
          className="completion-rate"
          showProgressBar
          progressValue={completionRate}
        />
        <MetricCard
          title="Average Duration"
          value={formatDuration(averageDuration)}
          description="Per test session"
          className="avg-duration"
        />
        <MetricCard
          title="Success Rate"
          value={successRate}
          description="Excluding not attempted"
          className="success-rate"
        />
      </div>

      {/* Charts */}
      <div className="charts-container">
        <ChartSection title="Status Distribution" className="pie-chart-section">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={CHART_CONFIG.pieChart.innerRadius}
                  outerRadius={CHART_CONFIG.pieChart.outerRadius}
                  paddingAngle={CHART_CONFIG.pieChart.paddingAngle}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Attempts']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>No data available</p>
            </div>
          )}
        </ChartSection>

        <ChartSection title="Status Breakdown" className="bar-chart-section">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [value, 'Count']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Empty State */}
      {stats.totalAttempts === 0 && <EmptyState />}
    </div>
  );
};