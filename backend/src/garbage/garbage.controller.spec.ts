import { Test, TestingModule } from '@nestjs/testing';
import { GarbageController } from './garbage.controller';

describe('GarbageController', () => {
  let controller: GarbageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GarbageController],
    }).compile();

    controller = module.get<GarbageController>(GarbageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
