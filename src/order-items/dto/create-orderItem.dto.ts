import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { OrderItemInputDto } from './orderItemInput.dto';

export class CreateOrderItemDto {
  @IsInt()
  orderId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}
