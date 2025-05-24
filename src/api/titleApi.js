import axio from '~/axios/index'


export function getMyTitles(){
  return axio.get('/title/my')
}

export function setMyTitle(titleId){
  return axio.put(`/title/my/${titleId}`)
}

///////////////ADMIN//////////////////


export function getUserTitles(userId){
  return axio.get(`/title/user/${userId}`)
}

export function getTitleListWithoutExp(){
  return axio.get('/title/list')
}

export function updateTitle(data){
  return axio.post('/title',data)
}

export function deleteTitle(titleId){
  return axio.delete(`/title/${titleId}`)
}

export function grantTitle(userId,titleId){
  return axio.put(`/title/grant/${userId}/${titleId}`)
}

export function addTitle(title){
  return axio.post('/title/add',title)
}