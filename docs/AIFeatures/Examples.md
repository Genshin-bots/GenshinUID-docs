# 完整示例

::: tip

本章提供 6 个完整的开发示例，从简单到复杂，手把手教你实现各种 AI 功能。

**适合场景**：

- 🔰 刚开始学习，想要"抄作业"快速上手
- 🔐 需要实现权限控制（管理员/VIP 功能）
- 🌐 想创建翻译、代码审查等专用 Agent
- 💝 需要实现好感度系统
- 💬 想实现多轮对话记忆功能

**生动比喻**：本章就像是 AI 开发的"菜谱大全"。每个示例都是一道完整的"菜"，有食材清单（导入）、烹饪步骤（代码）、成品展示（效果）。跟着做，你也能做出美味的 AI 功能！
:::

本文档提供 GsCore AI Core 的完整开发示例，帮助插件开发者快速上手。

## 示例一：注册工具并使用 check_func

### 场景

创建一个带权限校验的管理员查询工具。

### 完整代码

```python
from pydantic_ai import RunContext
from gsuid_core.ai_core.register import ai_tools, ai_entity
from gsuid_core.ai_core.models import ToolContext, KnowledgePoint, Event

# ==================== 权限校验函数 ====================

async def check_admin(ev: Event) -> tuple[bool, str]:
    """仅允许管理员使用此工具"""
    admin_ids = ["123456", "789012"]  # 管理员ID列表
    if ev.user_id in admin_ids:
        return True, ""
    return False, "仅管理员可用"

async def check_vip(ev: Event) -> tuple[bool, str]:
    """仅允许VIP用户使用此工具"""
    # 这里可以查询数据库判断用户是否为VIP
    vip_users = ["111111", "222222"]
    if ev.user_id in vip_users:
        return True, ""
    return False, "仅VIP用户可用"

# ==================== 工具注册 ====================

@ai_tools(check_func=check_admin)
async def admin_query(
    ctx: RunContext[ToolContext],
    uid: str,
) -> str:
    """
    管理员查询接口 - 仅管理员可用

    Args:
        uid: 要查询的用户ID
    """
    # 执行管理员级别的查询
    return f"管理员查询了用户 {uid} 的敏感信息"

@ai_tools(check_func=check_vip)
async def vip_feature(
    ctx: RunContext[ToolContext],
    feature_name: str,
) -> str:
    """
    VIP专属功能 - 仅VIP用户可用

    Args:
        feature_name: 要使用的功能名称
    """
    return f"VIP用户使用了功能: {feature_name}"

# ==================== 无需权限的工具 ====================

@ai_tools()
async def simple_calc(
    a: int,
    b: int,
    operation: str = "add",
) -> str:
    """
    简单计算器 - 所有用户可用

    Args:
        a: 第一个数
        b: 第二个数
        operation: 操作类型，add/sub/mul/div
    """
    if operation == "add":
        return str(a + b)
    elif operation == "sub":
        return str(a - b)
    elif operation == "mul":
        return str(a * b)
    elif operation == "div":
        if b == 0:
            return "错误：除数不能为0"
        return str(a / b)
    return "未知操作"

@ai_tools()
async def get_current_time() -> str:
    """获取当前时间 - 所有用户可用"""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# ==================== 知识库注册 ====================

ai_entity(KnowledgePoint(
    id="plugin_help_001",
    plugin="MyPlugin",
    title="插件帮助文档",
    content="""
    # MyPlugin 插件帮助

    ## 命令列表
    - /help - 显示帮助
    - /admin - 管理员命令（仅管理员）
    - /vip - VIP功能（仅VIP用户）
    - /calc - 计算器（所有用户）
    - /time - 获取时间（所有用户）

    ## 功能说明
    本插件提供管理员查询、VIP功能、计算器等工具。
    """,
    tags=["帮助", "命令", "文档"],
))
```

## 示例二：创建临时 Agent 处理自定义任务

### 场景

创建一个翻译助手 Agent，专门处理翻译任务。

### 完整代码

```python
from gsuid_core.ai_core.gs_agent import create_agent

# ==================== 翻译服务类 ====================

class TranslationService:
    """翻译服务"""
    
    def __init__(self):
        # 创建中英翻译 Agent
        self.zh_to_en = create_agent(
            model_name="gpt-3.5-turbo",
            system_prompt="""
你是一个专业的中英翻译助手。
将中文翻译成自然流畅的英文，保持原文的语气和风格。
只输出翻译结果，不添加解释。
            """,
        )
        
        # 创建英中翻译 Agent
        self.en_to_zh = create_agent(
            model_name="gpt-3.5-turbo",
            system_prompt="""
你是一个专业的英中翻译助手。
将英文翻译成自然流畅的中文，保持原文的语气和风格。
只输出翻译结果，不添加解释。
            """,
        )
        
        # 创建日英翻译 Agent
        self.ja_to_en = create_agent(
            model_name="gpt-4",
            system_prompt="""
你是一个专业的日英翻译助手。
将日文翻译成自然流畅的英文，保持原文的语气和风格。
只输出翻译结果，不添加解释。
            """,
        )
    
    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
    ) -> str:
        """
        翻译文本
        
        Args:
            text: 要翻译的文本
            source_lang: 源语言 (zh/en/ja)
            target_lang: 目标语言 (zh/en)
        """
        # 根据语言对选择 Agent
        if source_lang == "zh" and target_lang == "en":
            return await self.zh_to_en.run(text)
        elif source_lang == "en" and target_lang == "zh":
            return await self.en_to_zh.run(text)
        elif source_lang == "ja" and target_lang == "en":
            return await self.ja_to_en.run(text)
        else:
            return f"不支持的翻译方向: {source_lang} -> {target_lang}"

# ==================== 使用示例 ====================

# 创建翻译服务实例
translator = TranslationService()

# 在异步函数中使用
async def translate_example():
    # 中译英
    result1 = await translator.translate("你好，世界！", "zh", "en")
    print(f"中译英: {result1}")
    
    # 英译中
    result2 = await translator.translate("Hello, World!", "en", "zh")
    print(f"英译中: {result2}")

# ==================== 代码审查 Agent ====================

code_review_agent = create_agent(
    model_name="gpt-4",
    system_prompt="""
你是一个资深的 Python 代码审查专家。

## 审查内容
1. 代码风格和规范（PEP 8）
2. 潜在的错误和异常
3. 性能优化建议
4. 安全漏洞
5. 可读性和维护性

## 回复格式
1. **总体评价**: 代码质量概述
2. **问题列表**: 逐条列出发现的问题
3. **改进建议**: 具体的改进方案
4. **修改示例**: 提供修改后的代码
    """,
)

async def review_code(code: str) -> str:
    """审查代码"""
    prompt = f"请审查以下 Python 代码:\n\n```python\n{code}\n```"
    return await code_review_agent.run(prompt)
```

## 示例三：完整的插件初始化示例

### 场景

创建一个完整的插件，包含 AI 工具、知识库、别名等所有功能。

### 完整代码

```python
# my_plugin/__init__.py

from gsuid_core.sv import SV
from gsuid_core.plugin import Plugin
from gsuid_core.models import Bot, Event

from gsuid_core.ai_core.register import ai_tools, ai_entity, ai_alias
from gsuid_core.ai_core.models import KnowledgePoint
from gsuid_core.ai_core.gs_agent import create_agent
from gsuid_core.ai_core.buildin_tools import (
    search_knowledge,
    send_message_by_ai,
    query_user_favorability,
)
from pydantic_ai import RunContext
from gsuid_core.ai_core.models import ToolContext

# ==================== 别名注册 ====================

# 注册插件别名
ai_alias("我的插件", ["MyPlugin", "mp", "myplugin"])

# 注册角色别名
ai_alias("丝柯克", ["skk", "斯柯克", "SKK", "师傅"])
ai_alias("达达利亚", ["公子", "鸭鸭", "阿贾克斯"])

# ==================== 知识库注册 ====================

# 注册插件介绍
ai_entity(KnowledgePoint(
    id="my_plugin_info",
    plugin="MyPlugin",
    title="我的插件介绍",
    content="""
# MyPlugin

## 功能特性
1. 角色信息查询
2. 装备推荐
3. 攻略查询
4. AI 智能助手

## 使用方法
发送 /help 获取帮助
发送 /query 角色名 查询角色信息
    """,
    tags=["插件", "功能", "帮助"],
))

# 注册角色知识库
ai_entity(KnowledgePoint(
    id="character_skk",
    plugin="MyPlugin",
    title="丝柯克 - 角色介绍",
    content="""
# 丝柯克

## 基础信息
- 元素: 水
- 武器: 单手剑
- 命之座: 镜中景座

## 技能介绍
### 普通攻击 - 流澜剑术
进行至多五段的连续剑击...

### 元素战技 - 镜中水月
召唤水元素之力...

### 元素爆发 - 万流归一
释放强大的水元素爆发...

## 培养建议
### 武器推荐
1. 专武 - 镜花水月
2. 替代 - 雾切之回光
3. 四星 - 天目影打刀

### 圣遗物推荐
- 套装: 沉沦之心4件套
- 主词条: 攻击沙、水伤杯、暴击/暴伤头
- 副词条: 暴击 > 暴伤 > 攻击 > 充能
    """,
    tags=["丝柯克", "skk", "水元素", "单手剑"],
))

# ==================== AI 工具注册 ====================

@ai_tools()
async def query_character(
    ctx: RunContext[ToolContext],
    character_name: str,
) -> str:
    """
    查询角色详细信息

    Args:
        character_name: 角色名称
    """
    # 使用知识库检索
    result = await search_knowledge(
        ctx,
        query=f"{character_name}的角色信息和培养建议",
        plugin="MyPlugin",
        limit=3,
    )
    return result

@ai_tools()
async def recommend_build(
    ctx: RunContext[ToolContext],
    character_name: str,
    build_type: str = "通用",
) -> str:
    """
    推荐角色配装

    Args:
        character_name: 角色名称
        build_type: 配装类型（通用/输出/辅助/生存）
    """
    # 查询知识库获取推荐
    result = await search_knowledge(
        ctx,
        query=f"{character_name}的{build_type}配装推荐",
        plugin="MyPlugin",
        limit=2,
    )
    return result

@ai_tools()
async def check_user_status(
    ctx: RunContext[ToolContext],
) -> str:
    """
    查询用户当前状态（好感度、记忆等）
    """
    # 查询好感度
    favor = await query_user_favorability(ctx)
    
    return f"用户状态:\n{favor}"

# ==================== 创建专用 Agent ====================

# 创建角色攻略 Agent
character_guide_agent = create_agent(
    system_prompt="""
你是角色攻略专家，专门帮助玩家了解角色培养。

## 能力范围
1. 分析角色定位（主C/副C/辅助）
2. 推荐武器选择
3. 推荐圣遗物搭配
4. 提供天赋升级优先级
5. 推荐队伍搭配

## 回复格式
1. **角色定位**: 简要说明角色定位
2. **培养建议**: 武器/圣遗物/天赋
3. **队伍搭配**: 推荐配队方案
4. **注意事项**: 使用技巧和注意事项
    """,
)

# ==================== 插件注册 ====================

sv_myplugin = SV("我的插件")
pd_mp = Plugin(
    name="我的插件",
    pm=1,
    sv=sv_myplugin,
)

# ==================== 命令处理 ====================

@pd_mp.on_fullmatch("/myplugin help")
async def show_help(bot: Bot, ev: Event):
    """显示帮助"""
    help_text = """
【我的插件】帮助信息

【基础命令】
/help - 显示本帮助
/query 角色名 - 查询角色信息
/build 角色名 - 查询配装推荐

【AI功能】
直接发送问题，AI助手会为您解答

【示例】
/query 丝柯克
/build 达达利亚 输出
丝柯克怎么培养？
    """
    await bot.send(help_text)

@pd_mp.on_regex(r"/query (.+)")
async def handle_query(bot: Bot, ev: Event):
    """处理查询命令"""
    character = ev.regex_group[1]
    
    # 使用 Agent 生成回复
    result = await character_guide_agent.run(
        user_message=f"请介绍角色 {character} 的培养攻略",
        bot=bot,
        ev=ev,
    )
    
    await bot.send(result)

@pd_mp.on_regex(r"/build (.+?)(?: (.+))?$")
async def handle_build(bot: Bot, ev: Event):
    """处理配装命令"""
    character = ev.regex_group[1]
    build_type = ev.regex_group[2] or "通用"
    
    # 调用工具获取配装推荐
    from gsuid_core.ai_core.buildin_tools import search_knowledge
    from pydantic_ai import RunContext
    from gsuid_core.ai_core.models import ToolContext
    
    # 这里简化处理，实际应该通过 AI 调用工具
    await bot.send(f"正在查询 {character} 的 {build_type} 配装推荐...")
```

## 示例四：好感度系统实现

### 场景

实现一个完整的好感度系统，包含查询、增加、奖励等功能。

### 完整代码

```python
from gsuid_core.ai_core.register import ai_tools
from gsuid_core.ai_core.buildin_tools import (
    query_user_favorability,
    update_user_favorability,
    send_message_by_ai,
)
from pydantic_ai import RunContext
from gsuid_core.ai_core.models import ToolContext

# ==================== 好感度工具 ====================

@ai_tools()
async def daily_interaction(
    ctx: RunContext[ToolContext],
) -> str:
    """
    每日互动，增加好感度
    """
    import random
    
    # 随机增加 1-5 点好感度
    increase = random.randint(1, 5)
    
    # 更新好感度
    result = await update_user_favorability(ctx, increase)
    
    # 发送通知
    messages = [
        f"和你聊天真开心！好感度 +{increase} ❤️",
        f"今天也是美好的一天呢！好感度 +{increase} 🌟",
        f"谢谢你的陪伴！好感度 +{increase} 🎉",
    ]
    message = random.choice(messages)
    
    await send_message_by_ai(
        ctx,
        message_type="text",
        text=message,
    )
    
    return f"好感度增加了 {increase} 点"

@ai_tools()
async def check_favorability_level(
    ctx: RunContext[ToolContext],
) -> str:
    """
    查询好感度等级和奖励
    """
    # 查询当前好感度
    favor_info = await query_user_favorability(ctx)
    
    # 解析好感度值（这里简化处理）
    # 实际应该从 favor_info 中解析
    
    # 定义等级
    levels = [
        (0, 10, "陌生人", "暂无奖励"),
        (11, 30, "熟人", "每日签到奖励 x1.1"),
        (31, 60, "朋友", "每日签到奖励 x1.2"),
        (61, 100, "好友", "每日签到奖励 x1.5"),
        (101, 200, "挚友", "每日签到奖励 x2.0"),
        (201, float('inf'), "知己", "每日签到奖励 x3.0 + 专属功能"),
    ]
    
    # 这里简化返回
    return f"{favor_info}\n\n等级说明:\n" + "\n".join([
        f"{name} ({min_val}-{max_val}): {reward}"
        for min_val, max_val, name, reward in levels
    ])

@ai_tools()
async def give_gift(
    ctx: RunContext[ToolContext],
    gift_name: str,
) -> str:
    """
    赠送礼物，大幅增加好感度

    Args:
        gift_name: 礼物名称
    """
    # 定义礼物和对应的好感度
    gifts = {
        "鲜花": 5,
        "巧克力": 10,
        "首饰": 20,
        "书籍": 8,
        "美食": 12,
    }
    
    if gift_name not in gifts:
        return f"未知的礼物: {gift_name}。可用礼物: {', '.join(gifts.keys())}"
    
    increase = gifts[gift_name]
    
    # 更新好感度
    result = await update_user_favorability(ctx, increase)
    
    # 发送感谢消息
    thank_messages = {
        "鲜花": "哇，好漂亮的花！谢谢你！🌸",
        "巧克力": "巧克力！我的最爱！谢谢你！🍫",
        "首饰": "这...这太贵重了！我会好好珍惜的！💎",
        "书籍": "谢谢你的书，我会好好阅读的！📚",
        "美食": "看起来好好吃！谢谢你！🍰",
    }
    
    await send_message_by_ai(
        ctx,
        message_type="text",
        text=thank_messages[gift_name],
    )
    
    return f"赠送了 {gift_name}，好感度 +{increase}"
```

## 示例五：多轮对话实现

### 场景

实现一个支持多轮对话的 AI 助手，能够记住对话上下文。

### 完整代码

```python
from gsuid_core.ai_core.register import ai_tools
from gsuid_core.ai_core.gs_agent import create_agent
from gsuid_core.ai_core.buildin_tools import search_knowledge
from pydantic_ai import RunContext
from gsuid_core.ai_core.models import ToolContext

# ==================== 对话管理 ====================

class ConversationManager:
    """对话管理器"""
    
    def __init__(self):
        self.conversations = {}  # user_id -> conversation_history
    
    def get_history(self, user_id: str) -> list:
        """获取用户对话历史"""
        return self.conversations.get(user_id, [])
    
    def add_message(self, user_id: str, role: str, content: str):
        """添加消息到历史"""
        if user_id not in self.conversations:
            self.conversations[user_id] = []
        
        self.conversations[user_id].append({
            "role": role,
            "content": content,
        })
        
        # 限制历史长度
        if len(self.conversations[user_id]) > 20:
            self.conversations[user_id] = self.conversations[user_id][-20:]
    
    def clear_history(self, user_id: str):
        """清空对话历史"""
        self.conversations[user_id] = []

# 创建对话管理器实例
conversation_mgr = ConversationManager()

# ==================== 多轮对话 Agent ====================

chat_agent = create_agent(
    system_prompt="""
你是一个友好的 AI 助手，支持多轮对话。

## 对话原则
1. 记住之前的对话内容
2. 保持上下文连贯
3. 适时引用之前的信息
4. 主动询问以获取更多信息

## 能力范围
- 回答游戏相关问题
- 查询角色和装备信息
- 提供攻略建议
- 闲聊和陪伴
    """,
)

# ==================== 工具 ====================

@ai_tools()
async def chat_with_memory(
    ctx: RunContext[ToolContext],
    user_message: str,
) -> str:
    """
    进行多轮对话

    Args:
        user_message: 用户消息
    """
    user_id = ctx.deps.ev.user_id
    
    # 获取对话历史
    history = conversation_mgr.get_history(user_id)
    
    # 构建带上下文的提示
    context = ""
    if history:
        context = "之前的对话:\n"
        for msg in history[-5:]:  # 最近5条
            role_name = "用户" if msg["role"] == "user" else "助手"
            context += f"{role_name}: {msg['content']}\n"
        context += "\n"
    
    full_prompt = f"{context}当前用户消息: {user_message}"
    
    # 调用 Agent
    response = await chat_agent.run(
        user_message=full_prompt,
        bot=ctx.deps.bot,
        ev=ctx.deps.ev,
    )
    
    # 保存到历史
    conversation_mgr.add_message(user_id, "user", user_message)
    conversation_mgr.add_message(user_id, "assistant", response)
    
    return response

@ai_tools()
async def clear_conversation(
    ctx: RunContext[ToolContext],
) -> str:
    """
    清空当前对话历史
    """
    user_id = ctx.deps.ev.user_id
    conversation_mgr.clear_history(user_id)
    return "对话历史已清空"

@ai_tools()
async def query_with_context(
    ctx: RunContext[ToolContext],
    query: str,
) -> str:
    """
    结合知识库和对话上下文回答问题

    Args:
        query: 查询内容
    """
    user_id = ctx.deps.ev.user_id
    
    # 获取知识库信息
    knowledge = await search_knowledge(
        ctx,
        query=query,
        limit=3,
    )
    
    # 获取对话历史
    history = conversation_mgr.get_history(user_id)
    
    # 构建提示
    prompt = f"""
基于以下信息回答用户问题:

【知识库信息】
{knowledge}

【对话历史】
{history[-3:] if history else "无"}

【当前问题】
{query}
"""
    
    response = await chat_agent.run(prompt)
    
    # 保存对话
    conversation_mgr.add_message(user_id, "user", query)
    conversation_mgr.add_message(user_id, "assistant", response)
    
    return response
```

## 注意事项

1. **错误处理**：生产环境需要添加完善的错误处理
2. **性能优化**：大量知识库可能影响启动速度
3. **隐私保护**：注意用户数据的隐私和安全
4. **成本控制**：注意 AI 调用的 token 消耗
5. **测试覆盖**：为工具函数编写单元测试

## 示例六：触发器桥接（to_ai）— 让 AI 调用插件命令

### 场景

将已有的插件触发器（如查询股票、查天气等）自动注册为 AI 工具，让 AI 可以根据用户意图自动调用这些功能。

### 完整代码

```python
from gsuid_core.sv import SV
from gsuid_core.bot import Bot
from gsuid_core.models import Event
from gsuid_core.ai_core.trigger_bridge import ai_return

sv = SV("股票插件")

# ==================== 触发器 + AI 工具 ====================
# to_ai 参数的字符串将作为 AI 工具的 docstring
# AI 会根据这段描述判断何时调用该工具

@sv.on_command(
    "个股",
    to_ai="""
    查询指定股票或ETF的K线图或分时图。
    当用户询问某只股票/ETF走势时调用。

    Args:
        text: 股票名称或代码，可加前缀 "日k"/"周k"/"月k"，多个以空格分隔
              例如 "证券ETF"、"日k 白酒ETF"
    """,
)
async def send_stock_img(bot: Bot, ev: Event):
    content = ev.text.strip().lower()
    if not content:
        ai_return("错误：未提供股票代码")
        return await bot.send("请后跟股票代码使用")

    # ... 原有业务逻辑完全不变 ...
    # 生成图片后发送
    im = await generate_stock_chart(content)
    await bot.send(im)

# ==================== 天气查询示例 ====================

@sv.on_command(
    "天气",
    to_ai="""
    查询指定城市的天气信息。
    当用户询问天气、气温、是否下雨等问题时调用。

    Args:
        text: 城市名称，例如 "北京"、"上海"、"深圳"
    """,
)
async def query_weather(bot: Bot, ev: Event):
    city = ev.text.strip()
    if not city:
        ai_return("错误：未提供城市名称")
        return await bot.send("请输入城市名称")

    weather_data = await fetch_weather(city)
    await bot.send(weather_data)
```

### 交互效果

```
用户直接发送 "个股 证券ETF"：
  → 触发器匹配 → 直接发送 K 线图 ✅

用户对 AI 说 "帮我看看证券ETF最近走势怎么样"：
  → AI 识别意图 → 调用 send_stock_img(text="证券ETF")
  → MockBot 拦截图片 → AI 决定是否发送
  → AI 调用 send_trigger_images() → 图片发出 ✅

用户对 AI 说 "今天北京天气怎么样"：
  → AI 识别意图 → 调用 query_weather(text="北京")
  → AI 将天气数据整合到回复中 ✅
```

### 关键点

1. **零侵入**：原有触发器逻辑完全不变，只是多了一个 `to_ai` 参数
2. **AI 自主决策**：AI 根据 docstring 判断何时调用，调用后决定是否发送图片
3. **`ai_return()`**：在普通用户触发时静默忽略，AI 调用时返回文本给 AI
4. **图片拦截**：AI 调用时 `bot.send(image)` 被 MockBot 拦截，图片暂存，AI 可后续通过 `send_trigger_images` 发送

::: tip

更多关于 `to_ai` 参数的详细说明，请参考 [触发器文档](../CodePlugins/trigger#to_ai-参数--触发器自动注册为-ai-工具)。

:::

## 下一步

- [工具注册](./Tools) - 深入了解工具注册
- [知识库注册](./KnowledgeBase) - 深入了解知识库
- [Agent创建](./Agent) - 深入了解 Agent 创建
- [触发器文档](../CodePlugins/trigger) - 深入了解触发器和 to_ai 参数
