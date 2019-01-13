import React from 'react';
import {Button, Col, Form, Input, Row, Table, Divider, Modal, Transfer} from 'antd';
import reqwest from "reqwest";
import {Redirect} from 'react-router-dom';

import {openErrorNotify, openSuccessNotify} from "../global";
import './user.css'
import {url} from "../config";

class UserPage extends React.Component {

    state = {
        noLoginRedirect: false,

        userData: [],
        userColumn: [
            {
                title: 'id',
                dataIndex: 'id'
            }, {
                title: '登录名',
                dataIndex: 'loginName'
            }, {
                title: '昵称',
                dataIndex: 'nick'
            }, {
                title: '操作',
                dataIndex: 'operate',
                fixed: 'right',
                width: 250,
                render: (text, record) => (
                    <span>
                        <a onClick={() => this.queryMenu(record.id)}>赋予菜单</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.deleteUser(record.id, record.loginName)}>删除</a>
                    </span>
                )
            }
        ],
        userPagination: {
            current: 1
        },
        userLoading: false,

        userButtonLoading: false,
        userButtonDisable: false,

        deleteUserVisible: false,
        deleteUserLoading: false,
        deleteUserDisabled: false,
        deleteLoginName: '',
        deleteUserId: '',

        allMenuList: [],
        ownMenuIdList: [],

        addMenuVisible: false,
        addMenuUserId: '',
        userMenuTransferDisable: false
    };

    componentDidMount() {
        this.queryAllMenu();
    }

    //查询所有菜单
    queryAllMenu = () => {
        reqwest({
            url: 'http://' + url + '/exec?_mt=menu.getAllMenu',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json'
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
                data.result.map((k) => (
                    this.state.allMenuList.push({
                        key: k.id,
                        title: k.name
                    })
                ));
                this.setState({
                    deleteUserVisible: false
                });
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        });
    };

    //用户查询
    userQuery = (e) => {
        e.preventDefault();
        this.getUserList();
    };

    //用户查询调用接口
    getUserList = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    userButtonLoading: true,
                    userButtonDisable: true,
                    userLoading: true
                });
                reqwest({
                    url: 'http://' + url + '/exec?_mt=user.queryUser',
                    method: 'post',
                    crossOrigin: true,
                    withCredentials: true,
                    data: {
                        'loginName': values.loginName,
                        'pageNo': this.state.userPagination.current
                    },
                    type: 'json'
                }).then((data) => {
                    if (data.code === global.respCode.noLogin) {
                        this.setState({ noLoginRedirect: true });
                    } else if (data.code !== global.respCode.success) {
                        openErrorNotify(data.msg);
                    } else {
                        const userPagination = this.state.userPagination;
                        userPagination.total = data.result.totalCount;
                        userPagination.pageSize = data.result.pageSize;
                        this.setState({
                            userData: data.result.list,
                            userPagination: userPagination,
                        });
                    }
                }, (err, msg) => {
                    openErrorNotify(msg);
                }).always(() => {
                    this.setState({
                        userButtonLoading: false,
                        userButtonDisable: false,
                        userLoading: false
                    });
                });
            }
        });
    };

    //用户查询 - 翻页
    userTableChange = (pagination) => {
        const userPagination = this.state.userPagination;
        userPagination.current = pagination.current;
        this.setState({
            userPagination: userPagination
        });
        this.getUserList();
    };

    //赋予菜单确认框显示
    queryMenu = (userId) => {
        this.setState({
            addMenuVisible: true,
            addMenuUserId: userId
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=user.queryUserMenu',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'userId': userId
            },
            type: 'json'
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
                this.setState({
                    ownMenuIdList: data.result
                });
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        });
    };

    //赋予菜单确认框关闭
    addMenuClose = () => {
        this.setState({
            addMenuVisible: false
        });
    };

    //赋予菜单搜索框
    addMenuFilterOption = (inputValue, option) => option.title.indexOf(inputValue) > -1;

    //赋予权限
    handleChange = (targetKeys) => {
        this.setState({
            userMenuTransferDisable: true
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=user.addUserMenu',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'userId': this.state.addMenuUserId,
                'menuIds': targetKeys
            },
            type: 'json'
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
                //重新查询
                this.queryMenu(this.state.addMenuUserId);
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        }).always(() => {
            this.setState({
                userMenuTransferDisable: false
            });
        });
    };

    //删除人员弹框
    deleteUser = (userId, loginName) => {
        this.setState({
            deleteUserVisible: true,
            deleteLoginName: loginName,
            deleteUserId: userId,
        });
    };

    //删除人员确认框关闭
    deleteUserClose = () => {
        this.setState({
            deleteUserVisible: false
        });
    };

    //删除员工
    clickDeleteUser = () => {
        this.setState({
            deleteUserLoading: true,
            deleteUserDisable: true
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=user.deleteUser',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'userId': this.state.deleteUserId
            },
            type: 'json'
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
                openSuccessNotify("账号删除成功");
                this.setState({
                    deleteUserVisible: false
                });
                //刷新用户列表
                this.getUserList();
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        }).always(() => {
            this.setState({
                deleteUserLoading: false,
                deleteUserDisable: false
            });
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            this.state.noLoginRedirect ? <Redirect to={{pathname:"/login"}} /> :
            <div>
                <Form className="user-query-form" onSubmit={this.userQuery}>
                    <Row gutter={16} style={{marginLeft: '10%'}}>
                        <Col span={8} key={'c1'}>
                            <Form.Item label={`登录名`}>
                                {getFieldDecorator(`loginName`, {
                                })(
                                    <Input placeholder="模糊匹配" />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={3} key={'c2'} style={{textAlign: 'right'}}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={'search'}>查询</Button>
                            </Form.Item>
                        </Col>
                        <Col span={3} key={'c3'} style={{textAlign: 'right'}}>
                            <Form.Item>
                                <Button type="primary" icon={'plus'}>新增</Button>
                            </Form.Item>
                        </Col>
                        <Modal
                            title="确认删除吗？"
                            visible={this.state.deleteUserVisible}
                            onCancel={this.deleteUserClose}
                            footer={[
                                <Button key="cancel" onClick={this.deleteUserClose}>
                                    取消
                                </Button>,
                                <Button key="confirm" type="primary" loading={this.state.deleteUserLoading}
                                        disabled={this.state.deleteUserDisabled} onClick={this.clickDeleteUser}>
                                    确认
                                </Button>
                            ]}
                        >
                            <p>你将删除账号：{this.state.deleteLoginName}</p>
                        </Modal>
                        <Modal
                            title="赋予权限"
                            width={'50%'}
                            visible={this.state.addMenuVisible}
                            onCancel={this.addMenuClose}
                            footer={[
                                <Button key="cancel" onClick={this.addMenuClose}>
                                    取消
                                </Button>
                            ]}
                        >
                            <Transfer
                                dataSource={this.state.allMenuList}
                                showSearch
                                disabled={this.state.userMenuTransferDisable}
                                listStyle={{
                                    width: 250,
                                    height: 300
                                }}
                                operations={['赋予', '删除']}
                                filterOption={this.addMenuFilterOption}
                                targetKeys={this.state.ownMenuIdList}
                                onChange={this.handleChange}
                                render={item => item.title}
                            />
                        </Modal>
                    </Row>
                </Form>
                <br/>
                <Table
                    columns={this.state.userColumn}
                    rowKey={record => record.id}
                    dataSource={this.state.userData}
                    pagination={this.state.userPagination}
                    loading={this.state.userLoading}
                    onChange={this.userTableChange}
                    bordered
                    scroll={{x : true}}
                    size="middle"
                    className="user-query-table"
                />
            </div>
        );
    }

}

export default Form.create()(UserPage);