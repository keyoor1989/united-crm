
import { useState } from "react";
import { Product } from "@/types/sales";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { products } from "@/data/salesData";

interface QuotationItem {
  model: string;
  productId: string;
  product: Product | null;
  quantity: number;
  unitPrice: number;
}

interface UseItemsManagementParams {
  initialModels: ParsedQuotationRequest['models'];
}

export const useItemsManagement = ({ initialModels }: UseItemsManagementParams) => {
  const [items, setItems] = useState<QuotationItem[]>(initialModels.map(model => {
    const product = products.find(p => p.id === model.productId);
    
    return {
      model: model.model,
      productId: model.productId,
      product: product || null,
      quantity: model.quantity,
      unitPrice: product ? 165000 : 150000, // Default price if not found
    };
  }));

  const handleUnitPriceChange = (index: number, price: string) => {
    const newItems = [...items];
    newItems[index].unitPrice = Number(price);
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const newItems = [...items];
    newItems[index].quantity = Number(quantity);
    setItems(newItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const newItems = [...items];
    const product = products.find(p => p.id === productId);
    if (product) {
      newItems[index].product = product;
      newItems[index].productId = productId;
    }
    setItems(newItems);
  };

  return {
    items,
    handleUnitPriceChange,
    handleQuantityChange,
    handleProductSelect
  };
};
