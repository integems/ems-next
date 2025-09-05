import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { NotificationTokenType, NotificationType } from "src/common/constants";

export class SendNotificationDto {
  @ApiProperty({ description: "Recipient push token" })
  @IsString()
  token: string;

  @ApiProperty({ description: "The token type (mobile,web)" })
  @IsEnum(NotificationTokenType)
  tokenType: NotificationTokenType;

  @ApiProperty({ description: "Notification title" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Notification body" })
  @IsString()
  body: string;

  @ApiProperty({ description: "Optional navigation URL" })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ description: "Sender name" })
  @IsString()
  senderName: string;

  @ApiProperty({ description: "Sender user ID" })
  @IsString()
  sendUserId: string;

  @ApiProperty({ description: "Recipient user ID" })
  @IsString()
  recipientUserId: string;

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.User,
  })
  @IsEnum(NotificationType)
  type: NotificationType;
}

class BulkNotificationMessage {
  @ApiProperty({ description: "Recipient push token" })
  @IsString()
  token: string;

  @ApiProperty({ description: "Notification title" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Notification body" })
  @IsString()
  body: string;

  @ApiProperty({ description: "Optional navigation URL" })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ description: "Recipient user ID" })
  @IsString()
  recipientUserId: string;
}

export class BulkNotificationDto {
  @ApiProperty({
    description: "Array of notification messages",
    type: [BulkNotificationMessage],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkNotificationMessage)
  messages: BulkNotificationMessage[];

  @ApiProperty({ description: "Sender name" })
  @IsString()
  senderName: string;

  @ApiProperty({ description: "Sender user ID" })
  @IsString()
  sendUserId: string;
}

export class PreOrderNotificationDto {
  @ApiProperty({ description: "Pre-order ID" })
  @IsString()
  preOrderId: string;

  @ApiProperty({ description: "Product ID" })
  @IsString()
  productId: string;

  @ApiProperty({ description: "Business ID" })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: "Pre-order status",
    enum: ["requested", "pending", "approved", "declined"],
  })
  @IsString()
  status: string;

  @ApiProperty({ description: "Sender name" })
  @IsString()
  senderName: string;

  @ApiProperty({ description: "Sender user ID" })
  @IsString()
  sendUserId: string;

  @ApiProperty({ description: "Recipient user ID" })
  @IsString()
  recipientUserId: string;
}

export class OrderNotificationDto {
  @ApiProperty({ description: "Order ID" })
  @IsString()
  orderId: string;

  @ApiProperty({ description: "Business ID" })
  @IsString()
  businessId: string;

  @ApiProperty({ description: "Order status", enum: ["approved"] })
  @IsString()
  status: string;

  @ApiProperty({ description: "Sender name" })
  @IsString()
  senderName: string;

  @ApiProperty({ description: "Sender user ID" })
  @IsString()
  sendUserId: string;

  @ApiProperty({ description: "Recipient user ID" })
  @IsString()
  recipientUserId: string;
}

export class NotificationLogResponseDto {
  @ApiProperty({
    description: "Notification ID",
    example: "phi1234567890123456789",
  })
  notificationId: string;

  @ApiProperty({ description: "User ID", example: "phi1234567890123456789" })
  userId: string;

  @ApiProperty({ description: "Notification title", example: "New Message" })
  title: string;

  @ApiProperty({
    description: "Notification message",
    example: "You have a new message",
  })
  message: string;

  @ApiProperty({
    description: "Notification image",
    example: "http://example.com/image.png",
  })
  image: string;

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.User,
  })
  type: NotificationType;

  @ApiProperty({ description: "Has the notification been opened" })
  @IsBoolean()
  opened: boolean;

  @ApiProperty({
    description: "Navigation ID",
    example: "phi1234567890123456789",
  })
  navigationId: string;

  @ApiProperty({
    description: "Notification URL",
    example: "phinex://messages",
  })
  url: string;

  @ApiProperty({ description: "Created by", example: "John Doe" })
  createdBy: string;

  @ApiProperty({ description: "Created on", example: "2025-07-08T17:32:00Z" })
  createdAt: Date;

  @ApiProperty({ description: "Modified by", example: "John Doe" })
  updatedBy: string;

  @ApiProperty({
    description: "Modified on",
    example: "2025-07-08T17:32:00Z",
    nullable: true,
  })
  updatedAt: Date | null;
}

export class DeleteNotificationLogDto {
  @ApiProperty({
    description: "Message confirming the deletion of the notification log",
    example: "Notification log deleted successfully",
  })
  @IsString()
  message: string;
}

export class CreateNotificationDetailDto {
  @ApiProperty({ description: "Recipient push token" })
  @IsString()
  token: string;

  @ApiProperty({ description: "Device name" })
  @IsString()
  deviceName: string;

  @ApiProperty({ description: "The token type (mobile,web)" })
  @IsEnum(NotificationTokenType)
  tokenType: NotificationTokenType;

  @ApiProperty({ description: "Device ID" })
  @IsString()
  deviceId: string;
}

export class UpdateNotificationLogDto {
  @ApiProperty({ description: "Notification opened status", example: true })
  @IsBoolean()
  opened: boolean;
}

export class NotificationDetailResponseDto {
  @ApiProperty({
    description: "Notification Detail ID",
    example: "phi1234567890123456789",
  })
  notificationDetailId: string;

  @ApiProperty({ description: "User ID", example: "phi1234567890123456789" })
  userId: string;

  @ApiProperty({ description: "Recipient push token" })
  @IsString()
  token: string;

  @ApiProperty({ description: "Device name" })
  @IsString()
  deviceName: string;

  @ApiProperty({ description: "Device ID" })
  @IsString()
  deviceId: string;

  @ApiProperty({ description: "Created by", example: "John Doe" })
  createdBy: string;

  @ApiProperty({ description: "Created on", example: "2025-07-08T17:32:00Z" })
  createdAt: Date;

  @ApiProperty({ description: "Modified by", example: "John Doe" })
  updatedBy: string;

  @ApiProperty({
    description: "Modified on",
    example: "2025-07-08T17:32:00Z",
    nullable: true,
  })
  updatedAt: Date | null;
}
