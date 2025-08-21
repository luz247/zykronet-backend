import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import {  IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsOptional()
  @IsNumber()
  readonly subtotal?: number;

  @IsOptional()
  @IsNumber()
  readonly discount?: number;

  @IsOptional()
  @IsNumber()
  readonly total?: number;

  @IsOptional()
  @IsString()
  readonly currency?: string;
}
// src/dto/update-cart.dto.ts
