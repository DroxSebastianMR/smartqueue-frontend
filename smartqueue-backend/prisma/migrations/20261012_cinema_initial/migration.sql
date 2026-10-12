-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'ADMITTED', 'RESERVED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ControlMode" AS ENUM ('FIXED', 'REACTIVE', 'PREDICTIVE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'LOCKED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'BOX_OFFICE', 'USHER', 'CINEMA_MANAGER', 'OPERATIONS_ANALYST', 'ADMIN');

-- CreateEnum
CREATE TYPE "CinemaStatus" AS ENUM ('ACTIVE', 'CLOSED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AuditoriumStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'CLOSED');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('STANDARD', 'PREMIUM', 'ACCESSIBLE', 'COMPANION');

-- CreateEnum
CREATE TYPE "MovieReleaseStatus" AS ENUM ('ANNOUNCED', 'PRESALE', 'RELEASED', 'ENDED');

-- CreateEnum
CREATE TYPE "ShowtimeStatus" AS ENUM ('SCHEDULED', 'ON_SALE', 'SOLD_OUT', 'CANCELLED', 'FINISHED');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'BLOCKED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('RESERVED', 'PAID', 'USED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BookingOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethodCode" AS ENUM ('CARD', 'PREPAID_CARD', 'YAPE', 'PAGOEFECTIVO', 'BANK_TRANSFER', 'CASH', 'CARD_TERMINAL');

-- CreateEnum
CREATE TYPE "FiscalDocumentType" AS ENUM ('BOLETA', 'FACTURA');

-- CreateEnum
CREATE TYPE "FiscalDocumentStatus" AS ENUM ('REQUESTED', 'ISSUED', 'REJECTED', 'VOIDED');

-- CreateEnum
CREATE TYPE "MoviePublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CatalogSection" AS ENUM ('NOW_PLAYING', 'UPCOMING');

-- CreateEnum
CREATE TYPE "MovieAssetKind" AS ENUM ('POSTER', 'BACKDROP', 'LOGO', 'STILL', 'TRAILER', 'TEASER');

-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('EXTERNAL', 'YOUTUBE', 'LOCAL');

-- CreateEnum
CREATE TYPE "ProjectionFormat" AS ENUM ('TWO_D', 'THREE_D', 'INFINITY_VISION');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdvertisementPlacement" AS ENUM ('HOME', 'CHECKOUT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "cinemaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cinema" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL DEFAULT 'PE',
    "region" TEXT,
    "district" TEXT,
    "address" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'America/Lima',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "CinemaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cinema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditorium" (
    "id" TEXT NOT NULL,
    "cinemaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "AuditoriumStatus" NOT NULL DEFAULT 'ACTIVE',
    "supportedFormats" "ProjectionFormat"[] DEFAULT ARRAY['TWO_D']::"ProjectionFormat"[],
    "cleanupBufferMinutes" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "Auditorium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "auditoriumId" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "type" "SeatType" NOT NULL DEFAULT 'STANDARD',
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "durationMin" INTEGER,
    "posterUrl" TEXT,
    "backdropUrl" TEXT,
    "originalLanguageCode" TEXT,
    "releaseDate" DATE,
    "ageRating" TEXT,
    "publicationStatus" "MoviePublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieRelease" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "releaseDate" DATE NOT NULL,
    "presaleStartsAt" TIMESTAMP(3),
    "status" "MovieReleaseStatus" NOT NULL DEFAULT 'ANNOUNCED',

    CONSTRAINT "MovieRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieLocalization" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,

    CONSTRAINT "MovieLocalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieGenre" (
    "movieId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "MovieGenre_pkey" PRIMARY KEY ("movieId","genreId")
);

-- CreateTable
CREATE TABLE "MovieAsset" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "kind" "MovieAssetKind" NOT NULL,
    "provider" "MediaProvider" NOT NULL DEFAULT 'EXTERNAL',
    "url" TEXT NOT NULL,
    "locale" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MovieAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieVersion" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "format" "ProjectionFormat" NOT NULL,
    "audioLanguageCode" TEXT NOT NULL,
    "subtitleLanguageCode" TEXT,
    "label" TEXT,

    CONSTRAINT "MovieVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieCatalogPlacement" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "section" "CatalogSection" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "MovieCatalogPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "movieId" TEXT,
    "title" TEXT NOT NULL,
    "logoUrl" TEXT,
    "backdropUrl" TEXT NOT NULL,
    "videoUrl" TEXT,
    "videoProvider" "MediaProvider",
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "placement" "AdvertisementPlacement" NOT NULL DEFAULT 'HOME',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Showtime" (
    "id" TEXT NOT NULL,
    "auditoriumId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "ShowtimeStatus" NOT NULL DEFAULT 'SCHEDULED',
    "movieVersionId" TEXT NOT NULL,
    "basePriceCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PEN',
    "bookingOpensAt" TIMESTAMP(3),

    CONSTRAINT "Showtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'RESERVED',
    "amountCents" INTEGER NOT NULL,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "status" "BookingOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "totalCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PEN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethodCode" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PEN',
    "provider" TEXT,
    "providerRef" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalReceipt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "FiscalDocumentType" NOT NULL,
    "status" "FiscalDocumentStatus" NOT NULL DEFAULT 'REQUESTED',
    "buyerName" TEXT NOT NULL,
    "buyerDocumentNumber" TEXT,
    "buyerEmail" TEXT NOT NULL,
    "issuerRuc" VARCHAR(11),
    "documentNumber" TEXT,
    "externalReference" TEXT,
    "subtotalCents" INTEGER,
    "taxCents" INTEGER,
    "totalCents" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PEN',
    "acceptanceCode" TEXT,
    "xmlUrl" TEXT,
    "pdfUrl" TEXT,
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "availableStock" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "participantToken" TEXT NOT NULL,
    "turnNumber" BIGINT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "admittedAt" TIMESTAMP(3),
    "accessExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReservation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "queueEntryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "queueEntryId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentRun" (
    "id" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "generatorVersion" TEXT NOT NULL,
    "controlMode" "ControlMode" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ExperimentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricWindow" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "arrivalRate" DOUBLE PRECISION NOT NULL,
    "arrivalTrend" DOUBLE PRECISION NOT NULL,
    "queueLength" INTEGER NOT NULL,
    "activeBuyers" INTEGER NOT NULL,
    "admissionLimit" INTEGER NOT NULL,
    "latencyP95Ms" DOUBLE PRECISION NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "evaluable" BOOLEAN NOT NULL DEFAULT true,
    "saturationLabel" BOOLEAN,

    CONSTRAINT "MetricWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionLog" (
    "id" TEXT NOT NULL,
    "metricWindowId" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION,
    "riskClass" TEXT,
    "horizonSeconds" INTEGER,
    "modelVersion" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseMs" INTEGER,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "appliedMode" "ControlMode" NOT NULL,
    "appliedLimit" INTEGER NOT NULL,
    "failureReason" TEXT,

    CONSTRAINT "PredictionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_cinemaId_role_idx" ON "UserRoleAssignment"("cinemaId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_role_cinemaId_key" ON "UserRoleAssignment"("userId", "role", "cinemaId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetRequest_tokenHash_key" ON "PasswordResetRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_userId_expiresAt_idx" ON "PasswordResetRequest"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cinema_slug_key" ON "Cinema"("slug");

-- CreateIndex
CREATE INDEX "Cinema_countryCode_city_status_idx" ON "Cinema"("countryCode", "city", "status");

-- CreateIndex
CREATE INDEX "Cinema_city_district_idx" ON "Cinema"("city", "district");

-- CreateIndex
CREATE UNIQUE INDEX "Auditorium_cinemaId_name_key" ON "Auditorium"("cinemaId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_auditoriumId_row_number_key" ON "Seat"("auditoriumId", "row", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_slug_key" ON "Movie"("slug");

-- CreateIndex
CREATE INDEX "Movie_publicationStatus_releaseDate_idx" ON "Movie"("publicationStatus", "releaseDate");

-- CreateIndex
CREATE INDEX "MovieRelease_countryCode_status_releaseDate_idx" ON "MovieRelease"("countryCode", "status", "releaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "MovieRelease_movieId_countryCode_key" ON "MovieRelease"("movieId", "countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "MovieLocalization_movieId_locale_key" ON "MovieLocalization"("movieId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE INDEX "MovieGenre_genreId_idx" ON "MovieGenre"("genreId");

-- CreateIndex
CREATE INDEX "MovieAsset_movieId_kind_sortOrder_idx" ON "MovieAsset"("movieId", "kind", "sortOrder");

-- CreateIndex
CREATE INDEX "MovieVersion_movieId_format_audioLanguageCode_idx" ON "MovieVersion"("movieId", "format", "audioLanguageCode");

-- CreateIndex
CREATE INDEX "MovieCatalogPlacement_section_priority_idx" ON "MovieCatalogPlacement"("section", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "MovieCatalogPlacement_movieId_section_key" ON "MovieCatalogPlacement"("movieId", "section");

-- CreateIndex
CREATE INDEX "Banner_status_priority_idx" ON "Banner"("status", "priority");

-- CreateIndex
CREATE INDEX "Banner_movieId_idx" ON "Banner"("movieId");

-- CreateIndex
CREATE INDEX "Advertisement_placement_status_priority_idx" ON "Advertisement"("placement", "status", "priority");

-- CreateIndex
CREATE INDEX "Promotion_status_startsAt_endsAt_idx" ON "Promotion"("status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Showtime_auditoriumId_startsAt_idx" ON "Showtime"("auditoriumId", "startsAt");

-- CreateIndex
CREATE INDEX "Showtime_movieVersionId_startsAt_idx" ON "Showtime"("movieVersionId", "startsAt");

-- CreateIndex
CREATE INDEX "Showtime_status_startsAt_idx" ON "Showtime"("status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_key" ON "Ticket"("code");

-- CreateIndex
CREATE INDEX "Ticket_showtimeId_seatId_status_idx" ON "Ticket"("showtimeId", "seatId", "status");

-- CreateIndex
CREATE INDEX "Ticket_userId_status_idx" ON "Ticket"("userId", "status");

-- CreateIndex
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");

-- CreateIndex
CREATE INDEX "BookingOrder_userId_status_idx" ON "BookingOrder"("userId", "status");

-- CreateIndex
CREATE INDEX "BookingOrder_showtimeId_status_expiresAt_idx" ON "BookingOrder"("showtimeId", "status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_providerRef_key" ON "PaymentAttempt"("providerRef");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_idempotencyKey_key" ON "PaymentAttempt"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentAttempt_orderId_status_idx" ON "PaymentAttempt"("orderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalReceipt_orderId_key" ON "FiscalReceipt"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalReceipt_documentNumber_key" ON "FiscalReceipt"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalReceipt_externalReference_key" ON "FiscalReceipt"("externalReference");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "QueueEntry_eventId_status_turnNumber_idx" ON "QueueEntry"("eventId", "status", "turnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_eventId_participantToken_key" ON "QueueEntry"("eventId", "participantToken");

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_eventId_turnNumber_key" ON "QueueEntry"("eventId", "turnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReservation_queueEntryId_key" ON "PurchaseReservation"("queueEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_queueEntryId_key" ON "Purchase"("queueEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_reservationId_key" ON "Purchase"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_confirmationCode_key" ON "Purchase"("confirmationCode");

-- CreateIndex
CREATE UNIQUE INDEX "MetricWindow_runId_windowEnd_key" ON "MetricWindow"("runId", "windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionLog_metricWindowId_key" ON "PredictionLog"("metricWindowId");

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditorium" ADD CONSTRAINT "Auditorium_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_auditoriumId_fkey" FOREIGN KEY ("auditoriumId") REFERENCES "Auditorium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieRelease" ADD CONSTRAINT "MovieRelease_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieLocalization" ADD CONSTRAINT "MovieLocalization_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieAsset" ADD CONSTRAINT "MovieAsset_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieVersion" ADD CONSTRAINT "MovieVersion_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieCatalogPlacement" ADD CONSTRAINT "MovieCatalogPlacement_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_movieVersionId_fkey" FOREIGN KEY ("movieVersionId") REFERENCES "MovieVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_auditoriumId_fkey" FOREIGN KEY ("auditoriumId") REFERENCES "Auditorium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BookingOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingOrder" ADD CONSTRAINT "BookingOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingOrder" ADD CONSTRAINT "BookingOrder_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BookingOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalReceipt" ADD CONSTRAINT "FiscalReceipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BookingOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReservation" ADD CONSTRAINT "PurchaseReservation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReservation" ADD CONSTRAINT "PurchaseReservation_queueEntryId_fkey" FOREIGN KEY ("queueEntryId") REFERENCES "QueueEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_queueEntryId_fkey" FOREIGN KEY ("queueEntryId") REFERENCES "QueueEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "PurchaseReservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricWindow" ADD CONSTRAINT "MetricWindow_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ExperimentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionLog" ADD CONSTRAINT "PredictionLog_metricWindowId_fkey" FOREIGN KEY ("metricWindowId") REFERENCES "MetricWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
