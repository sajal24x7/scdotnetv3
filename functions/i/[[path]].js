// Cloudflare Pages Function: GET /i/<key>
//
// Streams images out of the IMAGES R2 bucket so the bucket needs no public
// domain — everything is served from the site's own hostname. Responses are
// immutable (keys are content-unique) and cached at the edge via the Cache API.

export async function onRequestGet(context) {
  const { request, env, params } = context;
  if (!env.IMAGES) return new Response('IMAGES R2 binding is not configured', { status: 500 });

  const key = (Array.isArray(params.path) ? params.path : [params.path]).join('/');
  if (!key) return new Response('Not found', { status: 404 });

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const object = await env.IMAGES.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  const response = new Response(object.body, { headers });
  context.waitUntil(cache.put(request, response.clone()));
  return response;
}
