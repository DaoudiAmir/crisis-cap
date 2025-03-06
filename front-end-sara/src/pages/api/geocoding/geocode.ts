import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * API route that proxies geocoding requests to Nominatim to avoid CORS issues
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  try {
    // Forward the request to Nominatim
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        'accept-language': 'fr',
      },
      headers: {
        'User-Agent': 'Crisis-Cap Emergency Management Platform'
      }
    });

    // Return the Nominatim response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error proxying to Nominatim:', error);
    return res.status(500).json({ error: 'Failed to fetch from Nominatim API' });
  }
}
