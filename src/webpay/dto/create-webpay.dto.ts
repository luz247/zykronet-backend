import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { Types } from 'mongoose';

export class InitWebpayDto {
  @IsNotEmpty()
  buyOrder!: string; // id de tu orden interna (<=26 chars)

  @IsInt()
  @Min(1)
  amount!: number; // CLP

  @IsMongoId()
  productId!: Types.ObjectId;
}