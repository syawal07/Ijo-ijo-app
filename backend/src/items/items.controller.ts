import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // MARKER: Pilih Karakter (Wajib Login)
  @UseGuards(AuthGuard('jwt'))
  @Post('/choose')
  chooseStarterPack(@Request() req, @Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(req.user.userId, createItemDto);
  }

  // MARKER: Check-in Harian
  @UseGuards(AuthGuard('jwt'))
  @Post('/checkin')
  dailyCheckIn(@Request() req) {
    // PERBAIKAN DI SINI: Panggil fungsi 'checkIn' (bukan dailyCheckIn)
    return this.itemsService.checkIn(req.user.userId);
  }
}
