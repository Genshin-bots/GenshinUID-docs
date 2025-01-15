# 确认环境有无缺失<Badge type="tip" text="简单" />

- ✅确保安装`Python`环境（版本须`>3.8`， 建议`>=3.12`，不建议`>=3.13`）

::: details 检查Python

```shell
# 【命令行内输入】
python -V

# 【以下为回复示例、无需输入】
# 回复类似Python 3.10.10的信息，即为已经安装python环境
>>> Python 3.x.x
```
::: 

- ✅确保安装`git`环境

::: details 检查Git

::: tip

如果你没有安装`git`且的系统是`ubuntu`，安装`git`只需要输入`sudo apt-get install git`

如果系统为`Windows`，则自行前往 🔗[官网](https://git-scm.com/) 下载安装包安装即可

---

```shell
# 【命令行内输入】(注意v为小写)
git -v

# 【以下为回复示例、无需输入】
# 回复类似git version 2.38.1.windows.1的信息，即为已经安装Git环境
>>> git version xxxxx
```
::: 

- ✅确保安装`poetry`(版本须`>=1.4.0`)**或者**`pdm`**或者**`uv`（建议使用`uv`）
  - `poetry`、`uv`和`pdm`**【三选一即可】**

::: details 检查PDM
```shell
# 【PDM】
# 命令行内输入
pdm -V

# 以下为回复示例、无需输入
# 回复类似PDM (PDM, version 2.10.4)的信息，即为已经安装PDM环境
>>> PDM, version x.x.x
```
:::

::: details 检查Poetry
```shell
# 【Poetry】
# 命令行内输入
poetry -V

# 以下为回复示例、无需输入
# 回复类似Poetry (version 1.4.1)的信息，即为已经安装Poetry环境
>>> Poetry (version x.x.x)
```
:::

::: details 检查uv
```shell
# 【uv】
# 命令行内输入
uv -V

# 以下为回复示例、无需输入
# 回复类似`uv 0.5.18`的信息，即为已经安装uv环境
>>> uv 0.5.18 (27d1bad55 2025-01-11)
```
:::

::: tip

如果你没有安装`poetry`，只需要输入`pip install poetry`即可安装

如果你没有安装`uv`, 只需要输入`pip install uv`即可安装（**更推荐使用**`pipx`）

如果你没有安装`pdm`, 则更加复杂一点, 必须使用`pipx`管理`pdm`环境
`pipx install pdm`

:::