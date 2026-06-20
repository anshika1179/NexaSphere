import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { RefreshCw } from 'lucide-react';

const ConnectionExchange = ({ userId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (userId && canvasRef.current) {
      // Generate a deep link for connection
      const connectionData = `nexasphere://connect/${userId}`;
      QRCode.toCanvas(
        canvasRef.current,
        connectionData,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR Generation failed', error);
        }
      );
    }
  }, [userId]);

  return (
    <div className="attendee-card" style={{ textAlign: 'center' }}>
      <h3>My Networking QR</h3>
      <p>Let others scan this to instantly exchange contact info</p>
      <div className="qr-container">
        <canvas ref={canvasRef}></canvas>
      </div>
      <button className="btn-secondary" style={{ marginTop: '1rem' }}>
        <RefreshCw size={16} /> Update Code
      </button>
    </div>
  );
};

export default ConnectionExchange;
