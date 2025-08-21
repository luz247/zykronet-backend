import { Module } from '@nestjs/common';
import { WebpayService } from './webpay.service';
import { WebpayController } from './webpay.controller';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports:[
    ConfigModule.forRoot(),
    OrdersModule


  ],
  controllers: [WebpayController],
  providers: [WebpayService],
  exports:[WebpayService]
})
export class WebpayModule {}
