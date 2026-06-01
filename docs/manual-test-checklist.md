# Manual Test Checklist

Use this checklist to manually verify the rule-based extractor and the MVP UI workflow.

Current date assumption for these examples: 2026-05-29.

## How To Test

1. Open the local app.
2. Paste one message into the simulated WeChat message box, or choose a sample.
3. Click `Extract draft`.
4. Compare the draft fields with the expected result below.
5. If the message should become a schedule item, click `Confirm`.
6. Check that it appears in `Local Schedule`.
7. If the event is in the future and confirmed, check whether it appears in `Upcoming`.

## Test Messages

| # | Test message | Expected title | Expected date/time type | Expected location | Expected confidence | Should save? |
|---|---|---|---|---|---|---|
| 1 | 明天下午3点在A203开班会 | 开班会 | Relative date + Chinese time | A203 | High | Yes |
| 2 | 后天上午10点在图书馆门口集合 | 集合 | Relative date + Chinese time | 图书馆门口 | High | Yes |
| 3 | 本周日20:00社团活动 | 社团活动 | This-week date + 24-hour time | None | High | Yes |
| 4 | 下周一下午2点考试 | 考试 | Next-week date + Chinese time | None | High | Yes |
| 5 | 下周三18:30训练 | 训练 | Next-week date + 24-hour time | None | High | Yes |
| 6 | 5月30日19:00数据库课程答疑 | 数据库课程答疑 | Specific date + 24-hour time | None | High | Yes |
| 7 | 明晚7点项目讨论 | 项目讨论 | Relative date + Chinese evening time | None | High | Yes |
| 8 | 今晚8点线上小组讨论 | 线上小组讨论 | Relative date + Chinese evening time | None | High | Yes |
| 9 | 周六晚上7点篮球训练 | 篮球训练 | Weekday date + Chinese evening time | None | High | Yes |
| 10 | 后天下午2点在操场集合 | 集合 | Relative date + Chinese time | 操场 | High | Yes |
| 11 | 大家今天中午吃什么 | 大家中午吃什么 | Relative date only, no clear schedule time | None | Medium-low | No |
| 12 | 记得参加活动 | 记得参加活动 | No recognizable date or time | None | Low | No |

## Current Known Limits

- The extractor does not understand long context across multiple messages.
- The extractor does not support dates like `下个月`, `月底`, or `两小时后`.
- Location recognition only handles simple `在...` patterns.
- Ordinary chat may still produce a medium-low confidence draft if it contains a date word, so the user should dismiss it.
- `5月30日` uses the current year.

## ICS 导出测试

### 场景 1：日期 + 时间 + 地点

输入示例：

```text
明天下午3点在A203开班会
```

验证：

- 可以保存为 confirmed
- 点击“导出 .ics”
- 成功下载文件
- Google Calendar 可以导入
- 标题正确
- 时间正确
- 地点正确

### 场景 2：日期 + 时间，无地点

输入示例：

```text
明天晚上7点项目讨论
```

验证：

- 导入后无 LOCATION
- 时间正常

### 场景 3：仅日期（全天事件）

输入示例：

```text
5月30日提交数据库作业
```

验证：

- 导出成功
- Google Calendar 显示为全天事件

### 场景 4：无日期

输入示例：

```text
记得完成数据库作业
```

验证：

- 不导出到 ICS
- 不生成 VEVENT

## v1.2 测试结果

- ICS 文件生成成功
- Google Calendar 导入成功
- 中文标题显示正常
- 地点显示正常
- 描述显示正常
- 默认事件时长为 1 小时

## v1.4 提醒设置测试

### 场景 1：不提醒

1. 输入并提取一条有日期和时间的活动消息。
2. 在确认日程时将“提醒设置”选择为“不提醒”。
3. 保存为 confirmed。
4. 保持页面打开。
5. 到达活动开始前的提醒窗口时，不应弹出浏览器通知。

### 场景 2：提前5分钟提醒

1. 创建一个 5 分钟内即将开始的 confirmed 日程。
2. 将“提醒设置”选择为“5分钟”。
3. 保持页面打开，并允许浏览器通知。
4. 预期：活动开始前 5 分钟内弹出通知。

### 场景 3：提前10分钟提醒

1. 创建一个 10 分钟内即将开始的 confirmed 日程。
2. 将“提醒设置”选择为“10分钟”。
3. 保持页面打开，并允许浏览器通知。
4. 预期：活动开始前 10 分钟内弹出通知。

### 场景 4：提前30分钟提醒

1. 创建一个 30 分钟内即将开始的 confirmed 日程。
2. 将“提醒设置”选择为“30分钟”。
3. 保持页面打开，并允许浏览器通知。
4. 预期：活动开始前 30 分钟内弹出通知。

### 场景 5：旧数据兼容

1. 使用浏览器 localStorage 中没有 reminderMinutes 字段的旧日程。
2. 保持页面打开，并允许浏览器通知。
3. 预期：系统按默认 10 分钟提醒处理，不报错。

说明：自动提醒检查频率为每分钟一次。测试时可以把事件时间设置到当前时间后的几分钟内，方便观察通知效果。
