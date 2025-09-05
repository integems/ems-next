import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../database/drizzle/schema";
import { customAlphabet } from "nanoid";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { fromZonedTime } from "date-fns-tz";
import * as admin from "firebase-admin";

import {
  ICurrentUser,
  NotificationType,
  NotificationTokenType,
} from "src/common/constants";
import { CustomLogger } from "src/config/logger.config";
import { DatabaseErrorService } from "src/common/services/error.service";
import { CreateNotificationDetailDto } from "./dtos/notifications.dto";
import { config } from "src/config/config";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);

type SendNotificationDetail = {
  token: string;
  tokenType: NotificationTokenType;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new CustomLogger();
  private readonly expo = new Expo();

  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: NodePgDatabase<typeof schema>,
    private databaseErrorService: DatabaseErrorService,
  ) {
    // Initialize Firebase Admin SDK for Android and Web
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.getEnv("FIREBASE_PROJECT_ID") as string,
        privateKey: config.getEnv("FIREBASE_PRIVATE_KEY") as string,
        clientEmail: config.getEnv("FIREBASE_CLIENT_EMAIL") as string,
      }),
    });
  }

  /**
   * @method paginateResponse
   * @description Creates a paginated response object with metadata.
   * @param data - The array of data items to include in the response.
   * @param totalItems - The total number of items available.
   * @param page - The current page number.
   * @param limit - The number of items per page.
   * @returns The paginated response object containing data and metadata.
   */
  private paginateResponse<T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
  ) {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      metadata: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * @method saveNotification
   * @description Saves notification metadata to the notification_logs table and increments the user's unread notification count.
   * @param params - The notification parameters.
   * @param params.userId - The ID of the user receiving the notification.
   * @param params.title - The title of the notification.
   * @param params.message - The message content of the notification.
   * @param params.type - The type of notification (e.g., User, Business).
   * @param params.navigationId - The ID for navigation purposes.
   * @param params.url - The URL associated with the notification.
   * @param params.image - Optional image URL for the notification.
   * @param params.createdBy - The name of the user creating the notification.
   * @returns {Promise<void>} A promise that resolves when the notification is saved.
   * @throws {Error} If the database insertion fails.
   */
  private async saveNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: string;
    navigationId: string;
    url: string;
    image?: string;
    createdBy: string;
  }) {
    try {
      const now = fromZonedTime(new Date(), "UTC");
      await this.db.insert(schema.notificationLogs).values({
        notificationId: `phi${generateId()}`,
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type as any,
        navigationId: params.navigationId,
        url: params.url,
        image: params.image,
        opened: false,
        createdBy: params.createdBy,
        updatedBy: params.createdBy,
        createdAt: now,
        updatedAt: now,
      });

      await this.db
        .update(schema.usersStats)
        .set({
          unReadNotificationsCount: sql`${schema.usersStats.unReadNotificationsCount} + 1`,
          updatedAt: now,
          updatedBy: params.createdBy,
        })
        .where(eq(schema.usersStats.userId, params.userId));
    } catch (error) {
      this.logger.error(
        `Failed to save notification: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `Database error: Failed to save notification: ${error.message}`,
      );
    }
  }

  /**
   * @method sendNotification
   * @description Sends a single push notification to a user.
   * @param notificationDetail - The notification token and type.
   * @param notificationDetail.token - The push notification token.
   * @param notificationDetail.tokenType - The type of notification (Android, iOS, Expo, Web).
   * @param title - The title of the notification.
   * @param body - The body content of the notification.
   * @param context - Contextual information for the notification.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @param context.recipientUserId - The ID of the recipient user.
   * @param context.navigationId - Optional navigation ID.
   * @param context.logo - Optional logo URL.
   * @param context.type - The type of notification (e.g., User, Business).
   * @param context.url - Optional URL for the notification.
   * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the notification result.
   * @throws {Error} If database insertion or notification sending fails.
   */
  async sendNotification(
    notificationDetail: SendNotificationDetail,
    title: string,
    body: string,
    context: {
      senderName: string;
      sendUserId: string;
      recipientUserId: string;
      navigationId?: string;
      logo?: string;
      type: string;
      url?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Save notification to database first
      await this.saveNotification({
        userId: context.recipientUserId,
        title,
        message: body,
        type: context.type,
        image: context.logo,
        navigationId: context.navigationId || "",
        url: context.url || "phinex://notifications",
        createdBy: context.senderName,
      });

      if (notificationDetail.tokenType === NotificationTokenType.Expo) {
        if (!Expo.isExpoPushToken(notificationDetail.token)) {
          this.logger.error(
            `Invalid Expo push token: ${notificationDetail.token}`,
          );
          return {
            success: false,
            message: `Invalid Expo push token: ${notificationDetail.token}`,
          };
        }

        const message: ExpoPushMessage = {
          to: notificationDetail.token,
          sound: "default",
          title,
          body,
          data: { url: context.url || "phinex://notifications" },
        };

        const chunks = this.expo.chunkPushNotifications([message]);
        const tickets: ExpoPushTicket[] = [];

        for (const chunk of chunks) {
          try {
            const ticketChunk =
              await this.expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            this.logger.error(
              `Failed to send Expo notification: ${error.message}`,
            );
            return {
              success: false,
              message: `Failed to send Expo notification: ${error.message}`,
            };
          }
        }
        return {
          success: true,
          message: "Expo notification sent successfully",
        };
      } else if (
        notificationDetail.tokenType === NotificationTokenType.Android
      ) {
        try {
          const message: admin.messaging.Message = {
            notification: {
              title,
              body,
            },
            data: {
              url: context.url || "phinex://notifications",
            },
            token: notificationDetail.token,
          };

          await admin.messaging().send(message);
          return {
            success: true,
            message: "Android notification sent successfully via FCM",
          };
        } catch (error) {
          this.logger.error(
            `Failed to send FCM Android notification: ${error.message}`,
          );
          return {
            success: false,
            message: `Failed to send FCM Android notification: ${error.message}`,
          };
        }
      } else if (notificationDetail.tokenType === NotificationTokenType.IOS) {
        if (!Expo.isExpoPushToken(notificationDetail.token)) {
          this.logger.error(
            `Invalid Expo push token: ${notificationDetail.token}`,
          );
          return {
            success: false,
            message: `Invalid Expo push token: ${notificationDetail.token}`,
          };
        }

        const message: ExpoPushMessage = {
          to: notificationDetail.token,
          sound: "default",
          title,
          body,
          data: { url: context.url || "phinex://notifications" },
        };

        const chunks = this.expo.chunkPushNotifications([message]);
        const tickets: ExpoPushTicket[] = [];

        for (const chunk of chunks) {
          try {
            const ticketChunk =
              await this.expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            this.logger.error(
              `Failed to send Expo iOS notification: ${error.message}`,
            );
            return {
              success: false,
              message: `Failed to send Expo iOS notification: ${error.message}`,
            };
          }
        }
        return {
          success: true,
          message: "Expo iOS notification sent successfully",
        };
      } else if (notificationDetail.tokenType === NotificationTokenType.Web) {
        try {
          const message: admin.messaging.Message = {
            notification: {
              title,
              body,
            },
            data: {
              url: context.url || "phinex://notifications",
            },
            token: notificationDetail.token,
            webpush: {
              notification: {
                icon: context.logo || undefined,
              },
            },
          };

          await admin.messaging().send(message);
          return {
            success: true,
            message: "Web notification sent successfully via FCM",
          };
        } catch (error) {
          this.logger.error(
            `Failed to send FCM Web notification: ${error.message}`,
          );
          return {
            success: false,
            message: `Failed to send FCM Web notification: ${error.message}`,
          };
        }
      } else {
        this.logger.error(
          `Unknown notification token type: ${notificationDetail.tokenType}`,
        );
        return {
          success: false,
          message: `Unknown notification token type: ${notificationDetail.tokenType}`,
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @method sendBulkNotification
   * @description Sends bulk push notifications to multiple users.
   * @param messages - Array of notification messages.
   * @param messages[].token - The push notification token.
   * @param messages[].title - The title of the notification.
   * @param messages[].body - The body content of the notification.
   * @param messages[].url - Optional URL for the notification.
   * @param messages[].recipientUserId - The ID of the recipient user.
   * @param messages[].type - Optional notification type (defaults to User).
   * @param context - Contextual information for the notifications.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @returns {Promise<{ success: boolean; message: string; results?: any[] }>} A promise resolving to the bulk notification result.
   * @throws {Error} If database insertion fails.
   */
  async sendBulkNotification(
    messages: Array<{
      token: string;
      title: string;
      body: string;
      url?: string;
      recipientUserId: string;
      type?: NotificationType;
    }>,
    context: { senderName: string; sendUserId: string },
  ): Promise<{ success: boolean; message: string; results?: any[] }> {
    try {
      if (!messages?.length) {
        return {
          success: false,
          message: "No messages provided for bulk send",
        };
      }

      await Promise.allSettled(
        messages.map((msg) =>
          this.saveNotification({
            userId: msg.recipientUserId,
            title: msg.title,
            message: msg.body,
            type: msg.type || NotificationType.User,
            navigationId: "",
            url: msg.url || "phinex://notifications",
            createdBy: context.senderName,
          }),
        ),
      );

      const expoMessages: ExpoPushMessage[] = [];
      const fcmAndroidMessages: admin.messaging.Message[] = [];

      const fcmWebMessages: admin.messaging.Message[] = [];

      const results: any[] = [];

      for (const msg of messages) {
        const notificationDetail =
          await this.db.query.notificationDetails.findFirst({
            where: eq(schema.notificationDetails.userId, msg.recipientUserId),
          });

        if (!notificationDetail) {
          this.logger.error(
            `Notification detail not found for user: ${msg.recipientUserId}`,
          );
          results.push({
            success: false,
            message: `Notification detail not found for user: ${msg.recipientUserId}`,
          });
          continue;
        }

        if (notificationDetail.tokenType === NotificationTokenType.Expo) {
          if (!Expo.isExpoPushToken(notificationDetail.token)) {
            this.logger.error(
              `Invalid Expo push token: ${notificationDetail.token}`,
            );
            results.push({
              success: false,
              message: `Invalid Expo push token: ${notificationDetail.token}`,
            });
            continue;
          }
          expoMessages.push({
            to: notificationDetail.token,
            sound: "default",
            title: msg.title,
            body: msg.body,
            data: { url: msg.url || "phinex://notifications" },
          });
        } else if (
          notificationDetail.tokenType === NotificationTokenType.Android
        ) {
          fcmAndroidMessages.push({
            notification: {
              title: msg.title,
              body: msg.body,
            },
            data: {
              url: msg.url || "phinex://notifications",
            },
            token: notificationDetail.token,
          });
        } else if (notificationDetail.tokenType === NotificationTokenType.IOS) {
          if (!Expo.isExpoPushToken(notificationDetail.token)) {
            this.logger.error(
              `Invalid Expo push token: ${notificationDetail.token}`,
            );
            results.push({
              success: false,
              message: `Invalid Expo push token: ${notificationDetail.token}`,
            });
            continue;
          }
          expoMessages.push({
            to: notificationDetail.token,
            sound: "default",
            title: msg.title,
            body: msg.body,
            data: { url: msg.url || "phinex://notifications" },
          });
        } else if (notificationDetail.tokenType === NotificationTokenType.Web) {
          fcmWebMessages.push({
            notification: {
              title: msg.title,
              body: msg.body,
            },
            data: {
              url: msg.url || "phinex://notifications",
            },
            token: notificationDetail.token,
            webpush: {
              notification: {
                icon: "https://picsum.photos/200/200",
              },
            },
          });
        } else {
          this.logger.error(
            `Unknown notification token type: ${notificationDetail.tokenType}`,
          );
          results.push({
            success: false,
            message: `Unknown notification token type: ${notificationDetail.tokenType}`,
          });
        }
      }

      // Send Expo notifications
      const expoTickets: ExpoPushTicket[] = [];
      const expoChunks = this.expo.chunkPushNotifications(expoMessages);
      for (const chunk of expoChunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          expoTickets.push(...ticketChunk);
          results.push({
            success: true,
            message: `Expo notification chunk sent successfully`,
          });
        } catch (error) {
          this.logger.error(
            `Failed to send Expo notification chunk: ${error.message}`,
          );
          results.push({
            success: false,
            message: `Failed to send Expo notification chunk: ${error.message}`,
          });
        }
      }

      // Send FCM Android notifications
      const fcmAndroidResults = await Promise.allSettled(
        fcmAndroidMessages.map((msg) =>
          admin
            .messaging()
            .send(msg)
            .then(() => ({
              success: true,
              message: `FCM Android notification sent`,
            })),
        ),
      );
      results.push(
        ...fcmAndroidResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : {
                success: false,
                message: `Failed to send FCM Android notification: ${(result as any).reason.message}`,
              },
        ),
      );

      // Send FCM Web notifications
      const fcmWebResults = await Promise.allSettled(
        fcmWebMessages.map((msg) =>
          admin
            .messaging()
            .send(msg)
            .then(() => ({
              success: true,
              message: `FCM Web notification sent`,
            })),
        ),
      );
      results.push(
        ...fcmWebResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : {
                success: false,
                message: `Failed to send FCM Web notification: ${(result as any).reason.message}`,
              },
        ),
      );

      return {
        success: true,
        message: `Successfully sent ${expoMessages.length} Expo notifications, ${fcmAndroidMessages.length} FCM Android notifications, and ${fcmWebMessages.length} FCM Web notifications`,
        results,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send bulk notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @method sendPreOrderRequestedNotification
   * @description Sends a notification for a pre-order request.
   * @param preOrderId - The ID of the pre-order.
   * @param productId - The ID of the product.
   * @param businessId - The ID of the business.
   * @param context - Contextual information for the notification.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @param context.recipientUserId - The ID of the recipient user.
   * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the notification result.
   * @throws {Error} If the product, business, or database insertion fails.
   */
  async sendPreOrderRequestedNotification(
    preOrderId: string,
    productId: string,
    businessId: string,
    context: {
      senderName: string;
      sendUserId: string;
      recipientUserId: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const product = await this.db.query.products.findFirst({
        where: eq(schema.products.productId, productId),
        with: { business: true },
      });

      if (!product || !product.business) {
        return { success: false, message: "Product or business not found" };
      }

      const title = "Pre-order Request";
      const message = `The product, ${product.name}, with a cost ${product.currency || "NLe"}. ${product.price} have a new pre-order request`;
      const url = "phinex://preorder-requests/";

      const notificationDetail =
        await this.db.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, product.business.userId),
        });

      if (!notificationDetail) {
        await this.saveNotification({
          userId: product.business.userId,
          title,
          message,
          type: NotificationType.Business,
          navigationId: preOrderId,
          url,
          image: product.business.logo || undefined,
          createdBy: context.senderName,
        });
        return {
          success: false,
          message: "Notification detail not found for business user",
        };
      }

      return this.sendNotification(
        notificationDetail as SendNotificationDetail,
        title,
        message,
        {
          ...context,
          recipientUserId: product.business.userId,
          type: NotificationType.Business,
          url,
          navigationId: preOrderId,
          logo: product.business.logo || undefined,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send pre-order requested notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @method sendPreOrderPendingNotification
   * @description Sends a notification for a pre-order pending payment.
   * @param preOrderId - The ID of the pre-order.
   * @param productId - The ID of the product.
   * @param businessId - The ID of the business.
   * @param context - Contextual information for the notification.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @param context.recipientUserId - The ID of the recipient user.
   * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the notification result.
   * @throws {Error} If the product, business, or database insertion fails.
   */
  async sendPreOrderPendingNotification(
    preOrderId: string,
    productId: string,
    businessId: string,
    context: {
      senderName: string;
      sendUserId: string;
      recipientUserId: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const product = await this.db.query.products.findFirst({
        where: eq(schema.products.productId, productId),
        with: { business: true },
      });

      if (!product || !product.business) {
        throw new Error("Product or business not found");
      }

      const notificationDetail =
        await this.db.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, context.recipientUserId),
        });

      const title = "Pre-order Pending Payment";
      const message = `The product, ${product.name}, you requested for has been accepted. Make your payment and have your will be pre-ordered soonest.`;
      const url = "phinex://preorder-requests/";

      if (!notificationDetail) {
        await this.saveNotification({
          userId: context.recipientUserId,
          title,
          message,
          type: NotificationType.Business,
          navigationId: preOrderId,
          url,
          image: product.business.logo || undefined,
          createdBy: context.senderName,
        });
        return {
          success: false,
          message: "Notification detail not found for business user",
        };
      }

      return this.sendNotification(
        notificationDetail as SendNotificationDetail,
        title,
        message,
        {
          ...context,
          type: NotificationType.Business,
          url,
          navigationId: preOrderId,
          logo: product.business.logo || undefined,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send pre-order pending notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @method sendPreOrderApprovedNotification
   * @description Sends a notification for a pre-order payment approval.
   * @param preOrderId - The ID of the pre-order.
   * @param productId - The ID of the product.
   * @param businessId - The ID of the business.
   * @param context - Contextual information for the notification.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @param context.recipientUserId - The ID of the recipient user.
   * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the notification result.
   * @throws {Error} If the product, business, or database insertion fails.
   */
  async sendPreOrderApprovedNotification(
    preOrderId: string,
    productId: string,
    businessId: string,
    context: {
      senderName: string;
      sendUserId: string;
      recipientUserId: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const product = await this.db.query.products.findFirst({
        where: eq(schema.products.productId, productId),
        with: { business: true },
      });

      if (!product || !product.business) {
        throw new Error("Product or business not found");
      }

      const title = "Pre-order Payment Transaction";
      const message = `Payment for the product, ${product.name}, with a cost ${product.currency || "NLe"}. ${product.price} have been made.`;
      const url = "phinex://preorder-requests/";

      const notificationDetail =
        await this.db.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, product.business.userId),
        });

      if (!notificationDetail) {
        await this.saveNotification({
          userId: product.business.userId,
          title,
          message,
          type: NotificationType.Business,
          navigationId: preOrderId,
          url,
          image: product.business.logo || undefined,
          createdBy: context.senderName,
        });
        return {
          success: false,
          message: "Notification detail not found for business user",
        };
      }

      return this.sendNotification(
        notificationDetail as SendNotificationDetail,
        title,
        message,
        {
          ...context,
          recipientUserId: product.business.userId,
          type: NotificationType.Business,
          url,
          navigationId: preOrderId,
          logo: product.business.logo || undefined,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send pre-order approved notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @method sendPreOrderDeclinedNotification
   * @description Sends a notification for a declined pre-order request.
   * @param preOrderId - The ID of the pre-order.
   * @param productId - The ID of the product.
   * @param businessId - The ID of the business.
   * @param context - Contextual information for the notification.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @param context.recipientUserId - The ID of the recipient user.
   * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the notification result.
   * @throws {Error} If the product, business, or database insertion fails.
   */
  async sendPreOrderDeclinedNotification(
    preOrderId: string,
    productId: string,
    businessId: string,
    context: {
      senderName: string;
      sendUserId: string;
      recipientUserId: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const product = await this.db.query.products.findFirst({
        where: eq(schema.products.productId, productId),
        with: { business: true },
      });

      if (!product || !product.business) {
        throw new Error("Product or business not found");
      }

      const title = "Pre-order Request Declined";
      const message = `The product, ${product.name}, you requested for has been temporarily declined. Vendor might not be accepting any further request for this product at this time.`;
      const url = "phinex://preorder-requests/";

      const notificationDetail =
        await this.db.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, context.recipientUserId),
        });

      if (!notificationDetail) {
        await this.saveNotification({
          userId: context.recipientUserId,
          title,
          message,
          type: NotificationType.Business,
          navigationId: preOrderId,
          url,
          image: product.business.logo || undefined,
          createdBy: context.senderName,
        });
        return {
          success: false,
          message: "Notification detail not found for business user",
        };
      }

      return this.sendNotification(
        notificationDetail as SendNotificationDetail,
        title,
        message,
        {
          ...context,
          type: NotificationType.Business,
          url,
          navigationId: preOrderId,
          logo: product.business.logo || undefined,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send pre-order declined notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @method sendOrderApprovedNotification
   * @description Sends a notification for an approved order payment.
   * @param orderId - The ID of the order.
   * @param businessId - The ID of the business.
   * @param context - Contextual information for the notification.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @param context.recipientUserId - The ID of the recipient user.
   * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the notification result.
   * @throws {Error} If the business or database insertion fails.
   */
  async sendOrderApprovedNotification(
    orderId: string,
    businessId: string,
    context: {
      senderName: string;
      sendUserId: string;
      recipientUserId: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const business = await this.db.query.business.findFirst({
        where: eq(schema.business.businessId, businessId),
      });

      if (!business) {
        throw new Error("Business not found");
      }

      const title = "Order Payment Transaction";
      const message = `Payment for the products ordered from ${business.name} have been made successfully.`;
      const url = "phinex://order-requests/";

      const notificationDetail =
        await this.db.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, business.userId),
        });

      if (!notificationDetail) {
        await this.saveNotification({
          userId: business.userId,
          title,
          message,
          type: NotificationType.Business,
          navigationId: orderId,
          url,
          image: business.logo || undefined,
          createdBy: context.senderName,
        });
        return {
          success: false,
          message: "Notification details not found",
        };
      }

      return this.sendNotification(
        notificationDetail as SendNotificationDetail,
        title,
        message,
        {
          ...context,
          recipientUserId: business.userId,
          type: NotificationType.Business,
          url,
          navigationId: orderId,
          logo: business.logo || undefined,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send order approved notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @method findAllByUser
   * @description Retrieves all notification logs for a user with pagination and search.
   * @param userId - The ID of the user.
   * @param page - The page number.
   * @param limit - The number of records per page.
   * @param search - Optional search term to filter notification logs (can be a sentence or phrase).
   * @returns {Promise<any>} Paginated list of notification logs.
   * @throws {Error} If the database query fails.
   */
  async findAllByUser(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const offset = (page - 1) * limit;
      let whereClause: any = eq(schema.notificationLogs.userId, userId);

      if (search && search !== "undefined" && search.trim()) {
        // Normalize search term: trim and split into words
        const searchTerms = search
          .trim()
          .split(/\s+/)
          .filter((term) => term.length > 0);

        // Create ILIKE conditions for each term across title and message
        const searchConditions = searchTerms.map((term) =>
          or(
            ilike(schema.notificationLogs.title, `%${term}%`),
            ilike(schema.notificationLogs.message, `%${term}%`),
          ),
        );

        // Combine conditions with AND (all terms must match somewhere)
        whereClause = and(whereClause, ...searchConditions);
      }

      const [logs, count] = await Promise.all([
        this.db.query.notificationLogs.findMany({
          where: whereClause,
          limit,
          offset,
          orderBy: desc(schema.notificationLogs.createdAt),
        }),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(schema.notificationLogs)
          .where(whereClause),
      ]);

      const totalItems = Number(count[0].count);
      return this.paginateResponse(logs, totalItems, page, limit);
    } catch (error) {
      this.logger.error(
        `Error fetching notification logs: ${error.message}`,
        error.stack,
      );
      this.databaseErrorService.handleDrizzleError(
        error,
        "notification logs retrieval",
      );
    }
  }

  /**
   * @method findAll
   * @description Retrieves all notification logs with pagination and search.
   * @param page - The page number.
   * @param limit - The number of records per page.
   * @param search - Optional search term to filter notification logs (can be a sentence or phrase).
   * @returns {Promise<any>} Paginated list of notification logs.
   * @throws {Error} If the database query fails.
   */
  async findAll(page: number, limit: number, search?: string) {
    try {
      const offset = (page - 1) * limit;
      let whereClause;

      if (search && search !== "undefined" && search.trim()) {
        // Normalize search term: trim and split into words
        const searchTerms = search
          .trim()
          .split(/\s+/)
          .filter((term) => term.length > 0);

        // Create ILIKE conditions for each term across title and message
        const searchConditions = searchTerms.map((term) =>
          or(
            ilike(schema.notificationLogs.title, `%${term}%`),
            ilike(schema.notificationLogs.message, `%${term}%`),
          ),
        );

        // Combine conditions with AND (all terms must match somewhere)
        whereClause = and(or(...searchConditions));
      }

      const [logs, count] = await Promise.all([
        this.db.query.notificationLogs.findMany({
          where: whereClause,
          limit,
          offset,
          orderBy: desc(schema.notificationLogs.createdAt),
        }),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(schema.notificationLogs)
          .where(whereClause),
      ]);

      const totalItems = Number(count[0].count);
      return this.paginateResponse(logs, totalItems, page, limit);
    } catch (error) {
      this.logger.error(
        `Error fetching notification logs: ${error.message}`,
        error.stack,
      );
      this.databaseErrorService.handleDrizzleError(
        error,
        "notification logs retrieval",
      );
    }
  }

  /**
   * @method remove
   * @description Deletes a notification log by its ID.
   * @param notificationId - The ID of the notification log to delete.
   * @returns {Promise<{ message: string }>} A promise resolving to a success message.
   * @throws {NotFoundException} If the notification log is not found.
   * @throws {Error} If the database deletion fails.
   */
  async remove(notificationId: string): Promise<{ message: string }> {
    try {
      return await this.db.transaction(async (tx) => {
        const existingLog = await tx.query.notificationLogs.findFirst({
          where: eq(schema.notificationLogs.notificationId, notificationId),
        });

        if (!existingLog) {
          throw new NotFoundException("Notification log not found");
        }

        await tx
          .delete(schema.notificationLogs)
          .where(eq(schema.notificationLogs.notificationId, notificationId));

        return { message: "Notification log deleted successfully" };
      });
    } catch (error) {
      this.logger.error(
        `Error deleting notification log: ${error.message}`,
        error.stack,
      );
      this.databaseErrorService.handleDrizzleError(
        error,
        "notification log deletion",
      );
    }
  }

  /**
   * @method createNotificationDetail
   * @description Creates or updates a notification detail for a user.
   * @param createNotificationDetailDto - The notification detail creation data.
   * @param createNotificationDetailDto.token - The push notification token.
   * @param createNotificationDetailDto.tokenType - The type of notification (Android, iOS, Expo, Web).
   * @param createNotificationDetailDto.deviceName - The name of the device.
   * @param createNotificationDetailDto.deviceId - The ID of the device.
   * @param currentUser - The user performing the action.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ message: string; data: any }>} A promise resolving to the created or updated notification detail.
   * @throws {Error} If the database operation fails.
   */
  async createNotificationDetail(
    createNotificationDetailDto: CreateNotificationDetailDto,
    currentUser: ICurrentUser,
  ) {
    try {
      return await this.db.transaction(async (tx) => {
        const now = fromZonedTime(new Date(), "UTC");

        // Validate token type
        const validTokenTypes = Object.values(NotificationTokenType);
        if (!validTokenTypes.includes(createNotificationDetailDto.tokenType)) {
          throw new Error(
            `Invalid token type: ${createNotificationDetailDto.tokenType}`,
          );
        }

        // Validate tokens based on type
        if (
          createNotificationDetailDto.tokenType === NotificationTokenType.Expo
        ) {
          if (!Expo.isExpoPushToken(createNotificationDetailDto.token)) {
            throw new Error(
              `Invalid Expo push token: ${createNotificationDetailDto.token}`,
            );
          }
        }

        let notificationDetail = await tx.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, currentUser.userId),
        });

        if (!notificationDetail) {
          [notificationDetail] = await tx
            .insert(schema.notificationDetails)
            .values({
              notificationDetailId: `phi${generateId()}`,
              userId: currentUser.userId,
              token: createNotificationDetailDto.token,
              tokenType: createNotificationDetailDto.tokenType,
              deviceName: createNotificationDetailDto.deviceName,
              deviceId: createNotificationDetailDto.deviceId,
              createdBy: currentUser.fullName,
              createdAt: now,
              updatedBy: currentUser.fullName,
              updatedAt: now,
            })
            .returning();
          return {
            message: "Notification detail created successfully",
            data: notificationDetail,
          };
        }

        [notificationDetail] = await tx
          .update(schema.notificationDetails)
          .set({
            token: createNotificationDetailDto.token,
            tokenType: createNotificationDetailDto.tokenType,
            deviceName: createNotificationDetailDto.deviceName,
            deviceId: createNotificationDetailDto.deviceId,
            updatedBy: currentUser.fullName,
            updatedAt: now,
          })
          .where(eq(schema.notificationDetails.userId, currentUser.userId))
          .returning();

        return {
          message: "Notification detail updated successfully",
          data: notificationDetail,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error creating notification detail: ${error.message}`,
        error.stack,
      );
      this.databaseErrorService.handleDrizzleError(
        error,
        "notification detail creation",
      );
    }
  }

  /**
   * @method findNotificationDetail
   * @description Retrieves a single notification detail by user ID.
   * @param userId - The ID of the user.
   * @returns {Promise<any>} The notification detail data.
   * @throws {NotFoundException} If the notification detail is not found.
   * @throws {Error} If the database query fails.
   */
  async findNotificationDetail(userId: string) {
    try {
      const notificationDetail =
        await this.db.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, userId),
        });

      if (!notificationDetail) {
        throw new NotFoundException("Notification detail not found");
      }

      return notificationDetail;
    } catch (error) {
      this.logger.error(
        `Error fetching notification detail: ${error.message}`,
        error.stack,
      );
      this.databaseErrorService.handleDrizzleError(
        error,
        "notification detail retrieval",
      );
    }
  }

  /**
   * @method updateOpenedStatus
   * @description Updates the opened status of a notification log and adjusts the user's unread notification count.
   * @param notificationId - The ID of the notification log.
   * @param opened - The new opened status (true or false).
   * @param currentUser - The user performing the action.
   * @param currentUser.userId - The ID of the user.
   * @param currentUser.fullName - The full name of the user.
   * @returns {Promise<{ message: string; data: any }>} A promise resolving to the updated notification log.
   * @throws {NotFoundException} If the notification log is not found.
   * @throws {Error} If the database update fails.
   */
  async updateOpenedStatus(
    notificationId: string,
    opened: boolean,
    currentUser: ICurrentUser,
  ) {
    try {
      return await this.db.transaction(async (tx) => {
        const existingLog = await tx.query.notificationLogs.findFirst({
          where: eq(schema.notificationLogs.notificationId, notificationId),
        });

        if (!existingLog) {
          throw new NotFoundException("Notification log not found");
        }

        const now = fromZonedTime(new Date(), "UTC");
        const [updatedLog] = await tx
          .update(schema.notificationLogs)
          .set({
            opened,
            updatedBy: currentUser.fullName,
            updatedAt: now,
          })
          .where(eq(schema.notificationLogs.notificationId, notificationId))
          .returning();

        if (updatedLog && updatedLog.opened && existingLog.opened === false) {
          await tx
            .update(schema.usersStats)
            .set({
              unReadNotificationsCount: sql`${schema.usersStats.unReadNotificationsCount} - 1`,
              updatedAt: now,
              updatedBy: currentUser.fullName,
            })
            .where(eq(schema.usersStats.userId, existingLog.userId));
        }

        return {
          message: "Notification log updated successfully",
          data: updatedLog,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error updating notification log: ${error.message}`,
        error.stack,
      );
      this.databaseErrorService.handleDrizzleError(
        error,
        "notification log update",
      );
    }
  }

  /**
   * @method sendBusinessStatusUpdatedNotification
   * @description Sends a notification when a business status is updated.
   * @param businessId - The ID of the business.
   * @param newStatus - The new status of the business.
   * @param context - Contextual information for the notification.
   * @param context.senderName - The name of the sender.
   * @param context.sendUserId - The ID of the sender.
   * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the notification result.
   * @throws {Error} If the business or database insertion fails.
   */
  async sendBusinessStatusUpdatedNotification(
    businessId: string,
    newStatus: string,
    context: {
      senderName: string;
      sendUserId: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const business = await this.db.query.business.findFirst({
        where: eq(schema.business.businessId, businessId),
      });

      if (!business) {
        throw new Error("Business not found");
      }

      const title = "Business Status Update";
      const message = `Your business, ${business.name}, has been updated to ${newStatus}.`;
      const url = "phinex://profile/business";

      const notificationDetail =
        await this.db.query.notificationDetails.findFirst({
          where: eq(schema.notificationDetails.userId, business.userId),
        });

      if (!notificationDetail) {
        await this.saveNotification({
          userId: business.userId,
          title,
          message,
          type: NotificationType.Business,
          navigationId: businessId,
          url,
          image: business.logo || undefined,
          createdBy: context.senderName,
        });
        return {
          success: false,
          message: "Notification detail not found for business user",
        };
      }

      return this.sendNotification(
        notificationDetail as SendNotificationDetail,
        title,
        message,
        {
          ...context,
          recipientUserId: business.userId,
          type: NotificationType.Business,
          url,
          navigationId: businessId,
          logo: business.logo || undefined,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send business status updated notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
