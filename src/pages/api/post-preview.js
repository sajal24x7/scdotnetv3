import { getCollection } from 'astro:content';

export async function GET(context) {
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category');
  const slug = url.searchParams.get('slug');

  // Debug logging
  console.log('API Request params:', { category, slug, search: url.search });

  if (!category || !slug) {
    return new Response(JSON.stringify({ 
      error: 'Missing category or slug', 
      received: { category, slug, search: url.search }
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get all year directories from content to search across all years
    const years = ['2012', '2013', '2014', '2015', '2016', '2017', '2019', '2021', '2022', '2024', '2025'];
    
    // Search for the post across all year collections
    let foundPost = null;
    
    for (const year of years) {
      try {
        const collection = await getCollection(year);
        const post = collection.find(entry => 
          entry.slug === slug && 
          entry.data.category === category
        );
        
        if (post) {
          foundPost = post;
          break;
        }
      } catch (error) {
        // Continue searching if this year collection doesn't exist
        continue;
      }
    }

    if (!foundPost) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create an excerpt from the post body
    let excerpt = '';
    if (foundPost.body) {
      // Remove markdown formatting and create excerpt
      const cleanText = foundPost.body
        .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/\n\s*\n/g, '\n') // Remove extra newlines
        .trim();
      
      // Take first 200 characters
      excerpt = cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;
    }

    // If no excerpt from body, use description
    if (!excerpt && foundPost.data.description) {
      excerpt = foundPost.data.description;
    }

    // If still no excerpt, create a default one
    if (!excerpt) {
      excerpt = `A ${foundPost.data.category} post from ${foundPost.data.pubDate.toLocaleDateString()}`;
    }

    const response = {
      title: foundPost.data.title || 'Untitled',
      excerpt: excerpt,
      category: foundPost.data.category,
      pubDate: foundPost.data.pubDate.toISOString(),
      url: `/${foundPost.data.category}/${foundPost.slug}/`
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching post preview:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 