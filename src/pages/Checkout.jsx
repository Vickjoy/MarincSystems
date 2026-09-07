import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './Checkout.module.css';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import PaymentImage from '../assets/Payment.jpg';

const mpesaImage = PaymentImage;

const Checkout = () => {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  // Form state for billing information
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    country: '',
    state: '',
    streetAddress: '',
    postcode: '',
    phone: '',
    email: ''
  });

  // Calculate totals
  const totalBeforeTax = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const taxRate = 0.16; // 16%
  const taxAmount = totalBeforeTax * taxRate;
  const totalWithTax = totalBeforeTax + taxAmount;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form validation
  const validateForm = () => {
    const required = ['firstName', 'lastName', 'country', 'state', 'streetAddress', 'postcode', 'phone', 'email'];
    for (const field of required) {
      if (!billingInfo[field].trim()) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      alert('Please enter a valid email address.');
      return false;
    }
    
    return true;
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Here you would send both billing info and order data to your endpoint
      const orderData = {
        billingInfo,
        cartItems,
        totals: {
          subtotal: totalBeforeTax,
          tax: taxAmount,
          total: totalWithTax
        }
      };
      
      console.log('Order data to be sent:', orderData);
      
      // TODO: Replace with actual API call when endpoint is ready
      // const response = await fetch('/api/orders/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(orderData)
      // });
      
      // For now, show success message
      alert('Order placed successfully! (This is a demo - no actual order was processed)');
      
      // You might want to clear the cart and redirect to a success page
      // clearCart();
      // navigate('/order-success');
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Checkout', path: '/checkout' }]} />
      <section className={styles.section}>
        <div className={styles.backButtonContainer}>
          <button
            className={styles.backButton}
            onClick={() => navigate('/order-summary')}
          >
            ← Back
          </button>
        </div>
        <div className={styles.gridContainer}>
          {/* Billing Information */}
          <div className={styles.billingColumn}>
            <div className={styles.billingCard}>
              <h2 className={styles.header}>Billing Information</h2>
              <form className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.label}>First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName"
                      className={styles.input} 
                      value={billingInfo.firstName}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.label}>Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName"
                      className={styles.input} 
                      value={billingInfo.lastName}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="companyName" className={styles.label}>Company Name (optional)</label>
                  <input 
                    type="text" 
                    id="companyName" 
                    name="companyName"
                    className={styles.input} 
                    value={billingInfo.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="country" className={styles.label}>Country</label>
                    <input 
                      type="text" 
                      id="country" 
                      name="country"
                      className={styles.input} 
                      value={billingInfo.country}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="state" className={styles.label}>State/County</label>
                    <input 
                      type="text" 
                      id="state" 
                      name="state"
                      className={styles.input} 
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="streetAddress" className={styles.label}>Street Address</label>
                  <input 
                    type="text" 
                    id="streetAddress" 
                    name="streetAddress"
                    className={styles.input} 
                    value={billingInfo.streetAddress}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="postcode" className={styles.label}>Postcode</label>
                    <input 
                      type="text" 
                      id="postcode" 
                      name="postcode"
                      className={styles.input} 
                      value={billingInfo.postcode}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      className={styles.input} 
                      value={billingInfo.phone}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    className={styles.input} 
                    value={billingInfo.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                {/* Removed the submit billing information button */}
              </form>
            </div>
          </div>

          {/* Order & Payment Section */}
          <div className={styles.orderColumn}>
            {/* Your Order Card */}
            <div className={styles.orderCard}>
              <h3 className={styles.orderHeader}>Your Order</h3>
              <div className={styles.orderItems}>
                {cartItems.length === 0 ? (
                  <div className={styles.emptyOrder}>Your cart is empty.</div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.orderItemInfo}>
                        <span className={styles.orderItemName}>{item.name || `Product #${item.id}`}</span>
                        <span className={styles.orderItemDetails}>
                          Qty: {item.quantity || 1} × KES {Number(item.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className={styles.orderItemActions}>
                        <span className={styles.orderItemPrice}>
                          KES {(item.price * (item.quantity || 1)).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className={styles.removeBtn} 
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {cartItems.length > 0 && (
                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>KES {totalBeforeTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Total VAT (16%):</span>
                    <span>KES {taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total:</span>
                    <span>KES {totalWithTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Card */}
            <div className={styles.paymentCard}>
              <h3 className={styles.paymentHeader}>Payment</h3>
              <div className={styles.paymentMpesa}>Lipa na M-Pesa</div>
              <div className={styles.paymentImage}>
                {mpesaImage ? (
                  <img 
                    src={mpesaImage} 
                    alt="M-Pesa Payment Details" 
                    className={styles.mpesaImage}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    [M-Pesa Payment Image Here]
                  </div>
                )}
              </div>
              {/* Single Place Order Button */}
              <button 
                className={styles.placeOrderButton} 
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;