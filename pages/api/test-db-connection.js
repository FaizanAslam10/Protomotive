// Test database connection - Fixed version
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Testing database connection...');
    console.log('Environment variables check:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
    console.log('POSTGRES_PRISMA_URL exists:', !!process.env.POSTGRES_PRISMA_URL);
    
    // Try to import @neondatabase/serverless dynamically
    console.log('Attempting to import @neondatabase/serverless...');
    const { neon } = await import('@neondatabase/serverless');
    console.log('Successfully imported @neondatabase/serverless');
    
    // Create SQL connection with Neon
    console.log('Creating Neon SQL connection...');
    const sql = neon(process.env.DATABASE_URL);
    console.log('Neon SQL connection created');
    
    // Test basic database connection with a simple query first
    console.log('Testing basic database connection...');
    const basicTest = await sql`SELECT 1 as test`;
    console.log('Basic query successful:', basicTest);
    
    // Try to query the bookings table
    console.log('Querying bookings table...');
    const result = await sql`SELECT COUNT(*) as count FROM bookings`;
    console.log('Bookings count query successful:', result);

    // Try to get table structure
    console.log('Getting table structure...');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `;
    console.log('Table structure query successful:', tableInfo);

    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      basicTest: basicTest[0] || basicTest,
      bookingsCount: (result[0] && result[0].count) || 0,
      tableStructure: tableInfo || [],
      rawResults: {
        basicTest: basicTest,
        result: result,
        tableInfo: tableInfo
      },
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Database connection test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(200).json({
      success: false,
      message: 'Database connection failed',
      error: {
        name: error.name,
        message: error.message,
        code: error.code
      },
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
}