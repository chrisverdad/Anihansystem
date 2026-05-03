import Delivery from '../models/Delivery.js';

/** Attach courier fields from `deliveries` for API consumers (buyers, vendors). */
export async function enrichOrderWithDelivery(
  order: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  if (!order || order.id == null) return order;
  const d = await Delivery.findByOrderId(order.id as number);
  if (d) {
    order.delivery_info = {
      delivery_person: String(d.delivery_person ?? ''),
      delivery_vehicle: String(d.delivery_vehicle ?? ''),
      fulfillment_notes: String(d.notes ?? ''),
      fulfillment_status: String(d.status ?? '')
    };
  } else {
    delete order.delivery_info;
  }
  return order;
}
