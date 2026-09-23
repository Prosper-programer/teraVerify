async function runTests() {
  const API_URL = 'http://localhost:5001/api';
  console.log('--- RUNNING SURVEYOR TESTS ---');

  try {
    console.log('1. Logging in as admin...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@terraverify.cm', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.error);
    const token = loginData.token;
    console.log('Login successful.');

    console.log('2. Fetching verification requests...');
    const reqsRes = await fetch(`${API_URL}/verification/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const reqsData = await reqsRes.json();
    if (!reqsRes.ok) throw new Error(reqsData.error);
    console.log(`Fetched ${reqsData.length} requests.`);

    if (reqsData.length > 0) {
      const firstReq = reqsData[0];
      console.log(`3. Updating request ${firstReq.id} to "under_review"...`);
      
      const updateRes = await fetch(`${API_URL}/verifications/${firstReq.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: 'under_review',
          surveyorNotes: 'Test note from surveyor',
          surveyorId: loginData.user.id
        })
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error);
      
      console.log('Update result:', updateData.message);
    } else {
      console.log('No requests found to update.');
    }
    
    console.log('--- ALL TESTS PASSED ---');
  } catch (err) {
    console.error('TEST FAILED:', err.message);
  }
}

runTests();
