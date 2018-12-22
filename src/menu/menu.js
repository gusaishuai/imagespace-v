import React from 'react';
import { Layout, Menu, Icon, Dropdown, Modal, Button, Form, Input } from 'antd';
import 'antd/dist/antd.css';
import reqwest from 'reqwest';

import SqlPage from '../sql/sql.js';
import ExcelPage from "../excel/excel.js";
import EmptyPage from "../empty/empty.js";

import './menu.css'
import { url } from '../config.js';
import { openError, validResp } from '../global.js';

const { Header, Sider, Content } = Layout;

const FormItem = Form.Item;

class MenuPage extends React.Component {

    state = {
        allMenu: {
            "sql": <SqlPage/>,
            "excel": <ExcelPage/>
        },

        collapsed: false,

        nick: '',

        childPage: '',
        selectMenuKey: [],
        ownMenu: [],

        modifyPwdVisible: false,
        modifyPwdClose: false
    };

    componentDidMount() {
        this.getMenuList();
    }

    getMenuList = () => {
        reqwest({
            url: 'http://' + url + '/exec?_mt=login.getMenu',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json',
        }).then((data) => {
            if (validResp(data) !== true) {
                return;
            }
            this.setState({ nick: data.result.nick });
            let menuList = data.result.menuList;
            //没有任何菜单权限
            if (!menuList || menuList.length === 0) {
                this.setState({ childPage: <EmptyPage/> });
                return;
            }
            let firstMenuRoute = menuList[0].route;
            let selectMenuKey = [];
            selectMenuKey.push(firstMenuRoute);
            this.setState({
                selectMenuKey: selectMenuKey,
                childPage: this.state.allMenu[firstMenuRoute],
                ownMenu: menuList.map(d =>
                    <Menu.Item key={d.route}>
                        <Icon type={d.logo} />
                        <span>{d.name}</span>
                    </Menu.Item>
                )
            });
        }, (err, msg) => {
            openError(msg);
        });
    };

    menuCollapse = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };

    menuClick = (e) => {
        let selectMenuKey = [];
        selectMenuKey.push(e.key);
        this.setState({
            selectMenuKey: selectMenuKey,
            childPage: this.state.allMenu[e.key]
        });
    };

    dropDownMenuClick = (e) => {
        if (e.key === 'modifyPwd') {
            //修改密码
            this.setState({ modifyPwdVisible: true });
        } else if (e.key === 'logout') {
            //登出
        }
    };

    aaa = (e) => {
        alert(2);
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                alert(1);
            }
        });
    };

    modifyPwdClose = () => {
        this.setState({ modifyPwdClose: true });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Layout style={{height: '100vh'}}>
                <Sider trigger={null}
                       collapsible
                       collapsed={this.state.collapsed}
                       style={{overflow: 'auto'}}
                >
                    <Icon className="menu-icon"
                          type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                          onClick={this.menuCollapse} />
                    <Menu theme="dark" selectedKeys={this.state.selectMenuKey} onClick={this.menuClick}>
                        {this.state.ownMenu}
                    </Menu>
                </Sider>
                <Layout>
                    <Header className="menu-header" >
                        <div style={{float: 'right'}}>
                            <Dropdown overlay={
                                <Menu onClick={this.dropDownMenuClick}>
                                    <Menu.Item key="modifyPwd"><Icon type="lock" />修改密码</Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item key="logout"><Icon type="logout" />退出</Menu.Item>
                                </Menu>
                            } trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    {this.state.nick} <Icon type="down" />
                                </a>
                            </Dropdown>
                        </div>
                        <div>GSS的想象空间</div>
                        <Modal
                            title="修改密码"
                            visible={this.state.modifyPwdVisible}
                            onCancel={this.modifyPwdClose}
                            footer={[
                                <Button type="primary" htmlType="submit">
                                    确认
                                </Button>,
                                <Button key="cancel" onClick={this.modifyPwdClose}>
                                    取消
                                </Button>
                            ]}
                        >
                            <Form onSubmit={this.aaa}>
                                <FormItem>
                                    {getFieldDecorator('oldPassword', {
                                        rules: [{ required: true, message: '请输入原密码' }],
                                    })(
                                        <Input size={'large'} prefix={<Icon type="lock" className="login-form-icon" />} type="password" placeholder="原密码" />
                                    )}
                                </FormItem>
                                <FormItem>
                                    {getFieldDecorator('newPassword', {
                                        rules: [
                                            { required: true, message: '请输入新密码' },
                                            { pattern: '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^0-9A-Za-z])([0-9A-Za-z]|[^0-9A-Za-z]){8,18}',
                                                message: '密码必须同时包含大、小写字母、数字和特殊字符，长度8~18位' }
                                        ],
                                    })(
                                        <Input size={'large'} prefix={<Icon type="lock" className="login-form-icon" />} type="password" placeholder="新密码" />
                                    )}
                                </FormItem>
                                <FormItem>
                                    {getFieldDecorator('newPasswordAgain', {
                                        rules: [{ required: true, message: '请重新输入新密码' }],
                                    })(
                                        <Input size={'large'} prefix={<Icon type="lock" className="login-form-icon" />} type="password" placeholder="重新输入新密码" />
                                    )}
                                </FormItem>
                            </Form>
                        </Modal>
                    </Header>
                    <Content style={{ margin: '1% 1%' }} >
                        {this.state.childPage}
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default Form.create()(MenuPage);