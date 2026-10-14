import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useMembers } from '../context/MembersContext.jsx'
import Layout from '../components/Layout.jsx'
import { Panel } from '../components/Panel.jsx'
import Button from '../components/Button.jsx'
import { enrollAccountFace, enrollFace, recognizeFace } from '../services/faceRecognitionService.js'
import { getRoleDefinition, hasRole, ROLES } from '../roles.js'
import { useT } from '../context/I18nContext.jsx'

const MODES = {
  ENROLL_MEMBER: 'enroll-member',
  ENROLL_ACCOUNT: 'enroll-account',
  RECOGNIZE: 'recognize',
}

export default function FaceRecognitionPage() {
  const { user } = useAuth()
  const t = useT()
  const { members, loading: membersLoading, refresh: refreshMembers } = useMembers()
  const isMember = hasRole(user, ROLES.MEMBER)
  const layoutRole = getRoleDefinition(user?.role)?.label || 'member'
  const [mode, setMode] = useState(isMember ? MODES.ENROLL_ACCOUNT : MODES.ENROLL_MEMBER)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [result, setResult] = useState(null)
  const [accessType, setAccessType] = useState('ENTREE')

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const memberId = params.get('memberId')
    if (memberId) {
      setSelectedMemberId(memberId)
    }
  }, [])

  useEffect(() => {
    if (isMember) setMode(MODES.ENROLL_ACCOUNT)
  }, [isMember])

  useEffect(() => {
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id)
    }
  }, [members, selectedMemberId])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  const memberOptions = useMemo(
    () => members.filter((member) => member && member.id).map((member) => ({
      id: member.id,
      label: member.nom || [member.prenom, member.nom].filter(Boolean).join(' ') || member.email || 'Membre',
    })),
    [members],
  )

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('This browser does not support webcam access.')
      return
    }

    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraReady(true)
    } catch (error) {
      console.error('Camera initialization failed', error)
      setCameraReady(false)
      const messages = {
        NotFoundError: 'No webcam was found. Connect or enable a built-in or USB camera, then retry.',
        NotAllowedError: 'Camera permission was denied. Allow camera access for this site in your browser settings.',
        NotReadableError: 'The camera is already in use or could not be started. Close other camera apps and retry.',
        OverconstrainedError: 'The webcam does not support the requested settings. Try another camera.',
      }
      setCameraError(messages[error.name] || 'The webcam could not be started. Check that it is connected and available.')
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraReady(false)
  }

  function captureFrame() {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      throw new Error('The webcam is not ready yet.')
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  async function handleEnroll() {
    if (!selectedMemberId) {
      setResult({ status: 'DENIED', message: 'Select a member before enrolling the face.' })
      return
    }
    try {
      setIsLoading(true)
      setResult(null)
      const image = captureFrame()
      const response = await enrollFace(selectedMemberId, image)
      if (response.status !== 'ENROLLED') {
        throw new Error(response.message || 'Face enrollment was not confirmed by the server.')
      }
      setResult({
        status: response.status || 'ENROLLED',
        message: response.message || 'Face successfully enrolled.',
        success: true,
      })
      try {
        await refreshMembers()
      } catch (refreshError) {
        setResult((current) => ({
          ...current,
          message: `${current.message} Enrollment succeeded, but the queue could not be refreshed: ${refreshError.message}`,
        }))
      }
    } catch (error) {
      setResult({
        status: 'DENIED',
        message: error?.message || 'Enrollment failed.',
        success: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAccountEnroll() {
    try {
      setIsLoading(true)
      setResult(null)
      const response = await enrollAccountFace(captureFrame())
      setResult({
        status: response.status || 'ENROLLED',
        message: response.message || 'Face successfully enrolled for account sign-in.',
        success: true,
      })
    } catch (error) {
      setResult({
        status: 'DENIED',
        message: error?.message || 'Account face enrollment failed.',
        success: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRecognize() {
    try {
      setIsLoading(true)
      setResult(null)
      const image = captureFrame()
      const response = await recognizeFace(image, accessType)
      setResult({
        status: response.status || 'DENIED',
        message: response.message || 'Recognition failed.',
        success: Boolean(response.accessGranted),
        member: response.memberNom || null,
        confidence: response.confidence ?? 0,
        accessGranted: Boolean(response.accessGranted),
      })
    } catch (error) {
      setResult({
        status: 'DENIED',
        message: error?.message || 'Recognition failed.',
        success: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout role={layoutRole}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Access Control</p>
          <h1 className="text-3xl font-bold mt-2">Face Recognition</h1>
          <p className="mt-3 max-w-3xl rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100" role="alert">
            {t('faceLivenessWarning')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!isMember && (
            <Button variant={mode === MODES.ENROLL_MEMBER ? 'primary' : 'secondary'} onClick={() => setMode(MODES.ENROLL_MEMBER)}>
              Member access enrollment
            </Button>
          )}
          <Button variant={mode === MODES.ENROLL_ACCOUNT ? 'primary' : 'secondary'} onClick={() => setMode(MODES.ENROLL_ACCOUNT)}>
            Enroll my sign-in face
          </Button>
          {!isMember && (
            <Button variant={mode === MODES.RECOGNIZE ? 'primary' : 'secondary'} onClick={() => setMode(MODES.RECOGNIZE)}>
              Recognition
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Panel className="p-5">
          <div className="rounded-2xl border border-graphite-line bg-graphite-bg overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover ${cameraReady ? '' : 'invisible'}`}
              />
              {!cameraReady && (
                <div className="flex h-full w-full items-center justify-center text-center text-text-muted">
                  <div>
                    <p className="text-lg font-semibold text-white">PC webcam preview</p>
                    <p className="mt-2 text-sm">Start the camera to begin.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={startCamera} disabled={cameraReady || isLoading}>
              {cameraReady ? 'Camera active' : 'Start camera'}
            </Button>
            <Button variant="secondary" onClick={stopCamera} disabled={!cameraReady}>
              Stop camera
            </Button>
            {mode === MODES.ENROLL_MEMBER ? (
              <Button variant="secondary" onClick={handleEnroll} disabled={isLoading || !cameraReady || !selectedMemberId}>
                {isLoading ? 'Processing...' : 'Capture & enroll'}
              </Button>
            ) : mode === MODES.ENROLL_ACCOUNT ? (
              <Button variant="secondary" onClick={handleAccountEnroll} disabled={isLoading || !cameraReady}>
                {isLoading ? 'Processing...' : 'Capture & enroll for sign-in'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleRecognize} disabled={isLoading || !cameraReady}>
                {isLoading ? 'Processing...' : 'Capture & recognize'}
              </Button>
            )}
          </div>

          {cameraError && (
            <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {cameraError}
            </p>
          )}

          {result && (
            <div className={`face-recognition-result mt-5 rounded-xl border px-4 py-3 ${
              result.success ? 'face-recognition-result--success' : 'face-recognition-result--denied'
            }`}>
              <p className="text-sm uppercase tracking-[0.18em] opacity-80">Status</p>
              <p className="mt-2 text-xl font-bold">{result.status}</p>
              {result.member && <p className="mt-2 text-base">Member: {result.member}</p>}
              {result.confidence !== undefined && <p className="mt-1 text-base">Confidence: {(result.confidence * 100).toFixed(1)}%</p>}
              <p className="mt-3 text-sm opacity-90">{result.message}</p>
            </div>
          )}
        </Panel>

        <Panel className="p-5">
          <h2 className="text-xl font-bold mb-4">Member details</h2>

          {mode === MODES.ENROLL_MEMBER ? (
            <>
              <label className="block text-sm text-text-muted mb-2">Select member</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                disabled={membersLoading || memberOptions.length === 0}
                className="w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-base text-white"
              >
                {!memberOptions.length && <option value="">No member available</option>}
                {memberOptions.map((member) => (
                  <option key={member.id} value={member.id}>{member.label}</option>
                ))}
              </select>
              <p className="mt-4 text-sm text-text-muted">
                The enrolled face is saved as an embedding in the backend and later compared during access checks.
              </p>
            </>
          ) : mode === MODES.ENROLL_ACCOUNT ? (
            <>
              <p className="text-sm text-text-muted">Account sign-in face</p>
              <div className="mt-3 rounded-xl border border-graphite-line bg-graphite-bg p-4">
                <p className="text-base font-semibold">{user?.displayName || user?.email}</p>
                <p className="mt-2 text-sm text-text-muted">Only your signed-in account can be enrolled here. This face will be used to issue the same role-scoped JWT as password sign-in.</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-text-muted">Recognition mode</p>
              <div className="mt-3 rounded-xl border border-graphite-line bg-graphite-bg p-4">
                <p className="text-base font-semibold">Access type</p>
                <select
                  value={accessType}
                  onChange={(event) => setAccessType(event.target.value)}
                  className="mt-2 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-base text-white"
                >
                  <option value="ENTREE">Entry</option>
                  <option value="SORTIE">Exit</option>
                </select>
              </div>
              <p className="mt-4 text-sm text-text-muted">
                The system detects a face, computes a biometric embedding, compares it to enrolled members, validates the subscription, and records the access log.
              </p>
            </>
          )}
        </Panel>
      </div>
    </Layout>
  )
}
