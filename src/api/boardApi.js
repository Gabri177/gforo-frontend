import axio from '~/axios/index'

export function getBoardList(){
	return axio.get('/board');
}
