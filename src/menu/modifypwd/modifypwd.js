import React from 'react';
import {Form, Icon, Input} from 'antd';

import './modifypwd.css'

class ModifyPwdForm extends React.Component {

    newPwdAgainSame = (rule, value, callback) => {
        if (value && value !== this.props.form.getFieldValue('newPassword')) {
            callback('两次密码输入不一致！');
        } else {
            callback();
        }
    };

    newPwdOldSame = (rule, value, callback) => {
        if (value && value === this.props.form.getFieldValue('oldPassword')) {
            callback('新密码不能和原密码一致！');
        } else {
            callback();
        }
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form>
                <Form.item>
                    {getFieldDecorator('oldPassword', {
                        rules: [{ required: true, message: '请输入原密码' }],
                    })(
                        <Input size={'large'} prefix={<Icon type="lock" className="modifypwd-form-icon" />} type="password" placeholder="原密码" />
                    )}
                </Form.item>
                <Form.item>
                    {getFieldDecorator('newPassword', {
                        validateFirst: true,
                        rules: [
                            { required: true, message: '请输入新密码' },
                            { pattern: '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^0-9A-Za-z])([0-9A-Za-z]|[^0-9A-Za-z]){8,18}',
                                message: '密码必须同时包含大、小写字母、数字和特殊字符，长度8~18位' },
                            { validator: this.newPwdOldSame }
                        ],
                    })(
                        <Input size={'large'} prefix={<Icon type="lock" className="modifypwd-form-icon" />} type="password" placeholder="新密码" />
                    )}
                </Form.item>
                <Form.item>
                    {getFieldDecorator('newPasswordAgain', {
                        rules: [{ required: true, message: '请重新输入新密码' }, { validator: this.newPwdAgainSame }],
                    })(
                        <Input size={'large'} prefix={<Icon type="lock" className="modifypwd-form-icon" />} type="password" placeholder="重新输入新密码" />
                    )}
                </Form.item>
            </Form>
        );
    }
}

export default Form.create()(ModifyPwdForm);