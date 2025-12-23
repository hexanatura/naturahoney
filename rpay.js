// Razorpay Payment Initialization
async function initializeRazorpayPayment(orderData, amount) {
    try {
        console.log('Initializing Razorpay payment for amount:', amount);
        
        const options = {
            key: "rzp_test_YOUR_KEY_ID", 
            amount: amount * 100, 
            currency: "INR",
            name: "Natura Honey",
            description: "Order Payment",
            image: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119",
            order_id: null, 
            handler: async function (response) {
                console.log('Razorpay payment successful:', response);
                
                orderData.paymentStatus = 'paid';
                orderData.razorpayPaymentId = response.razorpay_payment_id;
                orderData.razorpayOrderId = response.razorpay_order_id;
                orderData.razorpaySignature = response.razorpay_signature;
                orderData.paidAt = new Date().toISOString();
                
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

async function saveOrderAndProcess(orderData) {
    try {
        console.log('Saving order after payment...');
        
        // Save order to Firestore
        const orderRef = await saveOrderToFirestore(orderData);
        console.log('Order saved with ID:', orderRef.id);
        
        // Prepare data for success popup
        const updatedOrderData = {
            ...orderData,
            id: orderRef.id,
            orderId: orderData.orderId,
            orderNumber: orderData.orderId,
            status: 'ordered',
            paymentStatus: 'paid',
            paidAt: new Date().toISOString(),
            total: orderData.total
        };
        
        // Clear cart
        await clearCartAfterOrder();
        
        // Show success popup with NA-XXXXX order ID
        if (typeof showOrderSuccessPopup === 'function') {
            showOrderSuccessPopup(updatedOrderData);
        } else {
            alert(`Order confirmed successfully! Order ID: ${updatedOrderData.orderId}\n\nA confirmation email has been sent to ${orderData.email}`);
            window.location.href = 'index.html';
        }
        
        // Reset processing flag
        isProcessingPayment = false;
        
    } catch (error) {
        console.error('Error saving order after payment:', error);
        showNotification('Error processing order. Please contact support.', 'error');
        
        // Reset button state
        const checkoutBtn = document.querySelector('.checkout-btn');
        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        checkoutBtn.disabled = false;
        isProcessingPayment = false;
    }
}

if (!navigator.onLine) {
    showNotification('No internet connection. Please check your connection and try again.', 'error');
    return;
}
