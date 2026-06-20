-- CreateTable
CREATE TABLE "CallSession" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "callerToken" TEXT NOT NULL,
    "receiverToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_callId_key" ON "CallSession"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_callerToken_key" ON "CallSession"("callerToken");

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_receiverToken_key" ON "CallSession"("receiverToken");

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE CASCADE;
