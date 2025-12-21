// Razorpay Integration Module
class RazorpayIntegration {
    constructor(options = {}) {
        this.options = {
            key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay key
            amount: 100, // in paise
            currency: 'INR',
            name: 'Natura Honey',
            description: 'Order Payment',
            image: 'https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119',
            handler: this.onPaymentSuccess.bind(this),
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            theme: {
                color: '#5f2b27'
            },
            ...options
        };
    }
    
    // Initialize Razorpay
    initRazorpay(orderData, callback) {
        this.orderData = orderData;
        this.callback = callback;
        
        // Convert amount to paise
        const amountInPaise = Math.round(orderData.total * 100);
        
        const options = {
            ...this.options,
            amount: amountInPaise,
            description: `Order #${orderData.orderId}`,
            prefill: {
                name: orderData.shippingAddress.firstName + ' ' + orderData.shippingAddress.lastName,
                email: orderData.email,
                contact: orderData.shippingAddress.phone
            },
            notes: {
                order_id: orderData.orderId
            },
            handler: (response) => this.onPaymentSuccess(response)
        };
        
        this.razorpay = new Razorpay(options);
        this.razorpay.open();
        
        // Handle payment failure
        this.razorpay.on('payment.failed', (response) => {
            this.onPaymentFailed(response);
        });
    }
    
    // Payment success handler
    async onPaymentSuccess(response) {
        console.log('Payment successful:', response);
        
        // Update order with payment details
        const paymentDetails = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            payment_status: 'paid',
            paid_at: new Date().toISOString()
        };
        
        // Call the callback with payment details
        if (this.callback) {
            this.callback(true, {
                ...this.orderData,
                ...paymentDetails
            });
        }
        
        // Show success popup
        if (window.showOrderSuccess) {
            window.showOrderSuccess(this.orderData.orderId);
        }
    }
    
    // Payment failure handler
    onPaymentFailed(response) {
        console.error('Payment failed:', response);
        
        // Update order status
        const errorDetails = {
            payment_status: 'failed',
            error_code: response.error.code,
            error_description: response.error.description
        };
        
        // Call the callback with error
        if (this.callback) {
            this.callback(false, errorDetails);
        }
        
        // Show error notification
        if (window.showNotification) {
            window.showNotification('Payment failed: ' + response.error.description, 'error');
        }
    }
    
    // Create Razorpay order (server-side call - simulate)
    async createRazorpayOrder(amount) {
        // In production, this should be a server-side API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'order_' + Date.now(),
                    amount: amount * 100,
                    currency: 'INR'
                });
            }, 500);
        });
    }
    
    // Verify payment signature (server-side)
    async verifyPayment(paymentId, orderId, signature) {
        // In production, verify on server
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true); // Simulate successful verification
            }, 300);
        });
    }
}

// Make available globally
window.RazorpayIntegration = RazorpayIntegration;
