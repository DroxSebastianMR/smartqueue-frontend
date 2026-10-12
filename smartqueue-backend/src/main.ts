import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";

import { AppModule } from "@/app.module";
import { GlobalExceptionFilter } from "@/common/filters/global-exception.filter";
import { setupSwagger } from "@/config/swagger/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix("api/v1");
  app.use(helmet());
  app.enableCors({
    origin: (
      config.get<string>("FRONTEND_ORIGIN") ??
      "http://localhost:5173,http://localhost:5174"
    )
      .split(",")
      .map((origin) => origin.trim()),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  const port = Number(config.get("PORT", 3000));
  setupSwagger(app);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
