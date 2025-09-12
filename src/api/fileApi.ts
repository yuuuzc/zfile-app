import axios from "~/utils/request"
import { FilesReq } from "~/types/fileApi"

// 存储列表
export const storageListReq = () => {
    return axios({
        url: "/api/storage/list",
        method: "get"
    })
}

// 文件列表
export const filesReq = (data: FilesReq) => {
    return axios({
        url: "/api/storage/files",
        method: "post",
        data
    })
}