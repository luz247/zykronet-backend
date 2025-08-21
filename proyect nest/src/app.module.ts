import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { WebpayModule } from './webpay/webpay.module';
import { CartModule } from './cart/cart.module';
import { UserModule } from './user/user.module';
import { CheckoutModule } from './checkout/checkout.module';
import { LicenceModule } from './licence/licence.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    WebpayModule,
    CartModule,
    UserModule,
    CheckoutModule,
    LicenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
