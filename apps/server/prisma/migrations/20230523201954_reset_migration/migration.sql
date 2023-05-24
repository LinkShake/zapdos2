/*
  Warnings:

  - You are about to drop the column `from` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_chatId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "from",
DROP COLUMN "to";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "senderId",
ALTER COLUMN "chatId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_chatId_key" ON "Notification"("chatId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
