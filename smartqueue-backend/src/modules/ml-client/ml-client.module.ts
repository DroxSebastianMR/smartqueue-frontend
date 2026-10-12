import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { HttpMlClientService } from '@/modules/ml-client/infrastructure/http-ml-client.service';

@Module({ imports: [HttpModule], providers: [HttpMlClientService], exports: [HttpMlClientService] })
export class MlClientModule {}

