import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from 'src/common/entities/cart.entity';
import { Product, ProductDocument } from 'src/common/entities/product.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartItemDto } from './dto/item-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private compute(cart: CreateCartDto) {
    const subtotal = cart.products.reduce(
      (s: number, it: any) => s + it.priceAtAdd * it.quantity,
      0,
    );
    cart.subtotal = subtotal;
    cart.discount = cart.discount || 0;
    cart.total = Math.max(0, subtotal - cart.discount);
    return cart;
  }

  async getOrCreate(userId: Types.ObjectId) {
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        products: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        currency: 'CLP',
      });
    }
    return cart;
  }

  async addItem(
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    quantity: number,
  ): Promise<Cart> {
    const product = await this.productModel.findById(productId);

    if (!product || !product?.isActive)
      throw new NotFoundException('Not found product');

    const cart = await this.getOrCreate(userId);
    const idx = cart.products.findIndex(
      (i: any) => String(i.productId) === String(productId),
    );
    if (idx >= 0) {
      cart.products[idx].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity, priceAtAdd: product.price });
    }

    this.compute(cart);
    await cart.save();

    return cart;
  }

  async removeItem(userId: Types.ObjectId, productId: Types.ObjectId) {
    const cart = await this.getOrCreate(userId);
    cart.products = cart.products.filter((i: any) => String(i.productId) !== String(productId));
    this.compute(cart);
    await cart.save();
    return cart;
  }

  async clear(userId: Types.ObjectId) {
    const cart = await this.getOrCreate(userId);
    cart.products = [];
    this.compute(cart);
    await cart.save();
    return 'found';
  }
}
