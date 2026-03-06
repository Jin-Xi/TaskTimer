/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    // HeroUI components
    "./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ChronoFlow 品牌核心色 - Green Theme
        green: {
          50: '#F4F8F2',   // 极浅背景
          100: '#E8F5BD',  // Accent Light - 时间块底色
          200: '#C7EABB',  // Surface Green - 选中卡片背景
          300: '#A2CB8B',  // Secondary Green - 进度条、次要按钮
          400: '#84B179',  // Primary Green - 核心操作按钮
          500: '#6A9662',  // 悬停状态
          600: '#507B4A',  // 按下状态
          700: '#366032',  // 深色模式文本
          800: '#2C3628',  // Ink Text - 墨绿灰
          900: '#1C2B1D',  // 深色模式背景
        },

        // 中性色 - 带植被温度的灰色
        neutral: {
          50: '#FBFDF9',   // App Base - SPA 底层背景
          100: '#F0F3EC',  // Component Surface - 任务列表、看板列背景
          200: '#E0E8DE',  // 边框、分割线
          300: '#CDD9CC',  // 禁用状态边框
          400: '#B3C5AF',  // 占位符图标
          500: '#99B192',
          600: '#7F9D75',
          700: '#658958',
          800: '#5C6B57',  // Muted Text - 次要文本、时间戳
          900: '#2C3628',  // Ink Text - 主标题、正文
          950: '#1A2419',  // 深色模式深层背景
        },

        // 进行中状态 - Ochre (赭土黄)
        ochre: {
          50: '#FDF6EB',
          100: '#FAEBD6',
          200: '#E5D6A8',
          300: '#E5A952',  // 主色 - 进行中、聚焦计时
          400: '#D4943D',
          500: '#C27F28',
          600: '#A0651D',
          700: '#7E4B12',
          800: '#5C3107',
          900: '#3A1700',
        },

        // 阻塞/危险状态 - Terracotta (陶土红)
        terracotta: {
          50: '#FDF2F0',
          100: '#FBE6E1',
          200: '#F0CDC4',
          300: '#E5B4A7',
          400: '#D27D67',  // 主色 - 阻塞、逾期、危险操作
          500: '#BC6250',
          600: '#A14739',
          700: '#862C22',
          800: '#6B1112',
          900: '#4F060A',
        },

        // AI 交互色 - Slate River (石板溪蓝)
        'slate-river': {
          50: '#F1F5F6',
          100: '#E3EBED',
          200: '#C7D5D9',
          300: '#9DBABF',
          400: '#6B8E9B',  // 主色 - AI 聊天气泡、AI 建议
          500: '#567580',
          600: '#415C65',
          700: '#2C434A',
          800: '#172A30',
          900: '#021116',
        },

        // 别名 - 方便使用
        'green-50': '#F4F8F2',
        'green-100': '#E8F5BD',
        'green-200': '#C7EABB',
        'green-300': '#A2CB8B',
        'green-400': '#84B179',
        'green-500': '#6A9662',
        'green-600': '#507B4A',
        'green-700': '#366032',
        'green-800': '#2C3628',
        'green-900': '#1C2B1D',
        'neutral-50': '#FBFDF9',
        'neutral-100': '#F0F3EC',
        'neutral-200': '#E0E8DE',
        'neutral-300': '#CDD9CC',
        'neutral-400': '#B3C5AF',
        'neutral-500': '#99B192',
        'neutral-600': '#7F9D75',
        'neutral-700': '#658958',
        'neutral-800': '#5C6B57',
        'neutral-900': '#2C3628',
        'neutral-950': '#1A2419',
        'ochre-300': '#E5A952',
        'terracotta-400': '#D27D67',
        'slate-river-400': '#6B8E9B',

        // 兼容颜色 - 保留部分原有颜色
        slate: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
          950: '#020617',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        emerald: {
          50: '#d1fae5',
          100: '#a7f3d0',
          200: '#6ee7b7',
          300: '#34d399',
          400: '#10b981',
          500: '#059669',
          600: '#047857',
          700: '#065f46',
          800: '#064e3b',
          900: '#022c22',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        fuchsia: {
          50: '#fae8ff',
          100: '#f5d0fe',
          200: '#f0abfc',
          300: '#e879f9',
          400: '#d946ef',
          500: '#c026d3',
          600: '#a21caf',
          700: '#86198f',
          800: '#701a75',
          900: '#4a044e',
        },
        amber: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        cyan: {
          50: '#cffafe',
          100: '#a5f3fc',
          200: '#67e8f9',
          300: '#22d3ee',
          400: '#06b6d4',
          500: '#0891b2',
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#083344',
        },
      },
      backgroundImage: {
        'dot-pattern': "radial-gradient(#84B179 0.5px, transparent 0.5px)",
        'dot-pattern-subtle': "radial-gradient(#84B179 0.3px, transparent 0.3px)",
        'dot-pattern-dark': "radial-gradient(#6A9662 0.5px, transparent 0.5px)",
        'organic-pattern': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzg0QjE3OSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')",
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(44, 54, 40, 0.08)',
        'soft-lg': '0 8px 24px rgba(44, 54, 40, 0.12)',
        'green': '0 4px 12px rgba(132, 177, 121, 0.25)',
        'ochre': '0 4px 12px rgba(229, 169, 82, 0.25)',
        'terracotta': '0 4px 12px rgba(210, 125, 103, 0.25)',
        'slate-river': '0 4px 12px rgba(107, 142, 155, 0.25)',
      },
      borderRadius: {
        'soft': '0.75rem',
        'softer': '1rem',
      },
    },
  },
  plugins: [],
}
