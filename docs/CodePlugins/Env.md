# VsCode配置 <Badge type="tip" text="简单" />

为了能够获得一致的开发体验，**建议**进行如下配置

- 补全GsCore函数的代码提示, 请在`python.autoComplete.extraPaths`和`python.analysis.extraPaths`位置填入合适的路径

- GsCore目前使用`black`进行格式化代码
- GsCore目前使用`isort`进行自动排序导入库
- GsCore目前使用`autoDocstring`插件进行自动文档生成
- 其他项可参考`.pre-commit-config.yaml`文件，插件开发也可加入`pre-commit`代码检查

> 以下为一份VsCode的`settings.json`配置，仅供参考

```json
{
  "python.languageServer": "Pylance",
  "python.analysis.typeCheckingMode": "basic",
  "cSpell.words": [
    "enka",
    "genshin",
    "genshinuid"
  ],
  "editor.formatOnSave": true,
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  },
  "python.autoComplete.extraPaths": [
    "${workspaceFolder}/../../../../"
  ],
  "isort.args": [
    "--profile",
    "black"
  ],
  "python.formatting.provider": "black",
  "python.linting.flake8Enabled": true,
  "python.linting.flake8CategorySeverity.W": "Warning",
  "python.linting.flake8CategorySeverity.F": "Warning",
  "python.linting.flake8CategorySeverity.E": "Warning",
  "python.analysis.extraPaths": [
    "${workspaceFolder}/../../../../"
  ]
}
```

>  GsCore还提供了一份`gscore.mustache`模板文件
>
> 需要在配置项`Auto Docstring: Custom Template Path`修改模板文件的路径
