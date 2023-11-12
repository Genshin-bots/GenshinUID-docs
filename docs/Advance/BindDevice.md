# 绑定账号<Badge type="tip" text="简单" />

::: tip

基于米游社的插件例如`GenshinUID`或`StarRailUID`大部分功能均需要绑定Cookie

以下为简易向Bot绑定账号数据的教程

::: 

## 一、绑定UID<Badge type="tip" text="简单" />

向机器人发送`绑定uid`即可完成绑定

> 注意此为绑定原神uid, 如绑定星铁uid则发送`sr绑定uid`

<ChatPanel title="绑定UID">
<ChatMessage nickname="Wuyi无疑">绑定uid100740568</ChatMessage>
<ChatMessage nickname="GsCore">绑定UID100740568成功！</ChatMessage>
<ChatMessage nickname="Wuyi无疑">sr绑定uid100740568</ChatMessage>
<ChatMessage nickname="GsCore">sr绑定UID100740568成功！</ChatMessage>
</ChatPanel>

## 二、绑定Cookie<Badge type="tip" text="简单" />

向机器人发送`扫码登陆`，按照提示打开手机米游社，进行扫码确认，即可完成绑定

> 注意本身支持**私聊**`添加`后接完整Cookie格式绑定
>
> 不过该绑定方式需要用户已经持有完整CK的前提下
>
> 建议普通用户使用`扫码登陆`完成绑定

<ChatPanel title="扫码登陆">
<ChatMessage nickname="Wuyi无疑">扫码登陆</ChatMessage>
<ChatMessage nickname="GsCore">(图片)#一张二维码#</ChatMessage>
<ChatMessage nickname="GsCore">(图片)#绑定成功!!#</ChatMessage>
</ChatPanel>

完成这两步之后，绑定即可成功完成。

## 三、绑定设备<Badge type="warning" text="实验" />

::: warning

 ⚠ ⚠**该方法可能存在一定风险** ⚠ ⚠

为了应对近期频繁出现的`1034`、`5003`、`-999`（实际上也是`1034`）错误，现有一种实验性方法

GsCore提供一种绑定设备的方法，以**尽可能**的减少`1034`的出现（甚至完全不出现）

该方法**确实有效**，但，**仍旧需要一定时间**和数量的样本进行观测

**该方法仅限安卓**（苹果可以通过抓包直接构建fp的方式传入，具体在下面）

::: 

- 使用**常用米游社**手机下载[该项目](https://github.com/forchannot/get_device_info)Action中编译的APK，并安装
- 打开后点击按钮复制
- **私聊**Bot`mys设备登录`+粘贴你刚刚复制的内容
- 发送，完成绑定

> 以下示例中的信息已被隐藏，实际复制的内容是一个很长的字典

<ChatPanel title="绑定设备(私聊)">
<ChatMessage nickname="Wuyi无疑">mys设备登录{"oaid":"DD8ice......K110"}</ChatMessage>
<ChatMessage nickname="GsCore">设备绑定成功!</ChatMessage>
</ChatPanel>

::: tip
**`mys设备登录`现在支持直接传入fp**`

抓包之后构建一个带有`fp`和`device_id`的字典（如果可能的话可以携带`device_info`），传入即可

::: 

> 以下示例中的信息已被隐藏，实际内容并非如此

<ChatPanel title="绑定设备(私聊)">
<ChatMessage nickname="Wuyi无疑">mys设备登录{"fp":"38fff985f","device_id":"1234-5678-9999999-wcdd"}</ChatMessage>
<ChatMessage nickname="GsCore">设备绑定成功!</ChatMessage>
</ChatPanel>