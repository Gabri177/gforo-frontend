import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        isLoggedIn: false,
        userInfo: {
            id: null,
            name: '',
            avatar: '',
            email: '',
            createTime: null
        }
    }),

    getters: {
        getUserInfo: (state) => state.userInfo,
        getLoginStatus: (state) => state.isLoggedIn
    },

    actions: {
        // 设置用户信息
        setUserInfo(userInfo) {
            this.userInfo = userInfo;
            this.isLoggedIn = true;
        },

        // 清除用户信息（登出）
        clearUserInfo() {
            this.userInfo = {
                id: null,
                name: '',
                avatar: '',
                email: '',
                createTime: null
            };
            this.isLoggedIn = false;
        },

        // 更新用户信息
        updateUserInfo(updates) {
            this.userInfo = {
                ...this.userInfo,
                ...updates
            };
        },

        // 登录
        async login(credentials) {
            try {
                // TODO: 实现实际的登录API调用
                // const response = await api.login(credentials);
                // this.setUserInfo(response.data);
                // return response;
            } catch (error) {
                throw error;
            }
        },

        // 登出
        async logout() {
            try {
                // TODO: 实现实际的登出API调用
                // await api.logout();
                this.clearUserInfo();
            } catch (error) {
                throw error;
            }
        }
    }
}); 