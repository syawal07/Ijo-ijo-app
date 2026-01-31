import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Item } from './item.schema';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class GameScores {
  @Prop({ default: 0 })
  catcher: number;

  @Prop({ default: 0 })
  snake: number;

  @Prop({ default: 0 })
  quiz: number;
}

@Schema({ timestamps: true })
export class User {
  // MARKER: Auth Data
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  schoolClass: string;

  // --- UPDATE BARU: ROLE & STATUS ---
  @Prop({ default: 'student', enum: ['student', 'admin'] })
  role: string;

  @Prop({ default: 'pending', enum: ['pending', 'active', 'rejected'] })
  status: string;
  // ----------------------------------

  // MARKER: Game Economy
  @Prop({ default: 0 })
  ijoCoins: number;

  @Prop({ default: 0 })
  gameTickets: number;

  // MARKER: Game Scores (Replaces highScore)
  @Prop({
    type: GameScores,
    default: () => ({ catcher: 0, snake: 0, quiz: 0 }),
  })
  gameScores: GameScores;

  @Prop({ default: 0 })
  totalScore: number;

  // MARKER: Relations
  @Prop({ type: Types.ObjectId, ref: 'Item' })
  activeItem: Item;

  // MARKER: Settings
  @Prop({ default: 'id' })
  language: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
