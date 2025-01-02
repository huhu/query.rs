export async function GET({ url, platform }) {
    try {
      // Get and validate parameters
      const startDate = url.searchParams.get('start');
      const endDate = url.searchParams.get('end');
      const limit = parseInt(url.searchParams.get('limit') || '10');
  
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
  
      // Convert dates to Unix timestamps
      const startTimestamp = Math.floor(new Date(startDate).getTime());
      const endTimestamp = Math.floor(new Date(endDate).getTime());
  
      // Validate date range
      if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
        return new Response(JSON.stringify({ 
          error: 'Invalid date format. Use YYYY-MM-DD format' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
  
      if (startTimestamp > endTimestamp) {
        return new Response(JSON.stringify({ 
          error: 'Start date must be before end date' 
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
        WHERE createdAt >= ? AND createdAt <= ?
        ORDER BY score DESC
        LIMIT ?
      `)
      .bind(startTimestamp, endTimestamp, limit)
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
