import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { PublicShell } from '../components/PublicSite.jsx'
import { useT } from '../context/I18nContext.jsx'
import { getHomePath } from '../roles.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithFace } = useAuth()
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraReady(false)
  }

  const startCamera = async () => {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not support webcam access.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraReady(true)
    } catch (cameraStartError) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
      setCameraReady(false)
      const messages = {
        NotFoundError: 'No webcam was found.',
        NotAllowedError: 'Camera permission was denied.',
        NotReadableError: 'The camera is already in use or could not be started.',
      }
      setCameraError(messages[cameraStartError.name] || 'The webcam could not be started.')
    }
  }

  const handleFaceSignIn = async () => {
    setError('')
    setSubmitting(true)
    try {
      const video = videoRef.current
      if (!video?.videoWidth || !video.videoHeight) throw new Error('The webcam is not ready yet.')
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (!context) throw new Error('The webcam capture could not be processed.')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const user = await signInWithFace(canvas.toDataURL('image/jpeg', 0.9))
      stopCamera()
      navigate(getHomePath(user) || '/', { replace: true })
    } catch (faceSignInError) {
      window.dispatchEvent(new Event('gate:api-error-dismiss'))
      setError(faceSignInError.message || 'Face sign-in failed.')
      setSubmitting(false)
    }
  }

  const handleSignIn = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await signIn({ email, password })
      navigate(location.state?.from?.pathname || getHomePath(user) || '/', { replace: true })
    } catch (signInError) {
      window.dispatchEvent(new Event('gate:api-error-dismiss'))
      setError(signInError.message || t('wrongCredentials'))
      setSubmitting(false)
    }
  }

  return (
    <PublicShell>
      <main className="auth-page signin-page">
        <div className="auth-intro"><p className="eyebrow"><span className="live-dot" /> {t('memberSpace').toUpperCase()}</p><h1>{t('connection')}<br /><em>Gate.</em></h1><p>{t('comparePlans')}</p><div className="auth-manifesto"><span>G / MEMBER</span><p>{t('memberSpace')}</p></div></div>
        <div className="signin-form-wrap">
          <div className="form-heading"><span>{t('memberSpace').toUpperCase()}</span><p>{t('join')} ? <Link to="/plans"><strong>{t('plans')}</strong></Link></p></div>
          <form className="auth-form" onSubmit={handleSignIn}>
            <h2>{t('connection')}</h2>
            <label>{t('email')}<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('emailPlaceholder')} /></label>
            <label>{t('password')}<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('passwordPlaceholder')} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-lime submit-button" disabled={submitting}>{submitting ? t('loading') : t('signIn')} <span aria-hidden="true">↗</span></button>
          </form>
          <section className="mt-6 border-t border-graphite-line pt-5" aria-label={t('faceSignIn')}>
            <h2 className="text-lg font-semibold">{t('faceSignIn')}</h2>
            <p className="mt-2 text-sm text-text-muted">{t('faceLoginSetup')}</p>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`mt-4 aspect-video w-full rounded-xl bg-black object-cover ${cameraReady ? '' : 'hidden'}`}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="button button-secondary" onClick={startCamera} disabled={cameraReady || submitting}>
                {t('startCamera')}
              </button>
              {cameraReady && (
                <button type="button" className="button button-lime" onClick={handleFaceSignIn} disabled={submitting}>
                  {submitting ? t('loading') : t('captureAndSignIn')}
                </button>
              )}
              {cameraReady && (
                <button type="button" className="button button-secondary" onClick={stopCamera} disabled={submitting}>
                  {t('close')}
                </button>
              )}
            </div>
            {cameraError && <p className="form-error mt-3" role="alert">{cameraError}</p>}
          </section>
        </div>
      </main>
    </PublicShell>
  )
}
