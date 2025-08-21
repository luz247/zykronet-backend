import { Module } from '@nestjs/common';
import { WebpayService } from './webpay.service';
import { WebpayController } from './webpay.controller';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from 'src/orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/common/entities/payment.entity';
import { LicenceModule } from 'src/licence/licence.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    OrdersModule,
    LicenceModule
  ],
  controllers: [WebpayController],
  providers: [WebpayService],
  exports: [WebpayService],
})
export class WebpayModule {}
