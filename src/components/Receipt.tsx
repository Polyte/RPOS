import { forwardRef } from "react";
import { Separator } from "./ui/separator";
import { PRODUCTION_CONFIG } from "../utils/production-config";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  taxRate: number;
}

interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentReceived: number;
  change: number;
  timestamp: string;
  cashier: string;
  terminal: string;
  receiptNumber: string;
}

interface ReceiptProps {
  transaction: Transaction;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({
  transaction
}, ref) => {
  const transactionDate = new Date(transaction.timestamp);
  const dateString = transactionDate.toLocaleDateString('en-ZA');
  const timeString = transactionDate.toLocaleTimeString('en-ZA', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  // Format ZAR currency
  const formatZAR = (amount: number) => `R${amount.toFixed(2)}`;

  return (
    <div ref={ref} className="receipt bg-white p-6 max-w-sm mx-auto font-mono shadow-luxury animate-fade-in overflow-auto max-h-screen">
      {/* Header */}
      <div className="receipt-header text-center mb-6">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse-glow">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {PRODUCTION_CONFIG.COMPANY_NAME}
          </h1>
        </div>
        <p className="text-sm text-gray-700 font-semibold">Premium Point of Sale</p>
        <p className="text-xs text-gray-600">{PRODUCTION_CONFIG.COMPANY_ADDRESS}</p>
        <p className="text-xs text-gray-600">Tel: {PRODUCTION_CONFIG.COMPANY_PHONE}</p>
        <p className="text-xs text-gray-600">VAT: {PRODUCTION_CONFIG.COMPANY_VAT_NUMBER}</p>
      </div>

      <Separator className="my-4 border-dashed" />

      {/* Transaction Details */}
      <div className="mb-4 text-sm space-y-1">
        <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
          <span className="font-medium">Date:</span>
          <span>{dateString}</span>
        </div>
        <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
          <span className="font-medium">Time:</span>
          <span>{timeString}</span>
        </div>
        <div className="flex justify-between bg-blue-50 px-2 py-1 rounded">
          <span className="font-medium">Receipt #:</span>
          <span className="font-mono text-xs font-bold">{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
          <span className="font-medium">Terminal:</span>
          <span>{transaction.terminal}</span>
        </div>
        <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
          <span className="font-medium">Cashier:</span>
          <span>{transaction.cashier}</span>
        </div>
      </div>

      <Separator className="my-4 border-dashed" />

      {/* Items */}
      <div className="receipt-items mb-4">
        <h3 className="font-bold mb-3 text-center bg-gray-100 py-2 rounded">ITEMS PURCHASED</h3>
        <div className="space-y-2">
          {transaction.items.map((item, index) => (
            <div key={index} className="border-b border-dotted border-gray-300 pb-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold flex-1 pr-2">{item.name}</span>
                <span className="text-sm font-bold">{formatZAR(item.price * item.quantity)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{item.quantity} × {formatZAR(item.price)}</span>
                <span className="italic">each</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4 border-dashed border-gray-400" />

      {/* Totals */}
      <div className="receipt-total text-sm space-y-2">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span className="font-medium">{formatZAR(transaction.subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span className="font-medium">{formatZAR(transaction.tax)}</span>
        </div>
        <Separator className="my-2 border-solid border-gray-400" />
        <div className="flex justify-between font-bold text-lg bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg">
          <span>TOTAL:</span>
          <span className="text-green-700">{formatZAR(transaction.total)}</span>
        </div>
      </div>

      <Separator className="my-4 border-dashed" />

      {/* Payment Details */}
      <div className="text-center mb-4 bg-gradient-to-r from-blue-50 to-purple-50 py-3 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-1">PAYMENT METHOD</p>
        <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {transaction.paymentMethod.toUpperCase()}
        </p>
        
        {transaction.paymentMethod.toLowerCase() === 'cash' && (
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between max-w-40 mx-auto">
              <span className="text-gray-600">Received:</span>
              <span className="font-medium">{formatZAR(transaction.paymentReceived)}</span>
            </div>
            <div className="flex justify-between max-w-40 mx-auto">
              <span className="text-gray-600">Change:</span>
              <span className="font-medium text-green-600">{formatZAR(transaction.change)}</span>
            </div>
          </div>
        )}
        
        {transaction.paymentMethod.toLowerCase() === 'card' && (
          <p className="text-xs text-gray-600 mt-1">Approved - Thank you</p>
        )}
      </div>

      <Separator className="my-4 border-dashed" />

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 space-y-2">
        <p className="font-semibold text-gray-800">{PRODUCTION_CONFIG.RECEIPT_FOOTER_TEXT}</p>
        <p>Please retain this receipt for your records</p>
        <p className="italic">We appreciate your business</p>
        <div className="mt-3 pt-2 border-t border-dotted">
          <p className="text-xs">For queries: {PRODUCTION_CONFIG.COMPANY_EMAIL}</p>
          <p className="text-xs">Returns within {PRODUCTION_CONFIG.RETURN_POLICY_DAYS} days with receipt</p>
        </div>
      </div>

      {/* QR Code Placeholder */}
      <div className="flex justify-center mt-4">
        <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100">
          QR
          <br />
          CODE
        </div>
      </div>

      {/* Legal Footer */}
      <div className="text-center mt-3 pt-2 border-t border-dotted text-xs text-gray-500">
        <p>VAT Reg: {PRODUCTION_CONFIG.COMPANY_VAT_NUMBER} • CK: {PRODUCTION_CONFIG.COMPANY_REGISTRATION}</p>
        <p className="mt-1">Transaction ID: {transaction.id}</p>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";