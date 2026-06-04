export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const apiKey = process.env.NIM_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'NIM_API_KEY environment variable not set'
    });
  }

  try {
    // Debug incoming payload
    console.log('REQUEST BODY:');
    console.log(JSON.stringify(req.body, null, 2));

    const nimRes = await fetch(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      }
    );

    const rawResponse = await nimRes.text();

    console.log('NIM STATUS:', nimRes.status);
    console.log('NIM RAW RESPONSE:');
    console.log(rawResponse);

    let data;

    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('JSON PARSE ERROR:', parseError);

      return res.status(500).json({
        error: 'Invalid JSON from NIM',
        status: nimRes.status,
        raw: rawResponse.substring(0, 5000)
      });
    }

    if (!nimRes.ok) {
      return res.status(nimRes.status).json(data);
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('SERVER ERROR:', err);

    return res.status(500).json({
      error: err.message
    });
  }
}
