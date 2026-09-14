import type { CreatePricingInput } from "@/lib/api/pricing"

type PricingField = {
  key: keyof CreatePricingInput
  label: string
  optional?: boolean
}

export const PRICING_FIELD_GROUPS: Array<{ title: string; fields: PricingField[] }> = [
  {
    title: "Fuel & vehicle costs",
    fields: [
      { key: "gasPricePerLitre", label: "Gas price per litre (₦)" },
      { key: "dollarRate", label: "Dollar rate (₦)" },
      { key: "bikeConsumptionRatePerLtrKm", label: "Bike fuel consumption (L/km)" },
      { key: "carConsumptionRatePerLtrKm", label: "Car fuel consumption (L/km)" },
      { key: "googleDistanceMetrixApiCostPerRequest", label: "Distance API cost per request (₦)" },
    ],
  },
  {
    title: "Delivery fees",
    fields: [
      { key: "bikeDeliveryFlatFee", label: "Bike flat fee (₦)" },
      { key: "bicycleDeliveryFlatFee", label: "Bicycle flat fee (₦)" },
      { key: "footDeliveryFlatFee", label: "Foot flat fee (₦)" },
      { key: "bicycleDeliveryChargePerKm", label: "Bicycle charge per km (₦)" },
      { key: "footDeliveryChargePerKm", label: "Foot charge per km (₦)" },
    ],
  },
  {
    title: "Commission & service charge",
    fields: [
      { key: "serviceChargePercentage", label: "Service charge (%)" },
      { key: "deliveryAgentCommissionPercentage", label: "Delivery agent commission (%)", optional: true },
      { key: "merchantOrderCommissionPercentage", label: "Merchant order commission (%)", optional: true },
    ],
  },
]
