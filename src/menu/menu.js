import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import './menu.css'
import SqlPage from '../sql/sql.js';
import ExcelPage from "../excel/excel.js";

const { Header, Sider, Content } = Layout;

class MenuPage extends React.Component {

    state = {
        collapsed: false,

        childPage: <SqlPage/>,
        map: {
            "sql": <SqlPage/>,
            "excel": <ExcelPage/>,
        },
    };

    componentDidMount() {
        this.getMenuList();
    }

    getMenuList = () => {
    };

    menuCollapse = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };

    menuClick = (e) => {
        this.setState({ childPage: this.state.map[e.key] });
    };

    render() {
        return (
            <Layout style={{height: '100vh'}}>
                <Sider trigger={null}
                       collapsible
                       collapsed={this.state.collapsed}
                       style={{overflow: 'auto'}}
                >
                    <Icon className="menu-icon"
                          type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                          onClick={this.menuCollapse} />
                    <Menu theme="dark" defaultSelectedKeys={['sql']} onClick={this.menuClick}>
                        <Menu.Item key="sql">
                            <Icon type="select" />
                            <span>sql执行</span>
                        </Menu.Item>
                        <Menu.Item key="excel">
                            <Icon type="file-excel" />
                            <span>excel操作</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header className="menu-header">
                        GSS的想象空间
                    </Header>
                    <Content style={{ margin: '1% 1%' }} >
                        {this.state.childPage}
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default MenuPage;