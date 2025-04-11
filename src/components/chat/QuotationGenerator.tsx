
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileDown, Send } from "lucide-react";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { 
  products, 
  generateQuotationNumber, 
  createQuotationItem 
} from "@/data/salesData";
import { Quotation, Product } from "@/types/sales";
import { generateQuotationPdf } from "@/utils/pdfGenerator";
import { toast } from "sonner";

interface QuotationGeneratorProps {
  initialData: ParsedQuotationRequest;
  onComplete: (quotation: Quotation) => void;
  onCancel: () => void;
}

const QuotationGenerator: React.FC<QuotationGeneratorProps> = ({ 
  initialData, 
  onComplete,
  onCancel
}) => {
  const [customerName, setCustomerName] = useState(initialData.customerName || "");
  const [customerEmail, setCustomerEmail] = useState("");
  const [gstPercent, setGstPercent] = useState("18");
  const [items, setItems] = useState(initialData.models.map(model => {
    const product = products.find(p => p.id === model.productId);
    
    return {
      model: model.model,
      productId: model.productId,
      product: product,
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

  const generateQuotation = () => {
    if (!customerName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    
    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;
    
    // Create quotation items
    const quotationItems = items.map(item => {
      if (!item.product && item.productId) {
        item.product = products.find(p => p.id === item.productId) || null;
      }
      
      const quotationItem = createQuotationItem(
        item.product,
        item.quantity,
        item.unitPrice,
        !item.product, // isCustomItem if no product found
        item.product ? undefined : item.model, // use model as name for custom items
        item.product ? undefined : `${item.model} Printer/Copier`, // default description for custom items
        "Copier"
      );
      
      subtotal += item.quantity * item.unitPrice;
      totalGst += quotationItem.gstAmount;
      
      return quotationItem;
    });
    
    // Create quotation object
    const today = new Date();
    const validUntil = new Date();
    validUntil.setDate(today.getDate() + 15);
    
    const quotation: Quotation = {
      id: Math.random().toString(36).substring(2, 9),
      quotationNumber: generateQuotationNumber(),
      customerId: Math.random().toString(36).substring(2, 9),
      customerName: customerName,
      items: quotationItems,
      subtotal: subtotal,
      totalGst: totalGst,
      grandTotal: subtotal + totalGst,
      createdAt: today.toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0],
      status: "Draft",
      notes: "",
      terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 7-10 working days after confirmation."
    };
    
    // Generate PDF for the quotation
    try {
      generateQuotationPdf(quotation);
      toast.success("Quotation PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
    
    // Complete the flow
    onComplete(quotation);
  };

  return (
    <div className="space-y-4 bg-muted p-4 rounded-md">
      <h3 className="font-medium">Generate Quotation</h3>
      
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
        <Input
          id="customerEmail"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Enter customer email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gst">GST Percentage</Label>
        <Select value={gstPercent} onValueChange={setGstPercent}>
          <SelectTrigger>
            <SelectValue placeholder="Select GST %" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5%</SelectItem>
            <SelectItem value="12">12%</SelectItem>
            <SelectItem value="18">18%</SelectItem>
            <SelectItem value="28">28%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <Label>Products</Label>
        {items.map((item, index) => (
          <div key={index} className="bg-background p-3 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Item #{index + 1}</span>
              <Badge variant="outline">{item.model}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`product-${index}`}>Select Product</Label>
                <Select 
                  value={item.productId || ""} 
                  onValueChange={(value) => handleProductSelect(index, value)}
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
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`price-${index}`}>Unit Price (₹)</Label>
              <Input
                id={`price-${index}`}
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleUnitPriceChange(index, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={generateQuotation}>
            <FileDown className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
          
          <Button onClick={generateQuotation}>
            <Send className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotationGenerator;
