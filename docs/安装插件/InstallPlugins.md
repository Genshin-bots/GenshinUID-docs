# 为GsCore安装插件<Badge type="tip" text="简单" />

::: tip

本文默认装插件时你**没有**安装任何插件，即你**没有**执行[安装GsCore](../快速开始/InstallCore)一节中的最后一步。

即使是安装了也没有关系，只需要把安装的插件名字换成其他，依旧是一样的。

:::

### 命令安装<Badge type="tip" text="简单" />

已经启动Bot、GsCore，则只需要确保自己有`master`权限。

<ChatPanel title="聊天界面">
<ChatMessage nickname="Wuyi无疑">core安装插件GenshinUID</ChatMessage>
<ChatMessage nickname="GsCore">🚀 开始安装...请稍等一段时间...</ChatMessage>
<ChatMessage nickname="GsCore">🎉 安装成功！请发送`gs重启`或`core重启`以应用插件！.</ChatMessage>
</ChatPanel>

### 手动安装<Badge type="warning" text="普通" />

```sh
cd gsuid_core
cd plugins

# 本文以安装GenshinUID / StarRailUID插件为范例

# 安装v4 GenshinUID
git clone -b v4 https://ghproxy.com/https://github.com/KimigaiiWuyi/GenshinUID.git --depth=1 --single-branch

# 安装StarRailUID
git clone https://github.com/qwerdvd/StarRailUID.git --depth=1 --single-branch

# 返回主目录
cd ../

# 启动Bot（如此时GsCore正在运行，请先使用Ctrl+C快捷键关闭GsCore，无需重启Bot（如NoneBot2））
poetry run core
```