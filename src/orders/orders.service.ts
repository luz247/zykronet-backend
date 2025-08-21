// src/orders/orders.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from 'src/common/entities/order.entity';
import { cartFingerprint } from 'src/utils/fingerPrint'; 


@Injectable()
export class OrdersService {
  constructor(
    private readonly configService:ConfigService,
    @InjectModel(Order.name) private orders: Model<OrderDocument>
  ) {}

  private genOrderNumber(userId: Types.ObjectId) {
    return `ORD-${Date.now().toString().slice(-10)}-${userId.toString().slice(-4)}`.slice(0, 26);
  }

  async getOrReusePending(
    userId: Types.ObjectId,
    items: Array<{ productId: Types.ObjectId; title: string; version: string; price: number; quantity: number }>,
    total: number,
    currency = 'CLP',
  ) {
    const fp = cartFingerprint(items.map(i => ({ productId: String(i.productId), price: i.price, quantity: i.quantity })));
    const now = new Date();
    const existing = await this.orders.findOne({ userId, status: 'pending' }).sort({ createdAt: -1 });

    // si hay pendiente y no expiró y el carrito no cambió -> REUSAR
    if (existing && (!existing.expiresAt || existing.expiresAt > now) && existing.fingerprint === fp) {
      // (opcional) actualiza totales si difieren mínimamente
      if (existing.total !== total) {
        existing.total = total;
        existing.amount = items.reduce((s,i)=> s + i.price*i.quantity, 0);
        await existing.save();
      }
      return existing.toObject();
    }

    // si había pendiente pero expiró o el carrito cambió -> cancélala
    if (existing && existing.status === 'pending') {
      existing.status = 'cancelled';
      await existing.save();
    }

    // crea nueva
    const expiresAt = new Date(Date.now() + (this.configService.get<number>('PENDING_TTL_MIN')!)  * 60 * 1000);
    const order = await this.orders.create({
      orderNumber: this.genOrderNumber(userId),
      userId, items,
      amount: items.reduce((s,i)=> s + i.price*i.quantity, 0),
      currency, total,
      status: 'pending', paymentProvider: 'webpay',
      fingerprint: fp, expiresAt,
    });
    return order.toObject();
  }

  async markPaid(orderId: Types.ObjectId) {
    await this.orders.updateOne({ _id: orderId }, { $set: { status: 'paid' } });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.orders.findOne({ orderNumber }).lean();
  }
}
