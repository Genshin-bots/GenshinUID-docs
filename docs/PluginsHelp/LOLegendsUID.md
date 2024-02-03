# LOLegendsUID命令列表

::: warning

该文档可能更新不及时，请以插件实际功能为主

:::

## 丨功能

<details><summary>绑定切换删除UID - 命令:lol绑定UID、lol删除UID、lol切换UID</summary><p>
还没有图
</p></details>

<details><summary>搜索用户 - 命令: lol搜索</summary><p>
还没有图
</p></details>

<details><summary>查询基本信息 - 命令: lol查询</summary><p>
<a><img src="https://s11.ax1x.com/2024/01/30/pFujpA1.jpg"></a>
</p></details>

<details><summary>添加CK（私聊） - 命令: lol添加ck</summary><p>
还没有图
</p></details>

## 丨使用方式
1. 安装插件
2. 使用**小号**打开**Wegame**
3. 打开Fiddler，抓取任意一个数据请求的Cookie内容
   1. Cookie内容大致以`pgv_pvid=`开头，以`index.html`结尾

4. 私聊Bot，发送`lol添加ck` ，并在**命令后面直接**附上你第三步获取到的Cookie
   1. `lol添加ckpgv_pvid=....`

5. 可以正常使用Bot了！
   1. 假设我的ID叫`Wuyi无疑`
   2. 首先发送`lol搜索Wuyi无疑`
   3. Bot将会回复带有UID的信息
   4. 再发送`lol绑定uid`+你刚刚获取到的**完整UID**
      1. 例如`lol绑定uidRP68HxHor1oVPfjb5pyf1Q==:1`

   5. 可以进行查询，使用`lol查询`进行查询即可

