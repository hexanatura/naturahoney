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
                
                // Show immediate success
                showNotification('Payment successful! Confirmation email sent.', 'success');
                
                // Show success popup with order details
                const updatedOrderData = {
                    ...orderData,
                    orderId: orderData.orderId,
                    paymentStatus: 'paid',
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    paidAt: new Date().toISOString(),
                    total: amount
                };
                
                if (typeof showOrderSuccessPopup === 'function') {
                    showOrderSuccessPopup(updatedOrderData);
                }
                
                // Clear cart
                await clearCartAfterOrder();
                
                // Reset processing flag
                isProcessingPayment = false;
            },
            prefill: {
                name: orderData.customerName,
                email: orderData.customerEmail,
                contact: orderData.customerPhone
            },
            notes: {
                orderId: orderData.orderId,
                customerEmail: orderData.customerEmail
            },
            theme: {
                color: "#5f2b27"
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment cancelled by user');
                    showNotification('Payment cancelled. Please try again.', 'warning');
                    
                    const checkoutBtn = document.querySelector('.checkout-btn');
                    checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
                    checkoutBtn.disabled = false;
                    isProcessingPayment = false;
                }
            }
        };
        
        // Create Razorpay order from Firebase function
        try {
            const createOrderFunction = firebase.functions().httpsCallable('createRazorpayOrder');
            const result = await createOrderFunction({
                amount: amount,
                receipt: orderData.orderId,
                notes: {
                    orderId: orderData.orderId,
                    customerEmail: orderData.customerEmail,
                    customerName: orderData.customerName
                }
            });
            
            options.order_id = result.data.orderId;
            console.log('Using server-generated Razorpay order:', options.order_id);
            
        } catch (error) {
            console.log('Server order creation failed, using client-side:', error);
            // Continue with client-side
        }
        
        const razorpay = new Razorpay(options);
        
        // Handle payment failure
        razorpay.on('payment.failed', function(response) {
            console.error('Payment failed:', response.error);
            
            const errorMsg = response.error.description || 'Payment failed. Please try again.';
            showNotification(`Payment failed: ${errorMsg}`, 'error');
            
            // Reset button
            const checkoutBtn = document.querySelector('.checkout-btn');
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
            checkoutBtn.disabled = false;
            isProcessingPayment = false;
            
            // Mark order as failed in Firestore
            if (orderData.id) {
                db.collection('orders').doc(orderData.id).update({
                    paymentStatus: 'failed',
                    paymentError: response.error,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        });
        
        razorpay.open();
        
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        showNotification('Payment gateway error. Please try again.', 'error');
        
        const checkoutBtn = document.querySelector('.checkout-btn');
        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        checkoutBtn.disabled = false;
        isProcessingPayment = false;
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
