
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/sales";

interface ProductItemProps {
  index: number;
  item: {
    model: string;
    productId: string;
    product: Product | null;
    quantity: number;
    unitPrice: number;
  };
  products: Product[];
  onProductSelect: (index: number, productId: string) => void;
  onQuantityChange: (index: number, quantity: string) => void;
  onUnitPriceChange: (index: number, price: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({
  index,
  item,
  products,
  onProductSelect,
  onQuantityChange,
  onUnitPriceChange,
}) => {
  return (
    <div className="bg-background p-3 rounded-md space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">Item #{index + 1}</span>
        <Badge variant="outline">{item.model}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`product-${index}`}>Select Product</Label>
          <Select 
            value={item.productId || ""} 
            onValueChange={(value) => onProductSelect(index, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
          <Input
            id={`quantity-${index}`}
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onQuantityChange(index, e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor={`price-${index}`}>Unit Price (₹)</Label>
        <Input
          id={`price-${index}`}
          type="number"
          value={item.unitPrice}
          onChange={(e) => onUnitPriceChange(index, e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProductItem;
