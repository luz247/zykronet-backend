
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from 'src/common/entities/order.entity';

function orderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth()+1).toString().padStart(2,'0');
  const d = now.getDate().toString().padStart(2,'0');
  const r = Math.floor(Math.random()*100000).toString().padStart(5,'0');
  return `ZK-${y}{m}{d}-${r}`.replace('{m}',m).replace('{d}',d);
}

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private model: Model<OrderDocument>) {}

  async createPending(userId: Types.ObjectId, items: any[], total: number, currency='CLP') {
    const ord = await this.model.create({
      orderNumber: orderNumber(),
      userId,
      items,
      amount: total,
      currency,
      total,
      status: 'pending'
    });
    return ord;
  }

  async markPaid(id: Types.ObjectId) {
    return this.model.findByIdAndUpdate(id, { status: 'paid' }, { new: true });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.model.findOne({ orderNumber });
  }
}
