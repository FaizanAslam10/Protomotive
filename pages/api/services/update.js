// API endpoint to update an existing service
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const {
      id,
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
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`
      UPDATE services SET
        title = COALESCE(${title}, title),
        category = COALESCE(${category}, category),
        description = COALESCE(${description}, description),
        full_description = COALESCE(${full_description}, full_description),
        price = COALESCE(${price}, price),
        duration = COALESCE(${duration}, duration),
        image_url = COALESCE(${image_url}, image_url),
        is_active = COALESCE(${is_active}, is_active),
        display_order = COALESCE(${display_order}, display_order),
        additional_pricing = COALESCE(${additional_pricing}, additional_pricing),
        whats_included = COALESCE(${whats_included ? JSON.stringify(whats_included) : null}::jsonb, whats_included),
        exterior_points = COALESCE(${exterior_points ? JSON.stringify(exterior_points) : null}::jsonb, exterior_points),
        interior_points = COALESCE(${interior_points ? JSON.stringify(interior_points) : null}::jsonb, interior_points),
        specifications = COALESCE(${specifications ? JSON.stringify(specifications) : null}::jsonb, specifications),
        film_features = COALESCE(${film_features ? JSON.stringify(film_features) : null}::jsonb, film_features),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service: result[0]
    });

  } catch (error) {
    console.error('Error updating service:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
}
