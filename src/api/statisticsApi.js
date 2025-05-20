import axio from '~/axios/index'

export function getStatistics(){
	return axio.get('/statistics')
}

export function getWeeklyActivity(){
	return axio.get('/statistics/weekly-activity')
}

export function getMonthlyRegistration(){
	return axio.get('/statistics/monthly-registration')
}