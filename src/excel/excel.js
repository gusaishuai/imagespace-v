import React from 'react';
import {message, Upload, Icon, Layout, Form, Input, Button, Table, Select, Row, Col} from 'antd';
import reqwest from 'reqwest';

import {url} from "../config";
import "./excel.css";

const Dragger = Upload.Dragger;

const { Option } = Select;

const { Content, Sider, Header } = Layout;

let id = 0;

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
        fileList: [],
        currency: '',
    };

    uploadExcel = () => {
        let formData = new FormData();
        this.state.fileList.forEach((file) => {
            formData.append('files[]', file);
        });
        this.setState({ uploading: true });
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

    remove = (k) => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    add = () => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(++id);
        form.setFieldsValue({
            keys: nextKeys,
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
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

        getFieldDecorator('keys', { initialValue: [] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k) => (
            <Row gutter={16} key={'r' + k} style={{marginLeft: '3%', marginRight: '0%'}}>
                <Col span={3} key={'c1' + k}>
                    <Form.Item
                        key={'f1' + k}
                    >
                        <Select
                            defaultValue=""
                        >
                            <Option value="">无</Option>
                            <Option value="(">(</Option>
                            <Option value="((">( x 2</Option>
                            <Option value="(((">( x 3</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={3} key={'c2' + k}>
                    <Form.Item
                        key={'f2' + k}
                    >
                        {getFieldDecorator(`names1[${k}]`, {
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: "请填写列数",
                            }],
                        })(
                            <Input placeholder="列数" />
                        )}
                    </Form.Item>
                </Col>
                <Col span={4} key={'c3' + k}>
                    <Form.Item
                        key={'f3' + k}
                    >
                        <Select
                            defaultValue="1"
                        >
                            <Option value="1">满足</Option>
                            <Option value="0">不满足</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6} key={'c4' + k}>
                    <Form.Item
                        key={'f4' + k}
                    >
                        {getFieldDecorator(`names2[${k}]`, {
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: "请填写值或正则表达式",
                            }],
                        })(
                            <Input placeholder="值或正则表达式" />
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'c5' + k}>
                    <Form.Item
                        key={'f5' + k}
                    >
                        <Select
                            defaultValue=""
                        >
                            <Option value="">无</Option>
                            <Option value=")">)</Option>
                            <Option value="))">) x 2</Option>
                            <Option value=")))">) x 3</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={3} key={'c6' + k}>
                    <Form.Item
                        key={'f6' + k}
                    >
                        <Select
                            defaultValue=""
                        >
                            <Option value="">无</Option>
                            <Option value="&">并且</Option>
                            <Option value="|">或者</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={1} key={'c7' + k}>
                    <Form.Item
                        key={'f7' + k}
                    >
                        <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            onClick={() => this.remove(k)}
                        />
                    </Form.Item>
                </Col>
            </Row>
        ));
        
        return (
            <div>
                <Layout style={{ height: '35vh' }}>
                    <Sider style={{ background: 'transparent' }} width={'30%'}>
                        <Dragger {...props}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击或拖拽EXCEL到此上传</p>
                            <p className="ant-upload-hint">单个EXCEL文件上传（xls或xlsx格式）</p>
                        </Dragger>
                    </Sider>
                    <Content style={{overflow: 'auto'}}>
                        <Form onSubmit={this.handleSubmit}>
                            {formItems}
                            <Row gutter={16} key={'rq'} style={{marginLeft: '3%', marginRight: '0%'}}>
                                <Col span={20} key={'cq'}>
                                    <Form.Item>
                                        <Button type="dashed" onClick={this.add} style={{width: '100%'}}>
                                            <Icon type="plus" /> 添加过滤规则
                                        </Button>
                                    </Form.Item>
                                </Col>
                                <Col span={3} key={'cq1'}>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" style={{margin: '1%'}}>查询</Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Content>
                </Layout>
                <Layout>
                    <Header style={{background: 'transparent', height: '5vh'}}/>
                    <Content className="tabs-content">
                        <Table size={'middle'} bordered dataSource={dataSource} columns={columns} />
                    </Content>
                </Layout>
            </div>
        );
    }
}


export default Form.create()(ExcelPage);