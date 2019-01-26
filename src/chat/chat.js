import React from 'react';
import { Avatar, Icon, Card, Input, Layout, Menu, Badge } from 'antd';
import reqwest from 'reqwest';
import RenderContent from './RenderContent';
import './chat.css';
import {openErrorNotify, openSuccessNotify} from "../global";
import {url} from "../config";

const { TextArea } = Input;

const { Sider } = Layout;

class ChatPage extends React.Component {
    state = {
        deleteBtnSpin: false,
        loading: true,
        nowLength: 0,
        textarea: '',
        textareaDisable: false,
        list: [
            {
                time: '2018-11-12 15:35:15',
                avatar:
                    'https://sx-stag.oss-cn-shenzhen.aliyuncs.com/user-avatar/3_avatar.jpg?x-oss-process=image/resize,m_fixed,w_90,h_90/quality,q_90',
                nickname: '用户甲',
                pos: 1,
                voice:
                    'https://sx-stag.oss-cn-shenzhen.aliyuncs.com/user-chat/3_508340417_c84f79407f5bc16b9e7ee0373631cf35.aac',
                text: '',
            },
            {
                time: '2018-11-12 15:37:15',
                avatar:
                    'https://sx-stag.oss-cn-shenzhen.aliyuncs.com/user-avatar/3_avatar.jpg?x-oss-process=image/resize,m_fixed,w_90,h_90/quality,q_90',
                nickname: '卡布奇诺',
                pos: 2,
                voice: '',
                text:
                    '该词语多用于讽刺和揶揄调侃。也有送快递、查水电气、社区送温暖等引申说法。例如：（1）有人在网络上发表了不合乎相关法律法规或者破坏社会稳定和谐等消息而被警方捕；（2）在贴吧或论坛里拥有删帖权限的大小吧主，检查贴吧里是否存在灌水的帖子或跟帖，遇到就进行删除的行为。',
            }
        ],
    };

    componentDidMount() {
        document.addEventListener("keydown", this.ctrlEnter);
        this.refs.textarea.focus();
        let socket = new WebSocket("ws://localhost:8080/webSocket");
        //打开事件
        socket.onopen = function() {
            console.log("Socket 已打开");
            //socket.send("这是来自客户端的消息" + location.href + new Date());
        };
        //获得消息事件
        socket.onmessage = (msg) => {
            console.log(msg.data);
            let addList = [...this.state.list];
            addList.push(
                {
                    time: '',
                    avatar:
                        'https://sx-stag.oss-cn-shenzhen.aliyuncs.com/user-avatar/3_avatar.jpg?x-oss-process=image/resize,m_fixed,w_90,h_90/quality,q_90',
                    nickname: '卡布奇诺',
                    pos: 1,
                    voice: '',
                    text: msg.data,
                }
            );
            this.setState({ list: addList });
            this.refs.msg_end.scrollIntoView();
        };
        //关闭事件
        socket.onclose = function() {
            console.log("Socket已关闭");
        };
        //发生了错误事件
        socket.onerror = function() {
            alert("Socket发生了错误");
        };
    }

    ctrlEnter = (e) => {
        if (e.ctrlKey && e.keyCode === 13) {
            if (this.state.textarea.trim() === '') {
                openErrorNotify('填写东西');
                return;
            }
            this.setState({ textareaDisable: true });
            reqwest({
                url: 'http://' + url + '/exec?_mt=chat.test',
                method: 'post',
                crossOrigin: true,
                withCredentials: true,
                data: {
                    "abc": this.state.textarea
                },
                type: 'json'
            }).then((data) => {
                if (data.code === global.respCode.noLogin) {
                    this.setState({ noLoginRedirect: true });
                } else if (data.code !== global.respCode.success) {
                    openErrorNotify(data.msg);
                } else {
                    this.setState({
                        textarea: '',
                        nowLength: 0
                    });
                }
            }, (err, msg) => {
                openErrorNotify(msg);
            }).always(() => {
                this.setState({
                    textareaDisable: false
                });
                this.refs.textarea.focus();
            });
        }
    };

    changeTextArea = (e) => {
        let value = e.target.value;
        this.setState({
            textarea: value,
            nowLength: value.length
        });
    };

    render() {
        const { list } = this.state;
        // 渲染组件的前置条件
        const isRender = list && list.length > 0;
        return (
            <div>
                <Layout>
                    <Sider width={'20%'} style={{background: 'transparent'}}>
                        <Card
                            title="好友列表"
                            extra={<a href="#">上线</a>}
                            bodyStyle={{padding: 10}}
                            size="small"
                        >
                            <div style={{ height: '64vh', overflow: 'scroll'}}>
                                <Menu mode="inline">
                                    <Menu.Item key="3"><Badge dot offset={[-8,0]}><Icon type="user" /></Badge><span>好友122</span></Menu.Item>
                                    <Menu.Item key="4"><Badge dot offset={[-8,0]}><Icon type="user" /></Badge><span>好友211111111111111</span></Menu.Item>
                                    <Menu.Item key="41" style={{color: 'lightgrey'}}><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="42"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="43"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="44"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="45"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="46"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="416"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="426"><Icon type="user" /><span>好友21</span></Menu.Item>
                                </Menu>
                            </div>
                        </Card>
                    </Sider>
                    <Layout width={'50%'} style={{paddingLeft: '1%'}}>
                        <Card
                            title="聊天内容"
                            bodyStyle={{padding: 10}}
                            size="small"
                        >
                            <div style={{ height: '64vh', overflow: 'scroll'}}>
                                <ul className='list-wrapper'>
                                    {isRender &&
                                    list.map((item, listIndex) => {
                                        return (
                                            <li className='list-item' key={listIndex}>
                                                {item.time ? <span className='time'>{item.time}</span> : undefined}
                                                <div
                                                    className={
                                                        item.pos === 1
                                                            ? 'list-item-horizontal'
                                                            : 'list-item-horizontal-reverse'
                                                    }
                                                >
                                                    <Avatar
                                                        shape="square"
                                                        src={
                                                            item.avatar
                                                                ? item.avatar
                                                                : 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
                                                        }
                                                    />
                                                    <div
                                                        className={item.pos === 1 ? 'content-wrapper-flex' : 'content-wrapper'}
                                                    >
                                                        <p className={item.pos === 1 ? 'nickname' : 'nickname-right'}>
                                                            {item.nickname ? item.nickname : '用户昵称占位符'}
                                                        </p>
                                                        <div className={'content'}>
                                                            <RenderContent {...item} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div id="msg_end" ref="msg_end" style={{height:'0px', overflow:'hidden'}}/>
                            </div>
                        </Card>
                    </Layout>
                    <Sider width={'30%'} style={{paddingLeft: '1%', background: 'transparent'}}>
                        <Card
                            title={"回复内容（最多可输入 " + this.state.nowLength + "/2000 个字符）"}
                            extra={<a href="#">回复</a>}
                            size="small"
                            actions={[<Icon type="picture" />, <Icon type="sound" />, <Icon type="upload" />]}
                        >
                            <TextArea ref="textarea" onChange={this.changeTextArea} placeholder="请输入回复内容" disabled={this.state.textareaDisable}
                                      value={this.state.textarea} autosize={{ minRows: 3, maxRows: 15 }} maxLength={2000} />
                        </Card>
                        <div>

                        </div>
                    </Sider>
                </Layout>
            </div>
        );
    }
}

export default ChatPage;
