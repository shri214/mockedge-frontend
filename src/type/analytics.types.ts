// types/analytics.types.ts
export interface TestScheduledAnalyticsDto {
  id: string;
  userId: string;
  testName: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
}

export interface AttemptAnalyticsDto {
  id: string;
  userId: string;
  testScheduledId: string;
  attemptStatus: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_ATTEMPTED';
  mockName: string;
  totalScore: number;
  maxScore: number;
}

export interface TestScheduledAnalytic {
  totalTests: number;
  statusCount: Record<string, number>;
  tests: TestScheduledAnalyticsDto[];
}

export interface AttemptAnalytic {
  totalAttempt: number;
  statusCount: Record<string, number>;
  attempt: AttemptAnalyticsDto[];
}