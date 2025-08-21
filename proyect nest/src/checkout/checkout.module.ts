import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { WebpayModule } from 'src/webpay/webpay.module';
import { PaymentSchema, Payment } from 'src/common/entities/payment.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Payment.name, schema:PaymentSchema}]),
    OrdersModule,
    CartModule,
    WebpayModule
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
