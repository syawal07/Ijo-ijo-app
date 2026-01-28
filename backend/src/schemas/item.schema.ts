import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

// MARKER: Enum Definition
export enum ItemType {
  TUMBLER = 'Tumbler',
  LUNCHBOX = 'Lunchbox',
  TOTEBAG = 'Tote Bag',
  CUTLERY = 'Cutlery Set',
  STRAW = 'Stainless Straw',
}

@Schema({ timestamps: true })
export class Item {
  // MARKER: Item Basic Info
  @Prop({ required: true, enum: ItemType })
  type: ItemType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  personality: string;

  // MARKER: Gamification Stats
  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  currentXp: number;

  @Prop({ default: 100 }) // Target XP for next level
  nextLevelXp: number;

  @Prop({ default: false })
  isLegendary: boolean;

  // MARKER: Activity Tracking
  @Prop()
  lastCheckIn: Date;

  @Prop({ default: 0 })
  streakDays: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
