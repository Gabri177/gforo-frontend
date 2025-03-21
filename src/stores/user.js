import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isLoggedIn, clearTokens } from '~/utils/auth';

export const useUserStore = defineStore('user', () => {
    const isLoggedInState = ref(isLoggedIn());
    const userInfo = ref({
        username: '',
        email: '',
        headerUrl: '',
    });

    // 设置用户信息
    function setUserInfo(info) {
        userInfo.value = {
            username: info.username || '',
            email: info.email || '',
            headerUrl: info.headerUrl || '',
        };
        isLoggedInState.value = true;
    }

    // 清除用户信息
    function clearUserInfo() {
        userInfo.value = {
            username: '',
            email: '',
            headerUrl: '',
        };
        isLoggedInState.value = false;
        clearTokens();
    }

    // 更新头像
    function updateAvatar(newHeaderUrl) {
        userInfo.value.headerUrl = newHeaderUrl;
    }

    return {
        isLoggedInState,
        userInfo,
        setUserInfo,
        clearUserInfo,
        updateAvatar,
    };
}); 