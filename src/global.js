import React from 'react';
import {Redirect} from 'react-router-dom';
import { notification } from 'antd';
import 'antd/dist/antd.css';

const openError = (desc, msg) => {
    if (!msg) {
        msg = '操作失败';
    }
    notification.error({
        message: msg,
        description: desc,
    });
};

//接口返回数据是否正确
const validResp = (data) => {
    if (data.code === 1001) {
        return <Redirect to={{ pathname:"/login" }} />;
    } else if (data.code !== 0) {
        openError(data.msg);
    } else {
        return true;
    }
};

export { openError };
export { validResp };