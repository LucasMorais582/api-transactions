import { getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const categoryVerify = await categoriesRepository.findOne({
      where: { title },
    });

    if (categoryVerify) throw new AppError('This category already exists.');
    const category = await categoriesRepository.create({
      title,
    });

    await categoriesRepository.save(category);
    return category;
  }
}

export default CreateCategoryService;
