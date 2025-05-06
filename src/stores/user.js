import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isLoggedIn, clearTokens } from '~/utils/auth';

export const useUserStore = defineStore('user', () => {
    // 从 localStorage 获取存储的用户信息
    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    const isLoggedInState = ref(isLoggedIn());

    const userInfo = ref({
        id: savedUserInfo.id || '',
        username: savedUserInfo.username || '',
        email: savedUserInfo.email || '',
        headerUrl: savedUserInfo.headerUrl || '',
        bio: savedUserInfo.bio || '',
        createdAt: savedUserInfo.createdAt || '',
        status: savedUserInfo.status || '',
        postCount: savedUserInfo.postCount || 0,
        commentCount: savedUserInfo.commentCount || 0,
        nickname: savedUserInfo.nickname || '',
        boardIds: savedUserInfo.boardIds || [],
        roles: savedUserInfo.roles || []
    });

    function getBasicUserInfo() {
        return {
            id: userInfo.value.id,
            username: userInfo.value.username,
            headerUrl: userInfo.value.headerUrl,
            status: userInfo.value.status,
            nickname: userInfo.value.nickname
        };
    }

    // 设置用户信息
    function setUserInfo(info) {
        console.log(info)
        userInfo.value = {
            id: info.id || '',
            username: info.username || '',
            email: info.email || '',
            headerUrl: info.headerUrl || '',
            bio: info.bio || '',
            createdAt: info.createdAt || '',
            status: info.status || '',
            postCount: info.postCount || 0,
            commentCount: info.commentCount || 0,
            nickname: info.nickname || '',
            boardIds: info.boardIds || [],
            roles: info.roles || []
        };
        console.log("userInfo store", userInfo.value)
        isLoggedInState.value = true;
        // 保存到 localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
    }

    // 清除用户信息
    function clearUserInfo() {
        userInfo.value = {
            id: '',
            username: '',
            email: '',
            headerUrl: '',
            bio: '',
            createdAt: '',
            status: '',
            postCount: 0,
            commentCount: 0,
            nickname: '',
            boardIds: [],
            roles: []
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

    function updateStatus(newStatus) {
        userInfo.value.status = newStatus;
        // 更新 localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
    }

    function isGesterOfBoard(boardId) {
        const id = Number(boardId);
        return userInfo.value.boardIds.includes(id) && hasRole('ROLE_BOARD');
    }

    function hasRole(role) {
        //console.log("userhasrole: " + role + " ", userInfo.value.roles.includes(role))
        return userInfo.value.roles.includes(role);
    }

    return {
        isLoggedInState,
        userInfo,
        setUserInfo,
        clearUserInfo,
        updateAvatar,
        updateStatus,
        getBasicUserInfo,
        isGesterOfBoard,
        hasRole
    };
}); 