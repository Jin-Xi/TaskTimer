# Motion Polish 2025 - 设计文档

## Context

### 当前状态

ChronoFlow 应用目前使用基本的 CSS 过渡效果：
- Tab 切换：内容瞬间切换，无过渡动画
- 列表渲染：所有项目同时出现
- 按钮交互：简单的 hover 状态变化
- HeroUI Modal：已使用内置的 motionProps 动画

### 约束条件

- **依赖**: Framer Motion v12 已通过 HeroUI v2 引入，无需额外安装
- **性能**: 避免过度动画影响低端设备性能
- **兼容性**: 必须支持 prefers-reduced-motion 媒体查询
- **维护性**: 动画代码应模块化、可复用
- **HeroUI 集成**: 现有 HeroUI 组件需要保留兼容

## Goals / Non-Goals

**Goals:**
- 提供流畅的交互动画，增强视觉品质
- 使用 Framer Motion 实现弹簧物理效果
- 创建可复用的动画组件和配置
- 保持现有 HeroUI 组件功能不变
- 确保动画不影响核心功能性能

**Non-Goals:**
- 重新设计应用布局或 UI 风格
- 添加 3D 效果或复杂粒子动画
- 修改 HeroUI 组件的内部实现
- 为每个微小交互添加动画（追求适当的平衡）

## Decisions

### 决策 1: 直接使用 Framer Motion 而非仅通过 HeroUI

**选择**: 直接从 `framer-motion` 导入使用

**理由**:
- HeroUI v2 的 motionProps 仅限于 Modal 等少数组件
- 直接使用 Framer Motion 提供完整的 API 访问
- 需要使用 AnimatePresence、motion.div 等 HeroUI 未暴露的功能

**替代方案**: 仅使用 HeroUI 的 motionProps
- ❌ 功能受限，无法实现 Tab 切换等复杂动画

### 决策 2: Spring 参数优先于固定时长

**选择**: 主要使用 spring 物理效果 (`type: "spring"`)

**理由**:
- Spring 动画更自然，有"生命感"
- Framer Motion 的 spring 性能经过优化
- 更符合现代应用动画趋势

**配置**:
```javascript
{
  snappy: { type: "spring", stiffness: 400, damping: 17 },
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 200, damping: 20 }
}
```

### 决策 3: 创建动画组件层次结构

**选择**: 创建专门的动画组件和配置文件

**架构**:
```
src/
├── animations/
│   ├── springs.ts      # Spring 参数常量
│   ├── variants.ts     # 通用动画变体
│   └── components/
│       ├── AnimatedPage.tsx      # Tab 切换容器
│       ├── StaggeredList.tsx    # 列表交错动画
│       └── MotionButton.tsx     # 按钮动画包装
```

**理由**:
- 动画逻辑集中管理
- 便于统一调整动画风格
- 方便单元测试

### 决策 4: 渐进式实施顺序

**选择**: 按视觉影响优先级实施

**顺序**:
1. Tab 切换动画（最明显的"生硬"点）
2. 列表交错动画
3. 按钮点击反馈
4. 任务状态变化动画

**理由**:
- 早期实施带来最大视觉提升
- 便于逐步验证和调整
- 降低实施风险

### 决策 5: prefers-reduced-motion 支持

**选择**: 检测并尊重用户的动画偏好设置

**实现**:
```javascript
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

**理由**:
- 无障碍访问要求
- 部分用户可能对动画感到不适
- WCAG 2.1 可访问性指南推荐

## Risks / Trade-offs

### 风险 1: 性能影响

**描述**: 过度动画可能导致低端设备卡顿

**缓解措施**:
- [ ] 使用 CSS `will-change` 谨慎（仅对频繁动画的元素）
- [ ] 大列表（>100 项）禁用交错动画
- [ ] 在低端设备检测中禁用部分动画
- [ ] 使用 React.memo 优化渲染性能

### 风险 2: 动画与 HeroUI 组件冲突

**描述**: 直接使用 Framer Motion 可能与 HeroUI 组件产生样式冲突

**缓解措施**:
- [ ] 使用 `className` 合并而非直接修改 HeroUI 组件
- [ ] 创建包装组件而非修改原组件
- [ ] 测试所有 HeroUI 组件与动画的兼容性

### 风险 3: 维护复杂度增加

**描述**: 新增动画代码增加了维护成本

**缓解措施**:
- [ ] 创建统一的动画配置文件
- [ ] 编写动画使用文档和示例
- [ ] 定期审查和清理不必要的动画
- [ ] 保持动画代码模块化

### 风险 4: Spring 参数调优困难

**描述**: Spring 参数（stiffness, damping）调优需要经验

**缓解措施**:
- [ ] 定义预配置的 spring 常量（snappy/smooth/bouncy）
- [ ] 提供参数调优指南
- [ ] 在开发环境中使用 `framer-motion devtools` 调试

## Open Questions

1. **Tab 切换动画是否需要方向感知？**
   - 是否需要根据 Tab 的顺序决定滑动方向？
   - 还是用统一的淡入淡出即可？

2. **列表交错动画的触发时机？**
   - 仅在初始加载时交错？
   - 还是在过滤/排序后也重新交错？

3. **是否需要全局动画开关？**
   - 允许用户完全禁用动画（独立于系统设置）？
   - 这可能需要在用户设置中添加动画偏好选项
