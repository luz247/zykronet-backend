import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true, min: 0 }) price: number;
  @Prop({ default: true }) isActive: boolean;
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop() image: string;
  @Prop({ default: 0, min: 0, max: 5 }) rating: number;
  @Prop({ default: 0 }) downloads: number;
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop({ default: false }) featured: boolean;
  @Prop() fileUrl: string;
  // <-- NUEVO
  @Prop({ type: String, default: 'v.0' })
  version?: string;
  @Prop({ default: 0 }) ratingAvg: number;
  @Prop({ default: 0 }) ratingCount: number;
  @Prop({ default: 0 }) downloadsCount: number;
  @Prop({ default: 0 }) purchasesCount: number;
  // (Opcional) útil para URLs estables
  // @Prop({ unique: true, sparse: true, index: true }) slug?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
