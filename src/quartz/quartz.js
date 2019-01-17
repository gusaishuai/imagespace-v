import React from 'react';
import {Button, Col, Form, Input, Row, Table, Divider, Modal, Transfer} from 'antd';
import reqwest from "reqwest";
import {Redirect} from 'react-router-dom';

import {openErrorNotify, openSuccessNotify} from "../global";
import './quartz.css'
import {url} from "../config";

class QuartzPage extends React.Component {

    state = {
        noLoginRedirect: false,

        userData: [{
            'quartzName': "quartzName",
            'className': "className",
            'methodName': "methodName",
            'startTime': "startTime",
            'intervalTime': "intervalTime",
            'repeatNum': "repeatNum",
            'status': "status"
        }],
        userColumn: [
            {
                title: '任务名',
                dataIndex: 'quartzName'
            }, {
                title: '类名',
                dataIndex: 'className'
            }, {
                title: '方法名',
                dataIndex: 'methodName'
            },{
                title: '开始时间',
                dataIndex: 'startTime'
            },{
                title: 'CRON表达式',
                children: [{
                    title: '运行间隔',
                    dataIndex: 'intervalTime',
                }, {
                    title: '重复次数',
                    dataIndex: 'repeatNum',
                }]
            },{
                title: '状态',
                dataIndex: 'status'
            }, {
                title: '操作',
                dataIndex: 'operate',
                fixed: 'right',
                width: '15vw',
                render: (text, record) => (
                    <span>
                        <a onClick={() => this.queryMenu(record.id)}>执行</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.deleteUser(record.id, record.loginName)}>查看</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.queryMenu(record.id)}>编辑</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.queryMenu(record.id)}>关闭</a>
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
        userMenuTransferDisable: false,

        addUserVisible: false,
        addUserLoading: false,
        addUserDisable: false
    };


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            this.state.noLoginRedirect ? <Redirect to={{pathname:"/login"}} /> :
                <div>
                    <Form className="user-query-form" onSubmit={this.userQuery}>
                        <Row gutter={16} style={{marginLeft: '10%'}}>
                            <Col span={8} key={'c1'}>
                                <Form.Item label={`任务名`}>
                                    {getFieldDecorator(`loginName`, {
                                    })(
                                        <Input placeholder="模糊匹配" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8} key={'c1'}>
                                <Form.Item label={`方法名`}>
                                    {getFieldDecorator(`loginName`, {
                                    })(
                                        <Input placeholder="模糊匹配" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={3} key={'c2'} style={{textAlign: 'center'}}>
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
                </div>
        );
    }

}

export default Form.create()(QuartzPage);