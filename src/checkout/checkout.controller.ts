// src/checkout/checkout.controller.ts
import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { WebpayService } from '../webpay/webpay.service';
import { PaymentsService } from '../payments/payments.service';
import { ConfigService } from '@nestjs/config';

class CheckoutDto {}

@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly cart: CartService,
    private readonly orders: OrdersService,
    private readonly payments: PaymentsService,
    private readonly webpay: WebpayService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  async start(@Req() req: any, @Body() _b: CheckoutDto) {
    const userId = new Types.ObjectId(req.user.id);
    const cart = await this.cart.getOrCreate(userId);
    if (!cart.products?.length) throw new BadRequestException('Carrito vacío');

    const items = cart.products.map((i: any) => ({
      productId: new Types.ObjectId(i.productId),
      title: i.title ?? '',
      version: i.version ?? '1.0.0',
      price: i.priceAtAdd ?? i.price,
      quantity: i.quantity,
    }));

    // 1) Reusar o crear Order pending (TTL 30min)
    const order = await this.orders.getOrReusePending(userId, items, cart.total, cart.currency);

    // 2) Crear intento de Payment para la misma Order
    const { attempt } = await this.payments.createAttempt(order._id, order.total, order.currency);

    // 3) Cada intento tiene su buyOrder única (≤ 26 caracteres)
    const buyOrder = `${order.orderNumber}-${String(attempt).padStart(2,'0')}`.slice(0, 26);
    const returnUrl = `${this.config.get<string>('BASE_URL_API')}`;
    const { url, token } = await this.webpay.createTransaction({
      buyOrder,
      sessionId: userId.toString().slice(-12),
      amount: order.total,
      returnUrl,
    });

    // 4) Guardar token_ws/buyOrder en ese intento
    await this.payments.attachWebpayToken(order._id, attempt, token, buyOrder);

    return { redirectUrl: `${url}?token_ws=${token}`, token, orderNumber: order.orderNumber };
  }
}
