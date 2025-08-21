// src/entities/purchase.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true }) product: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true }) order: Types.ObjectId;

  @Prop() fileUrl?: string;    // o S3 key
  @Prop() licenseKey?: string; // opcional
  @Prop({ default: true }) active: boolean;
}
export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
