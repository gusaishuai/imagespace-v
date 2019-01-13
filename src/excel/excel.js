import React from 'react';
import {Button, Col, Form, Icon, Input, Layout, message, Modal, Row, Select, Table, Upload, Tooltip} from 'antd';
import reqwest from 'reqwest';
import {Redirect} from 'react-router-dom';

import {url} from "../config";
import {openErrorNotify, openSuccessNotify} from '../global.js';
import SaveFilterRuleForm from './filterrule/savefilterrule.js'
import "./excel.css";

const Dragger = Upload.Dragger;

const { Option } = Select;

const { Content, Sider, Header } = Layout;

const transposeColumns = [{
    dataIndex: 'k',
    fixed: 'left',
    width: 1,
}, {
    dataIndex: 'v',
}];

let keyRow = 0;

class ExcelPage extends React.Component {

    state = {
        noLoginRedirect: false,

        fileList: [],

        exprQueryLoading: false,
        exprQueryDisable: false,

        dataRow: [],

        excelData: [],
        excelColumn: [],
        excelPagination: {
            current: 1
        },
        excelLoading: false,
        excelTransposeVisible: false,

        filterRules: [],

        filterRuleSelectLoading: false,

        filterRuleLoading: false,
        filterRuleDisable: false,

        saveFilterRuleVisible: false,
        saveFilterRuleLoading: false,
        saveFilterRuleDisable: false,
        saveFilterRuleProp: {},

        deleteFilterRuleVisible: false,
        deleteFilterRuleLoading: false,
        deleteFilterRuleDisable: false,
        deleteFilterRuleName: ''
    };

    componentDidMount() {
        this.queryFilterRule();
    }

    //查询过滤规则
    queryFilterRule = () => {
        reqwest({
            url: 'http://' + url + '/exec?_mt=excel.filterRuleQuery',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json'
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
                this.setState({ filterRules: data.result });
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        });
    };

    //上传excel
    uploadExcel = () => {
        let formData = new FormData();
        this.setState({ exprQueryDisable: true });
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
                message.success('上传成功，我们将在服务器上为你保存24小时');
            }
        }, (err, msg) => {
            const fileList = this.state.fileList;
            fileList[0].status = 'error';
            this.setState({ fileList: fileList });
            message.error('上传失败：' + msg);
        }).always(() => {
            this.setState({ exprQueryDisable: false });
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

    //过滤条件下拉框修改
    changeFilterRule = (value) => {
        const { form } = this.props;
        keyRow = 0;
        form.setFieldsValue({
            exprRows: [],
            initialProp: []
        });
        if (!value) {
            return;
        }
        this.setState({ filterRuleSelectLoading: true });
        reqwest({
            url: 'http://' + url + '/exec?_mt=excel.filterRuleDetailQuery',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'ruleId': value
            },
            type: 'json'
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
                const { form } = this.props;
                form.setFieldsValue({ initialProp: data.result });

                data.result.map(() => (
                    this.addExpr()
                ));
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        }).always(() => {
            this.setState({ filterRuleSelectLoading: false });
        });
    };

    //返回list中获取列名
    getColumn = (data) => {
        let dataRows = [];
        let k = 0;
        if (data && data.length > 0) {
            for (let j in data[0]) {
                let dataRow = {};
                dataRow.title = j;
                dataRow.dataIndex = j;
                dataRows[k] = dataRow;
                k++;
            }
        }
        return dataRows;
    };

    //EXCEL查询 - 翻页
    excelTableChange = (pagination) => {
        const excelPagination = this.state.excelPagination;
        excelPagination.current = pagination.current;
        this.setState({
            excelPagination: excelPagination
        });
        this.excelQuery();
    };

    //EXCEL根据规则查询
    exprQuery = (e) => {
        e.preventDefault();
        this.excelQuery();
    };

    //EXCEL查询或分页查询
    excelQuery = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    exprQueryLoading: true,
                    exprQueryDisable: true,
                    excelLoading: true
                });
                reqwest({
                    url: 'http://' + url + '/exec?_mt=excel.exprQuery',
                    method: 'post',
                    crossOrigin: true,
                    withCredentials: true,
                    data: {
                        'sheetNum': values.sheetNum,
                        'topNum': values.topNum,
                        'pageNo': this.state.excelPagination.current,
                        'exprRows': values.exprRows,
                        'leftBracket': values.leftBracket,
                        'colNum': values.colNum,
                        'matched': values.matched,
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
                        const excelPagination = this.state.excelPagination;
                        excelPagination.total = data.result.pagination.totalCount;
                        excelPagination.pageSize = data.result.pagination.pageSize;
                        this.setState({
                            excelData: data.result.excelDataList,
                            excelColumn: this.getColumn(data.result.excelDataList),
                            excelPagination: excelPagination,
                        });
                    }
                }, (err, msg) => {
                    openErrorNotify(msg);
                }).always(() => {
                    this.setState({
                        exprQueryLoading: false,
                        exprQueryDisable: false,
                        excelLoading: false
                    });
                });
            }
        });
    };

    //执行 - 双击事件
    excelOnRowDoubleClick = (row) => {
        return {
            onDoubleClick : () => {
                this.setState({
                    excelTransposeVisible: true,
                    dataRow: this.transposeRow(row),
                });
            },
        }
    };

    //行转列
    transposeRow = (row) => {
        let dataRow = [];
        let j = 0;
        for (let i in row) {
            let data = {};
            data.k = i;
            data.v = row[i];
            dataRow[j] = data;
            j++;
        }
        return dataRow;
    };

    //行转列后确认
    excelTransposeClose = () => {
        this.setState({
            excelTransposeVisible: false
        });
    };

    //显示保存规则框
    showSaveFilterRule = () => {
        const { form } = this.props;
        form.validateFields((err, values) => {
            if (err) {
                openErrorNotify('过滤规则不符合规范');
                return;
            }
            const exprRows = form.getFieldValue('exprRows');
            let hasFilterRule = false;
            for (let exprRow in exprRows) {
                if (exprRow >= 0) {
                    hasFilterRule = true;
                }
            }
            if (!hasFilterRule) {
                openErrorNotify('至少要存在一条过滤规则');
            } else {
                this.setState({
                    saveFilterRuleVisible: true,
                    saveFilterRuleProp: values
                });
            }
        });
    };

    //保存规则框关闭
    saveFilterRuleClose = () => {
        this.setState({
            saveFilterRuleVisible: false
        });
    };

    //保存过滤规则
    saveFilterRule = () => {
        this.refs.saveFilterRuleForm.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    saveFilterRuleLoading: true,
                    saveFilterRuleDisable: true
                });
                reqwest({
                    url: 'http://' + url + '/exec?_mt=excel.filterRuleUpdate',
                    method: 'post',
                    crossOrigin: true,
                    withCredentials: true,
                    data: {
                        'filterRuleName': values.filterRuleName,
                        'exprRows': values._exprRows,
                        'leftBracket': values._leftBracket,
                        'colNum': values._colNum,
                        'matched': values._matched,
                        'regex': values._regex,
                        'rightBracket': values._rightBracket,
                        'conj': values._conj
                    },
                    type: 'json'
                }).then((data) => {
                    if (data.code === global.respCode.noLogin) {
                        this.setState({ noLoginRedirect: true });
                    } else if (data.code !== global.respCode.success) {
                        openErrorNotify(data.msg);
                    } else {
                        openSuccessNotify('过滤规则保存成功');
                        this.setState({
                            saveFilterRuleVisible: false
                        });
                        //刷新过滤规则
                        this.queryFilterRule();
                    }
                }, (err, msg) => {
                    openErrorNotify(msg);
                }).always(() => {
                    this.setState({
                        saveFilterRuleLoading: false,
                        saveFilterRuleDisable: false
                    });
                });
            }
        });
    };

    //删除过滤规则框打开
    showDeleteFilterRule = () => {
        const { form } = this.props;
        const filterRule = form.getFieldValue('filterRule');
        if (!filterRule) {
            openErrorNotify('必须选择一条规则');
            return;
        }
        let filterRuleName = '';
        this.state.filterRules.forEach((value) => {
            if (value.id === filterRule) {
                filterRuleName = value.name;
            }
        });
        this.setState({
            deleteFilterRuleVisible: true,
            deleteFilterRuleName: filterRuleName
        });
    };

    //删除过滤规则框关闭
    deleteFilterRuleClose = () => {
        this.setState({
            deleteFilterRuleVisible: false
        });
    };

    //删除过滤规则
    deleteFilterRule = () => {
        this.setState({
            deleteFilterRuleLoading: true,
            deleteFilterRuleDisable: true
        });
        const { form } = this.props;
        const filterRule = form.getFieldValue('filterRule');
        reqwest({
            url: 'http://' + url + '/exec?_mt=excel.filterRuleDelete',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'ruleId': filterRule,
            },
            type: 'json'
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                openErrorNotify(data.msg);
            } else {
                openSuccessNotify('过滤规则删除成功');
                this.setState({
                    deleteFilterRuleVisible: false
                });
                form.setFieldsValue({
                    filterRule: undefined,
                });
                //刷新过滤规则
                this.queryFilterRule();
            }
        }, (err, msg) => {
            openErrorNotify(msg);
        }).always(() => {
            this.setState({
                deleteFilterRuleLoading: false,
                deleteFilterRuleDisable: false
            });
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
        getFieldDecorator('initialProp', { initialValue: [] });

        const exprRows = getFieldValue('exprRows');
        const initialProp = getFieldValue('initialProp');

        const filterRuleRow = exprRows.map((k) => (
            <Row gutter={16} key={'r_' + k} className="excel-expr-row">
                <Col span={3} key={'c1_' + k}>
                    <Form.Item key={'f1_' + k}>
                        {getFieldDecorator(`leftBracket[${k}]`, {
                            initialValue: initialProp[k] && initialProp[k].leftBracket !== '' ? initialProp[k].leftBracket : undefined
                        })(
                            <Select allowClear placeholder="括号">
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
                            initialValue: initialProp[k] ? initialProp[k].colNum : '',
                            validateFirst: true,
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: "请填写列数",
                            }, {
                                pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                message: '请填写数字'
                            }, {
                                max: 8,
                                message: '需小于8位'
                            }]
                        })(
                            <Input placeholder="列数" />
                        )}
                    </Form.Item>
                </Col>
                <Col span={4} key={'c3_' + k}>
                    <Form.Item key={'f3_' + k}>
                        {getFieldDecorator(`matched[${k}]`, {
                            initialValue: initialProp[k] ? initialProp[k].matched : '1',
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
                            initialValue: initialProp[k] ? initialProp[k].regex : '',
                            validateFirst: true,
                            rules: [{
                                required: true,
                                message: "请填写值或正则表达式",
                            },{
                                max: 256,
                                message: '请设置小于256个字符'
                            }],
                        })(
                            <Input placeholder="值或正则表达式" />
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} key={'c5_' + k}>
                    <Form.Item key={'f5_' + k}>
                        {getFieldDecorator(`rightBracket[${k}]`, {
                            initialValue: initialProp[k] && initialProp[k].rightBracket !== '' ? initialProp[k].rightBracket : undefined
                        })(
                            <Select allowClear placeholder="括号">
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
                            initialValue: initialProp[k] && initialProp[k].conj !== '' ? initialProp[k].conj : undefined
                        })(
                            <Select allowClear placeholder="连接">
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

        const filterRuleOptions = this.state.filterRules.map((k) => (
            <Option key={k.id} value={k.id}>{k.name}</Option>
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
                                <Col span={3} key={'cs'}>
                                    <Form.Item>
                                        <Tooltip title="第几个sheet，缺省值：1">
                                            {getFieldDecorator(`sheetNum`, {
                                                rules:[{
                                                    pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                                    message: '请填写数字'
                                                }]
                                            })(
                                                <Input placeholder="表序数" />
                                            )}
                                        </Tooltip>
                                    </Form.Item>
                                </Col>
                                <Col span={3} key={'ct'}>
                                    <Form.Item>
                                        <Tooltip title="表头的行数，缺省值：0">
                                            {getFieldDecorator(`topNum`, {
                                                rules:[{
                                                    pattern: new RegExp(/^(0|[1-9]\d*)$/, "g"),
                                                    message: '请填写数字'
                                                }]
                                            })(
                                                <Input placeholder="表头数" />
                                            )}
                                        </Tooltip>
                                    </Form.Item>
                                </Col>
                                <Col span={12} key={'cf'}>
                                    <Form.Item>
                                        {getFieldDecorator(`filterRule`, {
                                        })(
                                            <Select onChange={this.changeFilterRule} loading={this.state.filterRuleSelectLoading}
                                                    allowClear placeholder="选择过滤规则">
                                                {filterRuleOptions}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={4} key={'cd'}>
                                    <Form.Item className="excel-expr-update-button">
                                        <Button type="primary" onClick={this.showDeleteFilterRule} icon={'delete'}>删除规则</Button>
                                        <Modal
                                            title="确认删除吗？"
                                            visible={this.state.deleteFilterRuleVisible}
                                            onCancel={this.deleteFilterRuleClose}
                                            footer={[
                                                <Button key="cancel" onClick={this.deleteFilterRuleClose}>
                                                    取消
                                                </Button>,
                                                <Button key="confirm" type="primary" loading={this.state.deleteFilterRuleLoading}
                                                        disabled={this.state.deleteFilterRuleDisable} onClick={this.deleteFilterRule}>
                                                    确认
                                                </Button>
                                            ]}
                                        >
                                            <p>你将删除过滤规则：{this.state.deleteFilterRuleName}</p>
                                        </Modal>
                                    </Form.Item>
                                </Col>
                            </Row>
                            {filterRuleRow}
                            <Row gutter={16} key={'rb'} className="excel-expr-row">
                                <Col span={6} key={'cq'}>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={this.state.exprQueryLoading}
                                                disabled={this.state.exprQueryDisable} icon={'search'}>过滤查询</Button>
                                    </Form.Item>
                                </Col>
                                <Col span={12} key={'ca'}>
                                    <Form.Item>
                                        <Button type="dashed" onClick={this.addExpr} className="excel-expr-add-button">
                                            <Icon type="plus" /> 添加过滤规则
                                        </Button>
                                    </Form.Item>
                                </Col>
                                <Col span={4} key={'cs'}>
                                    <Form.Item className="excel-expr-update-button">
                                        <Button type="primary" onClick={this.showSaveFilterRule}
                                                loading={this.state.filterRuleLoading} icon={'save'}
                                                disabled={this.state.filterRuleDisable}>保存规则</Button>
                                    </Form.Item>
                                    <Modal
                                        title="保存过滤规则"
                                        width={'65%'}
                                        visible={this.state.saveFilterRuleVisible}
                                        onCancel={this.saveFilterRuleClose}
                                        footer={[
                                            <Button key="cancel" onClick={this.saveFilterRuleClose}>
                                                取消
                                            </Button>,
                                            <Button key="confirm" type="primary" loading={this.state.saveFilterRuleLoading}
                                                    disabled={this.state.saveFilterRuleDisable} onClick={this.saveFilterRule}>
                                                确认
                                            </Button>
                                        ]}
                                    >
                                        <SaveFilterRuleForm ref="saveFilterRuleForm" param={this.state.saveFilterRuleProp} />
                                    </Modal>
                                </Col>
                            </Row>
                        </Form>
                    </Content>
                </Layout>
                <Layout>
                    <Header className="excel-table-header"/>
                    <Content className="excel-table-content">
                        <Table
                            columns={this.state.excelColumn}
                            rowKey={record => record.row}
                            dataSource={this.state.excelData}
                            pagination={this.state.excelPagination}
                            loading={this.state.excelLoading}
                            onChange={this.excelTableChange}
                            bordered
                            onRow={this.excelOnRowDoubleClick}
                            scroll={{x : true}}
                            size="middle"
                        />
                        <Modal
                            title = '列块显示'
                            visible={this.state.excelTransposeVisible}
                            onCancel={this.excelTransposeClose}
                            width = {'50%'}
                            footer={
                                <Button type="primary" onClick={this.excelTransposeClose}>
                                    确认
                                </Button>
                            }
                        >
                            <Table
                                columns={transposeColumns}
                                showHeader={false}
                                rowKey={record => record.key}
                                dataSource={this.state.dataRow}
                                pagination={false}
                                bordered
                                scroll={{x : true}}
                                size="middle"
                            />
                        </Modal>
                    </Content>
                </Layout>
            </div>
        );
    }
}

export default Form.create()(ExcelPage);