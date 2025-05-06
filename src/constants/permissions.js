export const PERMISSIONS = {
	USER: {
	  LOGOUT_FORCE: 'user:logout:force',
	  INFO_OWN: 'user:info:own',
	  PASSWORD_CHANGE_OWN: 'user:password:change:own',
	  PASSWORD_CHANGE_ANY: 'user:password:change:any',
	},
	COMMENT: {
	  PUBLISH_TO_POST: 'comment:publish:topost',
	  PUBLISH_TO_COMMENT: 'comment:publish:tocomment',
	  DELETE_OWN: 'comment:delete:own',
	  UPDATE_OWN: 'comment:update:own',
	  INFO_BOARD: 'comment:info:board',
	  INFO_ANY: 'comment:info:any',
	  DELETE_BOARD: 'comment:delete:board',
	  DELETE_ANY: 'comment:delete:any',
	},
	POST: {
	  PUBLISH: 'post:publish',
	  DELETE_OWN: 'post:delete:own',
	  UPDATE_OWN: 'post:update:own',
	  INFO_BOARD: 'post:info:board',
	  INFO_ANY: 'post:info:any',
	  DELETE_BOARD: 'post:delete:board',
	  DELETE_ANY: 'post:delete:any',
	}
  }
  