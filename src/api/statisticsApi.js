import axio from '~/axios/index'

export function getStatistics(){
	return axio.get('/statistics')
}