import { listRedditPostsByDate } from "$lib/server/reddit-posts.js";

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
  
      const posts = await listRedditPostsByDate(platform.env.DB, startDate, endDate, limit);
  
      return new Response(JSON.stringify(posts), {
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
