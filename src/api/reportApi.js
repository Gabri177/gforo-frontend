import axio from '~/axios/index'

export function submitReport (targetType, targetId, reason){
    return axio.post("/report/submit", {
        targetType: targetType, // 1 for post, 2 for comment
        targetId: targetId,
        reason: reason
    })
}

export function getAllReport(currentPage, pageSize, status) {
    return axio.get("/report/all", {
        params: {
            currentPage: currentPage != null && currentPage !== undefined ? currentPage : 1,
            pageSize: pageSize != null && pageSize !== undefined ? pageSize : 10,
            status: status != null && status !== undefined ? status : 6
        }
    })
}

export function  handleReport(reportId, isApproved, handleNote) {
    return axio.put("/report/handle", {
        id: reportId,
        isApproved: isApproved,
        handleNote: handleNote
    })
}
