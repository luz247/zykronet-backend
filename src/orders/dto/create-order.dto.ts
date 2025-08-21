// src/orders/dto/create-order.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';

class CreateOrderItemDto {
  @IsMongoId() product: string;

  @IsString() @IsNotEmpty() title: string;
  @IsOptional() @IsString() version?: string | null;

  @IsNumber() @Min(0) price: number;
  @IsNumber() @IsPositive() quantity: number;

  @IsNumber() @Min(0) subtotal: number; // = price * quantity
}

export class CreateOrderDto {
  @IsString() @IsNotEmpty()
  orderNumber: string; // ej: "ORD-000123"

  @IsMongoId()
  user: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional() @IsNumber() @Min(0)
  discountTotal?: number = 0;

  @IsOptional() @IsNumber() @Min(0)
  taxTotal?: number = 0;

  @IsNumber() @Min(0)
  grandTotal: number; // puedes calcularlo en servicio si prefieres
}
