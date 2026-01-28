import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Item } from './item.schema';

export type UserDocument = User & Document;

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
  role: string; // 'student' atau 'admin'

  @Prop({ default: 'pending', enum: ['pending', 'active', 'rejected'] })
  status: string; // User baru default-nya 'pending' (harus disetujui Admin)
  // ----------------------------------

  // MARKER: Game Economy
  @Prop({ default: 0 })
  ijoCoins: number;

  @Prop({ default: 0 })
  gameTickets: number;

  @Prop({ default: 0 })
  highScore: number;

  // MARKER: Relations
  @Prop({ type: Types.ObjectId, ref: 'Item' })
  activeItem: Item;

  // MARKER: Settings
  @Prop({ default: 'id' })
  language: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
