# Top Navigation Bar Redesign - Proposal

## Overview

将 ChronoFlow 的顶部导航栏重构为使用 HeroUI Navbar 组件，统一设计语言，改善用户体验。

## Problem Statement

当前顶部导航栏存在以下问题：

1. **设计不一致**：
   - 使用自定义 header 布局，未使用 HeroUI 组件库
   - 浮动汉堡按钮（fixed 定位）与整体设计风格不协调

2. **导航体验问题**：
   - 汉堡按钮位于屏幕左右边缘垂直居中位置，不直观
   - Tab 导航使用自定义实现，样式不统一

3. **功能缺失**：
   - 缺少快速查看今日完成任务的入口
   - 缺少外部项目链接（GitHub）
   - 任务清单入口不明显，新用户难以发现

4. **代码维护问题**：
   - 自定义布局代码复杂，难以维护
   - 未充分利用 HeroUI 组件库的能力

## Goals

1. **使用 HeroUI Navbar**：替换自定义 header 为 HeroUI Navbar 组件
2. **统一导航体验**：使用 HeroUI Tabs 组件实现 Tab 导航
3. **改进布局**：将 Logo、导航 Tabs、状态指示器整合到顶部 Navbar
4. **增强功能**：
   - 添加任务清单入口（汉堡菜单按钮，紧贴右侧边框）
   - 添加今日完成数显示
   - 添加 GitHub 项目链接
5. **更直观的交互**：使用熟悉的汉堡菜单图标，提升可发现性

## Scope

### Included

- 使用 HeroUI Navbar 替换自定义 header
- 使用 HeroUI Tabs 实现导航 Tab 切换
- 移除边缘浮动汉堡按钮和任务清单按钮
- 在 Navbar 右侧添加任务清单汉堡按钮（Menu 图标，紧贴右侧边框）
- 添加 GitHub 项目链接（https://github.com/Jin-Xi/TaskTimer）
- 添加今日完成数显示（实时统计今日完成的任务数量）
- 响应式设计（移动端隐藏 Tabs）

### Excluded

- Drawer 组件重构（保持现有实现）
- 底部 GlobalTimerIndicator 改动
- 其他页面组件改动

## Success Criteria

1. 顶部导航栏使用 HeroUI Navbar 组件
2. Tab 导航使用 HeroUI Tabs，样式统一
3. 移除左右边缘浮动按钮
4. Navbar 右侧汉堡按钮可正常打开任务清单
5. 汉堡按钮紧贴右侧边框，使用熟悉的 Menu 图标
6. GitHub 链接正确跳转到 https://github.com/Jin-Xi/TaskTimer
7. 今日完成数实时显示并正确统计
8. 响应式设计正常（移动端 Tabs 隐藏）

## Dependencies

- HeroUI v2 组件库已集成
- 现有导航项配置 (NAV_ITEMS)
- 现有翻译系统

## Risks

| Risk | Mitigation |
|------|------------|
| HeroUI Navbar 样式可能不匹配现有设计 | 使用 classNames 自定义样式覆盖 |
| 移动端导航体验可能变差 | 保留 Drawer 组件，移动端通过 Logo/菜单触发 |
| 现有 Tab 切换动画可能受影响 | 保持 AnimatePresence 和方向感知逻辑 |

## Timeline Estimate

- Navbar 组件集成：30 分钟
- Tabs 导航迁移：30 分钟
- 样式调整：30 分钟
- 测试：30 分钟

**总计：约 2 小时**
