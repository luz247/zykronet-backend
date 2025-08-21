import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Product, ProductDocument } from 'src/common/entities/product.entity';
import {
  Category,
  CategoryDocument,
} from 'src/common/entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private catModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  create(dto: CreateCategoryDto) {
    return this.catModel.create(dto);
  }

  async findAll() {
    const category = await this.catModel
      .aggregate([
        {
          $lookup: {
            from: this.productModel.collection.name,
            let: { catId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$catId', { $toObjectId: '$category' }], // <- cast
                  },
                },
              },
            ],
            as: 'products',
          
          },
        },
        { $project: { 
          _id: 1, 
          id: 1,
          name: 1, 
          icon:1,
          count: { $size: '$products' } } },
      ])
     

      return [{ id: 'all', name: 'Todos los Productos',icon:'Globe', count: (await this.productModel.find({})).length }, ...category];
  }

  findOne(id: number) {
    return this.catModel.findById(id);
  }

  update(id, updateCartDto: UpdateCategoryDto) {
    return 'soy el update';
  }

  remove(id: number) {
    return 'remove';
  }
  // lista con conteo de productos publicados
}
