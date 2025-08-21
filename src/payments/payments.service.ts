// src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from 'src/common/entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private payments: Model<PaymentDocument>){}

  async createAttempt(orderId: Types.ObjectId, amount: number, currency: string) {
    const attempt = (await this.payments.countDocuments({ orderId })) + 1;
    const payment = await this.payments.create({
      orderId, provider: 'webpay', attempt, amount, currency, status: 'pending',
    });
    return { payment: payment.toObject(), attempt };
  }

  async attachWebpayToken(orderId: Types.ObjectId, attempt: number, token: string, buyOrder: string) {
    await this.payments.updateOne({ orderId, attempt }, { $set: { providerToken: token, buyOrder } });
  }
}
