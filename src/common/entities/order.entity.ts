// src/orders/schemas/order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

export type OrderDocument = HydratedDocument<Order>;
@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true }) orderNumber: string;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true }) userId: Types.ObjectId;

  @Prop([{
    productId: { type: Types.ObjectId, ref: 'Product', required: true },
    title: String, version: String, price: Number,
    quantity: { type: Number, default: 1 }
  }]) items: any[];

  @Prop() amount: number;
  @Prop({ default: 'CLP' }) currency: string;
  @Prop() discount?: number;
  @Prop() tax?: number;
  @Prop() total: number;
  @Prop({ enum: ['pending','paid','failed','refunded','cancelled'], default: 'pending' }) status: string;
  @Prop({ enum: ['webpay','stripe','paypal'] }) paymentProvider?: string;
  @Prop({ type: Types.ObjectId, ref: 'Payment' }) paymentId?: Types.ObjectId;
  @Prop() providerOrderId?: string;

  // ⬇️ para reusar la misma orden si el carrito no cambió
  @Prop() fingerprint?: string;     // hash del snapshot del carrito
  @Prop() expiresAt?: Date;         // TTL para pending
}
export const OrderSchema = SchemaFactory.createForClass(Order);
