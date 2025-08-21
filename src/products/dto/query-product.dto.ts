import {
  IsBooleanString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProductDto {
  @IsOptional() @IsString() q?: string; // búsqueda por título/descr/tags
  @IsOptional() @IsString() category?: string; // id de categoría (ej: "templates")
  @IsOptional() @IsBooleanString() featured?: string; // "true"|"false"
  @IsOptional() @IsNumberString() page?: string; // 1..N
  @IsOptional() @IsNumberString() limit?: string; // por defecto 12
  @IsOptional() @IsString() sort?: string; // "price,-downloads" etc.
}
