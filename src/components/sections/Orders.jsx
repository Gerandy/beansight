import React from 'react';

const Orders = ({ orders = [] }) => {
  const hasOrders = orders && orders.length > 0;

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!hasOrders ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.5rem' }}>
          You haven't placed any orders yet.<br />
          Please place an order first!
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          {/* Replace this with your order list rendering */}
          <h2>Your Orders</h2>
          <ul>
            {orders.map((order, idx) => (
              <li key={idx}>
                {/* Customize order display */}
                Order #{order.id} - {order.item} - {order.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Orders;