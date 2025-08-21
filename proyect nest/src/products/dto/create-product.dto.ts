// src/products/dto/create-product.dto.ts
import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateProductDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsNumber() @Min(0) price: number;

  @IsMongoId() category: string;

  @IsString() @IsOptional() image: string;
  @IsNumber() @Min(0) @Max(5) @IsOptional() rating: number;
  @IsNumber() @Min(0) @IsOptional() downloads: number;
  @IsArray() @IsOptional() tags: string[];
  @IsBoolean() @IsOptional() featured?: boolean;

  @IsString() @IsOptional() fileUrl: string;
}
