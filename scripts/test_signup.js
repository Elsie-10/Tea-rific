const url = 'http://localhost:3000/api/auth/signup';
(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Automation Tester', email: 'tester+automation@example.com', password: 'TestPass123', phone: '1234567890' }),
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log(text);
  } catch (err) {
    console.error('fetch error', err.message);
  }
})();
