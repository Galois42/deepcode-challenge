// src/types/dashboard.ts

export interface SecurityMetrics {
  total: number;
  resolved: number;
  unresolved: number;
  accessible: number;
  inaccessible: number;
  loginForms: number;
  parked: number;
  previouslyBreached: number;
}

export interface VulnerabilityRadarData {
  category: string;
  value: number;
  fullMark: number;
}

export interface LoginFormDistribution {
  basic: number;
  captcha: number;
  otp: number;
  other: number;
}

export interface TimelineData {
  date: string;
  newBreaches: number;
  resolved: number;
}

export interface TopApplication {
  name: string;
  count: number;
}

export interface DashboardData {
  securityMetrics: SecurityMetrics;
  vulnerabilityRadar: VulnerabilityRadarData[];
  loginFormDistribution: LoginFormDistribution;
  timelineData: TimelineData[];
  topApplications: TopApplication[];
}

// Extra types needed for the dashboard components
export interface CategoryData {
  name: string;
  value: number;
}

export interface HighRiskDomain {
  name: string;
  riskScore: number;
  breachCount?: number;
  lastBreachDate?: string;
  tags?: string[];
}

export interface SearchTrendData {
  hour: number;
  day: string;
  value: number;
}

export interface DailySearchData {
  [hour: number]: number;
}

export interface WeeklySearchData {
  [day: string]: DailySearchData;
}

export interface BreachCategoryProps {
  data: {
    loginFormDistribution: LoginFormDistribution;
    loginFormTypes?: {
      other: number;
    };
  };
}

export interface HighRiskDomainsProps {
  domains: HighRiskDomain[];
}

export interface SearchTrendsProps {
  data: WeeklySearchData;
}