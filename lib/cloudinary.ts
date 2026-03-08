export function withCloudinaryTransform(url: string | null | undefined, transformation: string) {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url

  const marker = '/upload/'
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) return url

  const prefix = url.slice(0, markerIndex + marker.length)
  const suffix = url.slice(markerIndex + marker.length)

  if (suffix.startsWith('f_auto') || suffix.startsWith('q_auto') || suffix.startsWith('c_')) {
    return url
  }

  return `${prefix}${transformation}/${suffix}`
}

export function getCloudinaryOptimizedImage(url: string | null | undefined) {
  return withCloudinaryTransform(url, 'f_auto,q_auto,dpr_auto')
}

export function getCloudinaryHeroImage(url: string | null | undefined) {
  return withCloudinaryTransform(url, 'f_auto,q_auto,dpr_auto,w_1800')
}

export function getCloudinaryCardImage(url: string | null | undefined) {
  return withCloudinaryTransform(url, 'f_auto,q_auto,dpr_auto,w_900,c_fill,g_auto')
}

export function getCloudinaryThumbImage(url: string | null | undefined) {
  return withCloudinaryTransform(url, 'f_auto,q_auto,dpr_auto,w_600,c_fill,g_auto')
}
