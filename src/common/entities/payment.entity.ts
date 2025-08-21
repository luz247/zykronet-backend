// src/entities/payment.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true }) orderId: Types.ObjectId;
  @Prop({ required: true, enum: ['webpay','stripe','paypal'] }) provider: string;

  // intento N de pago para una misma orden
  @Prop({ required: true, default: 1 }) attempt: number;

  // index para encontrar rápido por token_ws
  @Prop({ index: true }) providerToken?: string;

  @Prop() authorizationCode?: string;
  @Prop() installmentsNumber?: number;
  @Prop() amount: number;
  @Prop({ default: 'CLP' }) currency: string;

  // ⬇️ por defecto pending
  @Prop({ enum: ['pending','authorized','failed','refunded'], default: 'pending' }) status: string;

  // metadatos útiles de Webpay
  @Prop() buyOrder?: string;
  @Prop() paymentTypeCode?: string;
  @Prop() transactionDate?: string;
  @Prop() responseCode?: number;

  @Prop({ type: Object }) raw?: any;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Opcionalmente, garantiza un intento único por orden:
PaymentSchema.index({ orderId: 1, attempt: 1 }, { unique: true });
