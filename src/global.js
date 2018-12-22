import {notification} from 'antd';
import 'antd/dist/antd.css';

global.respCode = {
    success: 0,
    //用户未登录
    noLogin: 1001
};

const openErrorNotify = (desc, msg) => {
    if (!msg) {
        msg = '操作失败';
    }
    notification.error({
        message: msg,
        description: desc,
    });
};

const openSuccessNotify = (desc, msg) => {
    if (!msg) {
        msg = '操作成功';
    }
    notification.success({
        message: msg,
        description: desc,
    });
};

export { openErrorNotify };
export { openSuccessNotify };