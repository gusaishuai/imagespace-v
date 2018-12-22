import React from 'react';
import {Icon, message, Upload} from 'antd';

import {url} from '../config.js';
import reqwest from "reqwest";

const Dragger = Upload.Dragger;

class ExcelPage extends React.Component {

    state = {
        fileList: [],
    };

    handleChange = (info) => {
        let fileList = info.fileList.slice(-1);
        this.setState({ fileList });

        const formData = new FormData();
        fileList.forEach((file) => {   // fileList 是要上传的文件数组
            formData.append('files[]', file);
        });
        reqwest({
            url: 'http://' + url + '/exec?_mt=excel.uploadExcel',
            method: 'post',
            crossOrigin: true,
            withCredentials: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            type: 'json',
            body: formData
        }).then((data) => {
            alert(JSON.stringify(data));
        });

        const status = info.file.status;
        if (status === 'done') {
            message.success(`${info.file.name} 上传成功`);
        } else if (status === 'error') {
            message.error(`${info.file.name} 上传失败`);
        }
    };

    render() {

        const props = {
            name: 'file',
            accept: '.xls,.xlsx',
            multiple: false,
            // action: 'http://' + url + '/exec?_mt=excel.uploadExcel',
            // headers: {
            //     'Access-Control-Allow-Origin': '*',
            //     'Access-Control-Allow-Credentials': 'true',
            //     'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            // },
            onChange: this.handleChange
        };

        return (
            <Dragger {...props} fileList={this.state.fileList}>
                <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">点击或拖动EXCEL到此区域进行上传</p>
                <p className="ant-upload-hint">每次单个文件上传，第二次上传会把第一次上传的文件覆盖</p>
            </Dragger>
        );
    }
}

export default ExcelPage;