// your code goes here <script>
    const firebaseConfig = {
      apiKey: "AIzaSyDuF6bdqprddsE871GuOablXPYqXI_HJxc",
      authDomain: "hexahoney-96aed.firebaseapp.com",
      projectId: "hexahoney-96aed",
      storageBucket: "hexahoney-96aed.firebasestorage.app",
      messagingSenderId: "700458850837",
      appId: "1:700458850837:web:0eb4fca98a5f4acc2d0c1c",
      measurementId: "G-MQGKK9709H"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // DOM Elements
    const orderIdInput = document.getElementById('orderIdInput');
    const orderEmailInput = document.getElementById('orderEmailInput');
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    const orderStatusSection = document.getElementById('orderStatusSection');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const displayOrderId = document.getElementById('displayOrderId');
    const displayOrderDate = document.getElementById('displayOrderDate');
    const customerName = document.getElementById('customerName');
    const customerEmail = document.getElementById('customerEmail');
    const orderStatusBadge = document.getElementById('orderStatusBadge');
    const desktopProgressFill = document.getElementById('desktopProgressFill');
    const mobileProgressFill = document.getElementById('mobileProgressFill');
    const orderItemsList = document.getElementById('orderItemsList');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderShipping = document.getElementById('orderShipping');
    const orderTotal = document.getElementById('orderTotal');
    const trackAnotherBtn = document.getElementById('trackAnotherBtn');
    const contactSupportBtn = document.getElementById('contactSupportBtn');

    // Status mapping
    const statusSteps = ['ordered', 'confirmed', 'shipped', 'out-for-delivery', 'delivered'];
    const statusIndexMap = {
      'ordered': 0,
      'confirmed': 1,
      'shipped': 2,
      'out-for-delivery': 3,
      'delivered': 4,
      'cancelled': -1
    };

    // Helper functions
    function formatDate(dateString) {
      if (!dateString) return 'Date not available';
      try {
        const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return 'Date not available';
      }
    }

    function formatShortDate(dateString) {
      if (!dateString) return '-';
      try {
        const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        });
      } catch (e) {
        return '-';
      }
    }

    function estimateDate(baseDate, daysToAdd) {
      try {
        const date = baseDate.toDate ? baseDate.toDate() : new Date(baseDate);
        const estimatedDate = new Date(date);
        estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
        return estimatedDate;
      } catch (e) {
        return null;
      }
    }

    // Timeline Update Functions
    function updateTimeline(order) {
      const currentStepIndex = statusIndexMap[order.status] || 0;
      const isCancelled = order.status === 'cancelled';
      
      // Update desktop timeline
      updateDesktopTimeline(currentStepIndex, isCancelled);
      updateMobileTimeline(currentStepIndex, isCancelled);
      updateStepDates(order, currentStepIndex);
      
      // Update step states
      updateStepStates(currentStepIndex, isCancelled);
    }

    function updateDesktopTimeline(currentStepIndex, isCancelled) {
      const totalSteps = statusSteps.length;
      const progressPercentage = isCancelled ? 0 : (currentStepIndex / (totalSteps - 1)) * 100;
      
      desktopProgressFill.style.width = `${progressPercentage}%`;
      desktopProgressFill.style.background = isCancelled ? '#dc3545' : '#5f2b27';
    }

    function updateMobileTimeline(currentStepIndex, isCancelled) {
      const totalSteps = statusSteps.length;
      const progressPercentage = isCancelled ? 0 : (currentStepIndex / (totalSteps - 1)) * 100;
      
      mobileProgressFill.style.height = `${progressPercentage}%`;
      mobileProgressFill.style.background = isCancelled ? '#dc3545' : '#5f2b27';
    }

    function updateStepDates(order, currentStepIndex) {
      // Update desktop dates
      document.getElementById('desktopStepOrderedDate').textContent = 
        formatShortDate(order.createdAt);
      
      document.getElementById('mobileStepOrderedDate').textContent = 
        formatShortDate(order.createdAt);
      
      // Update confirmed date
      let confirmedDate = '-';
      if (order.confirmedAt) {
        confirmedDate = formatShortDate(order.confirmedAt);
      } else if (currentStepIndex >= 1) {
        const estDate = estimateDate(order.createdAt, 1);
        confirmedDate = estDate ? 'Est. ' + formatShortDate(estDate) : '-';
      }
      document.getElementById('desktopStepConfirmedDate').textContent = confirmedDate;
      document.getElementById('mobileStepConfirmedDate').textContent = confirmedDate;
      
      // Update shipped date
      let shippedDate = '-';
      if (order.shippedAt) {
        shippedDate = formatShortDate(order.shippedAt);
      } else if (currentStepIndex >= 2) {
        const estDate = estimateDate(order.createdAt, 2);
        shippedDate = estDate ? 'Est. ' + formatShortDate(estDate) : '-';
      }
      document.getElementById('desktopStepShippedDate').textContent = shippedDate;
      document.getElementById('mobileStepShippedDate').textContent = shippedDate;
      
      // Update out for delivery date
      let outForDeliveryDate = '-';
      if (order.outForDeliveryAt) {
        outForDeliveryDate = formatShortDate(order.outForDeliveryAt);
      } else if (order.status === 'out-for-delivery') {
        outForDeliveryDate = 'Today';
      } else if (currentStepIndex >= 3) {
        const estDate = estimateDate(order.createdAt, 3);
        outForDeliveryDate = estDate ? 'Est. ' + formatShortDate(estDate) : '-';
      }
      document.getElementById('desktopStepOutForDeliveryDate').textContent = outForDeliveryDate;
      document.getElementById('mobileStepOutForDeliveryDate').textContent = outForDeliveryDate;
      
      // Update delivered date
      let deliveredDate = '-';
      if (order.deliveredAt) {
        deliveredDate = formatShortDate(order.deliveredAt);
      } else if (currentStepIndex >= 4) {
        const estDate = estimateDate(order.createdAt, 5);
        deliveredDate = estDate ? 'Est. ' + formatShortDate(estDate) : '-';
      }
      document.getElementById('desktopStepDeliveredDate').textContent = deliveredDate;
      document.getElementById('mobileStepDeliveredDate').textContent = deliveredDate;
    }

    function updateStepStates(currentStepIndex, isCancelled) {
      const steps = ['Ordered', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered'];
      
      // Reset all steps
      steps.forEach(step => {
        const desktopStep = document.getElementById(`desktopStep${step}`);
        const mobileStep = document.getElementById(`mobileStep${step}`);
        
        desktopStep.classList.remove('completed', 'active', 'cancelled');
        mobileStep.classList.remove('completed', 'active', 'cancelled');
      });
      
      if (isCancelled) {
        // Mark all steps as cancelled
        steps.forEach(step => {
          const desktopStep = document.getElementById(`desktopStep${step}`);
          const mobileStep = document.getElementById(`mobileStep${step}`);
          
          desktopStep.classList.add('cancelled');
          mobileStep.classList.add('cancelled');
        });
      } else {
        // Mark steps up to current step as completed
        for (let i = 0; i <= currentStepIndex; i++) {
          const step = steps[i];
          const desktopStep = document.getElementById(`desktopStep${step}`);
          const mobileStep = document.getElementById(`mobileStep${step}`);
          
          if (desktopStep && mobileStep) {
            desktopStep.classList.add('completed');
            mobileStep.classList.add('completed');
            
            // Mark current step as active
            if (i === currentStepIndex) {
              desktopStep.classList.add('active');
              mobileStep.classList.add('active');
            }
          }
        }
      }
    }

    function updateStatusBadge(status) {
      const statusMap = {
        'ordered': { text: 'Order Placed', class: 'placed' },
        'confirmed': { text: 'Confirmed', class: 'confirmed' },
        'shipped': { text: 'Shipped', class: 'shipped' },
        'out-for-delivery': { text: 'Out for Delivery', class: 'out-for-delivery' },
        'delivered': { text: 'Delivered', class: 'delivered' },
        'cancelled': { text: 'Cancelled', class: 'cancelled' }
      };

      const statusInfo = statusMap[status] || statusMap.ordered;
      orderStatusBadge.textContent = statusInfo.text;
      orderStatusBadge.className = `status-badge-simple ${statusInfo.class}`;
    }

function updateOrderItems(items) {
    orderItemsList.innerHTML = '';
    
    if (!items || items.length === 0) {
        orderItemsList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666; background: #f9f9f9; border-radius: 10px;">
                No items found in this order
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const itemHTML = `
            <div class="order-item">
                <div class="item-image">
                    <img src="${item.image || item.productImage || 'https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_gyalrfgyalrfgyal.jpg?updatedAt=1757217705022'}" 
                         alt="${item.name}" 
                         onerror="this.src='https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_gyalrfgyalrfgyal.jpg?updatedAt=1757217705022'">
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name || 'Product'}</div>
                    <div class="item-meta">
                        <span>${item.weight || 'N/A'}</span>
                        <span>Qty: ${item.quantity || 1}</span>
                    </div>
                </div>
                <div class="item-price">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</div>
            </div>
        `;
        orderItemsList.innerHTML += itemHTML;
    });
}
    function updateOrderSummary(order) {
      const subtotal = order.items ? order.items.reduce((sum, item) => 
        sum + ((item.price || 0) * (item.quantity || 1)), 0) : 0;
      
      orderSubtotal.textContent = `₹${subtotal.toLocaleString()}`;
      orderShipping.textContent = 'FREE';
      orderTotal.textContent = `₹${(order.total || subtotal).toLocaleString()}`;
    }

    function showError(message) {
      errorText.textContent = message;
      errorMessage.classList.add('active');
      emptyState.classList.add('active');
      orderStatusSection.classList.remove('active');
      loadingState.classList.remove('active');
    }

    function showOrder(orderData) {
      const orderNumber = orderData.orderId || orderData.id || 'N/A';
      displayOrderId.textContent = `Order ${orderNumber}`;
      displayOrderDate.textContent = `Order Date: ${formatDate(orderData.createdAt)}`;
      
      if (orderData.shippingAddress) {
        const firstName = orderData.shippingAddress.firstName || '';
        const lastName = orderData.shippingAddress.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        customerName.textContent = `Customer: ${fullName || 'Not provided'}`;
      } else {
        customerName.textContent = 'Customer: Not provided';
      }
      
      customerEmail.textContent = `Email: ${orderData.email || 'Not provided'}`;

      updateStatusBadge(orderData.status || 'ordered');
      updateTimeline(orderData);
      updateOrderItems(orderData.items || []);
      updateOrderSummary(orderData);

      loadingState.classList.remove('active');
      emptyState.classList.remove('active');
      errorMessage.classList.remove('active');
      orderStatusSection.classList.add('active');
    }

    async function trackOrder() {
      const orderNumber = orderIdInput.value.trim().toUpperCase();
      const email = orderEmailInput.value.trim().toLowerCase();

      if (!orderNumber || !email) {
        showError('Please enter both Order Number and Email address');
        return;
      }

      loadingState.classList.add('active');
      orderStatusSection.classList.remove('active');
      emptyState.classList.remove('active');
      errorMessage.classList.remove('active');

      try {
        let searchOrderId = orderNumber;
        if (!orderNumber.startsWith('NA-') && /^\d+$/.test(orderNumber)) {
          searchOrderId = 'NA-' + orderNumber;
        }

        let orderFound = false;
        let orderData = null;

        const searchStrategies = [
          () => db.collection('orders').where('orderId', '==', searchOrderId).limit(1).get(),
          () => db.collection('orders').where('orderNumber', '==', searchOrderId).limit(1).get(),
          () => db.collection('orders').where('id', '==', searchOrderId).limit(1).get()
        ];

        for (const strategy of searchStrategies) {
          try {
            const querySnapshot = await strategy();
            if (!querySnapshot.empty) {
              for (const doc of querySnapshot.docs) {
                const data = doc.data();
                if (data.email && data.email.toLowerCase() === email) {
                  orderFound = true;
                  orderData = { id: doc.id, ...data };
                  break;
                }
              }
            }
            if (orderFound) break;
          } catch (err) {
            console.log('Search strategy failed:', err.message);
          }
        }

        if (orderFound) {
          showOrder(orderData);
        } else {
          showError('Order not found or email does not match. Please check your details.');
        }

      } catch (error) {
        console.error('Error fetching order:', error);
        
        if (error.code === 'permission-denied') {
          showError('Permission denied. Please check Firestore security rules.');
        } else {
          showError('Error fetching order details. Please try again.');
        }
      } finally {
        loadingState.classList.remove('active');
      }
    }

    function resetTracking() {
      orderIdInput.value = '';
      orderEmailInput.value = '';
      orderStatusSection.classList.remove('active');
      emptyState.classList.add('active');
      errorMessage.classList.remove('active');
      orderIdInput.focus();
    }

    function contactSupport() {
      window.location.href = 'mailto:hexahoney.info@gmail.com?subject=Order%20Support%20Request';
    }

    // Event Listeners
    trackOrderBtn.addEventListener('click', trackOrder);
    trackAnotherBtn.addEventListener('click', resetTracking);
    contactSupportBtn.addEventListener('click', contactSupport);

    orderIdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') trackOrder();
    });

    orderEmailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') trackOrder();
    });

    // Handle window resize to recalculate timeline
    window.addEventListener('resize', () => {
      // The timeline will automatically adjust via CSS
      // No need for JavaScript recalculation
    });

    emptyState.classList.add('active');
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderFromUrl = urlParams.get('order');
    const emailFromUrl = urlParams.get('email');
    
    if (orderFromUrl) {
      orderIdInput.value = orderFromUrl;
      if (emailFromUrl) {
        orderEmailInput.value = emailFromUrl;
        setTimeout(() => trackOrder(), 500);
      }
    }
