// API endpoint to create a new service
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const {
      title,
      category,
      description,
      full_description,
      price,
      duration,
      image_url,
      is_active,
      display_order,
      additional_pricing,
      whats_included,
      exterior_points,
      interior_points,
      specifications,
      film_features
    } = req.body;

    // Validate required fields
    if (!title || !category || !description || !full_description || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, description, full_description, price, and duration are required'
      });
    }

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`
      INSERT INTO services (
        title,
        category,
        description,
        full_description,
        price,
        duration,
        image_url,
        is_active,
        display_order,
        additional_pricing,
        whats_included,
        exterior_points,
        interior_points,
        specifications,
        film_features
      ) VALUES (
        ${title},
        ${category},
        ${description},
        ${full_description},
        ${price},
        ${duration},
        ${image_url || null},
        ${is_active !== undefined ? is_active : true},
        ${display_order || 0},
        ${additional_pricing || null},
        ${JSON.stringify(whats_included || [])},
        ${JSON.stringify(exterior_points || [])},
        ${JSON.stringify(interior_points || [])},
        ${JSON.stringify(specifications || [])},
        ${JSON.stringify(film_features || [])}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result[0]
    });

  } catch (error) {
    console.error('Error creating service:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
}
