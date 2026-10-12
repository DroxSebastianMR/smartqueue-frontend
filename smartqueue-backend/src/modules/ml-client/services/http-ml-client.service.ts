import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom, timeout } from "rxjs";

import type {
  PredictionRequest,
  PredictionResponse,
} from "@/modules/ml-client/types/ml-contract";

@Injectable()
export class HttpMlClientService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async predict(payload: PredictionRequest): Promise<PredictionResponse> {
    const baseUrl = this.config.get("ML_SERVICE_URL", "http://localhost:5001");
    const timeoutMs = Number(this.config.get("ML_TIMEOUT_MS", 1_000));
    const response = await firstValueFrom(
      this.http
        .post<PredictionResponse>(`${baseUrl}/predict`, payload)
        .pipe(timeout(timeoutMs)),
    );
    const result = response.data;
    if (
      result.risk_score < 0 ||
      result.risk_score > 1 ||
      result.horizon_seconds !== 30 ||
      result.schema_version !== "1.0" ||
      !["HEALTHY", "SATURATION"].includes(result.risk_class) ||
      !result.model_version
    ) {
      throw new Error("ML response violates the v1 contract");
    }
    return result;
  }
}
