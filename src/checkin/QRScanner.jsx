import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

export default function QRScanner({ onScan }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('starting')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStatus('scanning')
        scanLoop()
      }
    } catch (err) {
      console.log('Camera error:', err)
      setStatus('denied')
    }
  }

  const stopCamera = () => {
    // Stop animation loop
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const scanLoop = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        onScan(code.data)
        return // Stop loop after scan!
      }
    }

    animFrameRef.current = requestAnimationFrame(scanLoop)
  }

  if (status === 'denied') {
    return (
      <div className="w-full rounded-3xl border-2 border-red-400/30 bg-gray-900 flex items-center justify-center"
        style={{ minHeight: '300px', maxWidth: '400px', margin: '0 auto' }}>
        <p className="text-red-400 text-sm text-center px-4">
          Camera access denied!<br />Use manual entry below.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto 24px auto', position: 'relative' }}>
      {status === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-white/40 text-sm">Starting camera...</p>
        </div>
      )}

      {/* Live video feed */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="w-full rounded-3xl border-2 border-yellow-400/30"
        style={{ display: 'block', minHeight: '300px', background: '#111' }}
      />

      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Scan overlay */}
      {status === 'scanning' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            border: '3px solid rgba(250, 204, 21, 0.8)',
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'
          }} />
        </div>
      )}
    </div>
  )
}