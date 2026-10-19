import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { Panel, SectionHeader } from '../components/Panel.jsx'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import Toast from '../components/Toast.jsx'
import { ApiError, ApiLoading } from '../components/ApiState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../hooks/useToast.js'
import * as profileService from '../services/profileService.js'
import { useT } from '../context/I18nContext.jsx'
import GoogleIdentityButton from '../components/GoogleIdentityButton.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function ProfileEdit() {
  const t = useT()
  const { user } = useAuth()
  const { toastMessage, toastVariant, toastId, toastLeaving, showToast, dismissToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false)
  const [confirmPhotoRemoval, setConfirmPhotoRemoval] = useState(false)
  const [googleLinked, setGoogleLinked] = useState(false)
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false)
  const [googleLinkError, setGoogleLinkError] = useState('')

  const loadProfile = () => {
    setLoading(true)
    setError(null)
    profileService.getProfile()
      .then((data) => {
        setProfile(data)
        setPhotoPreview(data.photo)
        if (user?.role === 'MEMBER') {
          profileService.getGoogleLinkStatus()
            .then((status) => setGoogleLinked(status.linked))
            .catch((statusError) => setGoogleLinkError(statusError.message))
        }
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProfile() }, [user?.id])
  useEffect(() => () => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const update = (field) => (event) => setProfile((current) => ({ ...current, [field]: event.target.value }))

  const choosePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_SIZE) {
      setActionError(t('photoInvalid'))
      event.target.value = ''
      return
    }
    setActionError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    event.target.value = ''
  }

  const removePhoto = async () => {
    if (photoFile) {
      setPhotoFile(null)
      setPhotoPreview(profile.photo)
      return
    }
    setConfirmPhotoRemoval(true)
  }

  const confirmRemovePhoto = async () => {
    setActionError('')
    setIsRemovingPhoto(true)
    try {
      const updated = await profileService.removeProfilePhoto()
      setProfile(updated)
      setPhotoPreview('')
      showToast(t('photoRemoved'))
    } finally {
      setIsRemovingPhoto(false)
    }
  }

  const save = async (event) => {
    event.preventDefault()
    setActionError('')
    if (!profile.nom.trim() || !profile.email.trim()) {
      setActionError(t('profileRequired'))
      return
    }
    setIsSaving(true)
    try {
      const updated = await profileService.updateProfile(user.id, profile, photoFile)
      setProfile(updated)
      setPhotoPreview(updated.photo)
      setPhotoFile(null)
      showToast(t('profileUpdated'))
    } catch (saveError) {
      setActionError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoogleLink = async (credential) => {
    setGoogleLinkError('')
    setIsLinkingGoogle(true)
    try {
      await profileService.linkGoogleAccount(credential)
      setGoogleLinked(true)
      showToast(t('googleLinked'))
    } catch (linkError) {
      setGoogleLinkError(linkError.message || t('googleSignInError'))
    } finally {
      setIsLinkingGoogle(false)
    }
  }

  if (loading) return <Layout><ApiLoading message={t('loading')} /></Layout>
  if (error || !profile) return <Layout><ApiError error={error || new Error(t('requestFailed', 'Impossible de charger votre profil.'))} onRetry={loadProfile} /></Layout>

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">{t('editProfile')}</h1>
      <Panel className="p-6">
        <SectionHeader title={t('personalInformation')} />
        <form onSubmit={save} className="grid gap-5 p-5 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            <Avatar name={profile.nom} size="lg" src={photoPreview} />
            <label className="button button-dark cursor-pointer">
              {t('changePhoto')}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={choosePhoto} disabled={isSaving || isRemovingPhoto} />
            </label>
            {photoPreview && <button type="button" className="text-sm text-text-muted underline" onClick={removePhoto} disabled={isSaving || isRemovingPhoto}>{isRemovingPhoto ? t('saving') : t('resetPhoto')}</button>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">{t('fullName')}<input required autoComplete="name" className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={profile.nom} onChange={update('nom')} /></label>
            <label className="text-sm font-medium">{t('emailLabel')}<input type="email" autoComplete="email" required className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={profile.email} onChange={update('email')} /></label>
            <label className="text-sm font-medium">{t('phone')}<input type="tel" autoComplete="tel" className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={profile.telephone} onChange={update('telephone')} /></label>
            <label className="text-sm font-medium md:col-span-2">{t('about')}<textarea rows="4" className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={profile.bio} onChange={update('bio')} /></label>
            {actionError && <p className="text-sm text-red-700 md:col-span-2" role="alert">{actionError}</p>}
            <Button className="justify-self-start" disabled={isSaving || isRemovingPhoto}>{isSaving ? t('saving') : t('save')}</Button>
          </div>
        </form>
      </Panel>
      {user?.role === 'MEMBER' && (
        <Panel className="mt-6 p-6">
          <SectionHeader title={t('googleAccount')} />
          <div className="grid gap-3 p-5">
            <p className="text-sm text-text-muted">{googleLinked ? t('googleAlreadyLinked') : t('googleLinkHelp')}</p>
            {googleLinkError && <p className="text-sm text-red-700" role="alert">{googleLinkError}</p>}
            {!googleLinked && <GoogleIdentityButton onCredential={handleGoogleLink} disabled={isLinkingGoogle} />}
          </div>
        </Panel>
      )}
      {confirmPhotoRemoval && <ConfirmDialog
        title={t('confirmDeletion')}
        description={t('confirmRemovePhoto')}
        confirmLabel={t('removePhoto')}
        onClose={() => setConfirmPhotoRemoval(false)}
        onConfirm={confirmRemovePhoto}
      />}
      <Toast message={toastMessage} variant={toastVariant} id={toastId} leaving={toastLeaving} onClose={dismissToast} />
    </Layout>
  )
}