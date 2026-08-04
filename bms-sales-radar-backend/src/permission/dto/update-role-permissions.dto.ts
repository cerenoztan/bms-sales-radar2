import {
  ArrayUnique,
  IsArray,
  IsInt,
} from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsInt({
    each: true,
  })
  permissionIds!: number[];
}