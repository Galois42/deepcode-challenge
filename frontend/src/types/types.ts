export type LoginFormType = "basic" | "captcha" | "otp" | "other";
export type FilterType =
  | "domain"
  | "ip"
  | "port"
  | "path"
  | "application"
  | "login_type"
  | "status"
  | "tag";

export interface SearchFilter {
  id: string;
  type: FilterType;
  value: string;
}

export interface SearchResult {
  id: number;
  uri: string;
  username: string;
  password: string;
  domain: string;
  ip_address: string | null;
  port: number | null;
  path: string | null;
  tags: string;
  title: string | null;
  is_resolved: boolean;
  is_accessible: boolean;
  has_login_form: boolean;
  login_form_type: LoginFormType | null;
  web_application: string | null;
  is_parked: boolean;
  is_breached: boolean;
  created_at: string;
}

export interface SearchParams {
  q?: string;
  domain?: string;
  ip?: string;
  port?: string;
  path?: string;
  application?: string;
  login_type?: string;
  status?: string;
  tag?: string;
  excludedIpRanges?: string[];
  [key: `tag_${string}`]: string | undefined;
}