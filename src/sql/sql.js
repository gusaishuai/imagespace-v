import React from 'react';
import {Button, Layout, Menu, Modal, notification, Table, Tabs} from 'antd';
import reqwest from 'reqwest';
import 'antd/dist/antd.css';
import './sql.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/sql-hint.js';
import 'codemirror/theme/darcula.css';
import url from '../config.js';
import {Redirect} from 'react-router-dom';

const codemirrorOptions={
    lineNumbers: true,
    lineSeparator: ' ',
    lineWrapping: true,
    mode: {name: "text/x-mysql"},
    extraKeys: {"Alt-/": "autocomplete"},
    theme: "darcula"
};

const {
    Header, Footer, Sider, Content,
} = Layout;

const TabPane = Tabs.TabPane;

const transposeColumns = [{
    dataIndex: 'k',
    fixed: 'left',
    width: 1,
}, {
    dataIndex: 'v',
}];

const openNotification = (msg) => {
    notification.error({
        message: '执行失败',
        description: msg,
    });
};

class SqlPage extends React.Component {

    state = {
        noLoginRedirect: false,

        data: [],
        pagination: {},
        loading: false,

        visible: false,
        dataRow: [],
        columns: [],

        buttonLoading: false,
        
        tablesData: [],
        siderLoading: false,
        aaa: [],
    };

    showModal = (row) => {
        this.setState({
            visible: true,
            dataRow: this.handleArray(row),
        });
    };

    handleOk = () => {
        this.setState({
            visible: false,
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });

        //TODO
        const editor = this.refs.editorSql.getCodeMirror();
        let sql = editor.getSelection();
        if (sql === '') {
            sql = editor.getValue();
        }
        this.fetch({
            sql: sql,
            pageNo: pagination.current,
        });
    };

    fetch = (params = {}) => {
        this.setState({ loading: true });
        reqwest({
            url: 'http://' + url + '/exec?_mt=sql.execSql',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                ...params,
            },
            type: 'json',
        }).then((data) => {
            if (data.code === 1001) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== 0) {
                openNotification(data.msg);
            } else {
                const pagination = {...this.state.pagination};
                pagination.total = data.result.pagination.totalCount;
                this.setState({
                    data: data.result.resultList,
                    columns: this.changeColumns(data.result.resultList),
                    pagination,
                });
            }
        }, (err, msg) => {
            openNotification(msg);
        }).always(() => {
            this.setState({
                loading: false,
                buttonLoading: false
            });
        });
    };

    getAllTables = () => {
        this.setState({ siderLoading: true });
        reqwest({
            url: 'http://' + url + '/exec?_mt=sql.getAllTables',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json',
        }).then((data) => {
            if (data.code === 1001) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== 0) {
                openNotification(data.msg);
            } else {
                this.setState({
                    tablesData: data.result.map(d =>
                        <Menu.Item key={d}>
                            <span>{d}</span>
                        </Menu.Item>
                ) });
            }
        }, (err, msg) => {
            openNotification(msg);
        }).always(() => {
            this.setState({
                siderLoading: false,
            });
        });
    };

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
        this.fetch({sql : "select * from t_user"});
        this.getAllTables();
    }

    onKeyDown = (e) => {
        //ctrl+enter
        if (e.ctrlKey && e.keyCode === 13) {
            this.setState({ buttonLoading: true });
            const editor = this.refs.editorSql.getCodeMirror();
            let sql = editor.getSelection();
            if (sql === '') {
                sql = editor.getValue();
            }
            if (sql === '') {
                this.setState({ buttonLoading: false });
                openNotification("请输入sql");
                return;
            }
            this.fetch({sql : sql});
        }
    };

    changeColumns = (data) => {
        let dataRows = [];
        let k = 0;
        for (let j in data[0]) {
            let dataRow = {};
            dataRow.title = j;
            dataRow.dataIndex = j;
            dataRows[k] = dataRow;
            k++;
        }
        return dataRows;
    };

    onRowClick1 = (rowKeys) => {
        return {
            onDoubleClick : () => {this.showModal(rowKeys)},
        }
    };

    handleArray = (row) => {
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

    enterLoading = () => {
        this.setState({ buttonLoading: true });
        const editor = this.refs.editorSql.getCodeMirror();
        let sql = editor.getSelection();
        if (sql === '') {
            sql = editor.getValue();
        }
        if (sql === '') {
            this.setState({ buttonLoading: false });
            openNotification("请输入sql");
            return;
        }
        this.fetch({sql : sql});
    };

    render() {
        return (
            this.state.noLoginRedirect ? <Redirect to={{pathname:"/login"}} /> :
            <div>
                <Layout>
                    <Sider width={'25%'} style={{height: '60vh', overflow: 'auto'}}>
                        <Menu theme="dark">
                            {this.state.tablesData}
                        </Menu>
                    </Sider>
                    <Layout width={'75%'} style={{ paddingLeft: '1%' }}>
                        <Content>
                            <CodeMirror ref="editorSql" options={codemirrorOptions} />
                        </Content>
                        <Footer align="right">
                            <Button type="primary" loading={this.state.buttonLoading} onClick={this.enterLoading} size={'large'}>
                                执行（CTRL+ENTER）
                            </Button>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Button type="primary" size={'large'}>
                                导出
                            </Button>
                        </Footer>
                    </Layout>
                </Layout>
                <Layout>
                    <Tabs onChange={console.log()}>
                        <TabPane tab="执行" key="1">
                            <Content style={{ background: '#FFFFFF' }}>
                                <Table
                                    columns={this.state.columns}
                                    rowKey={record => record._no}
                                    dataSource={this.state.data}
                                    pagination={this.state.pagination}
                                    loading={this.state.loading}
                                    onChange={this.handleTableChange}
                                    bordered
                                    onRow={this.onRowClick1}
                                    scroll={{x : true}}
                                    size="middle"
                                />

                                <Modal
                                    title = '列块显示'
                                    visible={this.state.visible}
                                    onOk={this.handleOk}
                                    onCancel={this.handleCancel}
                                    width = {'50%'}
                                    footer={
                                        <Button type="primary" onClick={this.handleOk}>
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
                        </TabPane>
                        <TabPane tab="表结构" key="2">Content of Tab Pane 2</TabPane>
                    </Tabs>
                    <Footer style={{ textAlign: 'center' }}>
                        ©2018 Created by GSS
                    </Footer>
                </Layout>
            </div>
        );
    }

}

export default SqlPage;
