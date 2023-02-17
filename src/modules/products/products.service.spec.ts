import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from './products.service';
import { PrismaClient, Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();
    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product',
        category: 'Test Category',
        imageUrl: '',
        isVisible: true,
        price: 10,
        stock: 5,
      };
      const newProduct: Product = {
        id: 1,
        name: createProductDto.name,
        description: createProductDto.description,
        category: createProductDto.category,
        price: createProductDto.price,
        stock: createProductDto.stock,
        isVisible: createProductDto.isVisible,
        imageUrl: createProductDto.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.product.create.mockResolvedValueOnce(newProduct);
      expect(await service.create(createProductDto)).toEqual(newProduct);
    });
  });

  describe('findAll', () => {
    const products: Product[] = [
      {
        id: 1,
        name: 'product 1',
        description: 'product 1 description',
        category: 'category 1',
        price: 10,
        stock: 10,
        isVisible: true,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'product 2',
        description: 'product 2 description',
        category: 'category 2',
        price: 20,
        stock: 20,
        isVisible: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    it('should return all products', async () => {
      prisma.product.findMany.mockResolvedValueOnce(products);
      const result = await service.findAll({
        limit: 10,
        page: 1,
      });
      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(result.items).toEqual(products);
    });
  });

  describe('findOne', () => {
    const product: Product = {
      id: 1,
      name: 'product 1',
      description: 'product 1 description',
      category: 'category 1',
      price: 10,
      stock: 10,
      imageUrl: '',
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    describe('when product with ID exists', () => {
      it('should return a product by id', async () => {
        prisma.product.findUnique.mockResolvedValueOnce(product);
        const result = await service.findOne(1);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({
          where: {
            id: 1,
          },
        });
        expect(result).toEqual(product);
      });
    });
    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const productId = 1;
        prisma.product.findUnique.mockResolvedValue(null);
        try {
          await service.findOne(1);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`Product #${productId} not found`);
        }
      });
    });
  });

  describe('update', () => {
    const product: Product = {
      id: 1,
      name: 'Product 1',
      description: 'product 1 description',
      category: 'category 1',
      price: 10,
      stock: 10,
      imageUrl: '',
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updateProductDto: UpdateProductDto = {
      name: 'Test Product',
      description: 'This is a test product',
      category: 'Test Category',
      imageUrl: '',
      isVisible: true,
      price: 10,
      stock: 5,
    };
    const updatedProduct: Product = {
      id: 1,
      name: 'Test Product',
      description: 'This is a test product',
      category: 'Test Category',
      imageUrl: '',
      isVisible: true,
      price: 10,
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    describe('when product with ID exists', () => {
      it('should update a product by id', async () => {
        prisma.product.findUnique.mockResolvedValueOnce(product);
        prisma.product.update.mockResolvedValue(updatedProduct);
        const result = await service.update(1, updateProductDto);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({
          where: {
            id: 1,
          },
        });
        expect(result).toEqual(updatedProduct);
      });
    });
    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const productId = 1;
        prisma.product.findUnique.mockResolvedValue(null);
        try {
          await service.update(1, updateProductDto);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`Product #${productId} not found`);
        }
      });
    });
  });

  describe('remove', () => {
    const product: Product = {
      id: 1,
      name: 'Product 1',
      description: 'product 1 description',
      category: 'category 1',
      price: 10,
      stock: 10,
      imageUrl: '',
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    describe('when product with ID exists', () => {
      it('should delete a product by id', async () => {
        prisma.product.findUnique.mockResolvedValueOnce(product);
        prisma.product.delete.mockResolvedValueOnce(product);
        const result = await service.remove(1);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({
          where: {
            id: 1,
          },
        });
        expect(result).toEqual(result);
      });
    });
    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const productId = 1;
        prisma.product.findUnique.mockResolvedValue(null);
        try {
          await service.remove(1);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`Product #${productId} not found`);
        }
      });
    });
  });

  describe('findOneAndCheckAvailability', () => {
    const product: Product = {
      id: 1,
      name: 'Product 1',
      description: 'product 1 description',
      category: 'category 1',
      price: 10,
      stock: 10,
      imageUrl: '',
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    describe('when the product does not exist', () => {
      it('should throw the "NotFoundException"', async () => {
        prisma.product.findUnique.mockResolvedValue(null);
        try {
          await service.findOneAndCheckAvailability(product.id, 5);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`Product #${product.id} not found`);
        }
      });
    });
    describe('when the product exists but is not visible', () => {
      it('should throw the "NotFoundException"', async () => {
        prisma.product.findUnique.mockResolvedValue({
          ...product,
          isVisible: false,
        });
        try {
          await service.findOneAndCheckAvailability(product.id, 5);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`Product #${product.id} not found`);
        }
      });
    });
    describe('when the product exists, is visible, has stock, and quantity is less than stock', () => {
      it('should return the product', async () => {
        prisma.product.findUnique.mockResolvedValue(product);
        const result = await service.findOneAndCheckAvailability(product.id, 5);
        expect(prisma.product.findUnique).toHaveBeenCalled();
        expect(result).toEqual(result);
      });
    });
    describe('when the product exists, is visible, has stock but the quantity is less than stock', () => {
      it('should throw the "BadRequestException"', async () => {
        prisma.product.findUnique.mockResolvedValue(product);
        try {
          await service.findOneAndCheckAvailability(product.id, 50);
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toEqual(
            `Invalid quantity, not enough stock for Product #${product.id}`,
          );
        }
      });
    });
    describe('when the product exists, is visible but stock is equal to 0', () => {
      it('should throw the "BadRequestException"', async () => {
        prisma.product.findUnique.mockResolvedValue({
          ...product,
          stock: 0,
        });
        try {
          await service.findOneAndCheckAvailability(product.id, 50);
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toEqual(`Product #${product.id} is out of stock`);
        }
      });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
