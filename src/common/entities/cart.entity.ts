// src/entities/cart.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from './product.entity';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;
  @Prop() sessionId?: string;
  @Prop([
    {
      productId: { type: Types.ObjectId, ref: Product.name, required: true },
      quantity: { type: Number, default: 1 },
      priceAtAdd: { type: Number, required: true },
    },
  ])
  products: any[];
  @Prop({ default: 0 }) subtotal: number;
  @Prop({ default: 0 }) discount: number;
  @Prop({ default: 0 }) total: number;
  @Prop({ default: 'CLP' }) currency: string;
}
export const CartSchema = SchemaFactory.createForClass(Cart);
