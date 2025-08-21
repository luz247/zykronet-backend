import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
export type LicenseDocument = HydratedDocument<License>;

@Schema({ timestamps: true })
export class License {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true }) orderId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) productId: Types.ObjectId;
  @Prop({ required: true, unique: true, index: true }) licenseKey: string;
  @Prop({ enum: ['single','multi','enterprise'], default: 'single' }) type: string;
  @Prop() versionGranted?: string;
  @Prop() updatesUntil?: Date;
  @Prop({ enum: ['active','revoked'], default: 'active' }) status: string;
}
export const LicenseSchema = SchemaFactory.createForClass(License);