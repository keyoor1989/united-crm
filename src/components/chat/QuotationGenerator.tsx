
import React from "react";
import { useQuotationGenerator } from "./quotation/hooks/useQuotationGenerator";
import CustomerSearch from "./quotation/CustomerSearch";
import CustomerInfoForm from "./quotation/CustomerInfoForm";
import GstSelector from "./quotation/GstSelector";
import ProductList from "./quotation/ProductList";
import ActionButtons from "./quotation/ActionButtons";
import { products } from "@/data/salesData";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { Quotation } from "@/types/sales";

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
  const {
    customerName,
    customerEmail,
    customerPhone,
    gstPercent,
    items,
    showCustomerSearch,
    setCustomerEmail,
    setCustomerPhone,
    setGstPercent,
    handleProductSelect,
    handleQuantityChange,
    handleUnitPriceChange,
    toggleCustomerSearch,
    selectCustomer,
    generateQuotation
  } = useQuotationGenerator({ initialData, onComplete });
  
  return (
    <div className="space-y-4 bg-muted p-4 rounded-md">
      <h3 className="font-medium">Generate Quotation {customerName ? `for ${customerName}` : ''}</h3>
      
      <div className="space-y-2">
        <CustomerSearch
          onSelectCustomer={selectCustomer}
          showSearch={showCustomerSearch}
          onToggleSearch={toggleCustomerSearch}
          customerName={customerName}
        />
      </div>
      
      <CustomerInfoForm
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        onEmailChange={setCustomerEmail}
        onPhoneChange={setCustomerPhone}
      />
      
      <GstSelector
        gstPercent={gstPercent}
        onGstChange={setGstPercent}
      />
      
      <ProductList
        items={items}
        products={products}
        onProductSelect={handleProductSelect}
        onQuantityChange={handleQuantityChange}
        onUnitPriceChange={handleUnitPriceChange}
      />
      
      <ActionButtons
        onCancel={onCancel}
        onGenerateQuotation={generateQuotation}
      />
    </div>
  );
};

export default QuotationGenerator;
