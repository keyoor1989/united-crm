
export type ShipmentMethodType = 'By Hand' | 'By Bus' | 'By Courier' | 'By Train';

export interface ShipmentDetails {
  id?: string;
  sale_id: string;
  shipment_method: ShipmentMethodType;
  courier_name?: string;
  tracking_number?: string;
  bus_details?: string;
  train_details?: string;
  additional_details?: string;
  status?: string;
}
