import React from 'react';
import {
    Form, Icon, Input, Button, Layout, Row, Col, notification
} from 'antd';
import { Redirect } from 'react-router-dom';
import reqwest from 'reqwest';
import 'antd/dist/antd.css';
import './login.css';
import url from '../config.js';

const FormItem = Form.Item;

const {
    Content, Footer, Header
} = Layout;

const openNotification = (msg) => {
    notification.error({
        message: '登录失败',
        description: msg,
    });
};

class LoginForm extends React.Component {

    state = {
        redirect: false,
        buttonLoading: false,

        captchaUrl: '',
    };

    componentDidMount() {
        this.getCaptcha();
    }

    checkUser = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ buttonLoading: true });
                reqwest({
                    url: 'http://' + url + '/_xsql1',
                    method: 'post',
                    crossOrigin: true,
                    data: {
                        ...values,
                    },
                    type: 'json',
                }).then((data) => {
                    this.setState({ redirect: true });
                }, (err, msg) => {
                    openNotification(msg);
                }).always(() => {
                    this.setState({ buttonLoading: false });
                });
            }
        });
    };

    getCaptcha = () => {
        this.setState({ captchaUrl: 'http://' + url + '/getCaptcha?r=' + Math.random() });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            this.state.redirect ? <Redirect to={{pathname:"/sql"}} /> :
            <Layout style={{height: '100vh'}}>
                <Header style={{color: "snow", fontSize: "large", textAlign: 'center'}}>GSS的想象空间</Header>
                <Content align="right" style={{padding: "10%"}}>
                    <Form onSubmit={this.checkUser} className="login-form">
                        <FormItem>
                            {getFieldDecorator('userName', {
                                rules: [{ required: true, message: '请输入用户名' }],
                            })(
                                <Input size={'large'} prefix={<Icon type="user" className="login-form-icon" />} placeholder="用户名" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码' }],
                            })(
                                <Input size={'large'} prefix={<Icon type="lock" className="login-form-icon" />} type="password" placeholder="密码" />
                            )}
                        </FormItem>
                        <FormItem>
                            <Row gutter={10}>
                                <Col span={14}>
                                    {getFieldDecorator('captcha', {
                                        rules: [{ required: true, message: '请输入验证码' }],
                                    })(
                                        <Input size={'large'} prefix={<Icon type="safety" className="login-form-icon" />} placeholder="验证码" />
                                    )}
                                </Col>
                                <Col span={10}
                                     onClick={() => {
                                         this.getCaptcha();
                                     }}
                                >
                                    {<img src={this.state.captchaUrl} style={{cursor:'pointer'}} alt="验证码" />}
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem>
                            <Button size={'large'} type="primary" loading={this.state.buttonLoading} htmlType="submit" className="login-form-button">
                                登录
                            </Button>
                        </FormItem>
                    </Form>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    ©2018 Created by GSS
                </Footer>
            </Layout>
        );
    }
}

const Login = Form.create()(LoginForm);

export default Login;