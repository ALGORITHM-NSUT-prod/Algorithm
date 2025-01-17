import React, { useState, useEffect } from 'react';

const FloatingBackground = ({ children }) => {
  const [circleCount, setCircleCount] = useState(30);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCircleCount(15);
      } else {
        setCircleCount(30);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="area text-white justify-center font-bold relative content-center flex justify-content">
      <ul className="circles flex flex-wrap justify-center items-center">
        {Array.from({ length: circleCount }).map((_, index) => (
          <li key={index} className="circle">
            <span className="circle-text"></span>
          </li>
        ))}
      </ul>
      <div className="content">
        {children}
      </div>

      <style>{`
        .area {
          background: #0f0c29;
          background: -webkit-linear-gradient(to bottom, #24243e, #302b63, #0f0c29);
          background: linear-gradient(to bottom, #0e0620, #151238, #0e0b27);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: -1;
        }

        .circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .circles li {
          will-change: transform, opacity;
          position: absolute;
          display: block;
          list-style: none;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
          animation: animate 25s linear infinite;
          bottom: -150px;
        }
        @media (max-width: 768px) {
          .circles li {
            background: rgba(128, 123, 184, 0.2); /* Change to your desired color */
          }
        }
        .circle {
          display: flex;
          justify-content: center;
          align-items: center;
          line-height: 2; 
        }

        .circle-text {
          font-size: calc(0.25 * 100%); /* Responsive size based on circle size */
          text-align: center;
          line-height: 2; /* Ensures vertical centering */
        }

        /* Individual circle styles */
        .circles li:nth-child(1) { left: 25%; width: 80px; height: 80px; animation-delay: 0s; }
        .circles li:nth-child(2) { left: 10%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s; }
        .circles li:nth-child(3) { left: 70%; width: 20px; height: 20px; animation-delay: 4s; }
        .circles li:nth-child(4) { left: 40%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s; }
        .circles li:nth-child(5) { left: 65%; width: 20px; height: 20px; animation-delay: 0s; }
        .circles li:nth-child(6) { left: 75%; width: 110px; height: 110px; animation-delay: 3s; }
        .circles li:nth-child(7) { left: 35%; width: 150px; height: 150px; animation-delay: 7s; }
        .circles li:nth-child(8) { left: 50%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s; }
        .circles li:nth-child(9) { left: 20%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s; }
        .circles li:nth-child(10) { left: 85%; width: 50px; height: 50px; animation-delay: 0s; animation-duration: 11s; }
        .circles li:nth-child(11) { left: 85%; width: 30px; height: 30px; animation-delay: 0s; }
        .circles li:nth-child(12) { left: 60%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s; }
        .circles li:nth-child(13) { left: 10%; width: 20px; height: 20px; animation-delay: 4s; }
        .circles li:nth-child(14) { left: 60%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s; }
        .circles li:nth-child(15) { left: 25%; width: 20px; height: 20px; animation-delay: 0s; }
        .circles li:nth-child(16) { left: 15%; width: 110px; height: 110px; animation-delay: 3s; }
        .circles li:nth-child(17) { left: 85%; width: 100px; height: 100px; animation-delay: 7s; }
        .circles li:nth-child(18) { left: 10%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s; }
        .circles li:nth-child(19) { left: 90%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s; }
        .circles li:nth-child(20) { left: 35%; width: 70px; height: 70px; animation-delay: 0s; animation-duration: 11s; }
        .circles li:nth-child(21) { left: 55%; width: 60px; height: 60px; animation-delay: 0s; }
        .circles li:nth-child(22) { left: 70%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s; }
        .circles li:nth-child(23) { left: 5%; width: 20px; height: 20px; animation-delay: 4s; }
        .circles li:nth-child(24) { left: 90%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s; }
        .circles li:nth-child(25) { left: 5%; width: 20px; height: 20px; animation-delay: 0s; }
        .circles li:nth-child(26) { left: 45%; width: 110px; height: 110px; animation-delay: 3s; }
        .circles li:nth-child(27) { left: 75%; width: 150px; height: 150px; animation-delay: 7s; }
        .circles li:nth-child(28) { left: 10%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s; }
        .circles li:nth-child(29) { left: 80%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s; }
        .circles li:nth-child(30) { left: 5%; width: 150px; height: 150px; animation-delay: 0s; animation-duration: 11s; }

        @keyframes animate {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
            border-radius: 0;
          }

          100% {
            transform: translateY(-1000px) rotate(720deg);
            opacity: 0;
            border-radius: 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(FloatingBackground);
