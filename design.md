# Project Design System: Pixel Retro Theme

이 프로젝트는 **고전 게임(8-bit)**의 향수를 불러일으키는 **픽셀 아트(Pixel Art)** 스타일의 디자인 시스템을 따릅니다. 모든 UI 구성 요소는 이 테마에 맞춰 일관성 있게 구현되어야 합니다.

## 1. 핵심 컨셉 (Core Concept)
- **Retro Gaming**: 90년대 게임기 스타일의 투박하지만 따뜻한 감성.
- **Pixelated**: 이미지는 픽셀이 뭉개지지 않게 처리하고, 선은 굵고 명확하게 유지.
- **Hard Border & Shadow**: 부드러운 그림자 대신 명확한 검은색 단색 그림자와 두꺼운 테두리 사용.

## 2. 타이포그래피 (Typography)
- **Primary Font**: `'Press Start 2P', cursive`
  - 모든 주요 텍스트, 제목, 버튼에 사용됩니다.
  - 가독성을 위해 본문(`p` 태그)에는 폰트 크기를 작게(8~10px) 하거나 `line-height`를 충분히(1.5 이상) 줍니다.
- **Fallback Font**: `monospace`, `sans-serif`

## 3. 컬러 팔레트 (Color Palette)
| 용도 | 색상 코드 | 설명 |
| :--- | :--- | :--- |
| **Background (Main)** | `linear-gradient(180deg, #fde047 0%, #facc15 100%)` | 메인 페이지의 밝고 경쾌한 노란색 그라데이션 |
| **Primary Action** | `#a855f7` (Purple) | 시작하기, 입장하기 등 핵심 버튼 |
| **Secondary Action** | `#93c5fd` (Blue) | 글 작성, 수정 등 보조 버튼 |
| **Card / Surface** | `#ffffff` | 콘텐츠를 담는 흰색 배경 |
| **Text (Main)** | `#000000` | 모든 텍스트의 기본 색상 |
| **Text (Sub)** | `#444444`, `#888888` | 설명글이나 작성자 정보 등 부가 정보 |
| **Border / Shadow** | `#000000` | 모든 테두리와 섀도우 처리 |

## 4. UI 패턴 및 요소 (UI Patterns)

### 테두리 및 그림자 (Borders & Shadows)
- **Border**: 기본적으로 `3px` 또는 `4px` 두께의 실선 검은색(`solid #000`)을 사용합니다.
- **Box Shadow**: 부드러운 blur 없이 `4px`에서 `8px` 정도의 오프셋을 가진 단색 검은색을 사용합니다.
  - 예: `box-shadow: 6px 6px 0 #000;`

### 상호작용 (Interactions)
- **Hover Effect**: 버튼이나 클릭 가능한 카드에 마우스를 올리면 요소가 오른쪽 아래로 살짝 내려가고 그림자가 얇아지는 효과를 줍니다.
  - `transform: translate(2px, 2px);`
  - `box-shadow: 2px 2px 0 #000;`
  - `transition: all 0.1s;`

### 애니메이션 (Animations)
- **Floating**: 주요 이미지나 제목에 위아래로 둥둥 떠다니는 효과를 적용합니다.
  - `@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`

### 이미지 처리 (Images)
- **Pixelated**: 픽셀 아트 이미지는 브라우저에서 보간법에 의해 흐려지지 않도록 다음 속성을 적용합니다.
  - `image-rendering: pixelated;`

## 5. 구현 코드 가이드

### 스타일 상수 (React Component)
컴포넌트 내에서 일관된 폰트 적용을 위해 다음과 같은 상수를 활용합니다.
```tsx
const px = { fontFamily: '"Press Start 2P", cursive' } as const;
```

### 버튼 템플릿
```tsx
<button
  style={{
    ...px,
    fontSize: "14px",
    background: "#a855f7",
    color: "#fff",
    border: "4px solid #000",
    boxShadow: "6px 6px 0 #000",
    padding: "20px 40px",
    transition: "all 0.1s",
  }}
>
  확인
</button>
```

---
이 가이드를 준수하여 새로운 페이지나 컴포넌트를 추가할 때 디자인 통일성을 유지해 주세요.
