export async function GET({ url, platform }) {
    try {
      // Get and validate parameters
      const startDate = url.searchParams.get('start');
      const endDate = url.searchParams.get('end');
      const limit = parseInt(url.searchParams.get('limit') || '20');
  
      if (!startDate || !endDate) {
        return new Response(JSON.stringify({ 
          error: 'Both start and end date parameters are required' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
  
      const posts = await platform.env.DB.prepare(`
        SELECT *
        FROM reddit_posts
        WHERE date(createdAt) >= date(?)
        AND date(createdAt) <= date(?)
        ORDER BY score DESC
        LIMIT ?
      `)
      .bind(startDate, endDate, limit)
      .all();
  
      return new Response(JSON.stringify(posts.results), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
