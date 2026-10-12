import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  SWAGGER_AUTH_NAME,
  SWAGGER_PATHS,
} from "@/config/swagger/swagger.constants";

export function createSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Cinetrux / SmartQueue API")
    .setDescription(
      "API de cine, autenticación, cola y monitoreo. Catálogo, administración de películas, cines, salas, funciones y autenticación usan almacenamiento local de demostración; el esquema Prisma aún no está desplegado. Pago y comprobantes son contratos no operativos hasta conectar órdenes, pasarela y emisor electrónico.",
    )
    .setVersion("1.0")
    .addServer("/", "Servidor actual")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      SWAGGER_AUTH_NAME,
    )
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): void {
  const document = createSwaggerDocument(app);
  SwaggerModule.setup(SWAGGER_PATHS.ui, app, document, {
    jsonDocumentUrl: SWAGGER_PATHS.json,
    customSiteTitle: "Cinetrux API | Swagger",
    swaggerOptions: {
      displayRequestDuration: true,
      filter: true,
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });
}
