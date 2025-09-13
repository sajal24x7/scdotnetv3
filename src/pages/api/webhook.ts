import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verify the webhook is from webmention.io
    const body = await request.text();
    const data = JSON.parse(body);
    
    // Basic validation
    if (!data || !data.source || !data.target) {
      return new Response('Invalid webhook data', { status: 400 });
    }
    
    // Log the webhook for debugging
    console.log('Webmention webhook received:', {
      source: data.source,
      target: data.target,
      property: data.property,
      timestamp: new Date().toISOString()
    });
    
    // In a real implementation, you would:
    // 1. Trigger a rebuild of your site
    // 2. Or update the webmentions.json file directly
    // 3. Or queue a job to fetch new webmentions
    
    // For now, we'll just return success
    // You can integrate this with your deployment platform's rebuild webhook
    return new Response('Webhook received', { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export const GET: APIRoute = async () => {
  return new Response('Webmention webhook endpoint', { status: 200 });
};