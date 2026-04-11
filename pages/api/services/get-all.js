// API endpoint to get all services (optionally filtered by category)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { category, activeOnly } = req.query;

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    let services;

    if (category) {
      // Get services by category
      if (activeOnly === 'true') {
        services = await sql`
          SELECT * FROM services
          WHERE category = ${category} AND is_active = true
          ORDER BY display_order ASC, created_at DESC
        `;
      } else {
        services = await sql`
          SELECT * FROM services
          WHERE category = ${category}
          ORDER BY display_order ASC, created_at DESC
        `;
      }
    } else {
      // Get all services
      if (activeOnly === 'true') {
        services = await sql`
          SELECT * FROM services
          WHERE is_active = true
          ORDER BY category, display_order ASC, created_at DESC
        `;
      } else {
        services = await sql`
          SELECT * FROM services
          ORDER BY category, display_order ASC, created_at DESC
        `;
      }
    }

    res.status(200).json({
      success: true,
      services: services || [],
      count: services ? services.length : 0
    });

  } catch (error) {
    console.error('Error fetching services:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
}
