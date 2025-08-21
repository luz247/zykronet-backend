// src/webpay/webpay.controller.ts
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { WebpayService } from './webpay.service';
import { InitWebpayDto } from './dto/create-webpay.dto';
import { ConfigService } from '@nestjs/config';

@Controller('webpay')
export class WebpayController {
  constructor(
    private readonly webpay: WebpayService,
    private readonly configService:ConfigService
    
  ) {}

  /**
   * 1) Iniciar transacción: devuelve la URL a la que debes redirigir
   * Body: { buyOrder, amount }
   */
  @Post('init')
  async init(@Body() body: InitWebpayDto) {
    // sessionId puedes usar el userId o algo único de la sesión

   
    const sessionId = `sess-${Date.now()}`;
    const returnUrl = this.configService.get('BASE_URL_API');

    // TIP: guarda la orden en BD con status "pending" aquí
    // y valida que amount == precio del producto en tu backend.
 console.log({body,sessionId, returnUrl})
    const tx = await this.webpay.createTransaction({
      buyOrder: body.buyOrder.slice(0, 26),
      sessionId: sessionId.slice(0, 61),
      amount: body.amount,
      returnUrl,
    });

    console.log(tx)

    // Para redirigir: `${tx.url}?token_ws=${tx.token}`
    return { redirectUrl: `${tx.url}?token_ws=${tx.token}`, token: tx.token };
  }

  /**
   * 2) Return URL: Transbank redirige aquí después del pago.
   * Hacemos commit y según resultado redirigimos al front.
   */
  @Get('return')
  async onReturn(@Query('token_ws') token: string, @Res() res: Response) {
    if (!token) {
      return res.redirect(`${this.configService.get('FRONTEND_FAILURE_URL')}?reason=no_token`);
    }

    try {
      const result = await this.webpay.commitTransaction(token);
      // result.status === 'AUTHORIZED' -> pago OK

      // Guarda en tu BD:
      // - marcar orden buy_order = result.buy_order como "paid"
      // - guarda authorization_code, payment_type_code, card_detail, etc.

      if (result.status === 'AUTHORIZED') {
        const params = new URLSearchParams({
          buyOrder: String(result.buy_order),
          amount: String(result.amount),
          authCode: String(result.authorization_code),
          installments: String(result.installments_number ?? 0),
        }).toString();

        return res.redirect(`${this.configService.get('FRONTEND_SUCCESS_URL')}?${params}`);
      }

      // Otros estados: FAILED, REVERSED, etc.
      const reason = encodeURIComponent(result.status ?? 'failed');
      return res.redirect(`${process.env.FRONTEND_FAILURE_URL}?reason=${reason}`);
    } catch (e) {
      return res.redirect(
        `${this.configService.get('FRONTEND_SUCCESS_URL')}?reason=${encodeURIComponent((e as Error).message)}`,
      );
    }
  }
}
