// Razorpay Payment Initialization
async function initializeRazorpayPayment(orderData, amount) {
    try {
        console.log('Initializing Razorpay payment for amount:', amount);
        
        // Create order in your backend or directly call Razorpay
        const options = {
            key: "rzp_test_YOUR_KEY_ID", // Replace with your Razorpay key
            amount: amount * 100, // Amount in paise (₹1 = 100 paise)
            currency: "INR",
            name: "Natura Honey",
            description: "Order Payment",
            image: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119",
            order_id: null, // We'll generate this from your backend
            handler: async function (response) {
                console.log('Razorpay payment successful:', response);
                
                // Update order with payment details
                orderData.paymentStatus = 'paid';
                orderData.razorpayPaymentId = response.razorpay_payment_id;
                orderData.razorpayOrderId = response.razorpay_order_id;
                orderData.razorpaySignature = response.razorpay_signature;
                orderData.paidAt = new Date().toISOString();
                
                // Save order to Firestore
                await saveOrderAndProcess(orderData);
            },
            prefill: {
                name: orderData.customerName,
                email: orderData.customerEmail,
                contact: orderData.customerPhone
            },
            notes: {
                orderId: orderData.orderId
            },
            theme: {
                color: "#5f2b27"
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment cancelled by user');
                    showNotification('Payment was cancelled. Please try again.', 'warning');
                    
                    // Reset button state
                    const checkoutBtn = document.querySelector('.checkout-btn');
                    checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
                    checkoutBtn.disabled = false;
                    isProcessingPayment = false;
                }
            }
        };
        
        // If you have a backend, fetch order_id from your server
        // For now, we'll create a dummy order_id
        if (!options.order_id) {
            // Create a temporary order_id
            options.order_id = 'order_' + Date.now();
        }
        
        const razorpay = new Razorpay(options);
        razorpay.open();
        
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        throw error;
    }
}
