import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';

import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartDeleteItemDto, CartItemDto } from './dto/item-cart.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get('allCart')
  shoppingCart(@Req() req: any) {
    
    return this.cart.getOrCreate(new Types.ObjectId(req.user.id));
  }

  @Post('add')
  add(@Req() req: any, @Body() item: CartItemDto) {
    return this.cart.addItem(
      new Types.ObjectId(req.user.id),
      new Types.ObjectId(item.productId),
      item.quantity,
    );
  }

  @Delete('remove')
  remove(@Req() req: any, @Body() b: CartDeleteItemDto) {
    return this.cart.removeItem(new Types.ObjectId(req.user.id), new Types.ObjectId(b.productId));
  }

  @Delete('clear')
  clear(@Req() req: any) {
    return this.cart.clear(new Types.ObjectId(req.user.id));
  }
}
