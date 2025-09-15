import React from 'react';
import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import './AttemptAnalytics.scss';
import type { AttemptAnalytic } from '../../type/analytics.types';

interface AttemptAnalyticsProps {
  data: AttemptAnalytic;
  loading?: boolean;
}

const ATTEMPT_STATUS_COLORS = {
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#10B981',
  NOT_ATTEMPTED: '#6B7280'
};

const ATTEMPT_STATUS_LABELS = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  NOT_ATTEMPTED: 'Not Attempted'
};

export const AttemptAnalytics: React.FC<AttemptAnalyticsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-skeleton">Loading...</div>
      </div>
    );
  }

  const pieData = Object.entries(data.statusCount).map(([status, count]) => ({
    name: ATTEMPT_STATUS_LABELS[status as keyof typeof ATTEMPT_STATUS_LABELS] || status,
    value: count,
    color: ATTEMPT_STATUS_COLORS[status as keyof typeof ATTEMPT_STATUS_COLORS] || '#6B7280'
  }));

  const scoreData = data.attempt
    .filter(attempt => attempt.totalScore > 0)
    .map(attempt => ({
      name: attempt.mockName.substring(0, 15) + '...',
      score: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: ((attempt.totalScore / attempt.maxScore) * 100).toFixed(1)
    }))
    .slice(0, 10);

  const avgScore = data.attempt.length > 0 
    ? (data.attempt.reduce((sum, attempt) => sum + (attempt.maxScore/ attempt.totalScore * 100), 0) / data.attempt.length).toFixed(1)
    : '0';

  const completedAttempts = data.statusCount.COMPLETED || 0;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2 className="analytics-title">Attempt Analytics</h2>
        <div className="analytics-summary">
          <div className="summary-card">
            <div className="summary-value">{data.totalAttempt}</div>
            <div className="summary-label">Total Attempts</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{avgScore}%</div>
            <div className="summary-label">Average Score</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{completedAttempts}</div>
            <div className="summary-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="chart-title">Attempt Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent?percent * 100:0).toFixed(0)}%`}
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
          <h3 className="chart-title">Score Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'score' ? `${value}/${scoreData.find(d => d.score === value)?.maxScore || 0}` : value,
                  name === 'score' ? 'Score' : 'Max Score'
                ]}
              />
              <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maxScore" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="attempt-list">
        <h3 className="list-title">Recent Attempts</h3>
        <div className="attempt-grid">
          {data.attempt.slice(0, 6).map((attempt) => (
            <div key={attempt.id} className="attempt-card">
              <div className="attempt-header">
                <h4 className="attempt-name">{attempt.mockName}</h4>
                <span 
                  className={`status-badge status-${attempt.attemptStatus.toLowerCase().replace('_', '-')}`}
                  style={{ backgroundColor: ATTEMPT_STATUS_COLORS[attempt.attemptStatus] }}
                >
                  {ATTEMPT_STATUS_LABELS[attempt.attemptStatus]}
                </span>
              </div>
              <div className="attempt-score">
                <span className="score">{attempt.maxScore}/{attempt.totalScore}</span>
                <span className="percentage">
                  ({((attempt.maxScore/attempt.totalScore) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};