
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebpayService } from '../webpay/webpay.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Payment, PaymentDocument } from 'src/common/entities/payment.entity';

class CheckoutDto {}

@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly cart: CartService,
    private readonly orders: OrdersService,
    private readonly webpay: WebpayService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  @Post()
  async start(@Req() req: any, @Body() _b: CheckoutDto) {
    const userId = new Types.ObjectId(req.user.id);
    const cart = await this.cart.getOrCreate(userId);
    if (!cart.products.length) throw new Error('Carrito vacío');

    const items = cart.products.map((i: any) => ({
      productId: i.productId,
      title: '',
      version: '1.0.0',
      price: i.priceAtAdd,
      quantity: i.quantity,
    }));

    const order = await this.orders.createPending(userId, items, cart.total, cart.currency);

    const returnUrl = `${process.env.BASE_URL_API}/webpay/return`;
    const tx = await this.webpay.createTransaction({
      buyOrder: order.orderNumber,
      sessionId: `sess-${Date.now()}`,
      amount: order.total,
      returnUrl,
    });

    await this.paymentModel.create({
      orderId: order._id,
      provider: 'webpay',
      providerToken: tx.token,
      amount: order.total,
      currency: order.currency,
      status: 'authorized',
    });

    return { redirectUrl: `${tx.url}?token_ws=${tx.token}` };
  }
}
