// This is a simple worker to serve static files from the dist directory
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    const response = await getAssetFromKV(event, {
      mapRequestToAsset: request => {
        // Add logic to customize how requests are mapped to assets
        return new Request(`${new URL(request.url).pathname}`, request)
      }
    })
    return response
  } catch (e) {
    // If an error occurs, return a 404 response
    return new Response('Not found', { status: 404 })
  }
}
