import axios from "~/utils/request"
import { User } from "~/types/userApi"

// 登录
export const loginReq = (data : User) => {
    return axios({
        url: "/user/login",
        method: "post",
        data
    })
}

// 获取登录图片验证码
export const loginVerifyImgReq = () => {
    return axios({
        url: "/user/login/captcha",
        method: "get"
    })
}

// 检查是否已登录
export const checkLoginReq = () => {
    return axios({
        url: "/user/login/check",
        method: "get",
    })
}