import React from 'react';
import {Button, Dropdown, Icon, Layout, Menu, Modal} from 'antd';
import 'antd/dist/antd.css';
import {Redirect} from 'react-router-dom';
import reqwest from 'reqwest';
import md5 from "md5-node";

import SqlPage from '../sql/sql.js';
import ExcelPage from "../excel/excel.js";
import EmptyPage from "../empty/empty.js";

import './menu.css'
import {url} from '../config.js';
import {openErrorNotify, openSuccessNotify} from '../global.js';
import ModifyPwdForm from './modifypwd/modifyPwd.js';

const { Header, Sider, Content, Footer } = Layout;

class MenuPage extends React.Component {

    state = {
        noLoginRedirect: false,

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
        modifyPwdLoading: false,
        modifyPwdDisable: false,

        logoutVisible: false,
        logoutLoading: false,
        logoutDisable: false
    };

    componentDidMount() {
        this.getMenuList();
    }

    getMenuList = () => {
        reqwest({
            url: 'http://' + url + '/exec?_mt=menu.getMenu',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json',
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
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
            }
        }, (err, msg) => {
            openErrorNotify(msg);
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
            this.setState({ logoutVisible: true });
        }
    };

    modifyPwd = () => {
        this.refs.modifyPwdForm.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    modifyPwdLoading: true,
                    modifyPwdDisable: true
                });
                reqwest({
                    url: 'http://' + url + '/exec?_mt=menu.modifyPwd',
                    method: 'post',
                    crossOrigin: true,
                    withCredentials: true,
                    data: {
                        'oldPassword': md5(values.oldPassword),
                        'newPassword': md5(values.newPassword)
                    },
                    type: 'json',
                }).then((data) => {
                    if (data.code === global.respCode.noLogin) {
                        this.setState({ noLoginRedirect: true });
                    } else if (data.code !== global.respCode.success) {
                        openErrorNotify(data.msg);
                    } else {
                        openSuccessNotify('密码修改成功');
                        this.setState({ modifyPwdVisible: false });
                    }
                }, (err, msg) => {
                    openErrorNotify(msg);
                }).always(() => {
                    this.setState({
                        modifyPwdLoading: false,
                        modifyPwdDisable: false
                    });
                });
            }
        });
    };

    modifyPwdClose = () => {
        this.setState({ modifyPwdVisible: false });
    };

    logout = () => {
        this.setState({
            logoutLoading: true,
            logoutDisable: true
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=menu.logout',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json',
        }).then((data) => {
            if (data.code === global.respCode.noLogin || data.code === global.respCode.success) {
                this.setState({ noLoginRedirect: true });
            } else {
                openErrorNotify(data.msg);
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        }).always(() => {
            this.setState({
                logoutVisible: false,
                logoutLoading: false,
                logoutDisable: false,
            });
        });
    };

    logoutClose = () => {
        this.setState({ logoutVisible: false });
    };

    render() {
        return (
            this.state.noLoginRedirect ? <Redirect to={{pathname:"/login"}} /> :
            <Layout>
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
                                    <Menu.Item key="logout"><Icon type="logout" />登出</Menu.Item>
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
                                <Button key="cancel" onClick={this.modifyPwdClose}>
                                    取消
                                </Button>,
                                <Button key="confirm" type="primary" loading={this.state.modifyPwdLoading}
                                        disabled={this.state.modifyPwdDisable} onClick={this.modifyPwd}>
                                    确认
                                </Button>
                            ]}
                        >
                            <ModifyPwdForm ref="modifyPwdForm"/>
                        </Modal>
                        <Modal
                            title="确认登出吗？"
                            visible={this.state.logoutVisible}
                            onCancel={this.logoutClose}
                            footer={[
                                <Button key="cancel" onClick={this.logoutClose}>
                                    取消
                                </Button>,
                                <Button key="confirm" type="primary" loading={this.state.logoutLoading}
                                        disabled={this.state.logoutDisable} onClick={this.logout}>
                                    确认
                                </Button>
                            ]}
                        >
                            <p>如需切换账号请登出</p>
                        </Modal>
                    </Header>
                    <Content style={{ margin: '1% 1%' }} >
                        {this.state.childPage}
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        ©2018 Created by GSS
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}

export default MenuPage;