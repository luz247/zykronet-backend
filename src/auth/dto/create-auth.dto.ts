import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  empresa: string;

  @IsOptional()
  isActive: boolean;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
