import axio from '~/axios/index'

export function getRoleDetailList() {
	return axio.get('/permission/role-detail')
}

export function updateUserRole(userId, roleIds, boardIds) {

	return axio.put('/permission/user-role', {
		userId: userId,
		roleIds: roleIds,
		boardIds: boardIds
	})
}

export function updateRolePermission(roleId, roleName, roleDescription, roleLevel, permissionIds) {
	return axio.put('/permission/role-permission', {
		roleId: roleId,
		roleName: roleName,
		roleDescription: roleDescription,
		permissionIds: permissionIds,
		roleLevel: roleLevel
	})
}

export function addRolePermission(roleName, roleDescription, roleLevel, permissionIds) {
	return axio.post('/permission/role-permission', {
		roleName: roleName,
		roleDescription: roleDescription,
		permissionIds: permissionIds,
		roleLevel: roleLevel
	})
}

export function deleteRole(roleId) {
	return axio.delete(`/permission/role/${roleId}`)
}