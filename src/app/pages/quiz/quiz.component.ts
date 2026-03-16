import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { gsap } from 'gsap';

type SkinType = 'dry' | 'oily' | 'combo' | 'normal' | 'sensitive';
type Phase = 'intro' | 'quiz' | 'result';

interface QuizAnswer {
  emoji: string;
  text: string;
  scores: Record<SkinType, number>;
}

interface QuizQuestion {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  tipTitle: string;
  tip: string;
  answers: QuizAnswer[];
}

interface SkinResult {
  type: SkinType;
  nickname: string;
  emoji: string;
  tagline: string;
  description: string;
  loves: string;
  avoid: string;
  productRanks: number[];
  gradient: string;
  accentColor: string;
}

interface Product {
  rank: number;
  brand: string;
  shortName: string;
  price: number;
  salePrice: number | null;
  image: string;
  whyItWorks: Record<SkinType, string>;
}

interface RoutineStep {
  step: number;
  label: string;
  instruction: string;
  brand: string;
  productName: string;
  image: string;
  price: number;
  salePrice: number | null;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit, AfterViewInit, OnDestroy {

  phase: Phase = 'intro';
  currentQ = 0;
  selectedIdx: number | null = null;
  answers: (number | null)[] = Array(7).fill(null);
  tipOpen = false;
  isAnimating = false;
  skinType: SkinType | null = null;
  scores: Record<SkinType, number> = { dry: 0, oily: 0, combo: 0, normal: 0, sensitive: 0 };
  prodIdx = 0;
  routineIdx = 0;

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef
  ) {}

  questions: QuizQuestion[] = [
    {
      id: 1,
      emoji: '🪞',
      title: 'On a typical day, a few hours after washing your face, how does your skin feel without any products on?',
      subtitle: 'Think about your usual pattern — not one random day',
      tipTitle: '💡 How to think about this',
      tip: 'Don\'t think about your skin right now or one unusual day. Think about what happens most of the time — what your skin is like on a boring average Tuesday when nothing unusual is going on.',
      answers: [
        { emoji: '😣', text: 'Tight, uncomfortable, sometimes flaky — like it\'s thirsty', scores: { dry: 4, oily: 0, combo: 1, normal: 0, sensitive: 1 } },
        { emoji: '😊', text: 'Comfortable and normal — no real issues most days', scores: { dry: 0, oily: 1, combo: 1, normal: 4, sensitive: 1 } },
        { emoji: '✨', text: 'Shiny and greasy all over — forehead, nose, cheeks, chin', scores: { dry: 0, oily: 4, combo: 1, normal: 0, sensitive: 0 } },
        { emoji: '🌗', text: 'Oily on my forehead and nose, but normal or dry on cheeks', scores: { dry: 0, oily: 1, combo: 4, normal: 1, sensitive: 0 } },
        { emoji: '🔴', text: 'Itchy, red, or irritated — my skin overreacts often', scores: { dry: 1, oily: 0, combo: 0, normal: 0, sensitive: 4 } },
      ]
    },
    {
      id: 2,
      emoji: '🔍',
      title: 'When you look at your skin in photos or a close mirror, what do you typically notice about your pores?',
      subtitle: 'Based on your general experience, not right this second',
      tipTitle: '💡 Where to look',
      tip: 'Pores are most visible on the nose, just beside the nostrils, and the forehead. Compare those to your cheekbones — most people notice a size difference between these zones, which is a strong combo skin signal.',
      answers: [
        { emoji: '🌸', text: 'Very smooth — I can barely see any pores anywhere', scores: { dry: 3, oily: 0, combo: 0, normal: 3, sensitive: 2 } },
        { emoji: '👁️', text: 'Small pores but nothing that bothers me', scores: { dry: 1, oily: 1, combo: 2, normal: 4, sensitive: 1 } },
        { emoji: '😮', text: 'My nose and forehead pores are clearly visible, cheeks less so', scores: { dry: 0, oily: 2, combo: 4, normal: 1, sensitive: 0 } },
        { emoji: '😬', text: 'My pores are obviously large and visible all over my face', scores: { dry: 0, oily: 4, combo: 2, normal: 0, sensitive: 0 } },
      ]
    },
    {
      id: 3,
      emoji: '☀️',
      title: 'On a typical afternoon — say around 2-4pm — how oily or shiny does your face usually get?',
      subtitle: 'Think about a regular weekday, nothing extreme',
      tipTitle: '💡 Why afternoon is the benchmark',
      tip: 'Midday is when your sebaceous glands have been working for 6-8 hours since your morning routine. How much oil you produce by afternoon is one of the most reliable indicators of your overall skin type. Think about whether you blot, whether you look shiny in group photos, or whether your makeup breaks down.',
      answers: [
        { emoji: '✨', text: 'Zero shine — my face stays completely matte all day', scores: { dry: 4, oily: 0, combo: 0, normal: 2, sensitive: 1 } },
        { emoji: '🌟', text: 'A tiny natural glow but nothing I\'d call greasy', scores: { dry: 1, oily: 1, combo: 1, normal: 4, sensitive: 1 } },
        { emoji: '💦', text: 'My whole face gets shiny — I feel like I need to blot constantly', scores: { dry: 0, oily: 4, combo: 1, normal: 0, sensitive: 0 } },
        { emoji: '🌗', text: 'My forehead and nose get oily but my cheeks stay fairly normal', scores: { dry: 0, oily: 1, combo: 4, normal: 1, sensitive: 0 } },
      ]
    },
    {
      id: 4,
      emoji: '📸',
      title: 'When you see a photo of yourself taken in natural light (no filter), what does your skin typically look like?',
      subtitle: 'Think about candid photos — not ones you posed for',
      tipTitle: '💡 Candid photos don\'t lie',
      tip: 'Posed photos in good lighting are flattering — candid ones are honest. Think about group photos, Zoom calls without beauty filters, or photos taken on a sunny day. Shiny skin reflects light brightly; dry skin looks matte or slightly ashy; sensitive skin may show redness around the nose or cheeks.',
      answers: [
        { emoji: '😐', text: 'Dull or flat — like my skin needs more hydration or glow', scores: { dry: 4, oily: 0, combo: 1, normal: 0, sensitive: 1 } },
        { emoji: '😍', text: 'Balanced and healthy — not shiny, not dull', scores: { dry: 0, oily: 0, combo: 1, normal: 4, sensitive: 1 } },
        { emoji: '📸', text: 'Very shiny and reflective — I\'m always the "glowy" one in photos', scores: { dry: 0, oily: 4, combo: 1, normal: 0, sensitive: 0 } },
        { emoji: '🌟', text: 'Shiny on my nose and forehead, normal on my cheeks', scores: { dry: 0, oily: 1, combo: 4, normal: 1, sensitive: 0 } },
      ]
    },
    {
      id: 5,
      emoji: '🧪',
      title: 'When you try a new product — cleanser, serum, moisturizer — how does your skin usually respond in the first few days?',
      subtitle: 'Think about your general track record with new products',
      tipTitle: '💡 What counts as a reaction',
      tip: 'A reaction doesn\'t have to be dramatic. It can be subtle: a slight sting when applying, skin feeling tight after a new wash, a few small bumps appearing, or skin looking more flushed than usual. If you\'ve been using the same products for years and haven\'t switched, think about how your skin reacts to fragrances or new fabrics on your face.',
      answers: [
        { emoji: '✅', text: 'Usually fine — I can switch products without issues', scores: { dry: 1, oily: 1, combo: 1, normal: 4, sensitive: 0 } },
        { emoji: '❄️', text: 'Things often feel drying — my skin gets tighter or starts to flake', scores: { dry: 4, oily: 0, combo: 1, normal: 0, sensitive: 1 } },
        { emoji: '🔴', text: 'I often get redness, stinging, or breakouts from new products', scores: { dry: 0, oily: 0, combo: 0, normal: 0, sensitive: 4 } },
        { emoji: '💧', text: 'Heavy or rich products make me break out or look oilier', scores: { dry: 0, oily: 4, combo: 1, normal: 0, sensitive: 0 } },
      ]
    },
    {
      id: 6,
      emoji: '💬',
      title: 'Which of these sounds most like what your skin deals with on a regular basis?',
      subtitle: 'Pick the one that\'s most consistently true for you',
      tipTitle: '💡 Pick your most common complaint',
      tip: 'Don\'t overthink — just go with your gut. What\'s the most common thing you notice about your skin on a regular week? Not your worst day or best day, but your average.',
      answers: [
        { emoji: '🏜️', text: 'It\'s always a bit dry — feels like it needs more moisture', scores: { dry: 4, oily: 0, combo: 0, normal: 0, sensitive: 1 } },
        { emoji: '🫧', text: 'It gets shiny and greasy faster than I\'d like', scores: { dry: 0, oily: 4, combo: 1, normal: 0, sensitive: 0 } },
        { emoji: '😤', text: 'My T-zone is oily but my cheeks behave completely differently', scores: { dry: 1, oily: 1, combo: 4, normal: 0, sensitive: 0 } },
        { emoji: '🌺', text: 'It reacts to almost everything — products, weather, stress', scores: { dry: 0, oily: 0, combo: 0, normal: 0, sensitive: 4 } },
        { emoji: '😌', text: 'Honestly pretty low maintenance — no major ongoing issues', scores: { dry: 0, oily: 0, combo: 1, normal: 4, sensitive: 0 } },
      ]
    },
    {
      id: 7,
      emoji: '🌅',
      title: 'When you wake up in the morning before touching your face, what does your skin typically feel like?',
      subtitle: 'Your overnight skin behavior tells a lot',
      tipTitle: '💡 Why morning skin matters',
      tip: 'Your skin has been working all night without products interfering. What you wake up with reflects your true sebum production rate. Oily skin produces a lot overnight; dry skin loses moisture; combo skin is oily in the T-zone but fine on the cheeks. Think about what\'s typical for you, not just today.',
      answers: [
        { emoji: '🏜️', text: 'Tight and dry — I want to moisturize immediately', scores: { dry: 4, oily: 0, combo: 0, normal: 0, sensitive: 1 } },
        { emoji: '✅', text: 'Comfortable and balanced — no rush to do anything', scores: { dry: 0, oily: 0, combo: 1, normal: 4, sensitive: 1 } },
        { emoji: '💦', text: 'Oily all over — my face feels greasy before I even start my routine', scores: { dry: 0, oily: 4, combo: 1, normal: 0, sensitive: 0 } },
        { emoji: '🌗', text: 'Oily on my forehead and nose, but normal on my cheeks', scores: { dry: 0, oily: 1, combo: 4, normal: 1, sensitive: 0 } },
        { emoji: '🔥', text: 'Sometimes red, irritated, or reactive — even after a calm night', scores: { dry: 0, oily: 0, combo: 0, normal: 0, sensitive: 4 } },
      ]
    },
  ];

  skinResults: Record<SkinType, SkinResult> = {
    dry: {
      type: 'dry', nickname: 'Desert Rose', emoji: '🌵',
      tagline: 'Your skin craves hydration above all else',
      description: 'Your skin doesn\'t produce enough natural oil (sebum), which means it loses moisture quickly. This often leads to tightness, flakiness, and a dull appearance — but with the right products, you can achieve that plump, dewy Korean glass skin look.',
      loves: 'Hyaluronic acid, ceramides, squalane, rich creams, sheet masks',
      avoid: 'Foaming cleansers, alcohol-based toners, over-exfoliating, mattifying products',
      productRanks: [1, 3, 9, 10, 2, 12],
      gradient: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5c4 100%)',
      accentColor: '#c4855a'
    },
    oily: {
      type: 'oily', nickname: 'Glass Glow', emoji: '✨',
      tagline: 'Your skin produces too much sebum — use it as a superpower',
      description: 'Oily skin overproduces sebum, which can cause shine, enlarged pores, and breakouts. BUT — oily skin ages slower and naturally stays more hydrated. K-beauty doesn\'t fight oil, it balances it with lightweight, non-comedogenic formulas.',
      loves: 'Niacinamide, PDRN, low-weight serums, gentle cleansers, balancing toners',
      avoid: 'Heavy creams, pore-clogging oils, skipping moisturizer (makes it worse!)',
      productRanks: [5, 8, 6, 11, 4, 12],
      gradient: 'linear-gradient(135deg, #e8f4f0 0%, #d4edea 100%)',
      accentColor: '#2d9b8a'
    },
    combo: {
      type: 'combo', nickname: 'Two Worlds', emoji: '☯️',
      tagline: 'Different rules for your T-zone vs your cheeks',
      description: 'Combination skin has two personalities: an oily T-zone (forehead, nose, chin) and dry or normal cheeks. It\'s the most common skin type and needs a layered approach — lightweight on the T-zone, richer where it\'s dry.',
      loves: 'Balancing serums, lightweight moisturizers, gentle exfoliants, toners with BHA',
      avoid: 'Very heavy creams all over, ignoring either zone, harsh stripping cleansers',
      productRanks: [4, 3, 5, 12, 6, 9],
      gradient: 'linear-gradient(135deg, #f0e8f5 0%, #e4d5f0 100%)',
      accentColor: '#8a5cb4'
    },
    normal: {
      type: 'normal', nickname: 'Lucky Girl', emoji: '🌸',
      tagline: 'Your skin is naturally balanced — protect what you have',
      description: 'Normal skin has a balanced oil-moisture ratio, minimal sensitivity, and small pores. Lucky you! Your job is maintenance and prevention — keeping your skin hydrated, protected from UV damage, and glowing.',
      loves: 'Antioxidant serums, SPF every day, light moisturizers, gentle cleansing',
      avoid: 'Over-complicating your routine, harsh actives you don\'t need, skipping SPF',
      productRanks: [1, 2, 10, 3, 8, 11],
      gradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
      accentColor: '#e91e8c'
    },
    sensitive: {
      type: 'sensitive', nickname: 'Soft Petal', emoji: '🌼',
      tagline: 'Your skin barrier is delicate — less is more',
      description: 'Sensitive skin reacts easily to ingredients, environmental changes, and stress. The goal is to strengthen your skin\'s protective barrier with calming, fragrance-free formulas. K-beauty is actually perfect for you — Korean brands lead in gentle, skin-barrier-first formulas.',
      loves: 'Centella asiatica, madecassoside, ceramides, fragrance-free everything, PDRN',
      avoid: 'Fragrances, alcohol, strong acids, vitamin C at high concentrations, too many actives at once',
      productRanks: [11, 12, 9, 3, 2, 6],
      gradient: 'linear-gradient(135deg, #fff9e6 0%, #fff0c2 100%)',
      accentColor: '#c49a00'
    }
  };

  products: Product[] = [
    { rank: 1, brand: "d'Alba", shortName: "White Truffle Spray Serum", price: 70, salePrice: 41.20,
      image: 'https://cdn-image.oliveyoung.com/display/1124/3e428fad-d1b1-41f0-b7f1-e00555d8cf8c.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Delivers 3 types of hyaluronic acid to deeply plump dry skin', oily: 'Lightweight spray absorbs instantly without adding grease', combo: 'Hydrates dry areas without overwhelming oily zones', normal: 'The spray format makes daily hydration effortless', sensitive: 'Fragrance-free formula won\'t trigger reactions' } },
    { rank: 2, brand: "S.NATURE", shortName: "Aqua Squalane Cream 1+1", price: 50, salePrice: 27.32,
      image: 'https://cdn-image.oliveyoung.com/display/1650/6b15bb5b-196b-4f62-8816-a51bfe856442.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Squalane mimics your skin\'s natural oils to lock in moisture', oily: 'Squalane is non-comedogenic — hydrates without clogging', combo: 'Balances both zones without heaviness', normal: 'Lightweight cream maintains your natural balance', sensitive: 'Squalane is one of the gentlest moisturizing ingredients' } },
    { rank: 3, brand: "Torriden", shortName: "Dive-In HA Serum Refill Set", price: 42, salePrice: 31.50,
      image: 'https://cdn-image.oliveyoung.com/display/1291/5ed4a9c1-d3b8-4cff-8be0-1c42c175158e.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: '5 molecular weights of HA penetrate deep to hydrate parched skin', oily: 'Replaces heavy moisturizer — oil-free hydration', combo: 'Lightweight hydration that won\'t worsen your T-zone', normal: 'The gold-standard hydrating serum for healthy skin', sensitive: 'Minimal ingredients, no fragrance — gentle and effective' } },
    { rank: 4, brand: "Anua", shortName: "PDRN HA Capsule Serum", price: 67, salePrice: 34.84,
      image: 'https://cdn-image.oliveyoung.com/display/1361/ccb287b1-36cb-4e23-a3fb-b1a42b6db27e.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'PDRN repairs and HA hydrates — double duty for dry skin', oily: 'PDRN helps regulate sebum production long-term', combo: 'Targets oil control in T-zone while hydrating cheeks', normal: 'Advanced repair + hydration for optimal skin health', sensitive: 'PDRN promotes healing and reduces inflammation' } },
    { rank: 5, brand: "beplain", shortName: "Mung Bean Cleansing Foam", price: 31, salePrice: 29.68,
      image: 'https://cdn-image.oliveyoung.com/display/1927/fcabb81a-7d60-4b8e-8c6d-4d167942e2a0.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Mild formula cleanses without stripping your skin\'s natural oils', oily: 'Mung bean extracts deeply cleanse and control sebum effectively', combo: 'pH-balanced to clean T-zone without drying cheeks', normal: 'Gentle daily cleanser that won\'t disrupt your natural balance', sensitive: 'pH-balanced foam is safe for reactive skin' } },
    { rank: 6, brand: "medicube", shortName: "PDRN Pink Peptide Ampoule", price: 54, salePrice: 28.87,
      image: 'https://cdn-image.oliveyoung.com/display/1124/b45371a5-5b3c-4604-af42-f83ecc9852d9.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Peptides strengthen skin structure while PDRN boosts hydration', oily: 'Regulates oil production at the cellular level', combo: 'Balances skin activity in both oily and dry zones', normal: 'Anti-aging + brightening for already-healthy skin', sensitive: 'Repairs skin barrier with DNA-repairing PDRN technology' } },
    { rank: 8, brand: "ma:nyo", shortName: "Pure Cleansing Oil Double", price: 43, salePrice: 30.10,
      image: 'https://cdn-image.oliveyoung.com/display/1587/93d560ea-8311-43da-bd44-9d6b1082d91d.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Oil cleansing nourishes dry skin while removing makeup', oily: 'Oil dissolves sebum better than water — paradoxically perfect for oily skin', combo: 'Melts all impurities without disrupting skin\'s balance', normal: 'The most effective makeup removal for healthy skin', sensitive: 'Fragrance-free oil cleanser is gentle enough for reactive skin' } },
    { rank: 9, brand: "ongredients", shortName: "Skin Barrier Calming Lotion", price: 47, salePrice: null,
      image: 'https://cdn-image.oliveyoung.com/display/1164/c84db808-8a07-4a2e-896e-86552013a02a.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Ceramides and humectants restore moisture to parched skin', oily: 'Lightweight lotion hydrates without triggering oil production', combo: 'Barrier repair formula works on all skin zones', normal: 'Maintains your natural barrier to keep skin resilient', sensitive: 'Barrier-focused formula designed specifically for reactive skin' } },
    { rank: 10, brand: "BIOHEAL BOH", shortName: "Probioderm 3D Lifting Cream", price: 82, salePrice: null,
      image: 'https://cdn-image.oliveyoung.com/display/1263/9f574a14-a156-403e-923c-c1a65398eed7.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Rich probiotic cream deeply nourishes and plumps dry skin', oily: 'Use just a thin layer — probiotics balance skin microbiome', combo: 'Apply generously to cheeks, lightly on T-zone', normal: 'Firming + probiotic formula for long-term skin health', sensitive: 'Probiotic formula strengthens skin barrier from within' } },
    { rank: 11, brand: "MEDIHEAL", shortName: "Madecassoside Blemish Serum", price: 49, salePrice: 30.40,
      image: 'https://cdn-image.oliveyoung.com/display/1938/07929254-2989-4529-a767-2111e0ab7564.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Madecassoside repairs skin while keeping it deeply moisturized', oily: 'Targets blemishes and congestion without drying skin out', combo: 'Clears blemishes while repairing the skin barrier', normal: 'Preventative blemish control and barrier strengthening', sensitive: 'Madecassoside is one of the most studied calming ingredients in K-beauty' } },
    { rank: 12, brand: "Torriden", shortName: "Dive-in Soothing Cream", price: 49, salePrice: 36.75,
      image: 'https://cdn-image.oliveyoung.com/display/1141/9697bcba-7257-4226-85d3-c8cc1fc0f20b.jpg?RS=315x420&SF=webp&QT=80',
      whyItWorks: { dry: 'Hyaluronic acid cream seals in moisture all night', oily: 'Lightweight gel-cream hydrates without the grease', combo: 'Perfect finishing cream for combination skin', normal: 'The perfect finishing moisturizer for dewy glass skin', sensitive: 'Fragrance-free, minimal ingredients — the gold standard for sensitive skin' } },
  ];

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQ];
  }

  get progress(): number {
    return ((this.currentQ) / this.questions.length) * 100;
  }

  get progressComplete(): number {
    if (this.phase === 'result') return 100;
    const answered = this.answers.filter(a => a !== null).length;
    return (answered / this.questions.length) * 100;
  }

  get currentResult(): SkinResult | null {
    if (!this.skinType) return null;
    return this.skinResults[this.skinType];
  }

  get recommendedProducts6(): (Product & { whyText: string })[] {
    if (!this.skinType || !this.currentResult) return [];
    return this.currentResult.productRanks
      .map(rank => {
        const p = this.products.find(pr => pr.rank === rank);
        if (!p) return null;
        return { ...p, whyText: p.whyItWorks[this.skinType!] };
      })
      .filter((p): p is (Product & { whyText: string }) => p !== null);
  }

  routines: Record<SkinType, RoutineStep[]> = {
    dry: [
      { step: 1, label: 'CLEANSE', instruction: 'Massage onto dry face, emulsify with water and rinse — nourishes as it cleanses', brand: 'ma:nyo', productName: 'Pure Cleansing Oil Double', image: 'https://cdn-image.oliveyoung.com/display/1587/93d560ea-8311-43da-bd44-9d6b1082d91d.jpg?RS=315x420&SF=webp&QT=80', price: 43, salePrice: 30.10 },
      { step: 2, label: 'ESSENCE', instruction: 'Pat 3 light layers onto damp skin — the heart of Korean glass skin', brand: 'Torriden', productName: 'Dive-In HA Serum', image: 'https://cdn-image.oliveyoung.com/display/1291/5ed4a9c1-d3b8-4cff-8be0-1c42c175158e.jpg?RS=315x420&SF=webp&QT=80', price: 42, salePrice: 31.50 },
      { step: 3, label: 'SERUM', instruction: 'Spray 3-4 pumps and press gently into skin — instant plump', brand: "d'Alba", productName: 'White Truffle Spray Serum', image: 'https://cdn-image.oliveyoung.com/display/1124/3e428fad-d1b1-41f0-b7f1-e00555d8cf8c.jpg?RS=315x420&SF=webp&QT=80', price: 70, salePrice: 41.20 },
      { step: 4, label: 'MOISTURIZE', instruction: 'Apply a generous layer and let it fully absorb — squalane mimics your skin\'s natural oils', brand: 'S.NATURE', productName: 'Aqua Squalane Cream', image: 'https://cdn-image.oliveyoung.com/display/1650/6b15bb5b-196b-4f62-8816-a51bfe856442.jpg?RS=315x420&SF=webp&QT=80', price: 50, salePrice: 27.32 },
      { step: 5, label: 'REPAIR', instruction: 'Final PM step — probiotics rebuild your barrier while you sleep', brand: 'BIOHEAL BOH', productName: 'Probioderm 3D Lifting Cream', image: 'https://cdn-image.oliveyoung.com/display/1263/9f574a14-a156-403e-923c-c1a65398eed7.jpg?RS=315x420&SF=webp&QT=80', price: 82, salePrice: null },
    ],
    oily: [
      { step: 1, label: 'CLEANSE', instruction: 'Work into a foam with water — removes excess sebum without stripping moisture', brand: 'beplain', productName: 'Mung Bean Cleansing Foam', image: 'https://cdn-image.oliveyoung.com/display/1927/fcabb81a-7d60-4b8e-8c6d-4d167942e2a0.jpg?RS=315x420&SF=webp&QT=80', price: 31, salePrice: 29.68 },
      { step: 2, label: 'BALANCE', instruction: 'Press 2-3 drops into skin — regulates oil at the cellular level over time', brand: 'medicube', productName: 'PDRN Pink Peptide Ampoule', image: 'https://cdn-image.oliveyoung.com/display/1124/b45371a5-5b3c-4604-af42-f83ecc9852d9.jpg?RS=315x420&SF=webp&QT=80', price: 54, salePrice: 28.87 },
      { step: 3, label: 'HYDRATE', instruction: 'Oily skin still needs hydration — skipping this makes oil production worse', brand: 'Torriden', productName: 'Dive-In HA Serum', image: 'https://cdn-image.oliveyoung.com/display/1291/5ed4a9c1-d3b8-4cff-8be0-1c42c175158e.jpg?RS=315x420&SF=webp&QT=80', price: 42, salePrice: 31.50 },
      { step: 4, label: 'MOISTURIZE', instruction: 'Pea-sized amount only — this gel-cream hydrates without adding grease', brand: 'Torriden', productName: 'Dive-in Soothing Cream', image: 'https://cdn-image.oliveyoung.com/display/1141/9697bcba-7257-4226-85d3-c8cc1fc0f20b.jpg?RS=315x420&SF=webp&QT=80', price: 49, salePrice: 36.75 },
      { step: 5, label: 'CLEAR', instruction: 'Spot treat congested areas — reduces blemishes without over-drying', brand: 'MEDIHEAL', productName: 'Madecassoside Blemish Serum', image: 'https://cdn-image.oliveyoung.com/display/1938/07929254-2989-4529-a767-2111e0ab7564.jpg?RS=315x420&SF=webp&QT=80', price: 49, salePrice: 30.40 },
    ],
    combo: [
      { step: 1, label: 'CLEANSE', instruction: 'Gentle foam cleans the T-zone without stripping dry cheeks', brand: 'beplain', productName: 'Mung Bean Cleansing Foam', image: 'https://cdn-image.oliveyoung.com/display/1927/fcabb81a-7d60-4b8e-8c6d-4d167942e2a0.jpg?RS=315x420&SF=webp&QT=80', price: 31, salePrice: 29.68 },
      { step: 2, label: 'BALANCE', instruction: 'Apply all over — PDRN normalizes sebum across both oily and dry zones', brand: 'Anua', productName: 'PDRN HA Capsule Serum', image: 'https://cdn-image.oliveyoung.com/display/1361/ccb287b1-36cb-4e23-a3fb-b1a42b6db27e.jpg?RS=315x420&SF=webp&QT=80', price: 67, salePrice: 34.84 },
      { step: 3, label: 'HYDRATE', instruction: 'Layer more generously on dry cheeks, lighter on the T-zone', brand: 'Torriden', productName: 'Dive-In HA Serum', image: 'https://cdn-image.oliveyoung.com/display/1291/5ed4a9c1-d3b8-4cff-8be0-1c42c175158e.jpg?RS=315x420&SF=webp&QT=80', price: 42, salePrice: 31.50 },
      { step: 4, label: 'MOISTURIZE', instruction: 'Lightweight texture that works on both zones without overloading T-zone', brand: 'Torriden', productName: 'Dive-in Soothing Cream', image: 'https://cdn-image.oliveyoung.com/display/1141/9697bcba-7257-4226-85d3-c8cc1fc0f20b.jpg?RS=315x420&SF=webp&QT=80', price: 49, salePrice: 36.75 },
      { step: 5, label: 'TREAT', instruction: 'Spot-apply on congested or oily areas only — skip over dry cheeks', brand: 'medicube', productName: 'PDRN Pink Peptide Ampoule', image: 'https://cdn-image.oliveyoung.com/display/1124/b45371a5-5b3c-4604-af42-f83ecc9852d9.jpg?RS=315x420&SF=webp&QT=80', price: 54, salePrice: 28.87 },
    ],
    normal: [
      { step: 1, label: 'CLEANSE', instruction: 'Massage onto dry skin first to dissolve SPF and makeup, then rinse', brand: 'ma:nyo', productName: 'Pure Cleansing Oil Double', image: 'https://cdn-image.oliveyoung.com/display/1587/93d560ea-8311-43da-bd44-9d6b1082d91d.jpg?RS=315x420&SF=webp&QT=80', price: 43, salePrice: 30.10 },
      { step: 2, label: 'ESSENCE', instruction: 'Spray onto palms and press in — effortless daily glow in one step', brand: "d'Alba", productName: 'White Truffle Spray Serum', image: 'https://cdn-image.oliveyoung.com/display/1124/3e428fad-d1b1-41f0-b7f1-e00555d8cf8c.jpg?RS=315x420&SF=webp&QT=80', price: 70, salePrice: 41.20 },
      { step: 3, label: 'SERUM', instruction: 'Apply 2-3 drops as a lightweight hydration layer before moisturizer', brand: 'Torriden', productName: 'Dive-In HA Serum', image: 'https://cdn-image.oliveyoung.com/display/1291/5ed4a9c1-d3b8-4cff-8be0-1c42c175158e.jpg?RS=315x420&SF=webp&QT=80', price: 42, salePrice: 31.50 },
      { step: 4, label: 'MOISTURIZE', instruction: 'Lock in hydration with squalane — your barrier stays balanced all day', brand: 'S.NATURE', productName: 'Aqua Squalane Cream', image: 'https://cdn-image.oliveyoung.com/display/1650/6b15bb5b-196b-4f62-8816-a51bfe856442.jpg?RS=315x420&SF=webp&QT=80', price: 50, salePrice: 27.32 },
      { step: 5, label: 'REPAIR', instruction: 'PM final step — probiotics work overnight to keep your natural balance', brand: 'BIOHEAL BOH', productName: 'Probioderm 3D Lifting Cream', image: 'https://cdn-image.oliveyoung.com/display/1263/9f574a14-a156-403e-923c-c1a65398eed7.jpg?RS=315x420&SF=webp&QT=80', price: 82, salePrice: null },
    ],
    sensitive: [
      { step: 1, label: 'CLEANSE', instruction: 'Fragrance-free foam — gentle enough to use twice daily without irritating reactive skin', brand: 'beplain', productName: 'Mung Bean Cleansing Foam', image: 'https://cdn-image.oliveyoung.com/display/1927/fcabb81a-7d60-4b8e-8c6d-4d167942e2a0.jpg?RS=315x420&SF=webp&QT=80', price: 31, salePrice: 29.68 },
      { step: 2, label: 'CALM', instruction: 'Apply immediately after cleansing to reduce redness and prep skin for actives', brand: 'ongredients', productName: 'Skin Barrier Calming Lotion', image: 'https://cdn-image.oliveyoung.com/display/1164/c84db808-8a07-4a2e-896e-86552013a02a.jpg?RS=315x420&SF=webp&QT=80', price: 47, salePrice: null },
      { step: 3, label: 'TREAT', instruction: 'Madecassoside is the gold standard for sensitive skin — apply to reactive areas', brand: 'MEDIHEAL', productName: 'Madecassoside Blemish Serum', image: 'https://cdn-image.oliveyoung.com/display/1938/07929254-2989-4529-a767-2111e0ab7564.jpg?RS=315x420&SF=webp&QT=80', price: 49, salePrice: 30.40 },
      { step: 4, label: 'SOOTHE', instruction: 'Apply a generous layer — HA plumps while the formula calms remaining sensitivity', brand: 'Torriden', productName: 'Dive-in Soothing Cream', image: 'https://cdn-image.oliveyoung.com/display/1141/9697bcba-7257-4226-85d3-c8cc1fc0f20b.jpg?RS=315x420&SF=webp&QT=80', price: 49, salePrice: 36.75 },
      { step: 5, label: 'RESTORE', instruction: 'Final spray seals everything in — no touching needed, perfect for reactive skin', brand: "d'Alba", productName: 'White Truffle Spray Serum', image: 'https://cdn-image.oliveyoung.com/display/1124/3e428fad-d1b1-41f0-b7f1-e00555d8cf8c.jpg?RS=315x420&SF=webp&QT=80', price: 70, salePrice: 41.20 },
    ],
  };

  getSalePct(price: number, sale: number): number {
    return Math.round((price - sale) / price * 100);
  }

  get maxProdIdx(): number { return 3; }
  get prodDots(): number[] { return [0, 1, 2, 3]; }
  get stepDots(): number[] { return [0, 1, 2, 3, 4]; }

  get currentRoutine(): RoutineStep[] {
    if (!this.skinType) return [];
    return this.routines[this.skinType];
  }

  get bundleTotal(): number {
    return parseFloat(this.currentRoutine.reduce((s, r) => s + (r.salePrice ?? r.price), 0).toFixed(2));
  }
  get bundlePrice(): number { return Math.round(this.bundleTotal * 0.68); }
  get bundleSavings(): number { return Math.round(this.bundleTotal - this.bundlePrice); }

  nextProd(): void { if (this.prodIdx >= this.maxProdIdx) return; this.prodIdx++; this.animateProdCarousel(); }
  prevProd(): void { if (this.prodIdx <= 0) return; this.prodIdx--; this.animateProdCarousel(); }
  goToProdDot(i: number): void { this.prodIdx = i; this.animateProdCarousel(); }
  private animateProdCarousel(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const track = document.querySelector('.prod-carousel-track') as HTMLElement;
    const card = document.querySelector('.prod-carousel-card') as HTMLElement;
    if (!track || !card) return;
    gsap.to(track, { x: -(card.offsetWidth + 16) * this.prodIdx, duration: 0.45, ease: 'power3.out' });
  }

  nextStep(): void { if (this.routineIdx >= 4) return; this.routineIdx++; this.animateBundleCarousel(); }
  prevStep(): void { if (this.routineIdx <= 0) return; this.routineIdx--; this.animateBundleCarousel(); }
  goToStepDot(i: number): void { this.routineIdx = i; this.animateBundleCarousel(); }
  private animateBundleCarousel(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const vp = document.querySelector('.bundle-viewport') as HTMLElement;
    const track = document.querySelector('.bundle-track') as HTMLElement;
    if (!track || !vp) return;
    gsap.to(track, { x: -vp.offsetWidth * this.routineIdx, duration: 0.5, ease: 'power3.out' });
  }

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.animateIntro(), 50);
  }

  private animateIntro(): void {
    const tl = gsap.timeline();
    tl.from('.quiz-intro-card', { opacity: 0, y: 60, scale: 0.9, rotationX: 8, duration: 0.8, ease: 'back.out(1.7)' })
      .from('.intro-emoji', { opacity: 0, scale: 0, rotation: -20, duration: 0.6, ease: 'back.out(2.5)' }, '-=0.3')
      .from('.intro-title', { opacity: 0, y: 18, duration: 0.45 }, '-=0.2')
      .from('.intro-sub', { opacity: 0, y: 14, duration: 0.4 }, '-=0.25')
      .from('.intro-features span', { opacity: 0, y: 12, duration: 0.35, stagger: 0.08 }, '-=0.2')
      .from('.intro-start-btn', { opacity: 0, y: 12, scale: 0.95, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.1')
      .from('.intro-hint', { opacity: 0, duration: 0.3 }, '-=0.15');
  }

  startQuiz(): void {
    if (!isPlatformBrowser(this.platformId)) { this.phase = 'quiz'; return; }
    const tl = gsap.timeline({
      onComplete: () => {
        this.phase = 'quiz';
        setTimeout(() => this.animateQuestion(), 20);
      }
    });
    tl.to('.intro-emoji', { rotation: 20, scale: 1.2, duration: 0.2, ease: 'power2.in' })
      .to('.quiz-intro-card', { opacity: 0, scale: 0.88, y: -20, duration: 0.4, ease: 'power3.in' }, '-=0.1');
  }

  private animateQuestion(): void {
    this.selectedIdx = this.answers[this.currentQ];
    this.tipOpen = false;

    const tl = gsap.timeline();
    tl.fromTo('.quiz-question-card',
      { x: 100, opacity: 0, scale: 0.94, rotationY: 6 },
      { x: 0, opacity: 1, scale: 1, rotationY: 0, duration: 0.55, ease: 'back.out(1.5)' }
    )
    .from('.question-emoji', { scale: 0, rotation: -15, opacity: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.3')
    .from('.question-number, .question-title, .question-subtitle', { opacity: 0, y: 10, duration: 0.35, stagger: 0.07 }, '-=0.25')
    .from('.tip-toggle', { opacity: 0, y: 8, duration: 0.3 }, '-=0.1')
    .from('.answer-option', { opacity: 0, x: 20, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, '-=0.1')
    .from('.quiz-nav-row', { opacity: 0, y: 10, duration: 0.3 }, '-=0.1');
  }

  selectAnswer(idx: number): void {
    this.selectedIdx = idx;
    if (!isPlatformBrowser(this.platformId)) return;
    const cards = document.querySelectorAll('.answer-option');
    cards.forEach((c, i) => {
      if (i === idx) {
        // Pop + wiggle the selected card
        gsap.timeline()
          .to(c, { scale: 1.04, x: 8, duration: 0.1, ease: 'power2.out' })
          .to(c, { scale: 1, x: 4, duration: 0.4, ease: 'elastic.out(1.8, 0.5)' });
        // Animate the checkmark in
        const check = (c as HTMLElement).querySelector('.answer-check');
        if (check) {
          gsap.fromTo(check, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2.5)' });
        }
      } else if (this.answers[this.currentQ] !== i) {
        // Gently push others back
        gsap.to(c, { x: 0, duration: 0.3, ease: 'power2.out' });
      }
    });
    // Animate the Next button lighting up
    gsap.fromTo('.quiz-next-btn',
      { scale: 0.96 },
      { scale: 1, duration: 0.4, ease: 'elastic.out(1.5, 0.5)', delay: 0.05 }
    );
  }

  nextQuestion(): void {
    if (this.selectedIdx === null || this.isAnimating) return;
    this.answers[this.currentQ] = this.selectedIdx;
    this.isAnimating = true;

    const tl = gsap.timeline({
      onComplete: () => {
        if (this.currentQ < this.questions.length - 1) {
          this.currentQ++;
          this.isAnimating = false;
          setTimeout(() => this.animateQuestion(), 10);
        } else {
          this.calculateResult();
        }
      }
    });
    tl.to('.answer-option', { opacity: 0, x: -20, duration: 0.2, stagger: 0.04 })
      .to('.quiz-question-card', { x: -80, opacity: 0, scale: 0.95, duration: 0.32, ease: 'power3.in' }, '-=0.05');
  }

  goBack(): void {
    if (this.currentQ === 0 || this.isAnimating) return;
    this.isAnimating = true;
    const tl = gsap.timeline({
      onComplete: () => {
        this.currentQ--;
        this.isAnimating = false;
        setTimeout(() => {
          this.selectedIdx = this.answers[this.currentQ];
          this.tipOpen = false;
          gsap.fromTo('.quiz-question-card',
            { x: -100, opacity: 0, scale: 0.94 },
            { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
          );
          gsap.from('.answer-option', { opacity: 0, x: -20, duration: 0.3, stagger: 0.06, delay: 0.1, ease: 'power2.out' });
        }, 10);
      }
    });
    tl.to('.answer-option', { opacity: 0, x: 20, duration: 0.2, stagger: 0.04 })
      .to('.quiz-question-card', { x: 80, opacity: 0, scale: 0.95, duration: 0.32, ease: 'power3.in' }, '-=0.05');
  }

  toggleTip(): void {
    this.tipOpen = !this.tipOpen;
    if (this.tipOpen && isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        gsap.from('.tip-content', { opacity: 0, height: 0, y: -8, duration: 0.35, ease: 'power2.out' });
      }, 10);
    }
  }

  private calculateResult(): void {
    this.scores = { dry: 0, oily: 0, combo: 0, normal: 0, sensitive: 0 };
    this.questions.forEach((q, qi) => {
      const ai = this.answers[qi];
      if (ai !== null && ai !== undefined) {
        const s = q.answers[ai].scores;
        (Object.keys(s) as SkinType[]).forEach(k => { this.scores[k] += s[k]; });
      }
    });
    this.skinType = (Object.keys(this.scores) as SkinType[]).reduce((a, b) =>
      this.scores[a] >= this.scores[b] ? a : b
    );
    this.prodIdx = 0;
    this.routineIdx = 0;
    // Persist result so the shop page can show a personalised banner
    if (isPlatformBrowser(this.platformId) && this.skinType) {
      localStorage.setItem('gs_skin_type', this.skinType);
    }
    this.phase = 'result';
    setTimeout(() => this.animateResult(), 30);
  }

  private animateResult(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.launchConfetti();

    const tl = gsap.timeline();
    tl.from('.result-type-badge', { opacity: 0, scale: 0, duration: 0.6, ease: 'back.out(2)' })
      .from('.result-emoji-big', { opacity: 0, scale: 0, duration: 0.55, ease: 'back.out(2.5)' }, '-=0.2')
      .from('.result-skin-type', { opacity: 0, y: 30, duration: 0.5 }, '-=0.1')
      .from('.result-nickname', { opacity: 0, y: 20, duration: 0.45 }, '-=0.15')
      .from('.result-tagline', { opacity: 0, y: 16, duration: 0.4 }, '-=0.1')
      .from('.result-description, .result-attributes', { opacity: 0, y: 16, duration: 0.4, stagger: 0.08 }, '-=0.1')
      .from('.prod-carousel-card', { opacity: 0, y: 24, scale: 0.95, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)' }, '-=0.1')
      .from('.bundle-section', { opacity: 0, y: 20, duration: 0.4 }, '-=0.05')
      .from('.result-ctas', { opacity: 0, y: 20, duration: 0.4 }, '-=0.1');
  }

  private launchConfetti(): void {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    const colors = ['#C9837A', '#f8c8d4', '#ffd6e0', '#ffb3c6', '#c77dff', '#e0aaff', '#ffeaa7', '#a8e6cf'];
    for (let i = 0; i < 70; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const size = Math.random() * 10 + 5;
      el.style.cssText = `
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}%;
        top:50%; position:absolute;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events:none;
      `;
      container.appendChild(el);
      gsap.fromTo(el,
        { y: 0, x: 0, rotation: 0, opacity: 1, scale: 1 },
        {
          y: -(Math.random() * 500 + 200),
          x: (Math.random() - 0.5) * 400,
          rotation: Math.random() * 720 - 360,
          opacity: 0,
          scale: Math.random() * 0.6 + 0.4,
          duration: Math.random() * 1.8 + 1,
          ease: 'power2.out',
          delay: Math.random() * 0.6,
          onComplete: () => el.remove()
        }
      );
    }
  }

  retakeQuiz(): void {
    this.answers = Array(7).fill(null);
    this.currentQ = 0;
    this.selectedIdx = null;
    this.skinType = null;
    this.scores = { dry: 0, oily: 0, combo: 0, normal: 0, sensitive: 0 };
    this.prodIdx = 0;
    this.routineIdx = 0;
    this.tipOpen = false;
    this.phase = 'quiz';
    setTimeout(() => this.animateQuestion(), 30);
  }

  ngOnDestroy(): void {}
}
