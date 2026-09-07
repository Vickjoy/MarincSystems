import React, { useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import styles from './OrderSummary.module.css';

const OrderSummary = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  // Quantity change handler for number input
  const handleQuantityChange = (item, e) => {
    const newQty = parseInt(e.target.value);
    if (isNaN(newQty) || newQty < 1) return;
    updateQuantity(item.id, newQty);
  };

  // Handle Request Quotation
  const handleRequestQuote = () => {
    if (cartItems.length === 0) return;

    // Format the message with product names and quantities
    let message = "Hello! I would like to request a quotation for the following items:\n\n";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name || `Product #${item.id}`} - Quantity: ${item.quantity || 1}\n`;
    });
    
    message += "\nPlease provide me with pricing and availability information. Thank you!";
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/254117320000?text=${encodedMessage}`;
    
    // Clear the cart using both methods to ensure it works
    if (clearCart) {
      clearCart();
    } else {
      setCart([]);
    }
    
    // Also clear from localStorage if it exists
    try {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
    } catch (e) {
      console.log('LocalStorage not available');
    }
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={styles.container}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Order Summary', path: '/order-summary' }]} />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Order Summary
          </h2>
          <button
            className={styles.continueButton}
            onClick={() => navigate('/category/addressable-fire-alarm-detection-systems')}
          >
            Continue Shopping
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={`${styles.tableHeaderCell} ${styles.left}`}>
                  Image
                </th>
                <th className={`${styles.tableHeaderCell} ${styles.left}`}>
                  Product Name
                </th>
                <th className={`${styles.tableHeaderCell} ${styles.center}`}>
                  Quantity
                </th>
                <th className={`${styles.tableHeaderCell} ${styles.center}`}>
                  Remove
                </th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    Your cart is empty.
                  </td>
                </tr>
              ) : (
                cartItems.map((item, index) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <img
                        src={
                          item.image
                            ? (typeof item.image === 'object' && item.image instanceof File)
                              ? URL.createObjectURL(item.image)
                              : (typeof item.image === 'string' && (item.image.startsWith('data:') || item.image.startsWith('blob:')))
                                ? item.image
                                : (item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`)
                            : '/placeholder.png'
                        }
                        alt={item.name}
                        className={styles.productImage}
                      />
                    </td>
                    <td className={`${styles.tableCell} ${styles.productName}`}>
                      {item.name || `Product #${item.id}`}
                    </td>
                    <td className={`${styles.tableCell} ${styles.quantityCell}`}>
                      <div className={styles.quantityContainer}>
                        <input
                          type="number"
                          value={item.quantity || 1}
                          min="1"
                          className={styles.quantityInput}
                          onChange={(e) => handleQuantityChange(item, e)}
                        />
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.center}`}>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className={styles.removeButton}
                        title="Remove"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.requestQuoteContainer}>
          <button
            className={styles.requestQuoteButton}
            onClick={handleRequestQuote}
            disabled={cartItems.length === 0}
          >
            Request Quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;