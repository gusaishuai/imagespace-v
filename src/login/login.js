import React from 'react';
import {Button, Col, Form, Icon, Input, Layout, Row, Carousel} from 'antd';
import 'antd/dist/antd.css';
import {Redirect} from 'react-router-dom';
import reqwest from 'reqwest';
import md5 from 'md5-node';

import './login.css';
import {url} from '../config.js';
import {openErrorNotify} from '../global.js';

const FormItem = Form.Item;

const { Content, Footer, Header, Sider } = Layout;

class LoginPage extends React.Component {

    state = {
        redirect: false,
        buttonLoading: false,

        captchaUrl: '',
    };

    componentDidMount() {
        reqwest({
            url: 'http://' + url + '/exec?_mt=login.checkDirectLogin',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json',
        }).then((data) => {
            if (data.code === global.respCode.success) {
                this.setState({ redirect: true });
            } else {
                this.getCaptcha();
            }
        });
    }

    checkUser = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ buttonLoading: true });
                reqwest({
                    url: 'http://' + url + '/exec?_mt=login.checkUser',
                    method: 'post',
                    crossOrigin: true,
                    withCredentials: true,
                    data: {
                        'userName': values.userName,
                        'password': md5(values.password),
                        'captcha': values.captcha
                    },
                    type: 'json',
                }).then((data) => {
                    if (data.code === global.respCode.success) {
                        this.setState({ redirect: true });
                    } else {
                        //提示错误
                        openErrorNotify(data.msg, '登录失败');
                        //重新获取验证码
                        this.getCaptcha();
                    }
                }, (err, msg) => {
                    openErrorNotify(msg, '登录失败');
                }).always(() => {
                    this.setState({ buttonLoading: false });
                });
            }
        });
    };

    getCaptcha = () => {
        this.setState({ captchaUrl: 'http://' + url + '/exec?_mt=login.getCaptcha&r=' + Math.random() });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            this.state.redirect ? <Redirect to={{pathname:"/menu"}} /> :
            <Layout style={{height: '100vh'}}>
                <Header className="login-form-header" >GSS的想象空间</Header>
                <Layout>
                    <Sider width="55%" style={{padding: "10%", background: 'transparent', textAlign: 'center'}}>
                        <div style={{textAlign: 'left'}}><h1>在这里，你可以进行：</h1></div>
                        <br/><br/><br/>
                        <Carousel autoplay dots={false}>
                            <div><h1><Icon type="select"/> SQL查询</h1></div>
                            <div><h1><Icon type="file-excel"/> EXCEL操作</h1></div>
                        </Carousel>
                    </Sider>
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
                                        {<img src={this.state.captchaUrl} style={{cursor:'pointer', verticalAlign: 'top'}} alt="验证码" />}
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
                </Layout>
                <Footer style={{ textAlign: 'center' }}>
                    ©2018 Created by GSS
                </Footer>
            </Layout>
        );
    }
}

export default Form.create()(LoginPage);