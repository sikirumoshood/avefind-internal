// Mirrors apps/auth UserRoleEnum (avefind-backend libs/common/src/database/prisma/schema.prisma)
export type UserRole =
  | "CUSTOMER"
  | "DELIVERY_AGENT"
  | "MERCHANT"
  | "SALES_REP"
  | "ADMIN"
  | "MANAGER"
  | "OPERATIONS"

/** Roles allowed to sign into this internal admin tool. */
export const ADMIN_PANEL_ROLES: UserRole[] = ["ADMIN", "MANAGER", "OPERATIONS"]

export type SessionUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole[]
  isActive: boolean
}

export type LoggedInResponse = {
  token: string
  data: SessionUser
  isDevTestUser?: boolean
}

export type ApiErrorBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

/** Mirrors lib/common/database/interface.ts PaginateResourceResponse<T>. */
export type PaginationMeta = {
  currentPage: number
  limit: number
  totalNumberOfPages: number
  totalNumberOfRecords: number
}

export type Paginated<T> = {
  pagination: PaginationMeta
  data: T[]
}

/** Mirrors apps/auth AdminUserListItem (POST /auth/admin/users). */
export type AdminUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole[]
  isActive: boolean
  phoneNumber: string
  activationDate: string | null
  deactivationDate: string | null
  createdAt: string
  updatedAt: string
}

/** Mirrors apps/auth/src/subdomains/merchant MerchantFilterEnum. */
export type MerchantFilter = "ACTIVE" | "INACTIVE" | "PENDING_REVIEW" | "REJECTED" | "APPROVED"

export type MerchantCreatorUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

export type MerchantStore = {
  id: string
  merchantId: string
  name: string
  isActive: boolean
  isOnline: boolean
  addressLine1: string
  addressLine2: string | null
  addressCity: string
  addressState: string
  addressLga: string
  addressCountry: string
  addressPostalCode: string | null
  contactNumber: string | null
  contactEmail: string | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the Prisma Merchant model + includes returned by POST /auth/merchant/admin/get-merchants. */
export type AdminMerchant = {
  id: string
  name: string
  contactNumber: string
  contactEmail: string
  businessNumber: string | null
  logoUrl: string | null
  categories: string[]
  isActive: boolean
  ratingScore: number | null
  includeRewardInPayout: boolean | null
  activationDate: string | null
  deactivationDate: string | null
  deactivationReason: string | null
  applicationApprovedAt: string | null
  applicationRejectedAt: string | null
  applicationRejectedReason: string | null
  createdAt: string
  updatedAt: string
  createdByUser: MerchantCreatorUser
  stores: MerchantStore[]
  paymentMethods: PaymentMethod[]
}

/** Mirrors the { data, meta } shape returned by getMerchants (distinct from PaginateResourceResponse). */
export type MerchantListMeta = {
  total: number
  page: number
  offset: number
  totalPages: number
}

export type MerchantListResponse = {
  data: AdminMerchant[]
  meta: MerchantListMeta
}

export type MerchantSalesAgentUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

/** Mirrors the Prisma MerchantSalesAgent model + includes returned by GET /auth/merchant/:id/sales-agents. */
export type MerchantSalesAgent = {
  id: string
  merchantId: string
  salesAgentId: string
  isActive: boolean
  activationDate: string | null
  deactivationDate: string | null
  createdAt: string
  updatedAt: string
  salesAgent: MerchantSalesAgentUser
}

/** Mirrors the Prisma MerchantSalesAgentStore model, as returned nested under GET /auth/merchant/sales-agent/:id. */
export type MerchantSalesAgentStoreAssignment = {
  id: string
  merchantSalesAgentId: string
  storeId: string
  isActive: boolean
  activationDate: string | null
  deactivationDate: string | null
  createdAt: string
  updatedAt: string
  store: MerchantStore
}

/** Mirrors GET /auth/merchant/sales-agent/:merchantSalesAgentId. */
export type MerchantSalesAgentInfo = {
  merchantSalesAgent: MerchantSalesAgent & { assignedStores: MerchantSalesAgentStoreAssignment[] }
  unassignedStores: MerchantStore[]
}

/** Mirrors Prisma DeliveryAgentApplicationStatusEnum. */
export type DeliveryAgentApplicationStatus = "IN_REVIEW" | "PENDING_OFFICE_VISIT" | "REJECTED" | "APPROVED"

/** Mirrors Prisma DeliveryMediumEnum. */
export type DeliveryMedium = "MOTORBIKE" | "BICYCLE" | "FOOT"

/** Mirrors apps/auth/src/subdomains/delivery-agent AdminDeliveryAgentListFilterEnum. */
export type AdminDeliveryAgentFilter =
  | "IsUnderReview"
  | "IsPendingOfficeVisit"
  | "IsRejected"
  | "IsApproved"
  | "IsOnline"
  | "IsOffline"
  | "IsActive"
  | "IsInactive"
  | "IsMotorbike"
  | "IsBicycle"
  | "IsFoot"

/** Mirrors apps/auth/src/subdomains/delivery-agent DeliveryAgentSearchActionEnum. */
export type DeliveryAgentSearchAction = "FindDeliveryAgents" | "FindClosestToDeliveryAgentLocation" | "FindClosestToPickupLocation"

export type DeliveryAgentUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  profileUrl: string | null
}

/** Mirrors Prisma DeliveryAgentWorkTypeEnum. */
export type DeliveryAgentWorkType = "FULL_TIME" | "PART_TIME"

/** Mirrors Prisma DeliveryAgentIdTypeEnum. */
export type DeliveryAgentIdType = "NATIONAL_ID" | "RIDERS_CARD"

/** Mirrors Prisma PaymentMethodEnum. */
export type PaymentMethodType = "BANK_ACCOUNT" | "CARD"

/** Mirrors the Prisma DeliveryAgentApplicationStatusHistory model. */
export type DeliveryAgentApplicationStatusHistory = {
  id: string
  status: DeliveryAgentApplicationStatus
  reason: string | null
  createdAt: string
  createdByUser: { id: string; firstName: string; lastName: string } | null
}

/** Mirrors the Prisma PaymentMethod model (type: BANK_ACCOUNT rows are "bank accounts"; also used by merchants). */
export type PaymentMethod = {
  id: string
  type: PaymentMethodType
  accountNumber: string | null
  cardLastFourDigit: string | null
  apiId: string
  apiToken: string
  bankCode: string | null
  bankName: string | null
  accountName: string | null
  deliveryAgentId: string | null
  merchantId: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  transferRecipientApiId: string | null
  transferRecipientApiCode: string | null
  transferRecipientCreatedAt: string | null
}

/** Response shape of POST /auth/delivery-agent/admin/get-decrypted-data. */
export type DeliveryAgentDecryptedData = {
  deliveryAgentId: string
  idNumber: string
  idPhotoUrl: string
}

/** Mirrors the Prisma Bank model (GET /payments/banks). */
export type Bank = { id: string; name: string; code: string; slug: string | null }

/** Mirrors the DeliveryAgent + includes returned by POST /auth/delivery-agent/admin/list-delivery-agents. */
export type AdminDeliveryAgent = {
  id: string
  userId: string
  deliveryMedium: DeliveryMedium
  isActive: boolean
  /** Live tracked app status — set by the rider app, not admin-editable. */
  isOnline: boolean
  applicationStatus: DeliveryAgentApplicationStatus
  applicationStatusReason: string | null
  ratingScore: number | null
  activationDate: string | null
  deactivationDate: string | null
  createdAt: string
  updatedAt: string
  totalOrdersUnderDelivery: number
  user: DeliveryAgentUser
  workType: DeliveryAgentWorkType
  idType: DeliveryAgentIdType | null
  /** Encrypted placeholder — use getDeliveryAgentDecryptedData(id) for the real value. */
  idNumber: string | null
  /** Encrypted placeholder — use getDeliveryAgentDecryptedData(id) for the real value. */
  idPhotoUrl: string | null
  vehiclePlateNumber: string | null
  vehiclePhotoUrl: string | null
  officeClearanceDate: string | null
  applicationStatusHistory: DeliveryAgentApplicationStatusHistory[]
  paymentMethods: PaymentMethod[]
}

/** Mirrors Prisma OrderStatusEnum (schema.prisma). */
export type OrderStatus =
  | "PENDING"
  | "MANUAL_REVIEW"
  | "SUBMITTED"
  | "FINDING_MERCHANT"
  | "MERCHANT_FOUND"
  | "MERCHANT_CONFIRMED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_CONFIRMED"
  | "FINDING_DELIVERY_AGENT"
  | "DELIVERY_AGENT_ACCEPTED_ORDER"
  | "DELIVERY_AGENT_REJECTED_ORDER"
  | "DELIVERY_AGENT_ENROUTE_FOR_PICKUP"
  | "DELIVERY_AGENT_ARRIVED_PICKUP_LOCATION"
  | "DELIVERY_AGENT_PICKEDUP_ORDER"
  | "DELIVERY_AGENT_ENROUTE_FOR_DROPOFF"
  | "DELIVERY_AGENT_ARRIVED_DROPOFF_LOCATION"
  | "DELIVERY_COMPLETED"
  | "CANCELED_BY_CUSTOMER"
  | "REJECTED"
  | "CANCELED_BY_SYSTEM"
  | "WAITING_FOR_CUSTOMER_TO_CONFIRM_MERCHANT"
  | "STOPPED_FINDING_MERCHANT"

/** Mirrors Prisma TransactionStatusEnum. */
export type TransactionStatus = "SUCCESSFUL" | "PENDING" | "FAILED"

export type OrderCustomer = {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  isActive?: boolean
  profileUrl?: string | null
}

export type OrderCheckout = {
  id: string
  vat: number
  deliveryFee: number
  serviceCharge: number
  totalDiscount: number
  discountedTotalAmount: number
  totalAmount: number
  orderAmount: number
  transaction: { status: TransactionStatus; failureReason: string | null } | null
}

export type OrderStore = {
  id: string
  name: string
  addressLine1: string
  addressLine2: string | null
  addressCity: string
  addressState: string
  addressLga: string
  addressCountry: string
  contactNumber: string | null
  contactEmail: string | null
  merchant: { id: string; name: string; logoUrl: string | null } | null
}

export type MerchantOrderRequestStatus = "OPEN" | "TIMEDOUT" | "REJECTED" | "ACCEPTED" | "CONFIRMED_BY_CUSTOMER"

/** One row per merchant that was offered the order — the admin UI shows the full history, not just the confirmed one. */
export type OrderMerchantRequest = {
  id: string
  status: MerchantOrderRequestStatus
  statusReason: string | null
  itemPriceFromMerchant: number | null
  createdAt: string
  acceptedAt: string | null
  rejectedAt: string | null
  store: OrderStore | null
  orderCheckout?: OrderCheckout | null
  attachments: string[]
}

export type OrderDeliveryAddress = {
  id: string
  addressLine1: string
  addressLine2: string | null
  addressCity: string
  addressState: string
  addressLga: string
  addressCountry: string
  nickname: string | null
  fullAddress: string | null
}

export type OrderTimelineEntry = {
  id: string
  status: OrderStatus
  reason: string | null
  createdAt: string
}

/** Mirrors Prisma DeliveryRequestStatusEnum. */
export type DeliveryRequestStatus = "OPEN" | "TIMEDOUT" | "ACCEPTED" | "REJECTED" | "CANCELED"

/** One row per delivery agent solicitation for an order — mirrors the DeliveryRequest model. */
export type OrderDeliveryRequest = {
  id: string
  status: DeliveryRequestStatus
  statusReason: string | null
  createdAt: string
  updatedAt: string
  deliveryAgent: {
    id: string
    user: { id: string; firstName: string; lastName: string }
  }
}

/** Mirrors the Order + includes returned by POST /orders/admin/orders. */
export type AdminOrder = {
  id: string
  item: string
  request: string
  quantity: number | null
  category: string
  status: OrderStatus
  statusReason: string | null
  reasonDescription: string | null
  isTest: boolean | null
  createdAt: string
  updatedAt: string
  user: OrderCustomer
  merchantOrderRequests: OrderMerchantRequest[]
  timeline: OrderTimelineEntry[]
  attachments: string[]
}

/**
 * Mirrors the Prisma OrderRewardAccrual model. amountRewarded is in kobo (lowest
 * denomination) — unlike every other amount field in this app, which is naira —
 * convert with koboToNaira() from lib/rewards.ts before formatCurrency().
 */
export type OrderRewardAccrual = {
  id: string
  amountRewarded: number
  beneficiaryUserId: string
  beneficiaryUser: { id: string; firstName: string; lastName: string; email: string }
  createdAt: string
}

/** Mirrors POST /orders/admin/order-info — includes full checkout+transaction, unlike the list. */
export type AdminOrderDetail = AdminOrder & {
  checkout: OrderCheckout | null
  deliveryAddress: OrderDeliveryAddress
  deliveryRequests: OrderDeliveryRequest[]
  rewardAccruals: OrderRewardAccrual[]
  /** Set when the reward accrual batch job attempted and skipped this order — e.g. no referral, max usage reached. */
  failedRewardsAccrualReason: string | null
}

/** Mirrors Prisma OrderReturnCaseStatusEnum. */
export type OrderReturnCaseStatus = "OPEN" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "RESOLVED"

/** Mirrors the Prisma OrderReturnCase model, as returned by /orders/return-case/admin/* endpoints. */
export type AdminOrderReturnCase = {
  id: string
  orderId: string
  order: { id: string; item: string; user: { id: string; firstName: string; lastName: string; email: string } }
  status: OrderReturnCaseStatus
  assigneeId: string
  assignee: { id: string; firstName: string; lastName: string }
  returnReason: string
  attachments: string[]
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type OrderReturnCaseMetrics = {
  totalToday: number
  totalThisMonth: number
}

/** Mirrors GET /orders/return-case/admin/:id — richer `order` than the list/create shape. */
export type AdminOrderReturnCaseDetail = Omit<AdminOrderReturnCase, "order"> & {
  order: {
    id: string
    item: string
    category: string
    status: OrderStatus
    request: string
    createdAt: string
    user: { id: string; firstName: string; lastName: string; email: string; phoneNumber: string }
    checkout: { totalAmount: number; discountedTotalAmount: number | null } | null
  }
}

/** Mirrors Prisma OrderStatusReasonEnum. */
export type OrderStatusReason =
  | "OTHER"
  | "COULD_NOT_FIND_EXACT_ITEM_IN_QUESTION"
  | "PROLONGED_ORDER_QUOTATION_TIME"
  | "QUOTATION_TOO_EXPENSIVE"
  | "INVALID_ORDER_DETAILS"

export type OrderDeliveryAgentSummary = {
  id: string
  isOnline: boolean
  user: { firstName: string; lastName: string; phoneNumber: string; profileUrl: string | null }
}

/** Mirrors Prisma PayoutRunStatusEnum. */
export type PayoutRunStatus = "PROCESSING" | "SUCCESSFUL" | "FAILED"

export type PayoutBeneficiaryAgent = {
  id: string
  user: { firstName: string; lastName: string }
}

export type PayoutRunSummary = {
  id: string
  status: PayoutRunStatus
  apiTransferCode: string
  failureReason: string | null
  createdAt: string
}

/** Mirrors the Payout + includes returned by POST /payments/admin/payouts. */
export type AdminPayout = {
  id: string
  date: string
  totalAmount: number
  orderAmount: number
  redemptionAmount: number
  merchantId: string | null
  merchant: { id: string; name: string } | null
  deliveryAgentId: string | null
  deliveryAgent: PayoutBeneficiaryAgent | null
  merchantOrders: { id: string }[]
  deliveryAgentOrders: { id: string }[]
  payoutRuns: PayoutRunSummary[]
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the PayoutRun + includes returned by POST /payments/admin/payout-runs. */
export type AdminPayoutRun = {
  id: string
  status: PayoutRunStatus
  apiPaymentReference: string
  apiTransferCode: string
  failureReason: string | null
  apiStatus: string
  createdAt: string
  payout: {
    id: string
    date: string
    totalAmount: number
    merchant: { id: string; name: string } | null
    deliveryAgent: PayoutBeneficiaryAgent | null
    merchantOrders: { id: string }[]
    deliveryAgentOrders: { id: string }[]
  }
}

/** Mirrors Prisma AppSettingTypeEnum. Add new values here as the backend adds them. */
export type AppSettingType = "DISABLE_ORDER_CREATION"

export type AppSetting = {
  type: AppSettingType
  value: boolean
}

/** Mirrors Prisma BannerType. */
export type BannerType = "PROMOTION" | "AFFILIATE_ADS"

/** Mirrors the Prisma Banner model (POST /orders/banner/list). */
export type AdminBanner = {
  id: string
  type: BannerType
  ctaUrl: string | null
  imageS3Key: string
  displayStartDate: string
  displayEndDate: string | null
  deactivationDate: string | null
  createdAt: string
  updatedAt: string
}

/** Mirrors Prisma DiscountTypeEnum. */
export type DiscountType = "AMOUNT" | "PERCENTAGE"

/** Mirrors Prisma DiscountPurposeEnum. */
export type DiscountPurpose = "FREE_SHIPPING" | "PROMOTION" | "PARTNERSHIP"

/** Mirrors the Prisma Discount model + _count (POST /orders/discount/admin/list). */
export type AdminDiscount = {
  id: string
  code: string
  value: number
  type: DiscountType
  purpose: DiscountPurpose
  startDate: string
  endDate: string
  activationDate: string | null
  deactivationDate: string | null
  isActive: boolean
  isAutoApplicable: boolean
  maxNumberOfUse: number | null
  maxDiscountedAmount: number | null
  minimumOrderAmount: number | null
  merchantId: string | null
  storeId: string | null
  userId: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  _count: { usages: number }
}

export type PricingUser = { id: string; firstName: string; lastName: string }

/**
 * Mirrors the Prisma Pricing model. Rows are historical snapshots, not a
 * single mutable record — see lib/api/pricing.ts.
 */
export type AdminPricing = {
  id: string
  gasPricePerLitre: number
  dollarRate: number
  bikeConsumptionRatePerLtrKm: number
  carConsumptionRatePerLtrKm: number
  googleDistanceMetrixApiCostPerRequest: number
  bikeDeliveryFlatFee: number
  bicycleDeliveryFlatFee: number
  footDeliveryFlatFee: number
  bicycleDeliveryChargePerKm: number
  footDeliveryChargePerKm: number
  serviceChargePercentage: number
  deliveryAgentCommissionPercentage: number | null
  merchantOrderCommissionPercentage: number | null
  deactivationDate: string | null
  createdAt: string
  updatedAt: string
  createdByUser: PricingUser | null
  updatedByUser: PricingUser | null
}

export type DashboardTodaySummary = {
  ordersInDelivery: number
  ordersPendingPickup: number
  ordersDeliveredToday: number
  usersFromReferralsToday: number
}

/** All medians in seconds; null when there's no data yet for that pair of events. */
export type DashboardTimingFunnel = {
  paymentToPickupMedianSeconds: number | null
  paymentToAssignmentMedianSeconds: number | null
  acceptanceToArrivalMedianSeconds: number | null
  arrivalToPickupMedianSeconds: number | null
}

export type DashboardTotals = {
  totalMerchants: number
  totalActivatedMerchants: number
  totalUsers: number
  totalOrdersCompleted: number
  grossRevenueThisMonth: number
  grossRevenueAllTime: number
  usersFromReferralsThisMonth: number
}

export type DashboardMonthlyOrders = {
  months: string[]
  currentYear: number[]
  previousYear: number[]
  currentYearLabel: number
  previousYearLabel: number
}

export type DashboardCategoryBreakdown = {
  category: string
  count: number
  percentage: number
}

export type DashboardSummary = {
  today: DashboardTodaySummary
  timingFunnel: DashboardTimingFunnel
  totals: DashboardTotals
  monthlyOrders: DashboardMonthlyOrders
  completedOrdersByCategory: DashboardCategoryBreakdown[]
}

/** Mirrors Prisma RewardConfigurationTypeEnum. */
export type RewardConfigurationType = "DELIVERY_AGENT" | "CUSTOMER" | "MERCHANT"

/** Mirrors Prisma RewardLedgerTypeEnum. */
export type RewardLedgerType =
  | "ACCRUAL"
  | "ACCRUAL_REVERSAL"
  | "REDEMPTION"
  | "REDEMPTION_REVERSAL"
  | "CASHBACK"
  | "CASHBACK_REVERSAL"
  | "OPENING_BALANCE"

export type RewardConfigUser = { id: string; firstName: string; lastName: string }

/** Mirrors the Prisma RewardConfiguration model (GET/POST /auth/reward/config). */
export type AdminRewardConfiguration = {
  id: string
  type: RewardConfigurationType
  minOrderAmount: number
  maxRewardAmount: number
  rewardPercentage: number | null
  rewardAmount: number | null
  description: string
  maxUsage: number
  isCurrent: boolean
  deactivationOn: string | null
  createdAt: string
  updatedAt: string
  createdByUser: RewardConfigUser | null
  updatedByUser: RewardConfigUser | null
}

/**
 * Mirrors the Prisma RewardLedger model (GET /auth/reward/history). Amounts are
 * in kobo (lowest denomination) — unlike every other amount field in this app,
 * which is naira — convert with koboToNaira() from lib/rewards.ts before formatCurrency().
 */
export type AdminRewardLedgerEntry = {
  id: string
  userId: string
  currentBalance: number
  amount: number
  type: RewardLedgerType
  description: string | null
  createdAt: string
  redemptionId: string | null
  orderRewardAccrualId: string | null
  createdByUserId: string | null
  previousLedgerId: string | null
}

/**
 * Mirrors the Prisma ReferralRewardConfiguration model plus the accrual stats
 * RewardConfigService.listReferralsForReferrer computes (GET /auth/reward/referral/:userId).
 * amountAccruedInLowestDenomination is kobo; potentialMaxAmount is naira (maxRewardAmount * maxUsage).
 */
export type AdminReferralRewardConfiguration = {
  id: string
  referredByUserId: string
  referredUserId: string
  referredUser: { id: string; firstName: string; lastName: string; email: string }
  rewardConfigurationId: string
  rewardConfiguration: AdminRewardConfiguration
  deactivationOn: string | null
  createdAt: string
  updatedAt: string
  accruedUsageCount: number
  amountAccruedInLowestDenomination: number
  potentialMaxAmount: number
}

/** Mirrors ApplyCashbackOutput (POST /auth/reward/cashback). */
export type ApplyCashbackResult = {
  beneficiaryUserId: string
  cashbackLedgerEntryId: string
  cashbackAmountInLowestDenomination: number
  newBalance: number
}

/** Mirrors ReverseCashbackOutput (POST /auth/reward/cashback/reversal). */
export type ReverseCashbackResult = {
  beneficiaryUserId: string
  reversalLedgerEntryId: string
  cashbackAmountInLowestDenomination: number
  newBalance: number
}
