
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { License, LicenseDocument } from 'src/common/entities/license.entity';

@Injectable()
export class LicensesService {
  constructor(@InjectModel(License.name) private model: Model<LicenseDocument>) {}

  async createForOrder(userId: Types.ObjectId, productId: Types.ObjectId, orderId: Types.ObjectId) {
    const licenseKey = `LIC-${randomUUID().toUpperCase()}`;
    return this.model.create({
      orderId, userId, productId, licenseKey, type: 'single', status: 'active'
    });
  }
}
