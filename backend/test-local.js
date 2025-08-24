const axios = require('axios');

async function testServer() {
  try {
    console.log('🧪 Testing local server...');
    
    const response = await axios.get('http://localhost:5000/api/test');
    console.log('✅ Local test successful:', response.data);
    
    return true;
  } catch (error) {
    console.error('❌ Local test failed:', error.message);
    return false;
  }
}

testServer(); 