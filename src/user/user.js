import React from 'react';
import {Button, Col, Form, Input, Row, Table, Divider, Modal} from 'antd';
import './user.css'
import {url} from "../config";
import reqwest from "reqwest";
import {openErrorNotify} from "../global";

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
                        <a href="#" onClick={() => this.queryMenu(record.id)}>赋予菜单</a>
                        <Divider type="vertical" />
                        <a href="#" onClick={() => this.deleteUser(record.id, record.loginName)}>删除</a>
                    </span>
                )
            },
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
                    url: 'http://' + url + '/exec?_mt=user.userQuery',
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

    //赋予菜单
    queryMenu = (userId) => {
        alert(userId)
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

    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
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
                        <Col span={4} key={'c2'} style={{textAlign: 'right'}}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={'search'}>查询</Button>
                            </Form.Item>
                        </Col>
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
            </div>
        );
    }

}

export default Form.create()(UserPage);