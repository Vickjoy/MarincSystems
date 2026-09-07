import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartModal = ({ onClose }) => {
  const { cartItems, removeFromCart, getTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0,0,0,0.3)', 
        zIndex: 99999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        paddingRight: '20px',
        pointerEvents: 'none'
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: 24, 
          minWidth: 340, 
          maxWidth: 400, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', 
          position: 'relative',
          animation: 'slideInFromRight 0.3s ease-out',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes slideInFromRight {
              from {
                opacity: 0;
                transform: translateX(100px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}
        </style>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: 10, 
            right: 14, 
            background: 'none', 
            border: 'none', 
            fontSize: 22, 
            color: '#e74c3c', 
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.color = '#c0392b'}
          onMouseOut={(e) => e.target.style.color = '#e74c3c'}
        >×</button>
        <h3 style={{ 
          marginBottom: 18, 
          color: '#6096B4', 
          fontWeight: 800, 
          textAlign: 'center' 
        }}>Your Cart</h3>
        {cartItems.length === 0 ? (
          <div style={{ 
            color: '#888', 
            textAlign: 'center', 
            margin: '2rem 0' 
          }}>Your cart is empty.</div>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cartItems.map(item => (
                <li key={item.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: 12, 
                  borderBottom: '1px solid #eee', 
                  paddingBottom: 8 
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#000' }}>{item.name || `Product #${item.id}`}</div>
                    <div style={{ fontSize: 13, color: '#1DCD9F' }}>KES {(Number(item.price) * item.quantity).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#e74c3c', 
                      fontSize: 20, 
                      cursor: 'pointer', 
                      marginLeft: 8,
                      transition: 'color 0.2s ease'
                    }}
                    title="Remove"
                    onMouseOver={(e) => e.target.style.color = '#c0392b'}
                    onMouseOut={(e) => e.target.style.color = '#e74c3c'}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 17, 
              margin: '18px 0 10px', 
              textAlign: 'right', 
              color: '#6096B4' 
            }}>
              Total: KES {getTotal().toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </div>
            <button
              style={{ 
                width: '100%', 
                background: '#1DCD9F', 
                color: 'white', 
                fontWeight: 700, 
                padding: '0.7rem 0', 
                borderRadius: 6, 
                border: 'none', 
                fontSize: 17, 
                cursor: 'pointer', 
                marginTop: 8,
                transition: 'all 0.2s ease'
              }}
              onClick={() => { onClose(); navigate('/order-summary'); }}
              onMouseOver={(e) => {
                e.target.style.background = '#17b591';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#1DCD9F';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;