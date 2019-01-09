import React from 'react';
import {Form, Row, Col, Input, Button, Icon} from 'antd';
import './user.css'

class UserPage extends React.Component {

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
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
        );
    }

}

export default Form.create()(UserPage);