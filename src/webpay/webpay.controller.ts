import { Controller, Get, Post, Query, Res, Req } from '@nestjs/common';
import { WebpayService } from './webpay.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from 'src/orders/orders.service';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LicensesService } from 'src/licence/licence.service';
import { Payment, PaymentDocument } from 'src/common/entities/payment.entity';

@Controller('webpay')
export class WebpayController {
  constructor(
    private readonly config: ConfigService,
    private readonly webpay: WebpayService,
    private readonly orders: OrdersService,
    private readonly licenses: LicensesService,
    @InjectModel(Payment.name) private payments: Model<PaymentDocument>,
  ) {}

  // Webpay puede volver por POST o GET
  @Post('return')
  async onReturnPost(@Req() req: any, @Res() res: any) {
    return this.handleReturn(res, (req.body as any)?.token_ws, (req.body as any)?.TBK_TOKEN);
  }

  @Get('return')
  async onReturnGet(@Query('token_ws') token_ws: string, @Query('TBK_TOKEN') tbk_token: string, @Res() res: any) {
    return this.handleReturn(res, token_ws, tbk_token);
  }

  private async handleReturn(@Res() res: any, token_ws?: string, tbk_token?: string) {
    const successUrl = this.config.get('FRONTEND_SUCCESS_URL');
    const failureUrl = this.config.get('FRONTEND_FAILURE_URL');

    try {
      // Usuario abortó en portal de pago
      if (tbk_token && !token_ws) {
        return res.redirect(`${failureUrl}?reason=aborted`);
      }
      if (!token_ws) {
        return res.redirect(`${failureUrl}?reason=missing_token`);
      }

      // Idempotencia: si ya quedó authorized, no re-commit
      const existing = await this.payments.findOne({ provider: 'webpay', providerToken: token_ws }).lean();
      if (existing?.status === 'authorized') {
        return res.redirect(`${successUrl}?order=${encodeURIComponent(existing.buyOrder ?? '')}`);
      }

      // Commit a Webpay
      const result = await this.webpay.commitTransaction(token_ws);
      const authorized = (result as any).response_code === 0 || (result as any).status === 'AUTHORIZED';

      // Vincular Payment y actualizar
      const payment = await this.payments.findOne({ provider: 'webpay', providerToken: token_ws });
      if (!payment) return res.redirect(`${failureUrl}?reason=no_payment_record`);

      payment.authorizationCode  = (result as any).authorization_code;
      payment.installmentsNumber = (result as any).installments_number ?? 0;
      payment.paymentTypeCode    = (result as any).payment_type_code;
      payment.transactionDate    = (result as any).transaction_date;
      payment.responseCode       = (result as any).response_code;
      payment.buyOrder           = (result as any).buy_order;
      payment.raw                = result;
      payment.status             = authorized ? 'authorized' : 'failed';
      await payment.save();

      if (authorized) {
        // Orden → paid
        await this.orders.markPaid(payment.orderId as unknown as Types.ObjectId);

        // Generar licencias por ítem
        const order = await this.orders.findByOrderNumber((result as any).buy_order);
        if (order) {
          for (const it of (order as any).items) {
            await this.licenses.createForOrder(order.userId as any, it.productId as any, order._id as any);
          }
        }
        return res.redirect(`${successUrl}?order=${encodeURIComponent((result as any).buy_order)}`);
      }

      return res.redirect(`${failureUrl}?reason=${encodeURIComponent((result as any).status ?? 'failed')}`);
    } catch (e) {
      return res.redirect(`${failureUrl}?reason=${encodeURIComponent((e as Error).message)}`);
    }
  }
}
