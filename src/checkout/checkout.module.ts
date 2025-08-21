import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';

import { WebpayModule } from 'src/webpay/webpay.module';
import { PaymentSchema, Payment } from 'src/common/entities/payment.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { CartModule } from 'src/cart/cart.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports:[
    ConfigModule,
    MongooseModule.forFeature([{name:Payment.name, schema:PaymentSchema}]),
    OrdersModule,
    CartModule,
    WebpayModule,
    PaymentsModule
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
