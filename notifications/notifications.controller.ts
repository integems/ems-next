import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Delete,
  Param,
  Query,
  Patch,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import {
  SendNotificationDto,
  BulkNotificationDto,
  PreOrderNotificationDto,
  OrderNotificationDto,
  NotificationLogResponseDto,
  DeleteNotificationLogDto,
  CreateNotificationDetailDto,
  NotificationDetailResponseDto,
  UpdateNotificationLogDto,
} from "./dtos/notifications.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AdminGuard } from "src/common/guards/admin.guard";
import { ICurrentUser } from "src/common/constants";
import { AuthenticatedGuard } from "src/common/guards/authenticated.guard";

/**
 * Controller for handling notification-related HTTP requests.
 */
@ApiTags("Notification")
@Controller("notifications")
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiExtraModels(
  SendNotificationDto,
  BulkNotificationDto,
  PreOrderNotificationDto,
  OrderNotificationDto,
  NotificationLogResponseDto,
  DeleteNotificationLogDto,
  CreateNotificationDetailDto,
  NotificationDetailResponseDto,
)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  /**
   * @method createNotificationDetail
   * @description Creates or updates a notification detail for a user.
   * @param createNotificationDetailDto - The DTO containing notification detail data.
   * @param createNotificationDetailDto.token - The push notification token.
   * @param createNotificationDetailDto.tokenType - The type of notification (Mobile or Web).
   * @param createNotificationDetailDto.deviceName - The name of the device.
   * @param createNotificationDetailDto.deviceId - The ID of the device.
   * @param currentUser - The authenticated user performing the action.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ message: string; data: any }>} The created or updated notification detail.
   * @throws {HttpException} If the request is unauthorized or database operation fails.
   */
  @Post("details")
  @ApiOperation({ summary: "Create a new notification detail" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Notification detail created",
    type: NotificationDetailResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  async createNotificationDetail(
    @Body() createNotificationDetailDto: CreateNotificationDetailDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.notificationService.createNotificationDetail(
      createNotificationDetailDto,
      currentUser,
    );
  }

  /**
   * @method findNotificationDetail
   * @description Retrieves notification details for a specific user.
   * @param userId - The ID of the user whose notification details are requested.
   * @returns {Promise<any>} The notification detail data.
   * @throws {HttpException} If the request is unauthorized or the notification detail is not found.
   */
  @Get("details/user/:userId")
  @ApiOperation({ summary: "Get notification detail for a user" })
  @ApiResponse({
    status: 200,
    description: "Notification detail data",
    type: NotificationDetailResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification detail not found",
  })
  async findNotificationDetail(@Param("userId") userId: string) {
    return this.notificationService.findNotificationDetail(userId);
  }

  /**
   * @method findAll
   * @description Retrieves all notification logs with pagination and optional search.
   * @param page - The page number (default: 1).
   * @param limit - The number of records per page (default: 20).
   * @param search - Optional search term to filter notifications by title or message.
   * @returns {Promise<any>} Paginated list of notification logs.
   * @throws {HttpException} If the request is unauthorized or the database query fails.
   */
  @Get("logs")
  @ApiOperation({ summary: "Get all notification logs" })
  @ApiQuery({ name: "page", type: "number", example: 1, required: false })
  @ApiQuery({ name: "limit", type: "number", example: 20, required: false })
  @ApiQuery({
    name: "search",
    type: "string",
    required: false,
    description: "Search term to filter notifications by title or message",
  })
  @ApiResponse({
    status: 200,
    description: "List of notification logs",
    type: [NotificationLogResponseDto],
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("search") search?: string,
  ) {
    return this.notificationService.findAll(page, limit, search);
  }

  /**
   * @method findAllByUser
   * @description Retrieves all notification logs for a specific user with pagination and optional search.
   * @param userId - The ID of the user whose notification logs are requested.
   * @param page - The page number (default: 1).
   * @param limit - The number of records per page (default: 20).
   * @param search - Optional search term to filter notifications by title or message.
   * @returns {Promise<any>} Paginated list of notification logs for the user.
   * @throws {HttpException} If the request is unauthorized or the database query fails.
   */
  @Get("logs/user/:userId")
  @ApiOperation({ summary: "Get all notification logs for a user" })
  @ApiQuery({ name: "page", type: "number", example: 1, required: false })
  @ApiQuery({ name: "limit", type: "number", example: 20, required: false })
  @ApiQuery({
    name: "search",
    type: "string",
    required: false,
    description: "Search term to filter notifications by title or message",
  })
  @ApiResponse({
    status: 200,
    description: "List of notification logs for a user",
    type: [NotificationLogResponseDto],
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  async findAllByUser(
    @Param("userId") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("search") search?: string,
  ) {
    return this.notificationService.findAllByUser(userId, page, limit, search);
  }

  /**
   * @method remove
   * @description Deletes a notification log by its ID.
   * @param notificationId - The ID of the notification log to delete.
   * @returns {Promise<{ message: string }>} A success message upon deletion.
   * @throws {HttpException} If the request is unauthorized or the notification log is not found.
   */
  @Delete("/:notificationId/logs")
  @ApiOperation({ summary: "Delete a notification log" })
  @ApiResponse({
    status: HttpStatus.NON_AUTHORITATIVE_INFORMATION,
    description: "Notification log deleted",
    type: DeleteNotificationLogDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification log not found",
  })
  async remove(@Param("notificationId") notificationId: string) {
    return this.notificationService.remove(notificationId);
  }

  /**
   * @method updateOpenedStatus
   * @description Updates the opened status of a notification log.
   * @param notificationId - The ID of the notification log.
   * @param updateNotificationLogDto - The DTO containing the new opened status.
   * @param updateNotificationLogDto.opened - The new opened status (true or false).
   * @param currentUser - The authenticated user performing the action.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ message: string; data: any }>} The updated notification log.
   * @throws {HttpException} If the request is unauthorized or the notification log is not found.
   */
  @Patch(":notificationId/logs/opened")
  @ApiOperation({ summary: "Update notification log opened status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification log opened status updated",
    type: NotificationLogResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification log not found",
  })
  async updateOpenedStatus(
    @Param("notificationId") notificationId: string,
    @Body() updateNotificationLogDto: UpdateNotificationLogDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.notificationService.updateOpenedStatus(
      notificationId,
      updateNotificationLogDto.opened,
      currentUser,
    );
  }

  /**
   * @method sendNotification
   * @description Sends a single push notification to a user (admin only).
   * @param sendNotificationDto - The DTO containing notification data.
   * @param sendNotificationDto.token - The push notification token.
   * @param sendNotificationDto.tokenType - The type of notification (Mobile or Web).
   * @param sendNotificationDto.title - The title of the notification.
   * @param sendNotificationDto.body - The body content of the notification.
   * @param sendNotificationDto.recipientUserId - The ID of the recipient user.
   * @param sendNotificationDto.type - The type of notification (e.g., User, Business).
   * @param sendNotificationDto.url - Optional URL for the notification.
   * @param currentUser - The authenticated admin user.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ success: boolean; message: string }>} The notification result.
   * @throws {HttpException} If the request is unauthorized or input data is invalid.
   */
  @UseGuards(AdminGuard)
  @Post("send")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send a single push notification" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification sent successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.notificationService.sendNotification(
      {
        token: sendNotificationDto.token,
        tokenType: sendNotificationDto.tokenType,
      },
      sendNotificationDto.title,
      sendNotificationDto.body,
      {
        senderName: currentUser.fullName,
        sendUserId: currentUser.userId,
        recipientUserId: sendNotificationDto.recipientUserId,
        type: sendNotificationDto.type,
        url: sendNotificationDto.url,
      },
    );
  }

  /**
   * @method sendBulkNotification
   * @description Sends bulk push notifications to multiple users (admin only).
   * @param bulkNotificationDto - The DTO containing an array of notification messages.
   * @param bulkNotificationDto.messages - Array of notification messages.
   * @param currentUser - The authenticated admin user.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ success: boolean; message: string; results?: any[] }>} The bulk notification result.
   * @throws {HttpException} If the request is unauthorized or input data is invalid.
   */
  @UseGuards(AdminGuard)
  @Post("bulk")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send bulk push notifications" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Bulk notifications sent successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  async sendBulkNotification(
    @Body() bulkNotificationDto: BulkNotificationDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.notificationService.sendBulkNotification(
      bulkNotificationDto.messages.map((msg) => ({
        token: msg.token,
        title: msg.title,
        body: msg.body,
        url: msg.url,
        recipientUserId: msg.recipientUserId,
      })),
      {
        senderName: currentUser.fullName,
        sendUserId: currentUser.userId,
      },
    );
  }

  /**
   * @method sendPreOrderNotification
   * @description Sends a pre-order notification based on the status.
   * @param preOrderNotificationDto - The DTO containing pre-order notification data.
   * @param preOrderNotificationDto.preOrderId - The ID of the pre-order.
   * @param preOrderNotificationDto.productId - The ID of the product.
   * @param preOrderNotificationDto.businessId - The ID of the business.
   * @param preOrderNotificationDto.recipientUserId - The ID of the recipient user.
   * @param preOrderNotificationDto.status - The status of the pre-order (requested, pending, approved, declined).
   * @param currentUser - The authenticated user.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ success: boolean; message: string }>} The notification result.
   * @throws {HttpException} If the request is unauthorized or input data is invalid.
   */
  @Post("preorder")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send pre-order notification" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Pre-order notification sent successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  async sendPreOrderNotification(
    @Body() preOrderNotificationDto: PreOrderNotificationDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    switch (preOrderNotificationDto.status) {
      case "requested":
        return this.notificationService.sendPreOrderRequestedNotification(
          preOrderNotificationDto.preOrderId,
          preOrderNotificationDto.productId,
          preOrderNotificationDto.businessId,
          {
            senderName: currentUser.fullName,
            sendUserId: currentUser.userId,
            recipientUserId: preOrderNotificationDto.recipientUserId,
          },
        );
      case "pending":
        return this.notificationService.sendPreOrderPendingNotification(
          preOrderNotificationDto.preOrderId,
          preOrderNotificationDto.productId,
          preOrderNotificationDto.businessId,
          {
            senderName: currentUser.fullName,
            sendUserId: currentUser.userId,
            recipientUserId: preOrderNotificationDto.recipientUserId,
          },
        );
      case "approved":
        return this.notificationService.sendPreOrderApprovedNotification(
          preOrderNotificationDto.preOrderId,
          preOrderNotificationDto.productId,
          preOrderNotificationDto.businessId,
          {
            senderName: currentUser.fullName,
            sendUserId: currentUser.userId,
            recipientUserId: preOrderNotificationDto.recipientUserId,
          },
        );
      case "declined":
        return this.notificationService.sendPreOrderDeclinedNotification(
          preOrderNotificationDto.preOrderId,
          preOrderNotificationDto.productId,
          preOrderNotificationDto.businessId,
          {
            senderName: currentUser.fullName,
            sendUserId: currentUser.userId,
            recipientUserId: preOrderNotificationDto.recipientUserId,
          },
        );
      default:
        return { success: false, message: "Invalid pre-order status" };
    }
  }

  /**
   * @method sendOrderNotification
   * @description Sends an order notification for an approved order.
   * @param orderNotificationDto - The DTO containing order notification data.
   * @param orderNotificationDto.orderId - The ID of the order.
   * @param orderNotificationDto.businessId - The ID of the business.
   * @param orderNotificationDto.recipientUserId - The ID of the recipient user.
   * @param orderNotificationDto.status - The status of the order (approved).
   * @param currentUser - The authenticated user.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ success: boolean; message: string }>} The notification result.
   * @throws {HttpException} If the request is unauthorized or input data is invalid.
   */
  @Post("order")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send order notification" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Order notification sent successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  async sendOrderNotification(
    @Body() orderNotificationDto: OrderNotificationDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    if (orderNotificationDto.status === "approved") {
      return this.notificationService.sendOrderApprovedNotification(
        orderNotificationDto.orderId,
        orderNotificationDto.businessId,
        {
          senderName: currentUser.fullName,
          sendUserId: currentUser.userId,
          recipientUserId: orderNotificationDto.recipientUserId,
        },
      );
    }
    return { success: false, message: "Invalid order status" };
  }
}
