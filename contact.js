function initContactPage() {
    if (document.getElementById('contactForm')) {
        initContactForm();
    }
    
    initMap();
    addContactEventListeners();
    addSuccessMessageStyles();
    addRealTimeValidation();
    autoFillFormForUser();
}

function initMap() {
    const mapIframe = document.querySelector('.map-section iframe');
    if (mapIframe) {
        mapIframe.addEventListener('load', function() {
            console.log('Map loaded successfully');
        });
        
        mapIframe.addEventListener('error', function() {
            console.error('Failed to load map');
            showMapFallback();
        });
        
        setTimeout(() => {
            if (mapIframe.contentWindow && mapIframe.contentWindow.document) {
                console.log('Map is accessible');
            } else {
                console.warn('Map might be blocked by browser restrictions');
            }
        }, 3000);
    }
}

function showMapFallback() {
    const mapSection = document.querySelector('.map-section');
    if (mapSection) {
        const fallbackHTML = `
            <div style="
                background: #f8f9fa;
                padding: 40px;
                text-align: center;
                border-radius: 15px;
                border: 2px dashed #dee2e6;
            ">
                <i class="fas fa-map-marker-alt" style="font-size: 48px; color: #6c757d; margin-bottom: 15px;"></i>
                <h3 style="color: #5f2b27; margin-bottom: 10px;">Map Not Available</h3>
                <p style="color: #6c757d; margin-bottom: 20px;">We're located in Thalassery, Kannur, Kerala</p>
                <a href="https://maps.google.com/?q=Thalassery,Kannur,Kerala" 
                   target="_blank" 
                   style="
                       background: #5f2b27;
                       color: white;
                       padding: 10px 20px;
                       border-radius: 25px;
                       text-decoration: none;
                       font-family: 'Unbounded', sans-serif;
                       font-weight: 600;
                   ">
                   Open in Google Maps
                </a>
            </div>
        `;
        mapSection.innerHTML = fallbackHTML;
    }
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmission();
        });
        
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                this.value = this.value.replace(/[^\d]/g, '');
            });
            
            phoneInput.addEventListener('paste', function(e) {
                const pasteData = e.clipboardData.getData('text');
                if (!/^\d+$/.test(pasteData)) {
                    e.preventDefault();
                    alert('Only numbers are allowed in phone field');
                }
            });
        }
    }
}

function handleContactFormSubmission() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    if (!validateContactForm()) {
        return;
    }
    
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    removeExistingSuccessMessage();
    
    if (!db) {
        console.error('Firebase not initialized');
        showFormErrorMessage('Connection error. Please check your internet connection.');
        resetSubmitButton(submitBtn, originalText);
        return;
    }
    
    const submissionData = {
        name: name,
        email: email,
        phone: phone || 'Not provided',
        subject: subject,
        message: message,
        userId: currentUser ? currentUser.uid : 'guest',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        page: 'contact',
        timestamp: new Date().toISOString()
    };
    
    db.collection('contactSubmissions').add(submissionData)
        .then((docRef) => {
            console.log('Form submitted successfully with ID:', docRef.id);
            
            if (currentUser) {
                db.collection('analytics').add({
                    type: 'contact_form_submission',
                    userId: currentUser.uid,
                    page: 'contact',
                    subject: subject,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(analyticsError => {
                    console.warn('Analytics tracking failed:', analyticsError);
                });
            }
            
            showFormSuccessMessage();
            contactForm.reset();
        })
        .catch((error) => {
            console.error("Error submitting contact form to Firestore:", error);
            
            if (error.code === 'unavailable' || error.code === 'failed-precondition') {
                showFormErrorMessage('Network issue. Please try again or contact us directly at info@hexaanatura.com');
            } else {
                showFormErrorMessage('Error submitting form. Please try again or contact us directly.');
            }
            
            saveToLocalStorage(submissionData);
        })
        .finally(() => {
            resetSubmitButton(submitBtn, originalText);
        });
}

function saveToLocalStorage(formData) {
    try {
        const submissions = JSON.parse(localStorage.getItem('contactFormBackup') || '[]');
        submissions.push({
            ...formData,
            localTimestamp: new Date().toISOString(),
            id: Date.now().toString()
        });
        localStorage.setItem('contactFormBackup', JSON.stringify(submissions));
        console.log('Form data saved to localStorage as backup');
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function resetSubmitButton(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
}

function removeExistingSuccessMessage() {
    const existingMessage = document.querySelector('.form-success-feedback');
    if (existingMessage) {
        existingMessage.remove();
    }
}

function showFormSuccessMessage() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const submitBtn = contactForm.querySelector('.submit-btn');
    
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success-feedback';
    successMsg.innerHTML = `
        <div style="
            background: #d4edda;
            color: #155724;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #c3e6cb;
            margin-top: 15px;
            text-align: center;
            font-family: 'Unbounded', sans-serif;
            font-weight: 500;
            font-size: 14px;
            animation: fadeIn 0.5s ease-in;
        ">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            Thank you for your feedback! We'll get back to you soon.
        </div>
    `;
    
    submitBtn.parentNode.insertBefore(successMsg, submitBtn.nextSibling);
    
    setTimeout(() => {
        if (successMsg.parentElement) {
            successMsg.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                if (successMsg.parentElement) {
                    successMsg.remove();
                }
            }, 500);
        }
    }, 5000);
}

function showFormErrorMessage(message = 'Error submitting form. Please try again.') {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const submitBtn = contactForm.querySelector('.submit-btn');
    
    removeExistingSuccessMessage();
    const existingError = document.querySelector('.form-error-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'form-error-feedback';
    errorMsg.innerHTML = `
        <div style="
            background: #f8d7da;
            color: #721c24;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #f5c6cb;
            margin-top: 15px;
            text-align: center;
            font-family: 'Unbounded', sans-serif;
            font-weight: 500;
            font-size: 14px;
        ">
            <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
            ${message}
        </div>
    `;
    
    submitBtn.parentNode.insertBefore(errorMsg, submitBtn.nextSibling);
    
    setTimeout(() => {
        if (errorMsg.parentElement) {
            errorMsg.remove();
        }
    }, 5000);
}

function addSuccessMessageStyles() {
    if (!document.getElementById('success-message-styles')) {
        const style = document.createElement('style');
        style.id = 'success-message-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
            }
            .form-success-feedback {
                animation: fadeIn 0.5s ease-in;
            }
            
            .map-fallback {
                background: #f8f9fa;
                padding: 40px;
                text-align: center;
                border-radius: 15px;
                border: 2px dashed #dee2e6;
            }
            
            .map-fallback i {
                font-size: 48px;
                color: #6c757d;
                margin-bottom: 15px;
            }
            
            .map-fallback h3 {
                color: #5f2b27;
                margin-bottom: 10px;
            }
            
            .map-fallback p {
                color: #6c757d;
                margin-bottom: 20px;
            }
            
            .map-fallback a {
                background: #5f2b27;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                text-decoration: none;
                font-family: 'Unbounded', sans-serif;
                font-weight: 600;
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }
}

function addContactEventListeners() {
    document.querySelectorAll('.social-icons a').forEach(link => {
        link.addEventListener('click', function(e) {
            const platform = this.querySelector('i').className.split(' ')[1].split('-')[1];
            trackSocialMediaClick(platform);
        });
    });
    
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', function() {
            const method = this.querySelector('h3').textContent.toLowerCase();
            trackContactMethodClick(method);
        });
    });
}

function trackSocialMediaClick(platform) {
    if (currentUser && db) {
        db.collection('analytics').add({
            type: 'social_media_click',
            platform: platform,
            userId: currentUser.uid,
            page: 'contact',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.warn('Analytics tracking failed:', error);
        });
    }
}

function trackContactMethodClick(method) {
    if (currentUser && db) {
        db.collection('analytics').add({
            type: 'contact_method_click',
            method: method,
            userId: currentUser.uid,
            page: 'contact',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.warn('Analytics tracking failed:', error);
        });
    }
}

function validateContactForm() {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const subject = document.getElementById('subject')?.value;
    const message = document.getElementById('message')?.value.trim();
    
    clearFormErrors();
    
    let isValid = true;
    
    if (!name || name.length < 2) {
        showFieldError('name', 'Name must be at least 2 characters long');
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (phone && !/^\d+$/.test(phone)) {
        showFieldError('phone', 'Phone number can only contain numbers');
        isValid = false;
    }
    
    if (!subject) {
        showFieldError('subject', 'Please select a subject');
        isValid = false;
    }
    
    if (!message || message.length < 10) {
        showFieldError('message', 'Message must be at least 10 characters long');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        font-family: Unbounded, sans-serif;
    `;
    errorElement.textContent = message;
    
    formGroup.appendChild(errorElement);
}

function clearFormErrors() {
    document.querySelectorAll('.form-group input.error, .form-group select.error, .form-group textarea.error').forEach(field => {
        field.classList.remove('error');
    });
    
    document.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
}

function addRealTimeValidation() {
    const fields = ['name', 'email', 'phone', 'message'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(fieldId);
            });
        }
    });
    
    const subjectField = document.getElementById('subject');
    if (subjectField) {
        subjectField.addEventListener('change', function() {
            validateField('subject');
        });
    }
}

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const value = field.value.trim();
    
    const formGroup = field.closest('.form-group');
    const existingError = formGroup?.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldId) {
        case 'name':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            
        case 'phone':
            if (value && !/^\d+$/.test(value)) {
                isValid = false;
                errorMessage = 'Phone number can only contain numbers';
            }
            break;
            
        case 'subject':
            if (!value) {
                isValid = false;
                errorMessage = 'Please select a subject';
            }
            break;
            
        case 'message':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long';
            }
            break;
    }
    
    if (!isValid) {
        field.classList.add('error');
        showFieldError(fieldId, errorMessage);
    }
}

function autoFillFormForUser() {
    if (currentUser) {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        
        if (nameField && currentUser.displayName) {
            nameField.value = currentUser.displayName;
        }
        
        if (emailField && currentUser.email) {
            emailField.value = currentUser.email;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initContactPage();
    
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setTimeout(autoFillFormForUser, 100);
            }
        });
    }
});

window.ContactPage = {
    initContactPage,
    handleContactFormSubmission,
    validateContactForm
};
