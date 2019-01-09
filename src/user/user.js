import React from 'react';
import {Form, Row, Col, Input, Button, Icon} from 'antd';

class UserPage extends React.Component {

    render() {
        return (
                <Form
                    // className="ant-advanced-search-form"
                >
                    <Row gutter={24}>123</Row>
                    <Row>
                        <Col span={24} style={{textAlign: 'right'}}>
                            <Button type="primary" htmlType="submit">Search</Button>
                            <Button style={{marginLeft: 8}} onClick={this.handleReset}>
                                Clear
                            </Button>
                            <a style={{marginLeft: 8, fontSize: 12}} onClick={this.toggle}>
                                Collapse <Icon type={'up'}/>
                            </a>
                        </Col>
                    </Row>
                </Form>
        );
    }

}

export default UserPage;