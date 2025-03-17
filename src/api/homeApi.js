import axio from '~/axios/index'


export function getPostsByPage(currentPage, orderMode, limit){
	
	let request
	request = `/home/${currentPage}`
	if (limit)
		request += `?limit=${limit}`
	if (limit && orderMode)
		request += `&orderMode=${orderMode}`
	else if (orderMode)
		request += `?orderMode=${orderMode}`
		
	return axio.get(request)
}