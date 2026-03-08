export const runtime = 'edge'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1d4ed8"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="32" font-family="Arial" fill="white">G</text></svg>`

export async function GET() {
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
