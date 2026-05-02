# MCP 工具集成 <Badge type="tip" text="新功能" />

::: tip

MCP (Model Context Protocol) 工具集成允许你通过 WebConsole 前端自由添加、管理 MCP 服务器配置。

框架启动时自动连接 MCP 服务器并将工具注册为 AI 工具，使 AI 可以自由调用 MCP 工具并利用返回结果。

:::

## 概述

MCP 是一种开放协议，允许 AI 应用与外部数据源和工具进行标准化交互。GsCore 通过 MCP 集成，可以将任何 MCP 服务器提供的工具自动注册为 AI 工具，无需编写任何插件代码。

### 核心特性

- **零代码集成**：通过 WebConsole 前端配置即可接入 MCP 服务器
- **自动工具发现**：框架启动时自动连接 MCP 服务器，发现并注册所有可用工具
- **热重载支持**：运行时可通过 API 重新加载配置，无需重启服务
- **统一管理**：MCP 工具与其他 AI 工具统一管理，AI Agent 可自动发现和调用

## 快速开始

### 1. 通过 WebConsole 添加 MCP 服务器

打开 WebConsole，进入 MCP 配置页面，点击"添加"按钮，填写以下信息：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `str` | MCP 服务器显示名称，例如 `"MiniMax"` |
| `command` | `str` | 启动命令，例如 `"uvx"`、`"npx"`、`"python"` |
| `args` | `list[str]` | 命令参数列表，例如 `["minimax-coding-plan-mcp"]` |
| `env` | `dict[str, str]` | 环境变量字典，例如 `{"MINIMAX_API_KEY": "your_key"}` |
| `enabled` | `bool` | 是否启用 |

### 2. 配置文件格式

配置文件存储在 `data/ai_core/mcp_configs/{config_id}.json`：

```json
{
    "name": "MiniMax",
    "command": "uvx",
    "args": ["minimax-coding-plan-mcp"],
    "env": {"MINIMAX_API_KEY": "your_key"},
    "enabled": true
}
```

### 3. 启动流程

```
框架启动
    │
    ├── on_core_start 钩子 (priority=5)
    │       │
    │       └── register_all_mcp_tools()
    │               │
    │               ├── 从 mcp_config_manager 获取所有 enabled=true 的配置
    │               ├── 对每个配置创建 MCPClient 并调用 list_tools()
    │               ├── 为每个 MCP 工具动态创建包装函数
    │               └── 注册到 _TOOL_REGISTRY["mcp"]
    │
    └── AI Agent 通过 search_tools() 发现并调用 MCP 工具
```

## WebConsole API

MCP 配置提供完整的 RESTful API，支持通过 WebConsole 前端或 HTTP 请求管理。

### API 端点一览

| 方法 | 端点 | 功能 |
|------|------|------|
| `GET` | `/api/ai/mcp/list` | 获取所有 MCP 配置列表 |
| `GET` | `/api/ai/mcp/{config_id}` | 获取指定配置详情 |
| `POST` | `/api/ai/mcp` | 创建新 MCP 配置 |
| `PUT` | `/api/ai/mcp/{config_id}` | 更新 MCP 配置 |
| `DELETE` | `/api/ai/mcp/{config_id}` | 删除 MCP 配置 |
| `POST` | `/api/ai/mcp/{config_id}/toggle` | 切换启用/禁用状态 |
| `POST` | `/api/ai/mcp/reload` | 热重载所有配置并重新注册工具 |

### 创建配置

```http
POST /api/ai/mcp
Content-Type: application/json

{
    "name": "MiniMax",
    "command": "uvx",
    "args": ["minimax-coding-plan-mcp"],
    "env": {"MINIMAX_API_KEY": "your_key"},
    "enabled": true
}
```

### 热重载

```http
POST /api/ai/mcp/reload
```

调用后会重新加载所有 MCP 配置，断开旧连接并重新注册工具，无需重启服务。

## 工具分类与命名

### 分类

MCP 工具注册到 `_TOOL_REGISTRY["mcp"]` 分类，与其他分类的关系：

| 分类名 | 说明 | 谁可以调用 |
|--------|------|-----------|
| `"self"` | 核心自我操作工具 | 主Agent |
| `"buildin"` | 内置工具 | 主Agent |
| `"common"` | 通用工具 | 主Agent |
| `"default"` | 子Agent工具 | 子Agent |
| **`"mcp"`** | **MCP 外部工具，启动时自动注册** | **主Agent（按需加载）** |

### 命名规则

MCP 工具注册时使用 `mcp_{server_name}_{tool_name}` 格式，避免不同 MCP 服务器之间的工具名冲突。

例如，名为 `MiniMax` 的服务器提供的 `search` 工具，注册名为 `mcp_MiniMax_search`。

## 架构设计

### 数据流

```
用户 (WebConsole 前端)
    │
    │  RESTful API (CRUD + 热重载)
    ▼
┌─────────────────────────────────────────┐
│  webconsole/mcp_config_api.py           │
│  (FastAPI RESTful API)                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ai_core/mcp/config_manager.py          │
│  MCPConfigManager (JSON 文件存储)        │
│  data/ai_core/mcp_configs/*.json        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ai_core/mcp/startup.py                 │
│  register_all_mcp_tools()               │
│  ├── MCPClient.list_tools()             │
│  ├── 动态创建包装函数                     │
│  └── 注册到 _TOOL_REGISTRY["mcp"]       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ai_core/register.py                    │
│  _TOOL_REGISTRY["mcp"]                  │
│  (MCP 工具与其他工具统一管理)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ai_core/gs_agent.py                    │
│  AI Agent 通过 search_tools() 发现      │
│  并调用 MCP 工具                         │
└─────────────────────────────────────────┘
```

### 设计决策

| 决策 | 说明 |
|------|------|
| JSON 文件存储 | 与 OpenAI 配置管理器模式一致，简单直观，便于手动编辑和备份 |
| 动态函数生成 | 根据 `input_schema` 生成正确的类型注解和函数签名，确保 PydanticAI 能正确生成 JSON Schema 给 LLM |
| 无状态 MCP 客户端 | 每次工具调用时建立连接、执行操作、断开连接，避免长连接管理的复杂性 |
| 热重载支持 | 通过 API 可在运行时重新加载配置，无需重启服务 |
| 工具名冲突避免 | 使用 `mcp_{server_name}_{tool_name}` 格式命名 |

## 常见 MCP 服务器示例

### MiniMax

```json
{
    "name": "MiniMax",
    "command": "uvx",
    "args": ["minimax-coding-plan-mcp"],
    "env": {"MINIMAX_API_KEY": "your_api_key_here"},
    "enabled": true
}
```

### 文件系统 MCP

```json
{
    "name": "FileSystem",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"],
    "env": {},
    "enabled": true
}
```

### 自定义 Python MCP

```json
{
    "name": "MyCustomMCP",
    "command": "python",
    "args": ["-m", "my_mcp_server"],
    "env": {"API_KEY": "your_key"},
    "enabled": true
}
```

## 相关文档

- [AI 插件编写简介](./ai_core_api_for_plugins) — 完整的 AI API 文档
- [AI 功能概述](/AIFeatures/) — AI Core 系统整体介绍
- [内置工具](./BuiltinTools) — GsCore 内置的 AI 工具
