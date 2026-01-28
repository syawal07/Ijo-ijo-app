import { Controller, Get, Body, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('public')
  getPublicContent() {
    return this.contentService.getPublicContent();
  }

  // Endpoint untuk Admin (Nanti dipakai di Dashboard Admin)
  @Post('update')
  update(@Body() updateContentDto: UpdateContentDto) {
    return this.contentService.updateContent(updateContentDto);
  }
}
