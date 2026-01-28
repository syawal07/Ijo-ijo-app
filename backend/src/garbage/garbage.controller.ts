import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GarbageService } from './garbage.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('garbage')
export class GarbageController {
  constructor(private readonly garbageService: GarbageService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/scan')
  scanTrash(@Request() req, @Body('category') category: string) {
    // category dikirim dari Frontend/Postman (misal: "Plastik")
    return this.garbageService.scanTrash(req.user.userId, category);
  }
}
