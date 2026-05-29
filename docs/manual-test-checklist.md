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
