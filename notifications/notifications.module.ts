import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { CommonModule } from "../common/common.module";
import { ConfigModule } from "src/config/config.module";
import { JwtModule } from "@nestjs/jwt";
import { oauthConfig } from "src/config/oauth.config";

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    ConfigModule,
    JwtModule.register({
      secret: oauthConfig.jwt.secret as string,
      signOptions: { expiresIn: oauthConfig.jwt.expiresIn },
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
