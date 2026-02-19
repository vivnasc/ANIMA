# 🎨 ANIMA LANDING PAGE - ESPECIFICAÇÕES FINAIS

**Para:** Claude Code  
**Status:** Ready to implement  
**Logos:** Já tens em /uploads (ANIMA, SOMA, SEREN, LUMA, ECHO)

---

## 🎯 VISÃO GERAL

Landing page com:
- Dark elegante (#0a0a0a)
- Motion subtil
- Glass morphism cards
- Tipografia Space Grotesk
- Logos REAIS (não emojis)
- Identidade forte ANIMA

---

## 🎨 DESIGN SYSTEM

### Cores
```css
--bg-dark: #0a0a0a
--bg-card: rgba(20, 20, 20, 0.8)
--text-primary: #ffffff
--text-secondary: #b4b4b4
--text-muted: #6b6b6b
--accent-primary: #7c8adb
--accent-secondary: #a78bfa

/* Mirrors */
--soma-color: #34d399
--seren-color: #60a5fa
--luma-color: #fbbf24
--echo-color: #c084fc
```

### Tipografia
```css
font-family: 'Space Grotesk', sans-serif
/* Headlines: 700 weight */
/* Body: 400-500 weight */
/* Letter-spacing: -0.02em (tight) */
```

### Spacing
```css
--spacing-sm: 1rem
--spacing-md: 1.5rem
--spacing-lg: 2rem
--spacing-xl: 3rem
--spacing-2xl: 4rem
--spacing-3xl: 6rem
```

---

## 📐 ESTRUTURA (Secções)

1. **Navigation** (sticky)
2. **Hero**
3. **Stats Bar**
4. **Testimonials**
5. **How it Works** (timeline)
6. **Mirrors Grid**
7. **Pricing**
8. **FAQ**
9. **CTA**
10. **Footer**

---

## 🧩 COMPONENTES DETALHADOS

### 1. NAVIGATION

**Sticky top, backdrop blur**

```
Logo ANIMA (círculo dividido gradient) + texto
Nav Links: Como Funciona | Espelhos | Preços | FAQ
Actions: [PT EN ES FR] | Entrar | Começar Grátis
```

**Style:**
- Background: rgba(10, 10, 10, 0.85) + blur(20px)
- Border-bottom: 1px rgba(255,255,255,0.06)
- Padding: 1.5rem 0

---

### 2. HERO

**Centro, text-align center**

```html
<Badge>Beta Aberta — Vagas Limitadas</Badge>

<H1>Descobre quem és através
    de conversas profundas</H1>

<Subtitle>Uma jornada estruturada de autoconhecimento 
com 4 espelhos de IA...</Subtitle>

<CTAs>
  [Começar Minha Jornada — Grátis]
  [Ver Como Funciona]
</CTAs>
```

**Style:**
- H1: 4.5rem (responsive), weight 700, gradient text
- Fade-in animations (0.6s ease, stagger 0.1s)
- Buttons: gradient primary + ghost

---

### 3. STATS BAR

**Grid 3 colunas**

```
4           |  4        |  ∞
Espelhos IA | Idiomas   | Profundidade
```

**Style:**
- Numbers: 3rem, gradient text
- Border top/bottom: 1px rgba(255,255,255,0.06)
- Padding: 3rem 0
- Margin: 6rem 0

---

### 4. TESTIMONIALS

**Grid 3 colunas (auto-fit, min 320px)**

Cada card:
```
"Quote text..."

[Avatar A] Ana R.
           Utilizadora Beta
```

**Style:**
- Background: rgba(20,20,20,0.8) + blur(20px)
- Border: 1px rgba(255,255,255,0.06)
- Border-radius: 16px
- Hover: translateY(-4px) + border glow

---

### 5. HOW IT WORKS (Timeline)

**Vertical timeline com linha gradient**

```
Linha vertical gradient (soma→seren→luma→echo)

[Icon] Começa com SOMA
       Description...

[Icon] Progride para SEREN
       Description...

[Icon] Expande com LUMA
       Description...

[Icon] Integra com ECHO
       Description...
```

**Icons:** Usa logos reais SOMA/SEREN/LUMA/ECHO (64x64px)

**Style:**
- Timeline line: 2px, gradient 4 cores
- Dots: 16px círculo, cor do mirror
- Icons: 64px
- Title: 1.75rem, cor do mirror
- Max-width: 800px, center

---

### 6. MIRRORS GRID

**Grid 2x2 (ou 4 colunas se desktop largo)**

Cada card:
```
[Logo 72x72]

SOMA                [Grátis]
Fundação

Description text...
```

**Cards IMPORTANTES:**
- **USA LOGOS REAIS** dos ficheiros PNG
- Hover: glow na cor do mirror + translateY(-6px)
- Border color on hover = cor do mirror
- Background radial gradient subtil (opacity 0.08)

**Style específico:**
```css
.mirror-card {
  background: rgba(20,20,20,0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 3rem 2.5rem;
}

.mirror-card:hover {
  border-color: var(--mirror-color);
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
}

.mirror-soma { --mirror-color: #34d399; }
.mirror-seren { --mirror-color: #60a5fa; }
.mirror-luma { --mirror-color: #fbbf24; }
.mirror-echo { --mirror-color: #c084fc; }
```

---

### 7. PRICING

**Grid 2 colunas**

Card Free:
```
Grátis
€0/mês

✓ 10 conversas por mês
✓ Espelho SOMA completo
✓ Histórico de 30 dias
✓ Dashboard de padrões
✓ Suporte a 4 idiomas

[Começar Grátis]
```

Card Premium (Featured):
```
[Badge: 🔥 Preço de lançamento]

Premium
€9/mês  €19

✓ Conversas ilimitadas
✓ Todos os 4 Espelhos
✓ Histórico ilimitado
✓ Insights cross-mirror
✓ Exportar conversas
✓ Jornadas guiadas
✓ Suporte prioritário

[Começar Premium]
```

**Style:**
- Featured card: border-color accent + shadow glow
- Badge: position absolute, top -14px
- Strike price: opacity 0.5, line-through

---

### 8. FAQ

**Lista de 6 items**

```
[Card] O ANIMA é terapia?
[Card] Os meus dados estão seguros?
[Card] Em que idiomas funciona?
[Card] Posso cancelar quando quiser?
[Card] Como é diferente do ChatGPT?
[Card] Preciso do plano Premium?
```

**Style:**
- Cards: background card + blur
- Hover: border lighten
- Max-width: 800px center

---

### 9. CTA

**Box gradient animado**

```
Começa a tua jornada hoje

Junta-te a centenas de pessoas que estão 
a descobrir-se através de conversas profundas.

[Começar Grátis — Sem Cartão]

Beta aberta com vagas limitadas
```

**Style:**
- Background: linear-gradient(135deg, accent-primary, accent-secondary)
- Border-radius: 24px
- Padding: 6rem 2rem
- Pseudo-element rotating radial gradient
- Button: white bg, accent text

---

### 10. FOOTER

```
[Logo] ANIMA        Privacidade | Termos

────────────────────────────────

Disclaimer: O ANIMA não substitui terapia...

© 2026 ANIMA. Todos os direitos reservados.
```

**Style:**
- Border-top: 1px rgba(255,255,255,0.06)
- Padding: 3rem 0
- Text: muted color

---

## 🎭 ANIMAÇÕES & MOTION

### Background Pattern
```css
.bg-pattern {
  position: fixed;
  radial-gradient com accent colors
  opacity: 0.4
  pointer-events: none
}
```

### Fade In Up
```css
@keyframes fadeInUp {
  from: opacity 0, translateY(20px)
  to: opacity 1, translateY(0)
}
```

Aplicar em:
- Hero badge (delay 0s)
- Hero title (delay 0.1s)
- Hero subtitle (delay 0.2s)
- Hero CTAs (delay 0.3s)

### Hover States
- Cards: translateY(-4px) + border glow
- Buttons: translateY(-1px) + shadow increase
- Links: color lighten

### CTA Box Rotation
```css
@keyframes rotate {
  from: rotate(0deg)
  to: rotate(360deg)
}
```

---

## 📱 RESPONSIVE

### Breakpoints
- Desktop: >1024px
- Tablet: 768-1023px
- Mobile: <768px

### Mobile Changes
```
- Nav links: hide
- Hero title: 2.5rem
- Stats: grid 1 column
- Testimonials: grid 1 column
- Mirrors: grid 1 column
- Pricing: grid 1 column
- Timeline: padding-left 2.5rem
- Footer: stack vertical
```

---

## 🖼️ ASSETS NEEDED

### Logos (já tens em /uploads)
- ANIMA__Logo.png (nav + footer)
- SOMA__Logo.png (timeline + cards)
- SEREN_Logo.png (timeline + cards)
- LUMA_Logo.png (timeline + cards)
- ECHO_Logo.png (timeline + cards)

**IMPORTANTE:** 
- Resize logos para 64x64px (timeline)
- Resize logos para 72x72px (mirror cards)
- Optimizar PNGs

---

## ⚙️ IMPLEMENTATION NOTES

### Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap">
```

### Smooth Scroll
```css
html { scroll-behavior: smooth; }
```

### Glass Morphism
```css
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
```

### Z-index Stack
```
0: bg-pattern
1: content
100: nav (sticky)
```

---

## ✅ CONTENT (Copy Exacto)

### Hero
**Title:** Descobre quem és através de conversas profundas
**Subtitle:** Uma jornada estruturada de autoconhecimento com 4 espelhos de IA. Cada um guia-te numa dimensão diferente do teu crescimento — corpo, mente, consciência e integração.
**CTA1:** Começar Minha Jornada — Grátis
**CTA2:** Ver Como Funciona

### Timeline
**SOMA Title:** Começa com SOMA
**SOMA Desc:** Explora a tua relação com o corpo e fundações emocionais. O SOMA lembra cada insight para construir sobre eles.

**SEREN Title:** Progride para SEREN
**SEREN Desc:** Trabalha ansiedade e regulação emocional. O SEREN usa os padrões do SOMA para ir mais fundo.

**LUMA Title:** Expande com LUMA
**LUMA Desc:** Questiona crenças limitantes e expande a tua consciência. O LUMA conecta insights dos espelhos anteriores.

**ECHO Title:** Integra com ECHO
**ECHO Desc:** Identifica os padrões que ecoam na tua vida e integra toda a jornada numa visão unificada.

### Mirrors
**SOMA:** Explora tua relação com corpo e nutrição emocional. Fundamenta-te no físico.
**SEREN:** Trabalha ansiedade, padrões de pensamento e regulação emocional.
**LUMA:** Expande consciência e questiona as crenças que te limitam.
**ECHO:** Identifica padrões que ecoam na tua vida e integra toda a jornada.

---

## 🎯 PRIORIDADES

1. **CRÍTICO:** Usar logos REAIS (não emojis, não SVG inline)
2. **CRÍTICO:** Cores exactas dos mirrors
3. **CRÍTICO:** Glass morphism nos cards
4. **IMPORTANTE:** Animações fade-in
5. **IMPORTANTE:** Hover states nos mirrors
6. **BOM TER:** CTA box rotation animation

---

## 📦 DELIVERABLE

Ficheiro único: `index.html`
- Self-contained (CSS inline)
- Logos como `<img src="...">`
- Responsive
- Optimizado
- ~500 linhas HTML+CSS

---

**FIM DAS SPECS - PRONTO PARA IMPLEMENTAR** ✅
