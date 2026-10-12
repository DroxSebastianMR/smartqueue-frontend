export interface PredictionRequest {
  schema_version: '1.0';
  window_end: string;
  arrival_rate: number;
  arrival_trend: number;
  queue_length: number;
  active_buyers: number;
  admission_limit: number;
  latency_p95_ms: number;
  error_rate: number;
  completion_rate: number;
}

export interface PredictionResponse {
  risk_score: number;
  risk_class: 'HEALTHY' | 'SATURATION';
  horizon_seconds: 30;
  model_version: string;
}

