// Shared types and utilities for Media Project Manager

export type ApiResponse<T> = {
  data: T;
  timestamp: string;
};

export type HealthStatus = {
  status: "ok" | "degraded";
  timestamp: string;
  database: "ok" | "error";
  frontend: "available" | "missing";
};
