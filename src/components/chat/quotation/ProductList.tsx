
import React from "react";
import { Label } from "@/components/ui/label";
import ProductItem from "./ProductItem";
import { Product } from "@/types/sales";

interface ProductListProps {
  items: {
    model: string;
    productId: string;
    product: Product | null;
    quantity: number;
    unitPrice: number;
  }[];
  products: Product[];
  onProductSelect: (index: number, productId: string) => void;
  onQuantityChange: (index: number, quantity: string) => void;
  onUnitPriceChange: (index: number, price: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  items,
  products,
  onProductSelect,
  onQuantityChange,
  onUnitPriceChange,
}) => {
  return (
    <div className="space-y-3">
      <Label>Products</Label>
      {items.map((item, index) => (
        <ProductItem
          key={index}
          index={index}
          item={item}
          products={products}
          onProductSelect={onProductSelect}
          onQuantityChange={onQuantityChange}
          onUnitPriceChange={onUnitPriceChange}
        />
      ))}
    </div>
  );
};

export default ProductList;
