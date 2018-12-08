import React from 'react';
import {
    Form, Icon, Input, Button, Checkbox, Layout
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

class LoginForm extends React.Component {

    state = {
        redirect: false,
        buttonLoading: false
    };

    handleSubmit = (e) => {
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

                }).always(() => {
                    this.setState({ buttonLoading: false });
                });
            }
        });
    };

    render() {

        const { getFieldDecorator } = this.props.form;

        return (
            this.state.redirect ? <Redirect
                to={
                    {
                        pathname:"/sql",
                    search:"p1=1&p2=2",
                    state:{"name":"kiramario","age":26}
                }
                }
            />
                    :
            <Layout style={{height: '100vh'}}>
                <Header style={{color: "snow", fontSize: "large", textAlign: 'center'}}>GSS的想象空间</Header>
                <Content align="right" style={{padding: "10%"}}>
                    <Form onSubmit={this.handleSubmit} className="login-form">
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
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(
                                <Checkbox>记住我</Checkbox>
                            )}
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