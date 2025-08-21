import { Module } from '@nestjs/common';
import { LicensesService } from './licence.service';
import { MongooseModule } from '@nestjs/mongoose';
import { License, LicenseSchema } from 'src/common/entities/license.entity';

@Module({
  imports:[
    MongooseModule.forFeature([{name:License.name, schema:LicenseSchema}])
  ],
  controllers: [],
  providers: [LicensesService],
  exports:[LicensesService]
})
export class LicenceModule {}
