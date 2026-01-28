import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ItemType } from '../../schemas/item.schema';

export class CreateItemDto {
  @IsNotEmpty()
  @IsEnum(ItemType)
  type: ItemType; // MARKER: Harus salah satu dari (Tumbler, Lunchbox, dll)

  @IsNotEmpty()
  @IsString()
  name: string; // MARKER: Nama panggilan barang (misal: "Si Botol")

  @IsNotEmpty()
  @IsString()
  personality: string; // MARKER: Sifat (Ceria/Kalem/Cool)
}
