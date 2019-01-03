import React from 'react';
import {message, Upload, Icon, Layout, Form, Input, Button, Table, Select, Row, Col} from 'antd';
import reqwest from 'reqwest';
import {Redirect} from 'react-router-dom';

import {url} from "../config";
import {openErrorNotify, openSuccessNotify} from '../global.js';
import "./excel.css";

const Dragger = Upload.Dragger;

const { Option } = Select;

const { Content, Sider, Header } = Layout;

let keyRow = 0;

const dataSource = [{
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号'
}, {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号'
}];

const columns = [{
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
}, {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
}, {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
}];

class ExcelPage extends React.Component {

    state = {
        noLoginRedirect: false,

        fileList: [],

        exprQueryLoading: false,
        exprQueryDisable: false,

        sheetNum: '',
    };

    //上传excel
    uploadExcel = () => {
        let formData = new FormData();
        this.state.fileList.forEach((file) => {
            formData.append('files[]', file);
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=excel.uploadExcel',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            processData: false,
            data: formData
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                const fileList = this.state.fileList;
                fileList[0].status = 'error';
                this.setState({ fileList: fileList });
                message.error('上传失败：' + data.msg);
            } else {
                const fileList = this.state.fileList;
                fileList[0].status = 'done';
                this.setState({ fileList: fileList });
                message.success('上传成功');
            }
        }, (err, msg) => {
            const fileList = this.state.fileList;
            fileList[0].status = 'error';
            this.setState({ fileList: fileList });
            message.error('上传失败：' + msg);
        });
    };

    //删除规则
    removeExpr = (k) => {
        const { form } = this.props;
        const exprRows = form.getFieldValue('exprRows');
        form.setFieldsValue({
            exprRows: exprRows.filter(key => key !== k)
        });
    };

    //添加规则
    addExpr = () => {
        const { form } = this.props;
        const exprRows = form.getFieldValue('exprRows');
        const nextExprRows = exprRows.concat(keyRow++);
        form.setFieldsValue({
            exprRows: nextExprRows
        });
    };

    //根据规则查询
    exprQuery = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    exprQueryLoading: true,
                    exprQueryDisable: true
                });
                reqwest({
                    url: 'http://' + url + '/exec?_mt=excel.exprQuery',
                    method: 'post',
                    crossOrigin: true,
                    withCredentials: true,
                    data: {
                        'sheetNum': values.sheetNum,
                        'topNum': values.topNum,
                        'exprRows': values.exprRows,
                        'leftBracket': values.leftBracket,
                        'colNum': values.colNum,
                        'match': values.match,
                        'regex': values.regex,
                        'rightBracket': values.rightBracket,
                        'conj': values.conj
                    },
                    type: 'json'
                }).then((data) => {
                    if (data.code === global.respCode.noLogin) {
                        this.setState({ noLoginRedirect: true });
                    } else if (data.code !== global.respCode.success) {
                        openErrorNotify(data.msg);
                    } else {
                        alert(JSON.stringify(data));
                    }
                }, (err, msg) => {
                    openErrorNotify(msg);
                }).always(() => {
                    this.setState({
                        exprQueryLoading: false,
                        exprQueryDisable: false
                    });
                });
            }
        });
    };

    render() {

        const props = {
            accept: '.xls,.xlsx',
            multiple: false,
            beforeUpload: (file) => {
                this.setState(state => ({
                    fileList: [...state.fileList, file],
                }));
            },
            customRequest: this.uploadExcel,
            onChange: (info) => {
                this.setState({ fileList: info.fileList.slice(-1) });
            },
            fileList: this.state.fileList
        };

        const { getFieldDecorator, getFieldValue } = this.props.form;

        getFieldDecorator('exprRows', { initialValue: [] });

        const exprRows = getFieldValue('exprRows');

        const expressions = exprRows.map((k) => (
            <Row gutter={16} key={'r_' + k} className="excel-expr-row">
                <Col span={3} key={'c1_' + k}>
                    <Form.Item key={'f1_' + k}>
                        {getFieldDecorator(`leftBracket[${k}]`, {
                            initialValue: ''
                        })(
                            <Select>
                                <Option value="">无</Option>
                                <Option value="(">(</Option>
                                <Option value="((">( x 2</Option>
                                <Option value="(((">( x 3</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'c2_' + k}>
                    <Form.Item key={'f2_' + k}>
                        {getFieldDecorator(`colNum[${k}]`, {
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: "请填写列数",
                            }, {
                                pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                message: '请填写数字'
                            }]
                        })(
                            <Input placeholder="列数" />
                        )}
                    </Form.Item>
                </Col>
                <Col span={4} key={'c3_' + k}>
                    <Form.Item key={'f3_' + k}>
                        {getFieldDecorator(`match[${k}]`, {
                            initialValue: '1',
                            rules: [{
                                required: true,
                                message: '请选择满足条件'
                            }],
                        })(
                            <Select>
                                <Option value="1">满足</Option>
                                <Option value="0">不满足</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={6} key={'c4_' + k}>
                    <Form.Item key={'f4_' + k}>
                        {getFieldDecorator(`regex[${k}]`, {
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [{
                                required: true,
                                message: "请填写值或正则表达式",
                            }],
                        })(
                            <Input placeholder="值或正则表达式" />
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'c5_' + k}>
                    <Form.Item key={'f5_' + k}>
                        {getFieldDecorator(`rightBracket[${k}]`, {
                            initialValue: ''
                        })(
                            <Select>
                                <Option value="">无</Option>
                                <Option value=")">)</Option>
                                <Option value="))">) x 2</Option>
                                <Option value=")))">) x 3</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'c6_' + k}>
                    <Form.Item key={'f6_' + k}>
                        {getFieldDecorator(`conj[${k}]`, {
                            initialValue: ''
                        })(
                            <Select>
                                <Option value="">无</Option>
                                <Option value="&">并且</Option>
                                <Option value="|">或者</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={1} key={'c7_' + k}>
                    <Form.Item key={'f7_' + k}>
                        <Icon
                            className="excel-expr-delete-button"
                            type="minus-circle-o"
                            onClick={() => this.removeExpr(k)}
                        />
                    </Form.Item>
                </Col>
            </Row>
        ));
        
        return (
            this.state.noLoginRedirect ? <Redirect to={{pathname:"/login"}} /> :
            <div>
                <Layout className="excel-layout">
                    <Sider className="excel-upload-sider" width={'30%'}>
                        <Dragger {...props}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击或拖拽EXCEL到此上传</p>
                            <p className="ant-upload-hint">单个EXCEL文件上传（xls或xlsx格式）</p>
                        </Dragger>
                    </Sider>
                    <Content className="excel-expr-content">
                        <Form onSubmit={this.exprQuery}>
                            <Row gutter={16} key={'rb1'} className="excel-expr-row">
                                <Col span={5} key={'cs'}>
                                    <Form.Item>
                                        {getFieldDecorator(`sheetNum`, {
                                            rules:[{
                                                pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                                message: '请输入正确的sheet数'
                                            }]
                                        })(
                                            <Input placeholder="sheet数，默认1" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={5} key={'ct'}>
                                    <Form.Item>
                                        {getFieldDecorator(`topNum`, {
                                            rules:[{
                                                pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                                message: '请输入正确的表头行数'
                                            }]
                                        })(
                                            <Input placeholder="表头行数，默认0" />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12} key={'cf'}>
                                    <Form.Item>
                                        {getFieldDecorator(`filterRule`, {
                                            initialValue: ''
                                        })(
                                            <Select>
                                                <Option value="">可选择保存的过滤规则</Option>
                                                <Option value="&7">性别和英文不一致性别和英文不一致性别和英文不一致性别和英文不一致</Option>
                                                <Option value="&">性别和英文不一致</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            {expressions}
                            <Row gutter={16} key={'rb'} className="excel-expr-row">
                                <Col span={3} key={'cq'}>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={this.state.exprQueryLoading}
                                                disabled={this.state.exprQueryDisable}>查询</Button>
                                    </Form.Item>
                                </Col>
                                <Col span={16} key={'ca'}>
                                    <Form.Item>
                                        <Button type="dashed" onClick={this.addExpr} className="excel-expr-add-button">
                                            <Icon type="plus" /> 添加过滤规则
                                        </Button>
                                    </Form.Item>
                                </Col>
                                <Col span={3} key={'cs'}>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={this.state.exprQueryLoading}
                                                disabled={this.state.exprQueryDisable}>保存</Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Content>
                </Layout>
                <Layout>
                    <Header className="excel-table-header"/>
                    <Content className="excel-table-content">
                        <Table size={'middle'} bordered dataSource={dataSource} columns={columns} />
                    </Content>
                </Layout>
            </div>
        );
    }
}


export default Form.create()(ExcelPage);