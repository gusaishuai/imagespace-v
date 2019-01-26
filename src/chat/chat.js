import React, { PureComponent, lazy, Suspense } from 'react';
import { Avatar, Icon, Popover, Card, Input, Layout, Menu } from 'antd';
import './chat.css';

// lodash 深比较
import isEqual from 'lodash/isEqual';

const { TextArea } = Input;

const { Footer, Sider, Content } = Layout;

// 渲染不同内容的组件
const LazyComponent = lazy(() => import('./RenderContent'));

export default class ChatPage extends PureComponent {
    state = {
        deleteBtnSpin: false,
        loading: true,
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
                time: '2018-11-12 15:36:15',
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
            },
            {
                time: '2018-11-12 15:38:15',
                avatar:
                    'https://sx-stag.oss-cn-shenzhen.aliyuncs.com/user-avatar/3_avatar.jpg?x-oss-process=image/resize,m_fixed,w_90,h_90/quality,q_90',
                nickname: '卡布奇诺',
                pos: 2,
                voice: '',
                img:
                    'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3040115650,4147729993&fm=26&gp=0.jpg',
                text:
                    '该词语多用于讽刺和揶揄调侃。也有送快递、查水电气、社区送温暖等引申说法。例如：（1）有人在网络上发表了不合乎相关法律法规或者破坏社会稳定和谐等消息而被警方捕；（2）在贴吧或论坛里拥有删帖权限的大小吧主，检查贴吧里是否存在灌水的帖子或跟帖，遇到就进行删除的行为。',
            },
            {
                time: '2018-11-12 15:39:15',
                avatar:
                    'https://sx-stag.oss-cn-shenzhen.aliyuncs.com/user-avatar/3_avatar.jpg?x-oss-process=image/resize,m_fixed,w_90,h_90/quality,q_90',
                nickname: '卡布奇诺',
                pos: 2,
                voice: '',
                img:
                    'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3040115650,4147729993&fm=26&gp=0.jpg',
            },
        ],
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        const { data } = nextProps;

        // 若是props和缓存state一致,则不更新state
        if (isEqual(prevState.prevData, nextProps.data)) {
            return null;
        }
        // 若是没有传入props也是
        if (!data || !Array.isArray(data) || data.length <= 0) {
            return null;
        }
        return {
            list: data,
            prevData: nextProps.data,
        };
    }

    // 唤醒子组件的回调过程
    wakeUpLazyComponent = () => {
        return <div>loading.....</div>;
    };

    // 悬浮条目显示删除按钮
    showOperatBtn = index => {
        let tmpList = [...this.state.list];
        tmpList = tmpList.map((item, innerIndex) => {
            if (index === innerIndex) {
                item.operatBtn = true;
            } else {
                item.operatBtn = false;
            }
            return item;
        });
        this.setState({ list: tmpList });
    };

    // 关闭操作按钮
    hideOperatBtn = index => {
        let tmpList = [...this.state.list];
        tmpList = tmpList.map((item, innerIndex) => {
            item.operatBtn = false;
            return item;
        });
        this.setState({ list: tmpList });
    };

    // 删除这条回复
    deleteCurrentReplay = (index, itemInfo) => {
        let tmpList = [...this.state.list];
        tmpList.splice(index, 1);
        this.setState({ list: tmpList });
        // 给父的回调,把该item的所有信息返回,外部再去执行接口操作什么的
        if (this.props.deleteItem) {
            this.props.deleteItem(itemInfo);
        }
    };

    render() {
        const { list, deleteBtnSpin } = this.state;
        // 是否显示操作区域
        const { operate } = this.props;
        // 渲染组件的前置条件
        const isRender = list && list.length > 0;
        return (
            <div>
                <Layout>
                    <Sider width={'20%'}>
                        <Card
                            title="好友列表"
                            extra={<a href="#">我要上线</a>}
                            bodyStyle={{padding: 10}}
                            size="small"
                        >
                            <div style={{ height: '64vh', overflow: 'scroll'}}>
                                <Menu mode="inline">
                                    <Menu.Item key="3"><Icon type="user" /><span>好友1</span></Menu.Item>
                                    <Menu.Item key="4"><Icon type="user" /><span>好友211111111111111</span></Menu.Item>
                                    <Menu.Item key="41"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="42"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="43"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="44"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="45"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="46"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="416"><Icon type="user" /><span>好友2</span></Menu.Item>
                                    <Menu.Item key="426"><Icon type="user" /><span>好友2</span></Menu.Item>
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
                            <div  style={{ height: '64vh', overflow: 'scroll'}}>
                            <ul className='list-wrapper'>
                                {isRender &&
                                list.map((item, listIndex) => {
                                    return (
                                        <Suspense fallback={this.wakeUpLazyComponent()} key={listIndex}>
                                            <li
                                                className='list-item'
                                                onMouseOver={() => this.showOperatBtn(listIndex)}
                                                onMouseLeave={() => this.hideOperatBtn(listIndex)}
                                            >
                                                <span className='time'>{item.time ? item.time : '时间占位符'}</span>
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
                                                            <LazyComponent {...item} />
                                                        </div>
                                                    </div>
                                                    {!!operate && item.operatBtn ? (
                                                        <Popover
                                                            content={'此操作会删除该记录'}
                                                            title="谨慎操作!"
                                                            onMouseEnter={() => {
                                                                this.setState({ deleteBtnSpin: true });
                                                            }}
                                                            onMouseLeave={() => {
                                                                this.setState({ deleteBtnSpin: false });
                                                            }}
                                                        >
                                                            <Icon
                                                                type="delete"
                                                                spin={deleteBtnSpin}
                                                                style={{
                                                                    fontSize: 24,
                                                                    alignSelf: 'flex-end',
                                                                    color: `${this.state.deleteBtnSpin ? '#ec1414' : '#1890ff'}`,
                                                                }}
                                                                onClick={() => this.deleteCurrentReplay(listIndex, item)}
                                                            />
                                                        </Popover>
                                                    ) : null}
                                                </div>
                                            </li>
                                        </Suspense>
                                    );
                                })}
                            </ul>
                            </div>
                        </Card>
                    </Layout>
                    <Layout width={'30%'} style={{paddingLeft: '1%'}}>
                        <Card
                            title="回复内容"
                            extra={<a href="#">回复</a>}
                            size="small"
                            actions={[<Icon type="picture" />, <Icon type="sound" />, <Icon type="upload" />]}
                        >
                            <TextArea placeholder="请输入回复内容" autosize={{ minRows: 3, maxRows: 15 }} />
                        </Card>
                    </Layout>
                </Layout>
            </div>
        );
    }
}


