# 确认环境有无缺失

- 确保安装`Python`环境（版本须`>=3.7`， 建议`>=3.10`，不建议`>=3.12`（3.12也能用））
- 部分插件不支持3.10以下的python版本（例如`StarrailUID`），`GenshinUID`支持3.7版本

```shell
# 命令行内输入
python -V

# 以下为回复示例、无需输入
# 回复类似Python 3.10.10的信息，即为已经安装python环境
>>> Python 3.x.x
```

- 确保安装`git`环境

```shell
# 命令行内输入(注意v为小写)
git -v

# 以下为回复示例、无需输入
# 回复类似git version 2.38.1.windows.1的信息，即为已经安装Git环境
>>> git version xxxxx
```

- 确保安装`poetry`(版本须`>=1.4.0`)

```shell
# 命令行内输入
poetry -V

# 以下为回复示例、无需输入
# 回复类似Poetry (version 1.4.1)的信息，即为已经安装Poetry环境
>>> Poetry (version x.x.x)
```