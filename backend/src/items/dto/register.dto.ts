import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  // VALIDATION: Must be valid email format
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // VALIDATION: Min 6 characters
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsString()
  schoolClass: string;
}
