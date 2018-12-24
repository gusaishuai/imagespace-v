import React from 'react';
import {Button, message, Upload, Steps, Icon, Divider} from 'antd';
import reqwest from 'reqwest';

import {url} from "../config";
import "./excel.css";

const Step = Steps.Step;

class ExcelPage extends React.Component {
    state = {
        fileList: [],
        uploading: false
    };

    handleUpload = () => {
        const formData = new FormData();
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
            data: formData,
        }).then((data) => {
            if (data.code === global.respCode.noLogin) {
                this.setState({ noLoginRedirect: true });
            } else if (data.code !== global.respCode.success) {
                message.error('上传失败：' + data.msg);
            } else {
                this.setState({ fileList: [] });
                message.success('上传成功');
            }
        }, (err, msg) => {
            message.error('上传失败：' + msg);
        }).always(() => {
            this.setState({ uploading: false });
        });
    };

    render() {
        const { uploading, fileList } = this.state;
        const props = {
            accept: '.xls,.xlsx',
            onRemove: (file) => {
                this.setState((state) => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: (file) => {
                this.setState(state => ({
                    fileList: [...state.fileList, file],
                }));
                return false;
            },
            fileList
        };

        return (
            <div>
                <Divider>上传EXCEL</Divider>
                <div>
                <Upload {...props}>
                    <Button icon={'upload'}>选择文件</Button>
                </Upload>
                <Button
                    type="primary"
                    onClick={this.handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    style={{ marginTop: '1%' }}
                >
                    {uploading ? '上传中' : '开始上传' }
                </Button>
                    </div>
                <Divider>选择校验逻辑</Divider>
            </div>
        );
    }
}


export default ExcelPage;