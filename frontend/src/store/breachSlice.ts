// src/store/breachSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Types
export interface SearchFilter {
  id: string;
  tags:string[];
  type:
    | "domain"
    | "ip"
    | "application"
    | "port"
    | "path"
    | "login_type"
    | "status"
    | "tag";
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
  tags: string[];
  title: string | null;
  is_resolved: boolean;
  is_accessible: boolean;
  has_login_form: boolean;
  login_form_type: "basic" | "captcha" | "otp" | "other" | null;
  web_application: string | null;
  is_parked: boolean;
  is_breached: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  totalBreaches: number;
  resolvedBreaches: number;
  activeVulnerabilities: number;
  highRiskCount: number;
  applicationBreakdown: {
    name: string;
    value: number;
    fullMark: number;
  }[];
  timeline: {
    date: string;
    newBreaches: number;
    resolved: number;
  }[];
  loginFormDistribution: {
    basic: number;
    captcha: number;
    otp: number;
    other: number;
  };
}

interface BreachState {
  searchResults: SearchResult[];
  searchFilters: SearchFilter[];
  searchQuery: string;
  currentPage: number;
  totalResults: number;
  itemsPerPage: number;
  metrics: DashboardMetrics;
  loading: {
    search: boolean;
    metrics: boolean;
  };
  error: {
    search: string | null;
    metrics: string | null;
  };
}

const initialState: BreachState = {
  searchResults: [],
  searchFilters: [],
  searchQuery: "",
  currentPage: 1,
  totalResults: 0,
  itemsPerPage: 20,
  metrics: {
    totalBreaches: 0,
    resolvedBreaches: 0,
    activeVulnerabilities: 0,
    highRiskCount: 0,
    applicationBreakdown: [],
    timeline: [],
    loginFormDistribution: {
      basic: 0,
      captcha: 0,
      otp: 0,
      other: 0,
    },
  },
  loading: {
    search: false,
    metrics: false,
  },
  error: {
    search: null,
    metrics: null,
  },
};

// Async Thunks
export const fetchBreachMetrics = createAsyncThunk(
  "breach/fetchMetrics",
  async () => {
    const response = await fetch("/api/metrics");
    if (!response.ok) {
      throw new Error("Failed to fetch metrics");
    }
    return response.json();
  }
);

export const searchBreaches = createAsyncThunk(
  "breach/search",
  async ({
    query,
    filters,
    page,
    limit,
  }: {
    query: string;
    filters: SearchFilter[];
    page: number;
    limit: number;
  }) => {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, filters, page, limit }),
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }
    return response.json();
  }
);

const breachSlice = createSlice({
  name: "breach",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addSearchFilter: (state, action: PayloadAction<SearchFilter>) => {
      state.searchFilters.push(action.payload);
    },
    removeSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilters = state.searchFilters.filter(
        (filter) => filter.id !== action.payload
      );
    },
    clearSearchFilters: (state) => {
      state.searchFilters = [];
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Metrics
      .addCase(fetchBreachMetrics.pending, (state) => {
        state.loading.metrics = true;
        state.error.metrics = null;
      })
      .addCase(fetchBreachMetrics.fulfilled, (state, action) => {
        state.loading.metrics = false;
        state.metrics = action.payload;
      })
      .addCase(fetchBreachMetrics.rejected, (state, action) => {
        state.loading.metrics = false;
        state.error.metrics = action.error.message || "Failed to fetch metrics";
      })
      // Search
      .addCase(searchBreaches.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchBreaches.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload.results;
        state.totalResults = action.payload.total;
      })
      .addCase(searchBreaches.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.error.message || "Search failed";
      });
  },
});

export const {
  setSearchQuery,
  addSearchFilter,
  removeSearchFilter,
  clearSearchFilters,
  setCurrentPage,
  setItemsPerPage,
} = breachSlice.actions;

export default breachSlice.reducer;

// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import breachReducer from "./breachSlice";

export const store = configureStore({
  reducer: {
    breach: breachReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
