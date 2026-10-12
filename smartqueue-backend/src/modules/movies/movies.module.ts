import { Module } from "@nestjs/common";
import { CatalogModule } from "@/modules/catalog/catalog.module";
import { MoviesController } from "@/modules/movies/controllers/movies.controller";
import { MoviesService } from "@/modules/movies/services/movies.service";
import { AdminMoviesController } from "@/modules/movies/controllers/admin-movies.controller";
import { ManageMoviesService } from "@/modules/movies/services/manage-movies.service";
import { AuthModule } from "@/modules/auth/auth.module";

@Module({
  imports: [CatalogModule, AuthModule],
  controllers: [MoviesController, AdminMoviesController],
  providers: [MoviesService, ManageMoviesService],
})
export class MoviesModule {}
