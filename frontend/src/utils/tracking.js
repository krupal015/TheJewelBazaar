export const trackingSteps = [
  { key: "pending", label: "Placed", description: "Your order has been received." },
  { key: "processing", label: "Confirmed", description: "Payment cleared and craftsmanship started." },
  { key: "processing-2", label: "Packed", description: "Your jewellery is packed and quality checked." },
  { key: "shipped", label: "Shipped", description: "The package is moving to your city." },
  { key: "delivery", label: "Out for Delivery", description: "Delivery partner is heading your way." },
  { key: "delivered", label: "Delivered", description: "Order completed successfully." }
];

export const getTrackingIndex = (status) => {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 2;
    case "shipped":
      return 4;
    case "delivered":
      return 5;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
};
