# 项目架构说明

本文记录微信日程助手当前前端架构、数据流和模块职责。本文只描述现有实现，不引入新的后端、数据库、真实微信接口或大模型服务。

## 1. 架构总览

微信日程助手是一个本地运行的 React + Vite 单页面应用。

核心特点：

- 前端-only：所有功能运行在浏览器中。
- 本地存储：已确认日程保存到浏览器 localStorage。
- 规则提取：从模拟微信群消息中提取日程草稿。
- 人工确认：系统生成草稿后，由用户确认或忽略。
- 本地提醒：页面打开时，通过浏览器通知能力提醒即将开始的日程。
- 本地导出：支持将 confirmed 日程导出为 `.ics` 文件。

当前项目不包含：

- 后端 API。
- 数据库。
- 用户登录。
- 多端同步。
- 真实微信接入。
- 真实大模型 API 调用。

## 2. 目录结构

```text
src
├─ App.jsx
├─ main.jsx
├─ styles.css
├─ components
│  ├─ EventConfirmation.jsx
│  ├─ MessageInput.jsx
│  ├─ ReminderPanel.jsx
│  └─ ScheduleList.jsx
├─ data
│  └─ sampleMessages.js
└─ utils
   ├─ aiExtractor.js
   ├─ dateHelpers.js
   ├─ extractor.js
   ├─ hybridExtractor.js
   ├─ icsExporter.js
   ├─ notificationService.js
   ├─ reminderService.js
   ├─ storage.js
   └─ workflow.js
```

## 3. 应用入口

### `src/main.jsx`

负责挂载 React 应用。

### `src/App.jsx`

`App.jsx` 是当前应用的主要状态中心，负责：

- 初始化 events。
- 保存 draftEvent。
- 调用消息提取逻辑。
- 确认、忽略、删除和更新日程。
- 将 events 保存到 localStorage。
- 启动和停止提醒循环。
- 在事件被提醒或结束时，通过 React state 更新 `remindedAt` 和 `endedAt`。
- 将数据和回调传给各个 UI 组件。

`App.jsx` 当前维护两个主要 state：

- `events`：已保存的本地日程数组。
- `draftEvent`：当前待确认的日程草稿。

## 4. 组件职责

### `MessageInput.jsx`

负责模拟微信群消息输入。

主要职责：

- 显示文本输入框。
- 显示本地示例消息。
- 用户点击提取后，把消息文本交给上层 `onExtract`。

该组件不直接保存日程，也不直接修改 events。

### `EventConfirmation.jsx`

负责展示和编辑提取出的日程草稿。

主要职责：

- 接收 `draftEvent`。
- 将草稿字段填入确认表单。
- 允许用户调整标题、日期、时间、地点、提醒提前量和持续时间。
- 用户确认后，把更新后的事件交给上层 `onConfirm`。
- 用户忽略后，通知上层清空草稿。

该组件只管理表单临时状态，不直接写 localStorage。

### `ReminderPanel.jsx`

负责展示即将开始的 confirmed 日程。

主要职责：

- 接收 events。
- 使用日期辅助逻辑筛选 upcoming events。
- 以简洁列表展示近期日程。

该组件只展示数据，不修改事件。

### `ScheduleList.jsx`

负责展示和管理已确认日程列表。

主要职责：

- 只展示 `status === 'confirmed'` 的事件。
- 支持编辑已保存日程。
- 支持删除已保存日程。
- 支持导出 `.ics` 文件。
- 支持手动测试浏览器通知。
- 展示提醒设置、持续时间和生命周期状态。

编辑保存时，组件通过 `onUpdate` 把更新后的事件交给 `App.jsx`，由上层统一更新 state。

## 5. 工具模块职责

### `storage.js`

负责 localStorage 读写。

当前 key：

```text
wechat-schedule-assistant-events
```

主要函数：

- `loadEvents()`：读取已保存事件，读取失败时返回空数组。
- `saveEvents(events)`：将事件数组序列化后保存。

### `extractor.js`

负责规则提取。

主要职责：

- 清理输入文本。
- 识别日期。
- 识别时间。
- 识别地点。
- 推断标题。
- 计算置信度。
- 返回 pending 草稿事件。

提取结果仍需要用户确认，不能直接视为正式日程。

### `hybridExtractor.js`

当前是提取入口包装层。

主要职责：

- 调用规则提取器。
- 标记 `extractionMethod: 'rules'`。
- 标记 `needsReview: true`。

该模块为未来可能加入其它提取方式保留了简单边界，但当前仍只使用规则提取。

### `workflow.js`

负责事件状态、生命周期和默认值规则。

当前允许的 status：

```text
pending
confirmed
dismissed
```

重要设计：

- `status` 只表示用户对提取结果的决策。
- `remindedAt` 表示事件已经触发过提醒。
- `endedAt` 表示事件已经被判断为结束。
- `reminderMinutes` 缺失时默认 10 分钟。
- `durationMinutes` 缺失时默认 60 分钟。

不要把 `reminded` 或 `ended` 加入 status 枚举。

### `reminderService.js`

负责自动提醒循环。

主要职责：

- 启动定时检查。
- 只处理 confirmed 且有日期和时间的事件。
- 跳过已结束事件。
- 跳过不提醒的事件。
- 避免重复通知。
- 到达提醒窗口时调用浏览器通知服务。
- 事件结束后通知 `App.jsx` 写入 `endedAt`。

提醒循环只在页面打开时运行。

### `notificationService.js`

负责浏览器通知能力。

主要职责：

- 请求通知权限。
- 展示浏览器通知。

通知权限是可选能力，失败不应影响主流程。

### `icsExporter.js`

负责生成和下载 `.ics` 文件。

主要职责：

- 只导出 confirmed 且有日期的事件。
- 有时间的事件导出 DTSTART 和 DTEND。
- 无时间的事件按全天事件导出。
- 使用 `durationMinutes` 计算有时间事件的结束时间。
- 写入标题、地点、描述和置信度等信息。

### `dateHelpers.js`

负责日期展示和 upcoming events 筛选。

主要职责：

- 判断哪些 confirmed 事件即将开始。
- 为提醒面板提供筛选后的事件列表。

### `sampleMessages.js`

保存本地示例消息，用于手动测试规则提取流程。

## 6. 主数据流

### 6.1 提取和确认流程

```text
用户输入或选择示例消息
        ↓
MessageInput 调用 onExtract
        ↓
App.jsx 调用 extractEventDraftHybrid
        ↓
生成 draftEvent
        ↓
EventConfirmation 展示并允许用户编辑
        ↓
用户确认
        ↓
App.jsx 设置 status 为 confirmed
        ↓
写入 reminderMinutes、durationMinutes、confirmedAt
        ↓
events state 更新
        ↓
saveEvents 保存到 localStorage
```

### 6.2 忽略流程

```text
用户查看 draftEvent
        ↓
点击忽略
        ↓
App.jsx 清空 draftEvent
        ↓
草稿不保存到本地日程
```

当前 MVP 中，被忽略草稿不会进入 localStorage。

### 6.3 编辑流程

```text
用户在 ScheduleList 点击编辑
        ↓
ScheduleList 使用本地表单保存临时编辑值
        ↓
用户点击保存
        ↓
ScheduleList 调用 onUpdate
        ↓
App.jsx 通过 setEvents 更新目标事件
        ↓
写入 updatedAt
        ↓
saveEvents 保存到 localStorage
```

### 6.4 删除流程

```text
用户点击删除
        ↓
ScheduleList 调用 onDelete
        ↓
App.jsx 从 events 中过滤目标事件
        ↓
saveEvents 保存到 localStorage
```

### 6.5 自动提醒和结束流程

```text
App.jsx 启动 reminderService
        ↓
reminderService 定时读取最新 events
        ↓
筛选 confirmed 且有日期和时间的事件
        ↓
判断是否已经结束
        ↓
如果结束，通知 App.jsx 写入 endedAt
        ↓
如果未结束且进入提醒窗口，调用 notificationService
        ↓
通知成功后，通知 App.jsx 写入 remindedAt
```

### 6.6 ICS 导出流程

```text
用户点击导出 .ics
        ↓
ScheduleList 调用 buildIcsCalendar(events)
        ↓
icsExporter 筛选 confirmed 且有日期的事件
        ↓
逐个生成 VEVENT
        ↓
有时间事件使用 durationMinutes 计算 DTEND
        ↓
downloadIcsFile 触发浏览器下载
```

## 7. 事件数据形状

当前事件对象常见字段：

```javascript
{
  id: string,
  title: string,
  date: string,
  time: string,
  location: string,
  sourceText: string,
  status: 'pending' | 'confirmed' | 'dismissed',
  confidence: number,
  extractionMethod: 'rules',
  needsReview: boolean,
  reminderMinutes: number,
  durationMinutes: number,
  createdAt: string,
  confirmedAt: string,
  updatedAt: string,
  remindedAt: string | null,
  endedAt: string | null
}
```

兼容性注意：

- 旧事件可能没有 `reminderMinutes`。
- 旧事件可能没有 `durationMinutes`。
- 旧事件可能没有 `remindedAt`。
- 旧事件可能没有 `endedAt`。
- 读取这些字段时应通过 helper 或默认值处理。

## 8. 状态和生命周期边界

事件状态只描述用户决策：

- `pending`：待确认草稿。
- `confirmed`：用户确认保存的日程。
- `dismissed`：用户忽略的草稿状态，目前不持久化到本地列表。

生命周期字段描述事件过程：

- `remindedAt`：已经提醒。
- `endedAt`：已经结束。

状态和生命周期不要混用。

## 9. 持久化边界

当前持久化只保存 events 数组。

不会持久化：

- 当前输入框文本。
- 当前 draftEvent。
- UI 编辑中的临时表单。
- 提醒循环内部的 intervalId。
- reminderService 内部的 notifiedEventIds。

这个边界可以让页面刷新后恢复已确认日程，但不会恢复未确认草稿。

## 10. 后续开发注意事项

- 不要新增后端、数据库或真实微信接入，除非项目目标明确变化。
- 修改事件字段时，必须考虑旧 localStorage 数据。
- 修改 status 时必须保持 `pending`、`confirmed`、`dismissed` 这三个值的边界。
- 新增生命周期能力时，优先使用可选时间戳字段。
- 新增提取能力时，保持用户确认流程。
- 新增提醒能力时，避免在 UI 组件中重复实现提醒规则。
- 新增导出能力时，保持 confirmed 事件和日期字段的筛选边界。
