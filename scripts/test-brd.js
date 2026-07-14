const axios = require('axios');
const token = '4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97';

async function checkBrightData() {
  try {
    const res = await axios.get('https://api.brightdata.com/zone/get_active_zones', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Success:', res.data);
  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data || e.message);
  }
}
checkBrightData();
