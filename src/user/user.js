import React from 'react';
import {Form, Row, Col, Input, Button, Table} from 'antd';
import './user.css'

class UserPage extends React.Component {

    state = {
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
                dataIndex: 'operate'
            },
        ],
        userPagination: {
            current: 1
        },
        userLoading: false
    };

    //用户查询 - 翻页
    userTableChange = (pagination) => {
        const userPagination = this.state.userPagination;
        userPagination.current = pagination.current;
        this.setState({
            userPagination: userPagination
        });
        // this.excelQuery();
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Form className="ant-advanced-search-form">
                    <Row gutter={16} style={{marginLeft: '10%'}}>
                        <Col span={8} key={'c1'}>
                            <Form.Item label={`登录名`}>
                                {getFieldDecorator(`loginName`, {
                                })(
                                    <Input/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={4} key={'c2'} style={{ textAlign: 'right' }}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={'search'}>查询</Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <br/>
                <Table
                    columns={this.state.userColumn}
                    rowKey={record => record.row}
                    dataSource={this.state.userData}
                    pagination={this.state.userPagination}
                    loading={this.state.userLoading}
                    onChange={this.userTableChange}
                    bordered
                    scroll={{x : true}}
                    size="middle"
                />
            </div>
        );
    }

}

export default Form.create()(UserPage);