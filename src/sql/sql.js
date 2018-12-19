import React from 'react';
import {Redirect} from 'react-router-dom';

import {Button, Layout, Menu, Modal, notification, Table, Tabs} from 'antd';
import 'antd/dist/antd.css';

import reqwest from 'reqwest';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/sql-hint.js';
import 'codemirror/theme/darcula.css';

import './sql.css';
import url from '../config.js';

const codemirrorOptions={
    lineNumbers: true,
    lineSeparator: ' ',
    lineWrapping: true,
    mode: {name: "text/x-mysql"},
    extraKeys: {"Alt-/": "autocomplete"},
    theme: "darcula"
};

const {
    Footer, Sider, Content,
} = Layout;

const TabPane = Tabs.TabPane;

const confirm = Modal.confirm;

const transposeColumns = [{
    dataIndex: 'k',
    fixed: 'left',
    width: 1,
}, {
    dataIndex: 'v',
}];

const openError = (msg) => {
    notification.error({
        message: '执行失败',
        description: msg,
    });
};

class SqlPage extends React.Component {

    state = {
        noLoginRedirect: false,
        
        dataRow: [],
        
        buttonLoading: false,

        allTables: [],

        execData: [],
        execColumn: [],
        execLoading: false,
        execPagination: {},
        execTransposeVisible: false,

        columnData: [],
        columnColumn: [],
        columnLoading: false,

        indexData: [],
        indexColumn: [],
        indexLoading: false,

        limitData: [],
        limitColumn: [],
        limitLoading: false,
        limitPagination: {},
        limitTransposeVisible: false,
    };

    componentDidMount() {
        document.addEventListener("keydown", this.ctrlEnter);
        this.getAllTables();
    }

    //codemirror中获取sql
    getSql = () => {
        const editor = this.refs.editorSql.getCodeMirror();
        let sql = editor.getSelection();
        if (sql === '') {
            sql = editor.getValue();
        }
        if (sql === '') {
            this.setState({ buttonLoading: false });
            openError("请输入sql");
            return;
        }
        return sql;
    };

    //接口返回数据是否正确
    checkSuccess = (data) => {
        if (data.code === 1001) {
            this.setState({ noLoginRedirect: true });
        } else if (data.code !== 0) {
            openError(data.msg);
        } else {
            return true;
        }
    };

    //ctrl+enter事件-执行sql
    ctrlEnter = (e) => {
        if (e.ctrlKey && e.keyCode === 13) {
            let sql = this.getSql();
            if (!sql) {
                return;
            }
            this.execSql(sql);
        }
    };

    //获取所有表
    getAllTables = () => {
        this.setState({
            allTables: <Menu.Item key={'loading'} disabled={true}>
                <span style={{ color: 'white' }}>loading...</span>
            </Menu.Item>
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=sql.getAllTables',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            type: 'json',
        }).then((data) => {
            if (this.checkSuccess(data)) {
                this.setState({
                    allTables: data.result.map(d =>
                        <Menu.Item key={d}>
                            <span>{d}</span>
                        </Menu.Item>
                    )
                });
            }
        }, (err, msg) => {
            openError(msg);
        });
    };
    
    //返回list中获取列名
    getColumn = (data) => {
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

    //点击-执行sql
    clickExecSql = () => {
        let sql = this.getSql();
        if (!sql) {
            return;
        }
        this.execSql(sql);
    };
    
    //执行sql
    execSql = (sql, pageNo) => {
        this.setState({
            execLoading: true,
            buttonLoading: true
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=sql.execSql',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'sql' : sql,
                'pageNo': pageNo
            },
            type: 'json',
        }).then((data) => {
            if (this.checkSuccess(data)) {
                const execPagination = this.state.execPagination;
                execPagination.total = data.result.pagination.totalCount;
                this.setState({
                    execData: data.result.resultList,
                    execColumn: this.getColumn(data.result.resultList),
                    execPagination,
                });
            }
        }, (err, msg) => {
            openError(msg);
        }).always(() => {
            this.setState({
                execLoading: false,
                buttonLoading: false
            });
        });
    };

    //导出sql数据
    clickExportSql = () => {
        let sql = this.getSql();
        if (!sql) {
            return;
        }
        confirm({
            title: '确认导出吗？',
            content: '此操作将导出该sql查询到的所有数据',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                window.location.href = 'http://' + url + '/exec?_mt=sql.exportSql&sql=' + sql;
            }
        });
    };

    //获取表结构信息
    getTableInfo = (e) => {
        this.tableColumn(e);
        this.tableIndex(e);
    };

    //表列名
    tableColumn = (e) => {
        this.setState({ columnLoading: true });
        reqwest({
            url: 'http://' + url + '/exec?_mt=sql.getColumn',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'table': e.key,
            },
            type: 'json',
        }).then((data) => {
            if (this.checkSuccess(data)) {
                this.setState({
                    columnData: data.result,
                    columnColumn: this.getColumn(data.result),
                });
            }
        }, (err, msg) => {
            openError(msg);
        }).always(() => {
            this.setState({ columnLoading: false });
        });
    };

    //表索引
    tableIndex = (e) => {
        this.setState({ indexLoading: true });
        reqwest({
            url: 'http://' + url + '/exec?_mt=sql.getIndex',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            data: {
                'table': e.key,
            },
            type: 'json',
        }).then((data) => {
            if (this.checkSuccess(data)) {
                this.setState({
                    indexData: data.result,
                    indexColumn: this.getColumn(data.result),
                });
            }
        }, (err, msg) => {
            openError(msg);
        }).always(() => {
            this.setState({ indexLoading: false });
        });
    };

    //执行sql后，数据的双击事件
    execOnRowDoubleClick = (row) => {
        return {
            onDoubleClick : () => {
                this.setState({
                    execTransposeVisible: true,
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
    execTransposeClose = () => {
        this.setState({
            execTransposeVisible: false,
        });
    };

    //翻页
    execTableChange = (pagination) => {
        const currentPagination = {...this.state.execPagination};
        currentPagination.current = pagination.current;
        this.setState({
            execPagination: currentPagination,
        });
        //TODO
        let sql = this.getSql();
        if (!sql) {
            return;
        }
        this.execSql({
            sql: sql,
            pageNo: pagination.current,
        });
    };

    render() {
        return (
            this.state.noLoginRedirect ? <Redirect to={{ pathname:"/login" }} /> :
            <div>
                <Layout>
                    <Sider width={'25%'} className="all-table-menu">
                        <Menu theme="dark" onClick={this.getTableInfo}>
                            {this.state.allTables}
                        </Menu>
                    </Sider>
                    <Layout width={'75%'} className="code-mirror-layout">
                        <Content>
                            <CodeMirror ref="editorSql" options={codemirrorOptions} />
                        </Content>
                        <Footer align="right">
                            <Button type="primary" loading={this.state.buttonLoading} onClick={this.clickExecSql} size={'large'}>
                                执行（CTRL+ENTER）
                            </Button>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Button type="primary" onClick={this.clickExportSql} size={'large'}>
                                导出
                            </Button>
                        </Footer>
                    </Layout>
                </Layout>
                <br/>
                <Layout>
                    <Tabs>
                        <TabPane tab="执行" key="exec">
                            <Content className="tabs-content">
                                <Table
                                    columns={this.state.execColumn}
                                    rowKey={record => record.id}
                                    dataSource={this.state.execData}
                                    pagination={this.state.execPagination}
                                    loading={this.state.execLoading}
                                    onChange={this.execTableChange}
                                    bordered
                                    onRow={this.execOnRowDoubleClick}
                                    scroll={{x : true}}
                                    size="middle"
                                />
                                <Modal
                                    title = '列块显示'
                                    visible={this.state.execTransposeVisible}
                                    onOk={this.execTransposeClose}
                                    onCancel={this.execTransposeClose}
                                    width = {'50%'}
                                    footer={
                                        <Button type="primary" onClick={this.execTransposeClose}>
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
                        <TabPane tab="表结构" key="column">
                            <Content className="tabs-content">
                                <Table
                                    columns={this.state.columnColumn}
                                    rowKey={record => record.列名}
                                    dataSource={this.state.columnData}
                                    loading={this.state.columnLoading}
                                    bordered
                                    scroll={{x : true}}
                                    size="middle"
                                />
                            </Content>
                        </TabPane>
                        <TabPane tab="表索引" key="index">
                            <Content className="tabs-content">
                                <Table
                                    columns={this.state.indexColumn}
                                    rowKey={record => record.索引名}
                                    dataSource={this.state.indexData}
                                    loading={this.state.indexLoading}
                                    bordered
                                    scroll={{x : true}}
                                    size="middle"
                                />
                            </Content>
                        </TabPane>
                        <TabPane tab="表数据" key="limit">
                            132
                        </TabPane>
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
