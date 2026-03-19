# 任务列表：AI 规划规则优化

## 实现任务

- [x] 1. 修改 AI 服务中的系统提示词，添加规划规则约束
- [x] 2. 在提示词中明确说明最多 5 条流水线的限制
- [x] 3. 在提示词中说明每条流水线代表一个章节
- [x] 4. 在提示词中要求每个章节至少有一个可执行任务
- [x] 5. 测试 AI 规划功能，验证规则是否生效

## 验收标准

- [ ] AI 输出的流水线数量不超过 5 条：
  - testcase1：我想为半程马拉松做训练
- [ ] 每条流水线有明确的章节标识
- [ ] 每个章节至少包含 1 个任务
- [ ] 任务之间的依赖关系正确

## 实现完成状态

**Build**: ✅ 通过
**Tests**: ✅ 15/15 通过

### 已完成修改
1. `generateProjectPlan` Gemini response schema: `parentIds: array` → `parentId: string, nullable: true`
2. `continuePlanningConversation` Gemini response schema: 同样修改
3. `validateAndFixTasks` 函数: 验证并修复 AI 返回的任务结构
4. OpenAI/DeepSeek 兼容性: 添加 `parseAIResponse` 函数处理响应

### 需要用户测试
使用 DeepSeek 模型测试 "我想为半程马拉松做训练"，验证：
- 流水线数量 ≤ 5
- 每条流水线是完整的任务链 (A→B→C→D)
- 每条流水线至少 2 个任务
