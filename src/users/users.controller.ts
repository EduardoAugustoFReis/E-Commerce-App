import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // FIND ALL
  @Get()
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  // FIND ONE
  @Get(':id')
  findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUserById(id);
  }

  // DELETE
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.usersService.deleteUser(id, req.user.userId);
  }

  // UPDATE
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user.userId);
  }
}
