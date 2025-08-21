// src/webpay/webpay.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, Options, WebpayPlus } from 'transbank-sdk';



@Injectable()
export class WebpayService {
  private options: Options;

  constructor(

    private readonly configService:ConfigService

  ) {
    const environment = configService.get('TB_ENV')
      ? Environment.Integration
      : Environment.Production;

    this.options = new Options(
      configService.get('TB_COMMERCE_CODE') ?? '597055555532',
      configService.get('TB_API_KEY') ?? '',
      environment,
    );
  }

  /**
   * Crea la transacción en Webpay y devuelve { url, token }
   * buyOrder: max 26 chars; sessionId: max 61 chars
   */
  async createTransaction(params: {
    buyOrder: string;
    sessionId: string;
    amount: number; // CLP
    returnUrl: string;
  }) {
    const tx = new WebpayPlus.Transaction(this.options);
    const { buyOrder, sessionId, amount, returnUrl } = params;

    // Validaciones mínimas
    if (amount <= 0) throw new Error('Monto inválido');
    if (!buyOrder) throw new Error('buyOrder requerido');

    // Llamada a Webpay
    const resp = await tx.create(buyOrder, sessionId, amount, returnUrl);
    // resp.url (form action) y resp.token
    return resp;
  }

  /** Confirma el pago (commit) usando token_ws de Transbank */
  async commitTransaction(tokenWs: string) {
    const tx = new WebpayPlus.Transaction(this.options);
    return await tx.commit(tokenWs);
  }

  /** (Opcional) Consultar estado si lo necesitas */
  async getStatus(tokenWs: string) {
    const tx = new WebpayPlus.Transaction(this.options);
    return await tx.status(tokenWs);
  }
}
