-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_chatId_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "chatId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
