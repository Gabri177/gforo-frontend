import axio from '~/axios/index'


export function getPostsByPage(currentPage, limit){
	
	let request;
	if (limit)
		request = `/home/${currentPage}?limit=${limit}`
	else
		request = `/home/${currentPage}`
	return axio.get(request)
}