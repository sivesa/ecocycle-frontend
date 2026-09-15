# EcoCycle Backend API Endpoints Reference

This document provides a comprehensive catalog of all API endpoints available in the EcoCycle backend system, grouped by logical domain.

---

## Table of Contents
1. [Authentication & Onboarding](#1-authentication--onboarding)
2. [Activation Fee Payment](#2-activation-fee-payment)
3. [Household Waste Logging](#3-household-waste-logging)
4. [Collection Request Lifecycle](#4-collection-request-lifecycle)
5. [In-App Wallet & Withdrawals](#5-in-app-wallet--withdrawals)
6. [Gamification (Points, Badges & Leaderboards)](#6-gamification-points-badges--leaderboards)
7. [Collector Profiles](#7-collector-profiles)
8. [Waste Catalog Management (Materials & Types)](#8-waste-catalog-management-materials--types)
9. [Admin Operations REST API](#9-admin-operations-rest-api)
10. [Admin Platform View Routing](#10-admin-platform-view-routing)

---

## 1. Authentication & Onboarding

### Onboarding Endpoints
Base URL: `/api/onboarding`

#### `POST /api/onboarding/household`
* **Description:** Registers a new household user, sets their auth method to OTP, and creates a minimal household profile along with an address.
* **Access Level:** Public (No authorization required)
* **Response:** Returns `RegistrationResponseDto`.

#### `POST /api/onboarding/collector`
* **Description:** Registers a new business collector user, sets their auth method to PASSWORD, and records their business details/address.
* **Access Level:** Public (No authorization required)
* **Response:** Returns `RegistrationResponseDto`.

#### `GET /api/onboarding/staff/invite/{token}`
* **Description:** Publicly looks up details of a staff invitation by its secure unique token. Used to render and populate the accept-invite form.
* **Access Level:** Public (No authorization required)
* **Response:** `StaffInviteDetailsResponse` containing invite metadata (e.g. email, role, invite status).

#### `POST /api/onboarding/staff/accept`
* **Description:** Accepts a staff invitation, completing account creation. Instantiates a User with the invited role, alongside a `StaffProfile`.
* **Access Level:** Public (No authorization required, since the user does not possess a JWT yet)
* **Response:** `204 No Content`.

---

### Auth Endpoints
Base URL: `/api/auth`

#### `POST /api/auth/authenticate`
* **Description:** Initiates the login process.
  * **Household (OTP Flow):** Send phone number only. Initiates SMS dispatch and returns `requiresOtpVerification = true`.
  * **Collector (Password Flow):** Send phone number and password. Returns active JWT tokens directly on success.
* **Access Level:** Public (No authorization required)
* **Response:** `AuthResponseDto` containing token info or OTP confirmation.

#### `POST /api/auth/verify-otp`
* **Description:** Submits the 6-digit OTP received via SMS to complete the Household login flow.
* **Access Level:** Public (No authorization required)
* **Response:** `AuthResponseDto` with access token, refresh token, and user metadata.

#### `POST /api/auth/refresh`
* **Description:** EcoCycle token refresh mechanism. **Note:** Currently disabled (clients should redirect to `/authenticate` upon receiving a `401 Unauthorized`). This endpoint explicitly returns a `400 Bad Request`.
* **Access Level:** Public (No authorization required)

#### `GET /api/auth/me`
* **Description:** Returns profile and status metadata for the currently authenticated user.
* **Access Level:** Authenticated (Any role)
* **Response:** `CurrentUserLightDto` (ID, phone, roles, active status, profile completion status).

#### `POST /api/auth/logout`
* **Description:** Invalidates and revokes the refresh token for the active user session.
* **Access Level:** Authenticated (Any role)
* **Response:** `204 No Content`.

---

## 2. Activation Fee Payment
Base URL: `/api/activation`

EcoCycle requires a once-off `R150` payment to activate accounts.

#### `GET /api/activation/instructions`
* **Description:** Generates and returns Nedbank cash deposit instructions alongside a unique payment reference for the user.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Response:** `ActivationPaymentInstructionsDto`.

#### `POST /api/activation/admin/{userId}/send-instructions`
* **Description:** Generates or reuses a pending payment reference for 'Bank Deposit' and SMSs or emails it to the household. Does not activate the account directly; activation is finalized via Nedbank polling or administrative manual verification.
* **Access Level:** `ADMIN` or `SUPPORT` role
* **Response:** `ActivationPaymentInstructionsDto`.

#### `GET /api/activation/status`
* **Description:** Checks the current status of the activation payment. Ideal for polling at the confirmation screen.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Response:** `ActivationPaymentStatus` (`PENDING`, `VERIFIED`, `EXPIRED`, `CANCELLED`).

#### `POST /api/activation/admin/verify`
* **Description:** Manual verification fallback. Allows admins to manually verify activation payments if Nedbank's poll misses them or if cash is deposited directly at the office.
* **Access Level:** `ADMIN` role
* **Response:** `200 OK`.

#### `POST /api/activation/paystack/initialize`
* **Description:** Creates a Paystack transaction for the R150 fee. Opens the checkout URL to complete payment online.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Request Body:** `PaystackInitializeRequestDto` (email, optional).
* **Response:** `PaystackInitializeResponseDto` (contains checkout URL and unique payment reference).

#### `GET /api/activation/paystack/verify/{reference}`
* **Description:** Confirms status directly with Paystack. Called when the checkout browser closes or when the app regains focus.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Response:** `ActivationPaymentStatus`.

#### `POST /api/activation/paystack/webhook`
* **Description:** Target webhook for Paystack's `charge.success` event. Acts as the background source of truth for online account activations.
* **Access Level:** Public (Requires valid Paystack signature header `x-paystack-signature`)
* **Response:** `200 OK`.

#### `POST /api/activation/crypto/quote`
* **Description:** Fetches a live, time-boxed ALGO conversion rate quote for the R150 activation fee.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Response:** `CryptoQuoteResponseDto` containing rate, microAlgos, and quote expiration.

#### `POST /api/activation/crypto/verify`
* **Description:** Submits details of an Algorand transaction (e.g. from Pera Wallet) for verification via the independent blockchain indexer to activate the user's account.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Request Body:** `CryptoVerifyRequestDto` (txId, senderAddress, microAlgos).
* **Response:** `ActivationPaymentStatus`.

---

## 3. Household Waste Logging
Base URL: `/api/household/waste`

Allows households to log and categorize their recyclable waste items before creating a collection request.

#### `POST /api/household/waste/log`
* **Description:** Logs a segregated waste item indicating category, material, estimated capacity, and collection date. Returns the estimated payout and preparation instructions.
* **Access Level:** `HOUSEHOLD` role
* **Response:** `LoggedWasteItemResponse`.

#### `GET /api/household/waste/categories`
* **Description:** Fetches all distinct top-level waste categories (e.g., METAL, PLASTIC, GLASS, PAPER) for dropdown populating.
* **Access Level:** `HOUSEHOLD` role
* **Response:** List of `WasteCategoryOptionDto`.

#### `GET /api/household/waste/materials`
* **Description:** Cascading dropdown endpoint. Returns recyclable waste materials matching a specified top-level category.
* **Query Parameters:**
  * `category` (String, required - e.g. "PLASTIC")
* **Access Level:** `HOUSEHOLD` role
* **Response:** List of `WasteMaterialOptionDto`.

#### `GET /api/household/waste/materials/{materialId}`
* **Description:** Gets details of a specific waste material, including educational instructions, tips, and pricing.
* **Path Parameters:**
  * `materialId` (Long, required)
* **Access Level:** `HOUSEHOLD` role
* **Response:** `WasteMaterialOptionDto`.

---

## 4. Collection Request Lifecycle
Base URL: `/api/collections`

Manages requests from the initial submission by households to arrival verification, rejection, and final payout.

### Household Actions

#### `POST /api/collections`
* **Description:** Submits a new recyclable collection request. Requires an active, paid-up account.
* **Access Level:** `HOUSEHOLD` role
* **Request Body:** `CreateCollectionRequestDto` (materialId, addressId, estimateCapacity, collectionDate).
* **Response:** `CollectionRequestResponseDto` (includes upfront payout estimate).

#### `GET /api/collections/my-requests`
* **Description:** Returns the authenticated household's complete history of collection requests.
* **Access Level:** `HOUSEHOLD` role
* **Response:** List of `CollectionRequestResponseDto` sorted newest first.

#### `DELETE /api/collections/{requestId}/cancel`
* **Description:** Cancels a collection request. Only allowed when the status is `REQUESTED` or `PENDING`.
* **Path Parameters:**
  * `requestId` (Long, required)
* **Access Level:** `HOUSEHOLD` role (must own the request)
* **Response:** `ApiResponse<Void>`.

---

### Collector Actions

#### `GET /api/collections/open`
* **Description:** Lists all available `REQUESTED` collection jobs ready for pickup.
* **Access Level:** `COLLECTOR` role
* **Response:** List of `CollectionRequestResponseDto`.

#### `GET /api/collections/my-jobs`
* **Description:** Lists the active collection jobs assigned to the requesting collector (status is `ACCEPTED` or `IN_PROGRESS`).
* **Access Level:** `COLLECTOR` role
* **Response:** List of `CollectionRequestResponseDto`.

#### `POST /api/collections/{requestId}/accept`
* **Description:** Claims an open collection request, assigns it to the collector, and sends an arrival confirmation OTP to the household.
* **Path Parameters:**
  * `requestId` (Long, required)
* **Access Level:** `COLLECTOR` role
* **Response:** `CollectionRequestResponseDto`.

#### `POST /api/collections/{requestId}/verify-arrival`
* **Description:** Proves physical arrival. Collector submits the 6-digit OTP obtained from the household. Transitions status to `IN_PROGRESS`.
* **Path Parameters:**
  * `requestId` (Long, required)
* **Request Body:** `VerifyArrivalOtpDto` (otpCode).
* **Access Level:** `COLLECTOR` role (must be the assigned collector)
* **Response:** `ApiResponse<Void>`.

#### `POST /api/collections/{requestId}/reject`
* **Description:** Rejects a collection request upon physical inspection due to contamination or non-compliance. Triggers an educational notification to the household.
* **Path Parameters:**
  * `requestId` (Long, required)
* **Request Body:** `RejectCollectionDto` (reason).
* **Access Level:** `COLLECTOR` role (must be the assigned collector)
* **Response:** `ApiResponse<Void>`.

#### `POST /api/collections/{requestId}/complete`
* **Description:** Finalizes the collection. The collector submits the actual weighed quantity. This calculates final earnings and transfers the payment to the household's wallet.
* **Path Parameters:**
  * `requestId` (Long, required)
* **Request Body:** `FinalizeCollectionDto` (actualWeightKg).
* **Access Level:** `COLLECTOR` role (must be the assigned collector and OTP must have been verified)
* **Response:** `CollectionRequestResponseDto`.

---

### Shared Operations

#### `GET /api/collections/{requestId}`
* **Description:** Retrieves the status and details of a specific collection request.
* **Path Parameters:**
  * `requestId` (Long, required)
* **Access Level:** `HOUSEHOLD` (must own request), `COLLECTOR` (must be assigned), or `ADMIN`.
* **Response:** `CollectionRequestResponseDto`.

---

## 5. In-App Wallet & Withdrawals
Base URL: `/api/v1/wallet`

### Household Actions

#### `GET /api/v1/wallet/balance`
* **Description:** Returns the household’s wallet balance metadata, including lifetime earnings, pending withdrawals, and flat transaction fees.
* **Access Level:** `HOUSEHOLD` role
* **Response:** `WalletBalanceDto`.

#### `GET /api/v1/wallet/transactions`
* **Description:** Retrieves a paginated transaction ledger displaying all credits and debits.
* **Query Parameters:**
  * `page` (int, default: 0)
  * `size` (int, default: 20)
* **Access Level:** `HOUSEHOLD` role
* **Response:** Paginated list of `WalletTransaction`.

#### `POST /api/v1/wallet/withdraw`
* **Description:** Requests a payout. Minimum withdrawal amount is `R50`. A flat `R10` processing fee is charged. Account must have verified banking details linked, and only one pending withdrawal request is allowed at a time.
* **Request Body:** `WithdrawalRequestDto` (amount).
* **Access Level:** `HOUSEHOLD` role
* **Response:** `WithdrawalResponseDto`.

#### `GET /api/v1/wallet/withdrawals`
* **Description:** Fetches all withdrawal requests submitted by the logged-in user.
* **Access Level:** `HOUSEHOLD` role
* **Response:** List of `WithdrawalRequest` objects.

#### `DELETE /api/v1/wallet/withdrawals/{id}/cancel`
* **Description:** Cancels a pending withdrawal request and refunds the withdrawal amount and transaction fee back to the wallet.
* **Path Parameters:**
  * `id` (Long, required)
* **Access Level:** `HOUSEHOLD` role
* **Response:** `ApiResponse<Void>`.

---

### Admin Actions

#### `GET /api/v1/wallet/admin/withdrawals/pending`
* **Description:** Lists all pending withdrawal requests waiting for administrative approval, oldest first.
* **Access Level:** `ADMIN` role
* **Response:** List of `WithdrawalRequest` objects.

#### `POST /api/v1/wallet/admin/withdrawals/action`
* **Description:** Approves or rejects a pending withdrawal. Approvals require entering an external bank EFT payment reference. Rejections refund the user.
* **Request Body:** `AdminWithdrawalActionDto` (id, approve, externalReference, rejectReason).
* **Access Level:** `ADMIN` role
* **Response:** `ApiResponse<Void>`.

---

## 6. Gamification (Points, Badges & Leaderboards)
Base URL: `/api/v1/gamification`

Encourages recycling through active reward milestones and community ranking.

#### `GET /api/v1/gamification/points`
* **Description:** Returns a points summary including all-time points, monthly points, total kg collected, and streak bonus status.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Response:** `UserPointsSummaryDto`.

#### `GET /api/v1/gamification/points/history`
* **Description:** Full ledger details of points earned by the user, sorted newest first.
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Response:** List of `PointLedgerEntryDto`.

#### `GET /api/v1/gamification/badges`
* **Description:** Lists all badges earned by the user (such as first collection, milestones reached).
* **Access Level:** `HOUSEHOLD` or `COLLECTOR` role
* **Response:** List of `BadgeDto`.

#### `GET /api/v1/gamification/leaderboard/household`
* **Description:** Displays the top 10 households sorted by points (both all-time and current calendar month). Includes the active user's relative ranking.
* **Access Level:** `HOUSEHOLD` or `ADMIN` role
* **Response:** `LeaderboardDto`.

#### `GET /api/v1/gamification/leaderboard/collector`
* **Description:** Displays the top 10 collectors based on points earned.
* **Access Level:** `COLLECTOR` or `ADMIN` role
* **Response:** `LeaderboardDto`.

---

## 7. Collector Profiles
Base URL: `/api/collectors`

Provides registry APIs for collectors.

#### `POST /api/collectors`
* **Description:** Registers a new collector profile.
* **Access Level:** Public (No authorization required)
* **Response:** `CollectorResponseDTO`.

#### `GET /api/collectors/{id}`
* **Description:** Fetches profile info of a specific collector by ID.
* **Access Level:** Public (No authorization required)
* **Response:** `CollectorResponseDTO`.

#### `GET /api/collectors`
* **Description:** Retrieves a complete list of all registered collectors.
* **Access Level:** Public (No authorization required)
* **Response:** List of `CollectorResponseDTO`.

#### `PUT /api/collectors/{id}`
* **Description:** Updates details for a collector profile.
* **Access Level:** Public (No authorization required)
* **Response:** `CollectorResponseDTO`.

#### `DELETE /api/collectors/{id}`
* **Description:** Deletes a collector profile from the system.
* **Access Level:** Public (No authorization required)
* **Response:** `204 No Content`.

---

## 8. Waste Catalog Management (Materials & Types)

### Waste Material Directory
Base URL: `/api/waste/materials`

#### `POST /api/waste/materials`
* **Description:** Adds a new waste material to the recycling catalogue.
* **Access Level:** Public (No authorization required)
* **Response:** `WasteMaterialResponse`.

#### `GET /api/waste/materials`
* **Description:** Fetches all materials filtered by category.
* **Query Parameters:**
  * `category` (String, required - e.g. "METAL")
* **Access Level:** Public (No authorization required)
* **Response:** List of `WasteMaterialResponse`.

#### `GET /api/waste/materials/options`
* **Description:** Fetches simple option DTO representations of materials in a given category.
* **Query Parameters:**
  * `category` (String, required)
* **Access Level:** Public (No authorization required)
* **Response:** List of `WasteMaterialOptionDto`.

#### `GET /api/waste/materials/{id}`
* **Description:** Fetches a single waste material profile.
* **Path Parameters:**
  * `id` (Long, required)
* **Access Level:** Public (No authorization required)
* **Response:** `WasteMaterialResponse`.

---

### Waste Types
Base URL: `/api/waste-types`

#### `POST /api/waste-types`
* **Description:** Registers a new top-level Waste Type category in the database.
* **Access Level:** Public (No authorization required)
* **Response:** `WasteType` object.

#### `GET /api/waste-types`
* **Description:** Lists all registered top-level waste types.
* **Access Level:** Public (No authorization required)
* **Response:** List of `WasteType` objects.

#### `GET /api/waste-types/{id}`
* **Description:** Fetches details of a specific top-level waste type.
* **Path Parameters:**
  * `id` (Long, required)
* **Access Level:** Public (No authorization required)
* **Response:** `WasteType` object.

---

## 9. Admin Operations REST API

### General Platform Admin
Base URL: `/api/admin`

#### `GET /api/admin/dashboard`
* **Description:** Aggregates and returns platform-wide stats, charts, and financial details for the admin console.
* **Access Level:** `ADMIN`, `SUPPORT`, `FINANCE`, or `COMPLIANCE` role
* **Response:** `DashboardStatsDto`.

#### `GET /api/admin/users`
* **Description:** Provides a paginated list of users filtered by role, with optional text search.
* **Query Parameters:**
  * `role` (UserRole, default: `HOUSEHOLD` - others: `COLLECTOR`, `ADMIN`)
  * `search` (String, optional - matches phone or email)
  * `page` (int, default: 0)
  * `size` (int, default: 20)
* **Access Level:** `ADMIN` or `SUPPORT` role
* **Response:** Paginated list of `AdminUserSummaryDto`.

#### `GET /api/admin/users/{userId}`
* **Description:** Retrieves the detailed profile, addresses, and gamification standings of a single user.
* **Path Parameters:**
  * `userId` (Long, required)
* **Access Level:** `ADMIN` role
* **Response:** `AdminUserSummaryDto`.

#### `PATCH /api/admin/users/status`
* **Description:** Enables or disables access for a user. Deactivated users are blocked from logging in or requesting collections.
* **Request Body:** `AdminUserActionDto` (userId, active).
* **Access Level:** `ADMIN` role
* **Response:** `ApiResponse<Void>`.

#### `DELETE /api/admin/users/{userId}`
* **Description:** Irreversibly deletes a User, HouseholdProfile, HouseholdWallet, and related addresses. Fails if dependencies like transaction ledgers, points, or collections still exist.
* **Path Parameters:**
  * `userId` (Long, required)
  * `reason` (String, optional query param)
* **Access Level:** `ADMIN` role (not SUPPORT)
* **Response:** `ApiResponse<Void>`.

#### `GET /api/admin/collections`
* **Description:** Returns a paginated list of all system collection requests. Filterable by status or area.
* **Query Parameters:**
  * `status` (CollectionStatus, optional)
  * `area` (String, optional - suburb or municipality)
  * `page` (int, default: 0)
  * `size` (int, default: 20)
* **Access Level:** `ADMIN` role
* **Response:** Paginated list of `AdminCollectionSummaryDto` sorted newest first.

#### `GET /api/admin/collections/{requestId}`
* **Description:** Fetches complete details of a specific collection request for administrative auditing.
* **Path Parameters:**
  * `requestId` (Long, required)
* **Access Level:** `ADMIN` role
* **Response:** `AdminCollectionSummaryDto`.

#### `GET /api/admin/materials`
* **Description:** Returns a paginated catalog of all waste materials, optionally filtered by category.
* **Query Parameters:**
  * `category` (String, optional)
  * `page` (int, default: 0)
  * `size` (int, default: 20)
* **Access Level:** `ADMIN` role
* **Response:** Paginated list of `WasteMaterial`.

#### `POST /api/admin/materials`
* **Description:** Registers a new recyclable material into the catalog, making it immediately selectable.
* **Request Body:** `AdminWasteMaterialDto` (wasteName, category, pricePerKg, requiresCleaning, educationalTip, etc.).
* **Access Level:** `ADMIN` role
* **Response:** Created `WasteMaterial` object (`201 Created`).

#### `PUT /api/admin/materials/{materialId}`
* **Description:** Updates the properties or price of an existing waste material. Price adjustments apply only to new requests.
* **Path Parameters:**
  * `materialId` (Long, required)
* **Request Body:** `AdminWasteMaterialDto`.
* **Access Level:** `ADMIN` role
* **Response:** Updated `WasteMaterial` object.

#### `DELETE /api/admin/materials/{materialId}`
* **Description:** Removes a waste material from the database. Allowed only if no active collections reference it.
* **Path Parameters:**
  * `materialId` (Long, required)
* **Access Level:** `ADMIN` role
* **Response:** `ApiResponse<Void>`.

#### `GET /api/admin/activity-logs`
* **Description:** Paginated search and audit trail of administrative/staff activities.
* **Query Parameters:**
  * `role` (UserRole, optional)
  * `action` (ActivityAction, optional)
  * `range` (String, default: "7d")
  * `q` (String, free-text search across actor/target)
  * `page` (int, default: 0)
  * `size` (int, default: 25)
* **Access Level:** `ADMIN` role
* **Response:** Paginated list of `ActivityLogDto` sorted newest first.

#### `GET /api/admin/activity-logs/summary`
* **Description:** Counters and key audit indicators (actions today, high-risk counts, active staff session metrics).
* **Query Parameters:**
  * `range` (String, default: "7d")
* **Access Level:** `ADMIN` role
* **Response:** `ActivityLogSummaryDto`.

#### `POST /api/admin/activity-logs/export`
* **Description:** Generates and streams a CSV report of the administrative audit log history.
* **Request Body:** `ActivityLogExportRequestDto` (role, range).
* **Access Level:** `ADMIN` role
* **Response:** Binary CSV stream (`text/csv`).

---

### Admin Waste Price Catalog Management
Base URL: `/api/admin/waste-materials`

#### `GET /api/admin/waste-materials`
* **Description:** Retrieves all waste materials for the Market Price management panel.
* **Query Parameters:**
  * `category` (String, optional)
  * `recyclable` (Boolean, optional)
  * `q` (String, optional search)
* **Access Level:** `ADMIN` or `FINANCE` role
* **Response:** List of `WasteMaterialResponse`.

#### `GET /api/admin/waste-materials/{id}`
* **Description:** Fetches detailed admin profile for a specific waste material.
* **Path Parameters:**
  * `id` (Long, required)
* **Access Level:** `ADMIN` or `FINANCE` role
* **Response:** `WasteMaterialResponse`.

#### `PATCH /api/admin/waste-materials/{id}/price`
* **Description:** Patches/updates the price per kg of a specific waste material. Takes immediate effect for new requests.
* **Path Parameters:**
  * `id` (Long, required)
* **Request Body:** `UpdateWasteMaterialPriceRequest` (pricePerKg).
* **Access Level:** `ADMIN` or `FINANCE` role
* **Response:** Updated `WasteMaterialResponse`.

---

### Staff & Access Management
Base URL: `/api/admin/staff`

#### `POST /api/admin/staff/invite`
* **Description:** Invites a new staff member to join the system with a specified administrative role.
* **Request Body:** `InviteStaffRequest` (email, role).
* **Access Level:** `ADMIN` role (Super Administrator only)
* **Response:** `InviteStaffResponse` containing the secure invitation token and link.

#### `GET /api/admin/staff`
* **Description:** Lists all system staff profiles, registration statuses, and access levels.
* **Access Level:** `ADMIN` role
* **Response:** List of `StaffSummaryResponse`.

#### `PATCH /api/admin/staff/{id}/access`
* **Description:** Dynamically enables or disables account access for an administrative staff member.
* **Path Parameters:**
  * `id` (Long, required)
* **Request Body:** `AccessUpdateRequest` (enabled).
* **Access Level:** `ADMIN` role
* **Response:** `200 OK`.

---

### Admin Household OTP Verification Support
Base URL: `/api/admin/households`

#### `POST /api/admin/households/{userId}/verify-otp`
* **Description:** Over-the-phone / WhatsApp support verification helper. Admins verify a household's registration OTP code read back by the user. Activates the user profile but generates no tokens.
* **Path Parameters:**
  * `userId` (Long, required)
* **Request Body:** `AdminVerifyOtpRequestDto` (otpCode).
* **Access Level:** `ADMIN` or `SUPPORT` role
* **Response:** `204 No Content`.

#### `POST /api/admin/households/{userId}/resend-otp`
* **Description:** Re-triggers and delivers an onboarding verification OTP code via SMS to a household pending activation.
* **Path Parameters:**
  * `userId` (Long, required)
* **Access Level:** `ADMIN` or `SUPPORT` role
* **Response:** `OtpStatus`.

---

## 10. Admin Platform View Routing
Base URL: `/platform/admin`

Renders server-side templates (HTML pages) for administrative and staff onboarding portals.

#### `GET /platform/admin/login`
* **Description:** Renders the platform's administrator login form page.
* **Template Rendered:** `ecocycle-admin/ecocycle-admin-login`
* **Access Level:** Public (No authorization required)

#### `GET /platform/admin/ecocycle/dashboard`
* **Description:** Renders the central staff dashboard platform UI shell (for Admins, Support, Finance, etc.).
* **Template Rendered:** `ecocycle-admin/ecocycle-admin-dashboard`
* **Access Level:** Protected (Requires active authenticated admin/staff session)

#### `GET /platform/admin/staff/accept-invite`
* **Description:** Renders the staff invitation acceptance form where invitees can specify their password and finalize registration details.
* **Template Rendered:** `ecocycle-admin/ecocycle-admin-accept-invite`
* **Access Level:** Public (Token validated in browser context)
