import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface MobileMoneyPaymentProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    currency: string;
    description: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const mobileMoneyProviders = [
    { code: 'mpesa', name: 'M-Pesa', icon: '📱' },
    { code: 'tigopesa', name: 'Tigo Pesa', icon: '🟠' },
    { code: 'airtelmoney', name: 'Airtel Money', icon: '🔴' },
    { code: 'halopesa', name: 'HaloPesa', icon: '🟡' },
];

export default function MobileMoneyPayment({
    isOpen,
    onClose,
    amount,
    currency,
    description,
    onSuccess,
    onError,
}: MobileMoneyPaymentProps) {
    const [provider, setProvider] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        if (!provider || !phoneNumber) {
            setError('Please select a provider and enter your phone number');
            return;
        }

        // Validate phone number format (Tanzania)
        const phoneRegex = /^(\+255|0)[0-9]{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Please enter a valid Tanzania phone number');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real implementation, you would call your payment API here
            // const response = await fetch('/api/payments/mobile-money', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            //     },
            //     body: JSON.stringify({
            //         provider,
            //         phone_number: phoneNumber,
            //         amount,
            //         currency,
            //         description,
            //     }),
            // });

            // if (!response.ok) {
            //     throw new Error('Payment failed');
            // }

            // For demo purposes, simulate success
            onSuccess?.();
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Payment failed';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        
        // Format as +255XXXXXXXXX
        if (digits.startsWith('255')) {
            return '+' + digits;
        } else if (digits.startsWith('0')) {
            return '+255' + digits.substring(1);
        } else if (digits.length > 0) {
            return '+255' + digits;
        }
        
        return value;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Mobile Money Payment
                    </DialogTitle>
                    <DialogDescription>
                        Pay {amount.toLocaleString()} {currency} using mobile money
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Payment Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Amount:</span>
                            <span className="text-lg font-bold">
                                {amount.toLocaleString()} {currency}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium">Description:</span>
                            <span className="text-sm text-gray-600">{description}</span>
                        </div>
                    </div>

                    {/* Provider Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="provider">Select Provider</Label>
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose mobile money provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {mobileMoneyProviders.map((provider) => (
                                    <SelectItem key={provider.code} value={provider.code}>
                                        <div className="flex items-center gap-2">
                                            <span>{provider.icon}</span>
                                            <span>{provider.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+255XXXXXXXXX"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            disabled={isProcessing}
                        />
                        <p className="text-xs text-gray-500">
                            Enter your phone number (e.g., +255123456789 or 0123456789)
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Instructions:</strong>
                        </p>
                        <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside space-y-1">
                            <li>Enter your phone number and select your provider</li>
                            <li>Click "Pay Now" to initiate the payment</li>
                            <li>You will receive a payment request on your phone</li>
                            <li>Enter your PIN to complete the payment</li>
                        </ol>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay Now
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
