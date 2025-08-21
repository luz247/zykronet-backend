// src/entities/payment.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;
@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true }) orderId: Types.ObjectId;
  @Prop({ required: true, enum: ['webpay','stripe','paypal'] }) provider: string;
  @Prop() providerToken?: string;
  @Prop() authorizationCode?: string;
  @Prop() installmentsNumber?: number;
  @Prop() amount: number;
  @Prop({ default: 'CLP' }) currency: string;
  @Prop({ enum: ['authorized','failed','refunded'], default: 'authorized' }) status: string;
  @Prop({ type: Object }) raw?: any;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
