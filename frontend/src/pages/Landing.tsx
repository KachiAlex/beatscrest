import React from "react";

export default function Landing() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white', 
      color: 'black',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '48px', 
        color: 'purple', 
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        BeatCrest
      </h1>
      
      <p style={{ 
        fontSize: '24px', 
        textAlign: 'center',
        color: 'gray',
        marginBottom: '40px'
      }}>
        The ultimate social media and marketplace platform for beat producers
      </p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <button style={{
          backgroundColor: 'purple',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '10px',
          fontSize: '18px',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
        
        <button style={{
          backgroundColor: 'white',
          color: 'purple',
          padding: '15px 30px',
          border: '2px solid purple',
          borderRadius: '10px',
          fontSize: '18px',
          cursor: 'pointer'
        }}>
          Explore Beats
        </button>
      </div>
      
      <div style={{ 
        marginTop: '60px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>
          Features
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            'Upload & Sell Beats',
            'Social Community', 
            'Trending Beats',
            'Producer Dashboard'
          ].map((feature, i) => (
            <div key={i} style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{ color: 'purple', marginBottom: '10px' }}>{feature}</h3>
              <p style={{ color: 'gray' }}>
                Feature description goes here for {feature.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ 
        marginTop: '60px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        padding: '40px 20px'
      }}>
        <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>
          Ready to Start Your Music Journey?
        </h2>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Join BeatCrest today and connect with a community of talented producers
        </p>
        <button style={{
          backgroundColor: 'purple',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '10px',
          fontSize: '18px',
          cursor: 'pointer'
        }}>
          Join BeatCrest Now
        </button>
      </div>
      
      <footer style={{ 
        marginTop: '60px',
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid #e9ecef',
        color: 'gray'
      }}>
        © 2024 BeatCrest. All rights reserved.
      </footer>
    </div>
  );
} 