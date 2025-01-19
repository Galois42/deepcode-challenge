// Base API Response Types
export interface APIStatisticsResponse {
  total_records: number;
  accessible_domains: number;
  unique_domains: number;
  login_forms: number;
  resolved_cases: number;
  is_parked: number;
  previously_breached: number;
  login_form_types: {
    basic?: number;
    captcha?: number;
    otp?: number;
    other?: number;
  };
}

// Core Metrics
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

// Chart-specific Types
export interface RiskSeverityData {
  name: string;  // 'Critical' | 'High' | 'Medium' | 'Low'
  count: number;
}

export interface BreachResolutionData {
  category: string;  // 'Resolved' | 'In Progress' | 'Pending' | 'Requires Attention'
  count: number;
}

export interface HistoricalImpactData {
  date: string;
  accountsAffected: number;
  criticalSystems: number;
  recoveryTime: number;
}

export interface AuthPatternData {
  date: string;
  attempts: number;
  successRate: number;
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

// High Risk Domain Types
export interface HighRiskDomain {
  domain: string;
  riskScore: number;
  breachCount: number;
  lastBreachDate: string;
  tags: string[];
  applicationTypes: string[];
  vulnerabilities: string[];
}

// Search Analytics Types
export interface SearchTrendData {
  timestamp: string;
  query: string;
  resultCount: number;
  filters: {
    domain?: string;
    ip?: string;
    application?: string;
    status?: string;
  };
}

// Component Props Types
export interface BreachCategoryProps {
  data: {
    loginFormDistribution: LoginFormDistribution;
    loginFormTypes?: {
      basic?: number;
      captcha?: number;
      otp?: number;
      other?: number;
    };
  };
}

export interface HighRiskDomainsProps {
  domains: HighRiskDomain[];
  onDomainClick?: (domain: HighRiskDomain) => void;
}

export interface SearchTrendsProps {
  data: SearchTrendData[];
  onTimeRangeChange?: (range: string) => void;
}

// Aggregated Dashboard Data
export interface DashboardData {
  securityMetrics: SecurityMetrics;
  riskSeverity: RiskSeverityData[];
  breachResolution: BreachResolutionData[];
  historicalImpact: HistoricalImpactData[];
  authPatterns: AuthPatternData[];
  vulnerabilityRadar: VulnerabilityRadarData[];
  loginFormDistribution: LoginFormDistribution;
  timelineData: TimelineData[];
  topApplications: TopApplication[];
  highRiskDomains: HighRiskDomain[];
  searchTrends: SearchTrendData[];
}

// Chart Component Props
export interface ChartProps<T> {
  data: T[];
  className?: string;
  onDataPointClick?: (data: T) => void;
}