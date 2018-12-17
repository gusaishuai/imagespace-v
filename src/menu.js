import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import './menu.css'
import Sql from './sql/sql.js';

const { Header, Sider, Content } = Layout;

class Menu1 extends React.Component {
    state = {
        collapsed: false,

        pathName: 'sql',
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    menuClick = (e) => {
        this.setState({ pathName: e.key });
    };

    render() {
        return (
            <Layout style={{height: '100vh'}}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                    style={{overflow: 'auto'}}
                >
                    <div style={{padding: '10%', color: "white"}} align="center">MENU</div>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['sql']} onClick={this.menuClick}>
                        <Menu.Item key="sql">
                            <Icon type="user" />
                            <span>sql执行</span>
                        </Menu.Item>
                        <Menu.Item key="login">
                            <Icon type="video-camera" />
                            <span>nav 2</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <Icon className="trigger"
                              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                              align="left"
                              onClick={this.toggle} />
                    </Header>
                    <Content style={{ margin: '16px 16px' }} >
                        <Sql/>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default Menu1;