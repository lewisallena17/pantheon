/** @type {import('next').NextConfig} */
const nextConfig = {
  // Piper TTS runs in the browser via WASM and a web worker. Next.js needs
  // these headers so SharedArrayBuffer works (the WASM requires it).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },
  webpack: (config) => {
    // Piper-tts-web ships WASM + ONNX model loaders; don't let webpack choke on them
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false }
    return config
  },
}

export default nextConfig
