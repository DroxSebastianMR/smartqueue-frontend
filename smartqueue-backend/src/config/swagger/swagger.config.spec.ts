import { Test } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import { createSwaggerDocument } from "@/config/swagger/swagger.config";
import { MoviesService } from "@/modules/movies/services/movies.service";
import { AdvertisementsService } from "@/modules/advertisements/services/advertisements.service";

describe("OpenAPI contract", () => {
  it("publishes typed success and error responses for auth and operations", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();
    try {
      const document = createSwaggerDocument(app);
      expect(document.servers?.[0]?.url).toBe("/");
      const login = document.paths["/api/v1/auth/login"]?.post;
      expect(login?.responses?.["200"]).toBeDefined();
      expect(login?.responses?.["400"]).toBeDefined();
      expect(login?.responses?.["401"]).toBeDefined();
      expect(login?.responses?.["429"]).toBeDefined();
      const badRequest = login?.responses?.["400"] as {
        content?: { "application/json"?: { schema?: { example?: unknown } } };
      };
      expect(
        badRequest.content?.["application/json"]?.schema?.example,
      ).toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        path: "/api/v1/auth/login",
      });
      expect(document.components?.schemas?.LoginResponseDto).toBeDefined();
      expect(
        document.paths["/api/v1/queue/entries"]?.post?.responses?.["201"],
      ).toBeDefined();
      expect(
        document.paths["/api/v1/metrics/dashboard"]?.get?.responses?.["403"],
      ).toBeDefined();
      for (const path of [
        "/api/v1/movies/upcoming",
        "/api/v1/advertisements",
      ]) {
        const parameters = document.paths[path]?.get?.parameters as Array<{
          name: string;
          in: string;
          schema?: { type?: string; maximum?: number; allOf?: unknown };
        }>;
        expect(parameters).toHaveLength(2);
        expect(parameters.map((parameter) => parameter.name)).toEqual([
          "limit",
          "page",
        ]);
        for (const parameter of parameters) {
          expect(parameter.in).toBe("query");
          expect(parameter.schema?.type).toBe("integer");
          expect(parameter.schema?.allOf).toBeUndefined();
        }
      }
      expect(
        (await app.get(MoviesService).upcoming({ page: 1, limit: 10 })).meta
          .count,
      ).toBe(10);
      expect(
        (await app.get(AdvertisementsService).list({ page: 1, limit: 5 })).meta
          .count,
      ).toBe(5);
    } finally {
      await app.close();
    }
  });
});
