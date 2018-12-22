import React from 'react';
import {Alert} from 'antd';
import 'antd/dist/antd.css';

class EmptyPage extends React.Component {

    render() {
        return (
            <Alert message="你的账号未被赋予任何菜单权限，请通知管理员" type="warning" showIcon />
        );
    }
}

export default EmptyPage;