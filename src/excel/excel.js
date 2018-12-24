import React from 'react';
import {message, Upload, Icon, Layout, Form, Input, Button, Table} from 'antd';
import reqwest from 'reqwest';

import {url} from "../config";
import "./excel.css";

const Dragger = Upload.Dragger;

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
        fileList: []
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
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    }

    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(++id);
        // can use data-binding to set
        // important! notify form to detect changes
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

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };

        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 24, offset: 0 },
                sm: { span: 20, offset: 4 },
            },
        };

        getFieldDecorator('keys', { initialValue: [] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <Form.Item
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                label={index === 0 ? 'Passengers' : ''}
                required={false}
                key={k}
            >
                {getFieldDecorator(`names[${k}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [{
                        required: true,
                        whitespace: true,
                        message: "Please input passenger's name or delete this field.",
                    }],
                })(
                    <Input placeholder="passenger name" style={{ width: '60%', marginRight: 8 }} />
                )}
                {keys.length > 1 ? (
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        disabled={keys.length === 1}
                        onClick={() => this.remove(k)}
                    />
                ) : null}
            </Form.Item>
        ));
        
        return (
            <div>
                <Layout style={{ height: '30vh' }}>
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
                            <Form.Item {...formItemLayoutWithOutLabel}>
                                <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                                    <Icon type="plus" /> Add field
                                </Button>
                            </Form.Item>
                            <Form.Item {...formItemLayoutWithOutLabel}>
                                <Button type="primary" htmlType="submit">Submit</Button>
                            </Form.Item>
                        </Form>
                    </Content>
                </Layout>
                <Layout>
                    <Header style={{background: 'transparent'}}/>
                    <Content className="tabs-content">
                        <Table size={'middle'} bordered dataSource={dataSource} columns={columns} />
                    </Content>
                </Layout>
            </div>
        );
    }
}


export default Form.create()(ExcelPage);