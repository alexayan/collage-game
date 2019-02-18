## 简介

小程序版拼贴游戏

## 组件参数

参数名| 类型 | 默认值 |描述
------------- | ------------- | ------------- | -------------
animationTime  | Number | 100 | 方块运动时间
meta | Object | null| 版拼板配置

### meta 参数

key| 类型 | 默认值 |描述
------------- | ------------- | ------------- | -------------
image | String || 图片背景
width | Number | 300 | 版拼板宽度
height| Number | 300 | 版拼板高度
line | Number | 4 | 定义行数
column | Number | 4 |定义列数
padding | Number | 0 | 方块间距

## 组件事件

`collagesuccess` : 拼贴完成触发

## 组件函数

`shuffle()`: 打乱拼图

`stopShuffle()`: 停止打乱拼图

`reset()`: 重置拼图

## Demo

![demo](demo.gif)
