import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true, unique: true })
  key: string; // Misal: 'hero_section', 'tips_section', 'footer_info'

  @Prop({ type: Object, required: true })
  value: any; // Isinya bebas (JSON)
}

export const ContentSchema = SchemaFactory.createForClass(Content);
