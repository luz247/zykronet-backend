import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CartItemDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}


export class CartDeleteItemDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId;

}