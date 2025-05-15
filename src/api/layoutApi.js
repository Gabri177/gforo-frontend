import axio from '~/axios/index'

/**
 * 获取所有轮播图列表
 */
export const getCarouselList = () => {
  return axio.get('/layout')
}

/**
 * 添加轮播图
 * @param {*} data { imageUrl, title, description, targetUrl }
 */
export const addCarousel = (data) => {
  return axio.put('/layout/carousel', data)
}

/**
 * 更新轮播图
 * @param {*} data { id, imageUrl, title, description, targetUrl }
 */
export const updateCarousel = (data) => {
  return axio.post('/layout/carousel', data)
}

/**
 * 删除轮播图
 * @param {number} id 
 */
export const deleteCarousel = (id) => {
  return axio.delete(`/layout/carousel/${id}`)
}
