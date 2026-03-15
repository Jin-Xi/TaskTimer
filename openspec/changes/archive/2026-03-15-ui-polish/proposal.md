# UI Polish - FullscreenFocus HeroUI Migration

## Overview

将 FullscreenFocus 组件的自定义按钮迁移到 HeroUI Button 组件，统一设计语言并更新配色方案。

## Problem Statement

当前 FullscreenFocus 组件存在以下问题：

1. **使用原生 button 元素**：未使用 HeroUI 组件库，与其他页面设计不一致
2. **配色方案过时**：使用自定义颜色（text-olive-500、text-terracotta-300），与 HeroUI 主题色不匹配
3. **缺少交互反馈**：没有充分利用 HeroUI 的动画和状态管理

## Goals

1. **迁移到 HeroUI Button**：所有按钮使用 HeroUI Button 组件
2. **更新配色方案**：使用 HeroUI 颜色系统（success、default、danger）
3. **保持功能完整**：所有现有功能正常工作
4. **提升交互体验**：利用 HeroUI 的 isLoading、isDisabled 等状态

## Scope

### Included

- FullscreenFocus 组件的按钮迁移
  - 播放/暂停按钮（圆形大按钮）
  - 退出按钮（圆形小按钮）
  - 背景图片按钮（圆形小按钮）
- 配色更新：
  - 主操作按钮：success（绿色）
  - 次要操作按钮：default（中性色）
- 标签 chips 迁移到 HeroUI Chip
- 默认背景图片：使用抽象渐变图片作为默认背景
- 按钮不透明样式：所有按钮和标签改为不透明，提升可读性
- 日期时间显示：左上角信息卡片改为不透明白色背景

### Excluded

- 背景图片上传功能（保持不变）
- 布局结构调整
- 全屏显示逻辑

## Success Criteria

1. 所有按钮使用 HeroUI Button 组件
2. 配色使用 HeroUI 颜色系统
3. 功能与修改前完全一致
4. 无 TypeScript 类型错误
5. 深色模式样式正确

## Dependencies

- HeroUI v2 组件库已集成
- 现有 FullscreenFocus 组件

## Risks

| Risk | Mitigation |
|------|------------|
| HeroUI Button 样式可能与全屏背景不协调 | 使用 variant="flat" 或自定义 classNames 调整 |
| 圆形按钮样式需要特殊处理 | 使用 isIconOnly + shape="circle" 或自定义 borderRadius |

## Timeline Estimate

- Button 迁移：20 分钟
- 配色更新：10 分钟
- 测试：10 分钟

**总计：约 40 分钟**
