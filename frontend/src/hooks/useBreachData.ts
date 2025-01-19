import {
    useQuery,
    useMutation,
    UseQueryOptions,
    UseMutationOptions,
    UseMutationResult,
  } from "@tanstack/react-query";
  import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
  import type {
    SearchFilter,
    SearchResult,
    DashboardMetrics,
  } from "../store/breachSlice";
  import {
    setSearchQuery,
    setCurrentPage,
    addSearchFilter,
    removeSearchFilter,
    type RootState,
  } from "../store/breachSlice";
  
  // API types
  interface SearchParams {
    query: string;
    filters: SearchFilter[];
    page: number;
    limit: number;
  }
  
  interface SearchResponse {
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
  }
  
  // Type for the extended mutation return type
  type BreachSearchMutation = UseMutationResult<SearchResponse, Error, SearchParams> & {
    search: (params?: Partial<SearchParams>) => Promise<SearchResponse>;
    addFilter: (type: SearchFilter["type"], value: string) => void;
    removeFilter: (filterId: string) => void;
  };
  
  // Custom hooks with proper typing
  export const useBreachMetrics = (
    options?: Omit<
      UseQueryOptions<DashboardMetrics, Error>,
      "queryKey" | "queryFn"
    >
  ) => {
    return useQuery<DashboardMetrics, Error>({
      queryKey: ["breachMetrics"],
      queryFn: async () => {
        try {
          const response = await fetch("/api/metrics");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return data as DashboardMetrics;
        } catch (error) {
          console.error("Error fetching metrics:", error);
          // Mock data with proper typing
          const mockMetrics: DashboardMetrics = {
            totalBreaches: 1250,
            resolvedBreaches: 600,
            activeVulnerabilities: 180,
            highRiskCount: 325,
            applicationBreakdown: [
              { name: "WordPress", value: 450, fullMark: 500 },
              { name: "Citrix", value: 300, fullMark: 500 },
              { name: "Exchange", value: 250, fullMark: 500 },
              { name: "SharePoint", value: 150, fullMark: 500 },
              { name: "Custom", value: 100, fullMark: 500 },
            ],
            timeline: [
              { date: "2024-01", newBreaches: 120, resolved: 80 },
              { date: "2024-02", newBreaches: 150, resolved: 100 },
              { date: "2024-03", newBreaches: 90, resolved: 130 },
            ],
            loginFormDistribution: {
              basic: 400,
              captcha: 200,
              otp: 150,
              other: 50,
            },
          };
          return mockMetrics;
        }
      },
      refetchInterval: 30000,
      ...options,
    });
  };
  
  export const useBreachSearch = (
    options?: Omit<
      UseMutationOptions<SearchResponse, Error, SearchParams>,
      "mutationFn"
    >
  ): BreachSearchMutation => {
    const dispatch = useAppDispatch();
    const { searchQuery, searchFilters, currentPage, itemsPerPage } =
      useAppSelector((state: RootState) => state.breach);
  
    const mutation = useMutation<SearchResponse, Error, SearchParams>({
      mutationFn: async (params: SearchParams) => {
        try {
          const response = await fetch("/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          return data as SearchResponse;
        } catch (error) {
          console.error("Error searching breaches:", error);
          // Mock data with proper typing
          const mockResponse: SearchResponse = {
            results: [
              {
                id: 1,
                uri: "https://example.com/login",
                username: "admin",
                password: "redacted",
                domain: "example.com",
                ip_address: "192.168.1.1",
                port: 443,
                path: "/login",
                tags: ["critical", "unresolved", "healthcare"],
                title: "Admin Login",
                is_resolved: false,
                is_accessible: true,
                has_login_form: true,
                login_form_type: "basic",
                web_application: "WordPress",
                is_parked: false,
                is_breached: true,
                created_at: new Date().toISOString(),
              },
            ],
            total: 1,
            page: 1,
            totalPages: 1,
          };
          return mockResponse;
        }
      },
      ...options,
    });
  
    const search = async (
      params?: Partial<SearchParams>
    ): Promise<SearchResponse> => {
      const searchParams: SearchParams = {
        query: params?.query ?? searchQuery,
        filters: params?.filters ?? searchFilters,
        page: params?.page ?? currentPage,
        limit: params?.limit ?? itemsPerPage,
      };
  
      if (params?.query !== undefined) {
        dispatch(setSearchQuery(params.query));
      }
      if (params?.page !== undefined) {
        dispatch(setCurrentPage(params.page));
      }
  
      return mutation.mutateAsync(searchParams);
    };
  
    return {
      ...mutation,
      search,
      addFilter: (type: SearchFilter["type"], value: string) => {
        dispatch(addSearchFilter({ id: Date.now().toString(), type, value }));
        void search({ page: 1 });
      },
      removeFilter: (filterId: string) => {
        dispatch(removeSearchFilter(filterId));
        void search({ page: 1 });
      },
    };
  };
  
  // Pagination hook with proper typing
  interface PaginationHook {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    setPage: (page: number) => void;
  }
  
  export const usePagination = (): PaginationHook => {
    const dispatch = useAppDispatch();
    const { currentPage, totalResults, itemsPerPage } = useAppSelector(
      (state: RootState) => state.breach
    );
  
    return {
      currentPage,
      totalPages: Math.ceil(totalResults / itemsPerPage),
      itemsPerPage,
      setPage: (page: number) => dispatch(setCurrentPage(page)),
    };
  };