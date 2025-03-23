import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isLoggedIn, clearTokens } from '~/utils/auth';

export const useUserStore = defineStore('user', () => {
    // 从 localStorage 获取存储的用户信息
    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    const isLoggedInState = ref(isLoggedIn());
    const userInfo = ref({
        username: savedUserInfo.username || '',
        email: savedUserInfo.email || '',
        headerUrl: savedUserInfo.headerUrl || '',
    });

    // 设置用户信息
    function setUserInfo(info) {
        userInfo.value = {
            username: info.username || '',
            email: info.email || '',
            headerUrl: info.headerUrl || '',
        };
        isLoggedInState.value = true;
        // 保存到 localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
    }

    // 清除用户信息
    function clearUserInfo() {
        userInfo.value = {
            username: '',
            email: '',
            headerUrl: '',
        };
        isLoggedInState.value = false;
        // 清除 localStorage
        localStorage.removeItem('userInfo');
        clearTokens();
    }

    // 更新头像
    function updateAvatar(newHeaderUrl) {
        userInfo.value.headerUrl = newHeaderUrl;
        // 更新 localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
    }

    return {
        isLoggedInState,
        userInfo,
        setUserInfo,
        clearUserInfo,
        updateAvatar,
    };
}); 