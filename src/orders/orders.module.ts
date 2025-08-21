import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/common/entities/order.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[
    ConfigModule,
    MongooseModule.forFeature([{name:Order.name, schema:OrderSchema}])
  ],
  controllers: [],
  providers: [OrdersService],
  exports:[OrdersService]
})
export class OrdersModule {}
