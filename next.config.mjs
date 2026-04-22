/** @type {import('next').NextConfig} */
const nextConfig = {
  // No custom response headers. We previously set Cross-Origin-Embedder-Policy:
  // require-corp for Piper TTS's SharedArrayBuffer requirement, but Piper has
  // been removed and COEP blocks Google AdSense (and most third-party iframes
  // that don't serve the CORP header). Leaving this empty restores normal
  // cross-origin loading for ads + analytics + AdSense verification.
}

export default nextConfig
