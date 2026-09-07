import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';

const CartIconWithHover = () => {
  const { cartItems } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [isHoveringIcon, setIsHoveringIcon] = useState(false);
  const [isHoveringModal, setIsHoveringModal] = useState(false);
  const timeoutRef = useRef(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show cart when hovering icon
  const handleIconMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHoveringIcon(true);
    setShowCart(true);
  };

  // Delay hiding when leaving icon
  const handleIconMouseLeave = () => {
    setIsHoveringIcon(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringModal) {
        setShowCart(false);
      }
    }, 300); // 300ms delay
  };

  // Keep cart open when hovering modal
  const handleModalMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHoveringModal(true);
  };

  // Hide cart when leaving modal
  const handleModalMouseLeave = () => {
    setIsHoveringModal(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringIcon) {
        setShowCart(false);
      }
    }, 300); // 300ms delay
  };

  // Force close cart
  const handleCloseCart = () => {
    setShowCart(false);
    setIsHoveringIcon(false);
    setIsHoveringModal(false);
  };

  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <>
      <div
        onMouseEnter={handleIconMouseEnter}
        onMouseLeave={handleIconMouseLeave}
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'inline-block'
        }}
      >
        {/* Cart Icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-10px',
              background: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {itemCount}
          </span>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div
          onMouseEnter={handleModalMouseEnter}
          onMouseLeave={handleModalMouseLeave}
        >
          <CartModal onClose={handleCloseCart} />
        </div>
      )}
    </>
  );
};

export default CartIconWithHover;