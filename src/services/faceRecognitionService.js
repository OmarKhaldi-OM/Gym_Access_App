import { apiPost } from './api.js'

export async function enrollFace(memberId, imageBase64) {
  return apiPost('/api/face-recognition/enroll', { memberId, imageBase64 })
}

export async function enrollAccountFace(imageBase64) {
  return apiPost('/api/face-recognition/enroll-account', { imageBase64 })
}

export async function recognizeFace(imageBase64, typeAcces = 'ENTREE') {
  return apiPost('/api/face-recognition/recognize', { imageBase64, typeAcces })
}
