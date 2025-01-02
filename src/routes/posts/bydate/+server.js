export async function GET({ url, platform }) {
    try {
      const date = url.searchParams.get('date'); // Format: YYYY-MM-DD
      
      if (!date) {
        return new Response(JSON.stringify({ error: 'Date parameter is required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
  
      // Convert date to Unix timestamp range
      const startDate = Math.floor(new Date(date).getTime() / 1000);
      const endDate = startDate + (24 * 60 * 60); // Add 24 hours
  
      const posts = await platform.env.DB.prepare(`
        SELECT *
        FROM reddit_posts
        WHERE createdAt >= ? AND createdAt < ?
        ORDER BY score DESC
      `)
      .bind(startDate, endDate)
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
