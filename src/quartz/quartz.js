import React from 'react';
import {Button, Col, Form, Input, Row, Table, Divider, Modal} from 'antd';
import reqwest from "reqwest";
import {Redirect} from 'react-router-dom';

import {openErrorNotify, openSuccessNotify} from "../global";
import './quartz.css'
import {url} from "../config";

class QuartzPage extends React.Component {

    state = {
        noLoginRedirect: false,

        quartzData: [],
        quartzColumn: [
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
                    key: 'intervalTime',
                    render: (value, row, index) => {
                        if (row.cronExpression) {
                            return {
                                children: row.cronExpression,
                                props: {
                                    colSpan: 2,
                                },
                            };
                        }
                        return value;
                    }
                }, {
                    title: '重复次数',
                    dataIndex: 'repeatNum',
                    key: 'repeatNum',
                    render: (value, row, index) => {
                        if (row.cronExpression) {
                            return {
                                props: {
                                    colSpan: 0,
                                },
                            };
                        }
                        return value;
                    }
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
                        <a onClick={() => this.execQuartz(record.id)}>执行</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.viewQuartz(record.id)}>查看</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.editQuartz(record.id)}>编辑</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.closeQuartz(record.id)}>关闭</a>
                    </span>
                )
            }
        ],
        quartzPagination: {
            current: 1
        },
        quartzLoading: false,

        quartzButtonLoading: false,
        quartzButtonDisable: false

    };

    //定时任务查询
    quartzQuery = (e) => {
        e.preventDefault();
        this.getQuartzList();
    };

    //定时任务查询调用接口
    getQuartzList = (pageNo) => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    quartzButtonLoading: true,
                    quartzButtonDisable: true,
                    quartzLoading: true
                });
                reqwest({
                    url: 'http://' + url + '/exec?_mt=quartz.queryQuartz',
                    method: 'post',
                    crossOrigin: true,
                    withCredentials: true,
                    data: {
                        'quartzName': values.quartzName,
                        'methodName': values.methodName,
                        'pageNo': pageNo
                    },
                    type: 'json'
                }).then((data) => {
                    if (data.code === global.respCode.noLogin) {
                        this.setState({ noLoginRedirect: true });
                    } else if (data.code !== global.respCode.success) {
                        openErrorNotify(data.msg);
                    } else {
                        const quartzPagination = this.state.quartzPagination;
                        quartzPagination.total = data.result.totalCount;
                        quartzPagination.current = data.result.pageNo;
                        quartzPagination.pageSize = data.result.pageSize;
                        this.setState({
                            quartzData: data.result.list,
                            quartzPagination: quartzPagination,
                        });
                    }
                }, (err, msg) => {
                    openErrorNotify(msg);
                }).always(() => {
                    this.setState({
                        quartzButtonLoading: false,
                        quartzButtonDisable: false,
                        quartzLoading: false
                    });
                });
            }
        });
    };

    //定时任务执行
    execQuartz = (id) => {
        alert(id)
    };

    //定时任务查看详情
    viewQuartz = (id) => {
        alert(id)
    };

    //修改定时任务
    editQuartz = (id) => {
        alert(id)
    };

    //关闭定时任务
    closeQuartz = (id) => {
        alert(id)
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            this.state.noLoginRedirect ? <Redirect to={{pathname:"/login"}} /> :
            <div>
                <Form className="quartz-query-form" onSubmit={this.quartzQuery}>
                    <Row gutter={16} style={{marginLeft: '10%'}}>
                        <Col span={8} key={'cq'}>
                            <Form.Item label={`任务名`}>
                                {getFieldDecorator(`quartzName`, {
                                })(
                                    <Input placeholder="模糊匹配" />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8} key={'cn'}>
                            <Form.Item label={`方法名`}>
                                {getFieldDecorator(`methodName`, {
                                })(
                                    <Input placeholder="模糊匹配" />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={3} key={'cs'} style={{textAlign: 'center'}}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={this.state.quartzButtonLoading}
                                        disabled={this.state.quartzButtonDisable} icon={'search'}>查询</Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <br/>
                <Table
                    columns={this.state.quartzColumn}
                    rowKey={record => record.id}
                    dataSource={this.state.quartzData}
                    pagination={this.state.quartzPagination}
                    loading={this.state.quartzLoading}
                    onChange={this.userTableChange}
                    bordered
                    scroll={{x : true}}
                    size="middle"
                    className="quartz-query-table"
                />
            </div>
        );
    }

}

export default Form.create()(QuartzPage);