# LangGraph 问答 Agent

> 基于 LangGraph 构建的交互式问答 Agent，部署在 EdgeOne Makers 上。自动生成知识问答题、评估答案、提供提示，并在多轮对话中追踪得分。

**Framework:** LangGraph · **Category:** Quick Start · **Language:** TypeScript

[![Deploy to EdgeOne Makers](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/makers/new?template=langgraph-quiz-starter-node&from=within&fromAgent=1&agentLang=typescript)

## 概览

LangGraph Quiz Agent 以状态图的形式运行一个交互式知识问答游戏。LLM 生成选择题，用户作答后由图评估正确性——第一次答错会给出提示，第二次仍错则揭示答案。全程追踪得分和进度。

- **状态化问答流程** — LangGraph 图管理完整的题目生命周期：出题 → 等待 → 评估 → 提示/结算 → 更新进度
- **Human-in-the-loop** — 通过 `interrupt()` 暂停图执行，等待用户作答
- **自适应提示** — 第一次答错时 LLM 给出提示但不揭示答案
- **中英双语** — 题目和界面支持中文和英文
- **可视化流程图** — 前端将 LangGraph 状态机渲染为 Mermaid 流程图，高亮当前节点

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `AI_GATEWAY_API_KEY` | 是 | 模型网关 API Key。使用 **Makers Models API Key**，或任何 OpenAI 兼容的 Key。 |
| `AI_GATEWAY_BASE_URL` | 是 | 网关地址。Makers Models 使用 `https://ai-gateway.edgeone.link/v1`。 |

> 本模板遵循 **OpenAI 兼容标准**，可对接 Makers Models 或任何兼容的模型网关。

### 如何获取 `AI_GATEWAY_API_KEY`

1. 打开 [Makers 控制台](https://console.cloud.tencent.com/edgeone/makers)。
2. 登录并开通 Makers。
3. 进入 **Makers → 模型 → API Key**，创建一个 Key。
4. 将 Key 填入 `AI_GATEWAY_API_KEY`（`AI_GATEWAY_BASE_URL` 填写 `https://ai-gateway.edgeone.link/v1`）。

内置模型（`@makers/deepseek-v4-flash`、`@makers/hy3-preview`、`@makers/minimax-m2.7`）免费但有频率限制，适合开发验证。生产环境建议在控制台绑定自有模型 Key（BYOK）。

## 本地开发

**前置依赖：** Node.js、npm

```bash
npm install
cp .env.example .env
edgeone makers dev
```

打开 `http://localhost:8080/agent-metrics` 查看本地可观测面板。

## 项目结构

```text
langgraph-quiz-nodejs/
├── agents/
│   ├── quiz.ts            # /quiz — 主问答端点（SSE 流式）
│   ├── stop.ts            # /stop — 中止正在进行的问答
│   └── _lib/
│       ├── graph.ts       # LangGraph 状态图定义
│       ├── state.ts       # 问答状态 Schema
│       ├── nodes.ts       # 图节点：出题、评估、提示、结算、进度
│       ├── prompts.ts     # LLM Prompt 模板
│       └── logger.ts      # 共享日志工厂
├── src/
│   ├── components/        # React UI（QuizCard、FlowChart、ScoreBoard 等）
│   ├── hooks/             # useQuiz Hook（SSE 消费 + 状态管理）
│   └── ...
├── edgeone.json           # Agent 运行时配置
└── package.json
```

> 以 `_` 为前缀的文件是私有模块，不会被 EdgeOne 暴露为公开路由。

## 工作原理

Agent 以**会话模式**运行：相同 `conversation_id` 的请求路由到同一实例，状态持久化。

### 工作流

1. **开始** (`action: "start"`) — 初始化图，设置语言和题目数量，然后流式推送第一道题。
2. **出题** — LLM 通过结构化输出生成选择题。
3. **等待作答** — 图通过 `interrupt()` 暂停；前端收到 `waiting` SSE 事件。
4. **提交答案** (`action: "answer"`) — 用户提交 A/B/C/D，图恢复执行并评估。
5. **评估** — 答对则结算；第一次答错给提示后再等待；第二次仍错则揭示正确答案。
6. **更新进度** — 更新得分，推送 progress 事件，循环出下一题或结束。
7. **完成** — 所有题目结束后，推送最终得分和统计数据。

### 核心机制

- **LangGraph StateGraph**：节点和条件边定义问答流程；`interrupt()` 实现 Human-in-the-loop。
- **结构化输出**：出题使用 `bindTools` 确保一致的四选一格式。
- **自定义流事件**：通过 `config.writer!` 推送类型化事件（`question`、`result`、`hint_done`、`feedback`、`progress`）。
- **Checkpointer**：对话状态通过 `context.store.langgraphCheckpointer` 持久化；`resume` 动作可恢复中途退出的问答。

### 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/quiz` | POST | 主问答端点 — 支持 action：`start`、`answer`、`resume`、`graph` |
| `/stop` | POST | 中止正在进行的问答 |

`conversation_id` 通过 `makers-conversation-id` 请求头传递。

## 相关资源

- [Makers Agents 文档](https://cloud.tencent.com/document/product/1552/132759)
- [快速开始：Agent 开发](https://cloud.tencent.com/document/product/1552/132786)
- [Makers Models](https://cloud.tencent.com/document/product/1552/132748)

## License

MIT
