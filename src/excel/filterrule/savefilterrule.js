import React from 'react';
import {Form, Icon, Input, Select, Col, Row} from 'antd';

import "./savefilterrule.css";

const { Option } = Select;

class SaveFilterRuleForm extends React.Component {

    render() {
        const { getFieldDecorator } = this.props.form;
        const param = this.props.param;

        getFieldDecorator('_exprRows', { initialValue: param.exprRows });

        const filterRuleRowSave = param.exprRows.map((k) => (
            <Row gutter={16} key={'rr_' + k} className="excel-filter-rule-row">
                <Col span={3} key={'cc1_' + k}>
                    <Form.Item key={'ff1_' + k}>
                        {getFieldDecorator(`_leftBracket[${k}]`, {
                            initialValue: param.leftBracket[k]
                        })(
                            <Select disabled>
                                <Option value="">无</Option>
                                <Option value="(">(</Option>
                                <Option value="((">( x 2</Option>
                                <Option value="(((">( x 3</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'cc2_' + k}>
                    <Form.Item key={'ff2_' + k}>
                        {getFieldDecorator(`_colNum[${k}]`, {
                            initialValue: param.colNum[k]
                        })(
                            <Input placeholder="列数" disabled/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={4} key={'cc3_' + k}>
                    <Form.Item key={'ff3_' + k}>
                        {getFieldDecorator(`_matched[${k}]`, {
                            initialValue: param.matched[k]
                        })(
                            <Select disabled>
                                <Option value="1">满足</Option>
                                <Option value="0">不满足</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={6} key={'cc4_' + k}>
                    <Form.Item key={'ff4_' + k}>
                        {getFieldDecorator(`_regex[${k}]`, {
                            initialValue: param.regex[k]
                        })(
                            <Input placeholder="值或正则表达式" disabled/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'cc5_' + k}>
                    <Form.Item key={'ff5_' + k}>
                        {getFieldDecorator(`_rightBracket[${k}]`, {
                            initialValue: param.rightBracket[k]
                        })(
                            <Select disabled>
                                <Option value="">无</Option>
                                <Option value=")">)</Option>
                                <Option value="))">) x 2</Option>
                                <Option value=")))">) x 3</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'cc6_' + k}>
                    <Form.Item key={'ff6_' + k}>
                        {getFieldDecorator(`_conj[${k}]`, {
                            initialValue: param.conj[k]
                        })(
                            <Select disabled>
                                <Option value="">无</Option>
                                <Option value="&">并且</Option>
                                <Option value="|">或者</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
            </Row>
        ));

        return (
            <Form>
                {filterRuleRowSave}
                <Row gutter={16} key={'rrb'} className="excel-filter-rule-row">
                    <Col span={22} key={'ccq'}>
                        <Form.Item>
                            {getFieldDecorator('filterRuleName', {
                                validateFirst: true,
                                rules: [{
                                    required: true,
                                    whitespace: true,
                                    message: '请输入过滤规则名称'
                                },{
                                    max: 128,
                                    message: '请设置小于128个字符'
                                }],
                            })(
                                <Input size={'large'} prefix={<Icon type="paper-clip" className="excel-filter-rule-icon" />}
                                       placeholder="请输入过滤规则名称" />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        );
    }
}

export default Form.create()(SaveFilterRuleForm);