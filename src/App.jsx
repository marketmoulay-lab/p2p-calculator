import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// ---- Affiliate banner ----
function trackAffiliateClick(name) {
  try {
    const key = "moulay-p2p:affiliate-clicks";
    const raw = localStorage.getItem(key);
    const counts = raw ? JSON.parse(raw) : {};
    counts[name] = (counts[name] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(counts));
  } catch (e) {}
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "affiliate_click", { affiliate_name: name });
  }
}

function AffiliateBanner() {
  const EXCHANGES = [
    { name: "Binance", tag: "P2P • most liquidity", accent: "#F0B90B", href: "https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_OZIWV&utm_source=referral_entrance" },
    { name: "Bybit", tag: "Fast KYC, deep P2P", accent: "#F7A600", href: "https://partner.bybit.com/b/157970" },
    { name: "OKX", tag: "Wide pair coverage", accent: "#B0B0B0", href: "https://okx.com/join/31050757" },
    { name: "BingX", tag: "Low fees on USDT", accent: "#3B82F6", href: "https://bingxdao.com/invite/N0ZCF7/" },
    { name: "KuCoin", tag: "Wide altcoin liquidity", accent: "#22C08F", href: "https://link.kucoin.com/iqEP/alk9lpk6?utm_source=refer_earn&utm_campaign=referAndEarn&rcode=QBSAKVY7&utm_medium=share" },
  ];
  const BROKERS = [
    { name: "XM", tag: "Forex & CFD broker", accent: "#E14657", href: "https://www.xmglobal.com/referral?token=srQSW9IulHeBxYNW-Pb1Tg" },
  ];
  const PROP_FIRMS = [
    { name: "PropFirmMatch", tag: "Compare prop firms", accent: "#8B7CFA", href: "https://www.propfirmmatch.com/?a_aid=moulay" },
    { name: "Earn2Trade", tag: "Futures funded accounts", accent: "#22C08F", href: "https://www.earn2trade.com/trader-career-path?a_pid=non&a_bid=8d7b4b9e" },
  ];
  const Row = ({ items }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
      {items.map((it) => (
        <a key={it.name} href={it.href} target="_blank" rel="noopener noreferrer sponsored"
          onClick={() => trackAffiliateClick(it.name)}
          className="group relative overflow-hidden rounded-lg border border-[#262B35] bg-[#161920] px-3 py-3 flex flex-col gap-1 transition-colors hover:border-[color:var(--accent)]"
          style={{ "--accent": it.accent }}>
          <span className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: it.accent }} aria-hidden="true" />
          <span className="text-sm font-semibold text-[#EDEFF2]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{it.name}</span>
          <span className="text-[11px] text-stone-400">{it.tag}</span>
          <span className="font-mono text-[11px] font-medium mt-1" style={{ color: it.accent }}>Get bonus →</span>
        </a>
      ))}
    </div>
  );
  return (
    <section className="max-w-5xl mx-auto px-5 py-6">
      <div className="rounded-xl border border-[#262B35] bg-[#161920]/40 p-5">
        <div className="mb-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Crypto exchanges</p>
          <p className="text-sm text-stone-300 mt-1">These are the exchanges the numbers on this page are based on.</p>
        </div>
        <Row items={EXCHANGES} />
        <div className="mt-5 mb-3"><p className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Forex & CFD brokers</p></div>
        <Row items={BROKERS} />
        <div className="mt-5 mb-3"><p className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Prop firms</p></div>
        <Row items={PROP_FIRMS} />
        <p className="text-[10px] text-stone-500 leading-relaxed mt-4">
          Affiliate disclosure: links above are referral links. Signing up through them may earn Moulay Trading a commission at no extra cost to you.
        </p>
      </div>
    </section>
  );
}
// ---- end affiliate banner ----

// ---- Live indicative USDT/MAD reference rate ----
// Uses Frankfurter (free, no key, CORS-friendly) for USD->MAD as a stand-in
// for USDT, refreshed every 5 minutes. Clearly labeled as indicative, not
// the actual P2P execution price.
function LivePriceTicker() {
  const [rate, setRate] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=MAD");
        const data = await res.json();
        if (!cancelled && data?.rates?.MAD) {
          setRate(data.rates.MAD);
          setStatus("ok");
        } else if (!cancelled) {
          setStatus("error");
        }
      } catch (e) {
        if (!cancelled) setStatus("error");
      }
    }
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (status === "error") return null;

  const items = [
    status === "loading"
      ? "LOADING REFERENCE RATE…"
      : `1 USDT ≈ ${rate.toFixed(3)} MAD — INDICATIVE, NOT P2P PRICE`,
    "SPREAD ZONES · LOW < 0.3% · NORMAL 0.3–1.2% · HIGH > 1.2%",
    "MOULAY TRADING · CALC.MOULAYTRADING.FIT",
  ];
  const line = items.join("     ·     ");

  return (
    <div
      className="w-full overflow-hidden border-b border-[#262B35] bg-[#0D0F14]"
      role="status"
      aria-label="Market reference ticker"
    >
      <div className="ticker-track flex whitespace-nowrap font-mono text-[11px] tracking-wider text-[#E8A33D] py-1.5">
        <span className="px-4">{line}</span>
        <span className="px-4" aria-hidden="true">{line}</span>
      </div>
    </div>
  );
}

// ---------- reference data ----------
const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CNY", "CHF", "CAD", "AUD", "NZD", "HKD",
  "SGD", "KRW", "INR", "PKR", "BDT", "LKR", "NPR", "IDR", "MYR", "PHP",
  "THB", "VND", "TRY", "RUB", "UAH", "PLN", "CZK", "HUF", "RON", "SEK",
  "NOK", "DKK", "ILS", "SAR", "AED", "QAR", "KWD", "BHD", "OMR", "JOD",
  "EGP", "MAD", "DZD", "TND", "NGN", "GHS", "KES", "ZAR", "ETB", "BRL",
  "MXN", "ARS", "CLP", "COP", "PEN", "UYU", "VES",
];
const ASSETS = ["USDT", "USDC", "BTC", "ETH", "BNB", "TRX", "SOL"];

// ---------- i18n ----------
const STR = {
  ar: {
    dir: "rtl", langName: "العربية",
    brand: "Moulay Trading",
    tagline: "حاسبة أرباح P2P",
    tabs: { single: "صفقة واحدة", compound: "نمو رأس المال", compare: "مقارنة استراتيجيات", legal: "قانوني" },
    legal: {
      title: "الشروط والإفصاح القانوني",
      disclaimerTitle: "إفصاح مالي",
      disclaimer: "هاد الموقع كيقدم أداة حسابية للتوضيح والتعليم فقط. النتائج المعروضة تقديرية، وكتفترض شروط سوق ثابتة (السعر، السيولة، الرسوم) لي ماشي واقعية بشكل دائم فسوق العملات المشفرة. حنا ما كنقدموش استشارة مالية أو استثمارية. تداول العملات المشفرة فيه مخاطر عالية وممكن تخسر جزء أو كل رأس المال ديالك. قبل اتخاذ أي قرار مالي، نصحوكم تتشاوروا مع مستشار مالي مرخص.",
      privacyTitle: "سياسة الخصوصية",
      privacy: "هاد التطبيق كيحتفظ بالمدخلات ديالك (رأس المال، الأسعار، الإعدادات) محليا فالمتصفح ديالك فقط، باش يسهل عليك ترجع لهم فمرة قادمة. ما كنجمعوش، ما كنبيعوش، وما كنشاركوش أي معلومة شخصية مع أطراف أخرى. الموقع ممكن يستعمل خدمات إعلانية (بحال Google AdSense) لي عندها السياسات ديالها الخاصة بخصوص الكوكيز والإعلانات المخصصة.",
      termsTitle: "شروط الاستخدام",
      terms: "استعمال هاد الأداة معناه أنك فهمتي وقبلتي أن النتائج تقديرية وماشي ضمان لأي ربح فعلي. المالك ديال هاد الموقع ماشي مسؤول عن أي خسارة مالية ناتجة عن استعمال هاد الأداة أو الاعتماد عليها فقرارات تداول حقيقية.",
      contactTitle: "التواصل",
      contact: "لأي استفسار، تقدر تتواصل معنا عبر قناة تيليجرام @cryptomoulay.",
    },
    export: "تصدير PDF",
    saved: "تم الحفظ ✓",
    currencyLabel: "العملة", assetLabel: "العملة المشفرة",
    single: {
      title: "حساب الصفقة", capital: "رأس المال", buy: "سعر الشراء", sell: "سعر البيع",
      fee: "الرسوم (%)", result: "الربح الصافي", margin: "نسبة الربح", spreadLabel: "السبريد",
      typical: "السبريد النموذجي فسوق P2P: 0.3% – 1.2%", low: "ضعيف", normal: "عادي", high: "مرتفع",
    },
    compound: {
      title: "محاكي النمو المركب", start: "رأس المال الأولي", weekly: "الإضافة الأسبوعية",
      trades: "عدد الصفقات فالأسبوع", spread: "متوسط السبريد بالصفقة (%)", weeks: "عدد الأسابيع",
      finalCapital: "رأس المال النهائي", totalProfit: "الربح الإجمالي", totalInjected: "المجموع المُضاف",
      chartTitle: "تطور رأس المال",
    },
    compare: {
      title: "مقارنة: سبريد مرتفع vs تردد مرتفع", stratA: "استراتيجية أ — سبريد مرتفع",
      stratB: "استراتيجية ب — تردد مرتفع", capital: "رأس المال", spread: "السبريد بالصفقة (%)",
      trades: "الصفقات فالأسبوع", weeks: "عدد الأسابيع", winner: "الأفضل", profitA: "ربح أ",
      profitB: "ربح ب", chartTitle: "الربح الأسبوعي التراكمي",
    },
    footer: "هاد التطبيق غير أداة حسابية للتوضيح، ماشي نصيحة مالية. النتائج تقديرية وكتفترض سيولة وأسعار ثابتة.",
  },
  en: {
    dir: "ltr", langName: "English",
    brand: "Moulay Trading",
    tagline: "P2P Profit Calculator",
    tabs: { single: "Single Trade", compound: "Capital Growth", compare: "Strategy Compare", legal: "Legal" },
    legal: {
      title: "Legal Disclosure & Terms",
      disclaimerTitle: "Financial Disclaimer",
      disclaimer: "This site provides an illustrative, educational calculator only. Results shown are estimates and assume constant market conditions (price, liquidity, fees) that don't always hold in crypto markets. We do not provide financial or investment advice. Cryptocurrency trading carries high risk and you may lose part or all of your capital. Consult a licensed financial advisor before making any financial decision.",
      privacyTitle: "Privacy Policy",
      privacy: "This app stores your inputs (capital, prices, settings) locally in your own browser only, so you can pick up where you left off. We do not collect, sell, or share any personal information with third parties. The site may use advertising services (such as Google AdSense), which have their own policies regarding cookies and personalized ads.",
      termsTitle: "Terms of Use",
      terms: "By using this tool you acknowledge that results are estimates and not a guarantee of any actual profit. The owner of this site is not liable for any financial loss resulting from use of, or reliance on, this tool for real trading decisions.",
      contactTitle: "Contact",
      contact: "For any questions, reach out via our Telegram channel @cryptomoulay.",
    },
    export: "Export PDF",
    saved: "Saved ✓",
    currencyLabel: "Currency", assetLabel: "Crypto asset",
    single: {
      title: "Trade Calculator", capital: "Capital", buy: "Buy price", sell: "Sell price",
      fee: "Fees (%)", result: "Net profit", margin: "Margin", spreadLabel: "Spread",
      typical: "Typical P2P spread: 0.3% – 1.2%", low: "Low", normal: "Normal", high: "High",
    },
    compound: {
      title: "Compound Growth Simulator", start: "Starting capital", weekly: "Weekly injection",
      trades: "Trades per week", spread: "Avg. spread per trade (%)", weeks: "Number of weeks",
      finalCapital: "Final capital", totalProfit: "Total profit", totalInjected: "Total injected",
      chartTitle: "Capital growth over time",
    },
    compare: {
      title: "Compare: High spread vs High frequency", stratA: "Strategy A — High spread",
      stratB: "Strategy B — High frequency", capital: "Capital", spread: "Spread per trade (%)",
      trades: "Trades per week", weeks: "Number of weeks", winner: "Winner", profitA: "Profit A",
      profitB: "Profit B", chartTitle: "Cumulative weekly profit",
    },
    footer: "This is an illustrative calculator, not financial advice. Results are estimates and assume constant liquidity and prices.",
  },
  fr: {
    dir: "ltr", langName: "Français",
    brand: "Moulay Trading",
    tagline: "Calculateur de profit P2P",
    tabs: { single: "Transaction unique", compound: "Croissance du capital", compare: "Comparer les stratégies", legal: "Mentions légales" },
    legal: {
      title: "Mentions légales et conditions",
      disclaimerTitle: "Avertissement financier",
      disclaimer: "Ce site propose un calculateur illustratif et éducatif uniquement. Les résultats affichés sont des estimations et supposent des conditions de marché constantes (prix, liquidité, frais) qui ne sont pas toujours réalistes sur les marchés crypto. Nous ne fournissons aucun conseil financier ou d'investissement. Le trading de cryptomonnaies comporte des risques élevés et vous pouvez perdre une partie ou la totalité de votre capital. Consultez un conseiller financier agréé avant toute décision financière.",
      privacyTitle: "Politique de confidentialité",
      privacy: "Cette application enregistre vos saisies (capital, prix, réglages) uniquement dans votre propre navigateur, afin que vous puissiez reprendre où vous vous étiez arrêté. Nous ne collectons, ne vendons ni ne partageons aucune donnée personnelle avec des tiers. Le site peut utiliser des services publicitaires (comme Google AdSense), qui ont leurs propres règles concernant les cookies et les publicités personnalisées.",
      termsTitle: "Conditions d'utilisation",
      terms: "En utilisant cet outil, vous reconnaissez que les résultats sont des estimations et ne garantissent aucun profit réel. Le propriétaire de ce site n'est pas responsable des pertes financières résultant de l'utilisation de cet outil pour de véritables décisions de trading.",
      contactTitle: "Contact",
      contact: "Pour toute question, contactez-nous sur notre canal Telegram @cryptomoulay.",
    },
    export: "Exporter en PDF",
    saved: "Enregistré ✓",
    currencyLabel: "Devise", assetLabel: "Actif crypto",
    single: {
      title: "Calcul de la transaction", capital: "Capital", buy: "Prix d'achat", sell: "Prix de vente",
      fee: "Frais (%)", result: "Profit net", margin: "Marge", spreadLabel: "Écart",
      typical: "Écart P2P typique : 0,3 % – 1,2 %", low: "Faible", normal: "Normal", high: "Élevé",
    },
    compound: {
      title: "Simulateur de croissance composée", start: "Capital de départ", weekly: "Ajout hebdomadaire",
      trades: "Transactions par semaine", spread: "Écart moyen par transaction (%)", weeks: "Nombre de semaines",
      finalCapital: "Capital final", totalProfit: "Profit total", totalInjected: "Total ajouté",
      chartTitle: "Évolution du capital",
    },
    compare: {
      title: "Comparer : écart élevé vs fréquence élevée", stratA: "Stratégie A — Écart élevé",
      stratB: "Stratégie B — Fréquence élevée", capital: "Capital", spread: "Écart par transaction (%)",
      trades: "Transactions par semaine", weeks: "Nombre de semaines", winner: "Meilleure stratégie",
      profitA: "Profit A", profitB: "Profit B", chartTitle: "Profit hebdomadaire cumulé",
    },
    footer: "Ceci est un calculateur illustratif, pas un conseil financier. Les résultats sont des estimations et supposent des prix et une liquidité constants.",
  },
  es: {
    dir: "ltr", langName: "Español",
    brand: "Moulay Trading",
    tagline: "Calculadora de ganancias P2P",
    tabs: { single: "Operación única", compound: "Crecimiento del capital", compare: "Comparar estrategias", legal: "Legal" },
    legal: {
      title: "Divulgación legal y términos",
      disclaimerTitle: "Aviso financiero",
      disclaimer: "Este sitio ofrece una calculadora ilustrativa y educativa únicamente. Los resultados mostrados son estimaciones y asumen condiciones de mercado constantes (precio, liquidez, comisiones) que no siempre se cumplen en los mercados cripto. No ofrecemos asesoría financiera ni de inversión. El trading de criptomonedas conlleva un alto riesgo y podrías perder parte o todo tu capital. Consulta a un asesor financiero autorizado antes de tomar cualquier decisión financiera.",
      privacyTitle: "Política de privacidad",
      privacy: "Esta aplicación guarda tus datos (capital, precios, ajustes) solo en tu propio navegador, para que puedas continuar donde lo dejaste. No recopilamos, vendemos ni compartimos información personal con terceros. El sitio puede usar servicios publicitarios (como Google AdSense), que tienen sus propias políticas sobre cookies y anuncios personalizados.",
      termsTitle: "Términos de uso",
      terms: "Al usar esta herramienta, aceptas que los resultados son estimaciones y no garantizan ninguna ganancia real. El propietario de este sitio no es responsable de ninguna pérdida financiera derivada del uso de esta herramienta para decisiones de trading reales.",
      contactTitle: "Contacto",
      contact: "Para cualquier consulta, contáctanos en nuestro canal de Telegram @cryptomoulay.",
    },
    export: "Exportar a PDF",
    saved: "Guardado ✓",
    currencyLabel: "Moneda", assetLabel: "Activo cripto",
    single: {
      title: "Cálculo de la operación", capital: "Capital", buy: "Precio de compra", sell: "Precio de venta",
      fee: "Comisión (%)", result: "Ganancia neta", margin: "Margen", spreadLabel: "Spread",
      typical: "Spread P2P típico: 0.3% – 1.2%", low: "Bajo", normal: "Normal", high: "Alto",
    },
    compound: {
      title: "Simulador de crecimiento compuesto", start: "Capital inicial", weekly: "Aporte semanal",
      trades: "Operaciones por semana", spread: "Spread promedio por operación (%)", weeks: "Número de semanas",
      finalCapital: "Capital final", totalProfit: "Ganancia total", totalInjected: "Total aportado",
      chartTitle: "Evolución del capital",
    },
    compare: {
      title: "Comparar: spread alto vs frecuencia alta", stratA: "Estrategia A — Spread alto",
      stratB: "Estrategia B — Frecuencia alta", capital: "Capital", spread: "Spread por operación (%)",
      trades: "Operaciones por semana", weeks: "Número de semanas", winner: "Ganadora",
      profitA: "Ganancia A", profitB: "Ganancia B", chartTitle: "Ganancia semanal acumulada",
    },
    footer: "Esto es una calculadora ilustrativa, no asesoría financiera. Los resultados son estimaciones y asumen precios y liquidez constantes.",
  },

  pt: {
    dir: "ltr", langName: "Português",
    brand: "Moulay Trading",
    tagline: "Calculadora de lucro P2P",
    tabs: { single: "Operação única", compound: "Crescimento do capital", compare: "Comparar estratégias", legal: "Legal" },
    legal: {
      title: "Divulgação legal e termos",
      disclaimerTitle: "Aviso financeiro",
      disclaimer: "Este site oferece apenas uma calculadora ilustrativa e educacional. Os resultados exibidos são estimativas e assumem condições de mercado constantes (preço, liquidez, taxas) que nem sempre se aplicam nos mercados de criptomoedas. Não oferecemos consultoria financeira ou de investimento. O trading de criptomoedas envolve alto risco e você pode perder parte ou todo o seu capital. Consulte um consultor financeiro licenciado antes de tomar qualquer decisão financeira.",
      privacyTitle: "Política de privacidade",
      privacy: "Este aplicativo armazena seus dados (capital, preços, configurações) apenas localmente no seu navegador, para que você possa continuar de onde parou. Não coletamos, vendemos ou compartilhamos informações pessoais com terceiros. O site pode usar serviços de publicidade (como o Google AdSense), que têm suas próprias políticas sobre cookies e anúncios personalizados.",
      termsTitle: "Termos de uso",
      terms: "Ao usar esta ferramenta, você reconhece que os resultados são estimativas e não garantem qualquer lucro real. O proprietário deste site não é responsável por qualquer perda financeira resultante do uso desta ferramenta em decisões reais de trading.",
      contactTitle: "Contato",
      contact: "Para qualquer dúvida, entre em contato pelo nosso canal do Telegram @cryptomoulay.",
    },
    export: "Exportar PDF",
    saved: "Salvo ✓",
    currencyLabel: "Moeda", assetLabel: "Ativo cripto",
    single: {
      title: "Cálculo da operação", capital: "Capital", buy: "Preço de compra", sell: "Preço de venda",
      fee: "Taxas (%)", result: "Lucro líquido", margin: "Margem", spreadLabel: "Spread",
      typical: "Spread P2P típico: 0.3% – 1.2%", low: "Baixo", normal: "Normal", high: "Alto",
    },
    compound: {
      title: "Simulador de crescimento composto", start: "Capital inicial", weekly: "Aporte semanal",
      trades: "Operações por semana", spread: "Spread médio por operação (%)", weeks: "Número de semanas",
      finalCapital: "Capital final", totalProfit: "Lucro total", totalInjected: "Total aportado",
      chartTitle: "Evolução do capital",
    },
    compare: {
      title: "Comparar: spread alto vs frequência alta", stratA: "Estratégia A — Spread alto",
      stratB: "Estratégia B — Frequência alta", capital: "Capital", spread: "Spread por operação (%)",
      trades: "Operações por semana", weeks: "Número de semanas", winner: "Vencedora",
      profitA: "Lucro A", profitB: "Lucro B", chartTitle: "Lucro semanal acumulado",
    },
    footer: "Esta é uma calculadora ilustrativa, não consultoria financeira. Os resultados são estimativas e assumem preços e liquidez constantes.",
  },
  de: {
    dir: "ltr", langName: "Deutsch",
    brand: "Moulay Trading",
    tagline: "P2P-Gewinnrechner",
    tabs: { single: "Einzelner Handel", compound: "Kapitalwachstum", compare: "Strategien vergleichen", legal: "Rechtliches" },
    legal: {
      title: "Rechtliche Hinweise & Bedingungen",
      disclaimerTitle: "Finanzieller Haftungsausschluss",
      disclaimer: "Diese Seite bietet lediglich einen illustrativen, pädagogischen Rechner. Die angezeigten Ergebnisse sind Schätzungen und gehen von konstanten Marktbedingungen (Preis, Liquidität, Gebühren) aus, die auf Kryptomärkten nicht immer zutreffen. Wir bieten keine Finanz- oder Anlageberatung an. Der Handel mit Kryptowährungen ist mit hohem Risiko verbunden, und Sie können einen Teil oder Ihr gesamtes Kapital verlieren. Wenden Sie sich vor jeder finanziellen Entscheidung an einen zugelassenen Finanzberater.",
      privacyTitle: "Datenschutzrichtlinie",
      privacy: "Diese App speichert Ihre Eingaben (Kapital, Preise, Einstellungen) nur lokal in Ihrem eigenen Browser, damit Sie dort weitermachen können, wo Sie aufgehört haben. Wir sammeln, verkaufen oder teilen keine persönlichen Daten mit Dritten. Die Seite kann Werbedienste (wie Google AdSense) nutzen, die eigene Richtlinien zu Cookies und personalisierter Werbung haben.",
      termsTitle: "Nutzungsbedingungen",
      terms: "Durch die Nutzung dieses Tools erkennen Sie an, dass die Ergebnisse Schätzungen sind und keinen tatsächlichen Gewinn garantieren. Der Betreiber dieser Seite haftet nicht für finanzielle Verluste, die aus der Nutzung dieses Tools für echte Handelsentscheidungen entstehen.",
      contactTitle: "Kontakt",
      contact: "Bei Fragen erreichen Sie uns über unseren Telegram-Kanal @cryptomoulay.",
    },
    export: "Als PDF exportieren",
    saved: "Gespeichert ✓",
    currencyLabel: "Währung", assetLabel: "Krypto-Asset",
    single: {
      title: "Handelsberechnung", capital: "Kapital", buy: "Kaufpreis", sell: "Verkaufspreis",
      fee: "Gebühren (%)", result: "Nettogewinn", margin: "Marge", spreadLabel: "Spread",
      typical: "Typischer P2P-Spread: 0,3 % – 1,2 %", low: "Niedrig", normal: "Normal", high: "Hoch",
    },
    compound: {
      title: "Zinseszins-Simulator", start: "Startkapital", weekly: "Wöchentliche Einzahlung",
      trades: "Trades pro Woche", spread: "Durchschn. Spread pro Trade (%)", weeks: "Anzahl der Wochen",
      finalCapital: "Endkapital", totalProfit: "Gesamtgewinn", totalInjected: "Gesamt eingezahlt",
      chartTitle: "Kapitalentwicklung",
    },
    compare: {
      title: "Vergleich: Hoher Spread vs. Hohe Frequenz", stratA: "Strategie A — Hoher Spread",
      stratB: "Strategie B — Hohe Frequenz", capital: "Kapital", spread: "Spread pro Trade (%)",
      trades: "Trades pro Woche", weeks: "Anzahl der Wochen", winner: "Gewinner",
      profitA: "Gewinn A", profitB: "Gewinn B", chartTitle: "Kumulierter Wochengewinn",
    },
    footer: "Dies ist ein illustrativer Rechner, keine Finanzberatung. Die Ergebnisse sind Schätzungen und setzen konstante Preise und Liquidität voraus.",
  },
  tr: {
    dir: "ltr", langName: "Türkçe",
    brand: "Moulay Trading",
    tagline: "P2P Kâr Hesaplayıcı",
    tabs: { single: "Tek İşlem", compound: "Sermaye Büyümesi", compare: "Strateji Karşılaştırma", legal: "Yasal" },
    legal: {
      title: "Yasal Bildirim ve Şartlar",
      disclaimerTitle: "Finansal Uyarı",
      disclaimer: "Bu site yalnızca açıklayıcı, eğitim amaçlı bir hesap makinesi sunar. Gösterilen sonuçlar tahminidir ve kripto piyasalarında her zaman geçerli olmayan sabit piyasa koşullarını (fiyat, likidite, ücretler) varsayar. Finansal veya yatırım tavsiyesi vermiyoruz. Kripto para ticareti yüksek risk içerir ve sermayenizin bir kısmını veya tamamını kaybedebilirsiniz. Herhangi bir finansal karar almadan önce lisanslı bir finansal danışmana başvurun.",
      privacyTitle: "Gizlilik Politikası",
      privacy: "Bu uygulama girdilerinizi (sermaye, fiyatlar, ayarlar) yalnızca kendi tarayıcınızda yerel olarak saklar, böylece kaldığınız yerden devam edebilirsiniz. Kişisel bilgilerinizi toplamıyor, satmıyor veya üçüncü taraflarla paylaşmıyoruz. Site, kendi çerez ve kişiselleştirilmiş reklam politikalarına sahip reklam hizmetleri (Google AdSense gibi) kullanabilir.",
      termsTitle: "Kullanım Şartları",
      terms: "Bu aracı kullanarak, sonuçların tahmini olduğunu ve gerçek bir kâr garantisi olmadığını kabul edersiniz. Bu sitenin sahibi, bu aracın gerçek ticaret kararlarında kullanılmasından kaynaklanan herhangi bir finansal kayıptan sorumlu değildir.",
      contactTitle: "İletişim",
      contact: "Sorularınız için Telegram kanalımız @cryptomoulay üzerinden bize ulaşabilirsiniz.",
    },
    export: "PDF olarak dışa aktar",
    saved: "Kaydedildi ✓",
    currencyLabel: "Para birimi", assetLabel: "Kripto varlık",
    single: {
      title: "İşlem Hesaplama", capital: "Sermaye", buy: "Alış fiyatı", sell: "Satış fiyatı",
      fee: "Ücretler (%)", result: "Net kâr", margin: "Kâr marjı", spreadLabel: "Spread",
      typical: "Tipik P2P spread: %0.3 – %1.2", low: "Düşük", normal: "Normal", high: "Yüksek",
    },
    compound: {
      title: "Bileşik Büyüme Simülatörü", start: "Başlangıç sermayesi", weekly: "Haftalık ekleme",
      trades: "Haftalık işlem sayısı", spread: "İşlem başına ort. spread (%)", weeks: "Hafta sayısı",
      finalCapital: "Nihai sermaye", totalProfit: "Toplam kâr", totalInjected: "Toplam eklenen",
      chartTitle: "Sermaye büyümesi",
    },
    compare: {
      title: "Karşılaştır: Yüksek spread vs Yüksek frekans", stratA: "Strateji A — Yüksek spread",
      stratB: "Strateji B — Yüksek frekans", capital: "Sermaye", spread: "İşlem başına spread (%)",
      trades: "Haftalık işlem sayısı", weeks: "Hafta sayısı", winner: "Kazanan",
      profitA: "Kâr A", profitB: "Kâr B", chartTitle: "Kümülatif haftalık kâr",
    },
    footer: "Bu açıklayıcı bir hesap makinesidir, finansal tavsiye değildir. Sonuçlar tahminidir ve sabit fiyat ile likidite varsayar.",
  },
  ru: {
    dir: "ltr", langName: "Русский",
    brand: "Moulay Trading",
    tagline: "Калькулятор прибыли P2P",
    tabs: { single: "Одна сделка", compound: "Рост капитала", compare: "Сравнение стратегий", legal: "Правовая информация" },
    legal: {
      title: "Правовая информация и условия",
      disclaimerTitle: "Финансовое предупреждение",
      disclaimer: "Этот сайт предоставляет только иллюстративный, образовательный калькулятор. Показанные результаты являются оценками и предполагают постоянные рыночные условия (цена, ликвидность, комиссии), которые не всегда соблюдаются на криптовалютных рынках. Мы не предоставляем финансовые или инвестиционные консультации. Торговля криптовалютой связана с высоким риском, и вы можете потерять часть или весь свой капитал. Проконсультируйтесь с лицензированным финансовым консультантом перед принятием любого финансового решения.",
      privacyTitle: "Политика конфиденциальности",
      privacy: "Это приложение сохраняет ваши данные (капитал, цены, настройки) только локально в вашем браузере, чтобы вы могли продолжить с того места, где остановились. Мы не собираем, не продаём и не передаём личную информацию третьим лицам. Сайт может использовать рекламные сервисы (например, Google AdSense), которые имеют собственные политики в отношении файлов cookie и персонализированной рекламы.",
      termsTitle: "Условия использования",
      terms: "Используя этот инструмент, вы признаёте, что результаты являются оценками и не гарантируют реальную прибыль. Владелец этого сайта не несёт ответственности за любые финансовые потери, возникшие в результате использования этого инструмента для реальных торговых решений.",
      contactTitle: "Контакты",
      contact: "По любым вопросам обращайтесь к нам через Telegram-канал @cryptomoulay.",
    },
    export: "Экспорт в PDF",
    saved: "Сохранено ✓",
    currencyLabel: "Валюта", assetLabel: "Криптоактив",
    single: {
      title: "Расчёт сделки", capital: "Капитал", buy: "Цена покупки", sell: "Цена продажи",
      fee: "Комиссия (%)", result: "Чистая прибыль", margin: "Маржа", spreadLabel: "Спред",
      typical: "Типичный спред P2P: 0.3% – 1.2%", low: "Низкий", normal: "Обычный", high: "Высокий",
    },
    compound: {
      title: "Симулятор сложного роста", start: "Начальный капитал", weekly: "Еженедельное пополнение",
      trades: "Сделок в неделю", spread: "Средний спред за сделку (%)", weeks: "Количество недель",
      finalCapital: "Итоговый капитал", totalProfit: "Общая прибыль", totalInjected: "Всего внесено",
      chartTitle: "Рост капитала",
    },
    compare: {
      title: "Сравнение: высокий спред vs высокая частота", stratA: "Стратегия А — Высокий спред",
      stratB: "Стратегия Б — Высокая частота", capital: "Капитал", spread: "Спред за сделку (%)",
      trades: "Сделок в неделю", weeks: "Количество недель", winner: "Победитель",
      profitA: "Прибыль А", profitB: "Прибыль Б", chartTitle: "Накопленная недельная прибыль",
    },
    footer: "Это иллюстративный калькулятор, а не финансовая консультация. Результаты являются оценками и предполагают постоянные цены и ликвидность.",
  },
  hi: {
    dir: "ltr", langName: "हिन्दी",
    brand: "Moulay Trading",
    tagline: "P2P लाभ कैलकुलेटर",
    tabs: { single: "एक ट्रेड", compound: "पूंजी वृद्धि", compare: "रणनीति तुलना", legal: "कानूनी" },
    legal: {
      title: "कानूनी प्रकटीकरण और शर्तें",
      disclaimerTitle: "वित्तीय अस्वीकरण",
      disclaimer: "यह साइट केवल एक उदाहरणात्मक, शैक्षणिक कैलकुलेटर प्रदान करती है। दिखाए गए परिणाम अनुमान हैं और स्थिर बाज़ार स्थितियों (कीमत, तरलता, फीस) को मानते हैं जो क्रिप्टो बाज़ारों में हमेशा लागू नहीं होती। हम कोई वित्तीय या निवेश सलाह प्रदान नहीं करते। क्रिप्टोकरेंसी ट्रेडिंग में उच्च जोखिम होता है और आप अपनी पूंजी का हिस्सा या पूरी पूंजी खो सकते हैं। कोई भी वित्तीय निर्णय लेने से पहले किसी लाइसेंस प्राप्त वित्तीय सलाहकार से सलाह लें।",
      privacyTitle: "गोपनीयता नीति",
      privacy: "यह ऐप आपके इनपुट (पूंजी, कीमतें, सेटिंग्स) को केवल आपके अपने ब्राउज़र में स्थानीय रूप से सहेजता है, ताकि आप जहां छोड़ा था वहीं से जारी रख सकें। हम किसी भी तीसरे पक्ष के साथ व्यक्तिगत जानकारी एकत्र, बेचते या साझा नहीं करते। साइट विज्ञापन सेवाओं (जैसे Google AdSense) का उपयोग कर सकती है, जिनकी कुकीज़ और वैयक्तिकृत विज्ञापनों के संबंध में अपनी नीतियां हैं।",
      termsTitle: "उपयोग की शर्तें",
      terms: "इस टूल का उपयोग करके आप स्वीकार करते हैं कि परिणाम अनुमान हैं और किसी वास्तविक लाभ की गारंटी नहीं देते। इस साइट का मालिक वास्तविक ट्रेडिंग निर्णयों के लिए इस टूल के उपयोग से होने वाले किसी भी वित्तीय नुकसान के लिए उत्तरदायी नहीं है।",
      contactTitle: "संपर्क करें",
      contact: "किसी भी प्रश्न के लिए, हमारे Telegram चैनल @cryptomoulay के माध्यम से संपर्क करें।",
    },
    export: "PDF निर्यात करें",
    saved: "सहेजा गया ✓",
    currencyLabel: "मुद्रा", assetLabel: "क्रिप्टो एसेट",
    single: {
      title: "ट्रेड कैलकुलेशन", capital: "पूंजी", buy: "खरीद मूल्य", sell: "बिक्री मूल्य",
      fee: "फीस (%)", result: "शुद्ध लाभ", margin: "मार्जिन", spreadLabel: "स्प्रेड",
      typical: "सामान्य P2P स्प्रेड: 0.3% – 1.2%", low: "कम", normal: "सामान्य", high: "उच्च",
    },
    compound: {
      title: "चक्रवृद्धि विकास सिमुलेटर", start: "प्रारंभिक पूंजी", weekly: "साप्ताहिक जोड़",
      trades: "प्रति सप्ताह ट्रेड", spread: "प्रति ट्रेड औसत स्प्रेड (%)", weeks: "सप्ताहों की संख्या",
      finalCapital: "अंतिम पूंजी", totalProfit: "कुल लाभ", totalInjected: "कुल जोड़ा गया",
      chartTitle: "पूंजी वृद्धि समय के साथ",
    },
    compare: {
      title: "तुलना: उच्च स्प्रेड बनाम उच्च आवृत्ति", stratA: "रणनीति A — उच्च स्प्रेड",
      stratB: "रणनीति B — उच्च आवृत्ति", capital: "पूंजी", spread: "प्रति ट्रेड स्प्रेड (%)",
      trades: "प्रति सप्ताह ट्रेड", weeks: "सप्ताहों की संख्या", winner: "विजेता",
      profitA: "लाभ A", profitB: "लाभ B", chartTitle: "संचित साप्ताहिक लाभ",
    },
    footer: "यह एक उदाहरणात्मक कैलकुलेटर है, वित्तीय सलाह नहीं। परिणाम अनुमान हैं और स्थिर कीमतों और तरलता को मानते हैं।",
  },
  ur: {
    dir: "rtl", langName: "اردو",
    brand: "Moulay Trading",
    tagline: "P2P منافع کیلکولیٹر",
    tabs: { single: "ایک ٹریڈ", compound: "کیپیٹل کی نمو", compare: "حکمت عملی کا موازنہ", legal: "قانونی" },
    legal: {
      title: "قانونی معلومات اور شرائط",
      disclaimerTitle: "مالی وضاحت",
      disclaimer: "یہ سائٹ صرف ایک وضاحتی، تعلیمی کیلکولیٹر فراہم کرتی ہے۔ دکھائے گئے نتائج تخمینی ہیں اور مستقل مارکیٹ حالات (قیمت، لیکویڈیٹی، فیس) کو فرض کرتے ہیں جو کرپٹو مارکیٹس میں ہمیشہ درست نہیں ہوتے۔ ہم کوئی مالی یا سرمایہ کاری کا مشورہ نہیں دیتے۔ کرپٹو کرنسی ٹریڈنگ میں زیادہ خطرہ ہوتا ہے اور آپ اپنا کچھ یا تمام سرمایہ کھو سکتے ہیں۔ کوئی بھی مالی فیصلہ کرنے سے پہلے کسی لائسنس یافتہ مالی مشیر سے مشورہ کریں۔",
      privacyTitle: "پرائیویسی پالیسی",
      privacy: "یہ ایپ آپ کی معلومات (کیپیٹل، قیمتیں، سیٹنگز) صرف آپ کے اپنے براؤزر میں مقامی طور پر محفوظ کرتی ہے، تاکہ آپ جہاں چھوڑا تھا وہاں سے دوبارہ شروع کر سکیں۔ ہم کسی بھی تیسرے فریق کے ساتھ ذاتی معلومات جمع، فروخت یا شیئر نہیں کرتے۔ سائٹ اشتہاری خدمات (جیسے Google AdSense) استعمال کر سکتی ہے، جن کی کوکیز اور ذاتی نوعیت کے اشتہارات کے بارے میں اپنی پالیسیاں ہیں۔",
      termsTitle: "استعمال کی شرائط",
      terms: "اس ٹول کا استعمال کرتے ہوئے آپ تسلیم کرتے ہیں کہ نتائج تخمینی ہیں اور کسی حقیقی منافع کی ضمانت نہیں دیتے۔ اس سائٹ کا مالک اصلی ٹریڈنگ فیصلوں کے لیے اس ٹول کے استعمال سے ہونے والے کسی بھی مالی نقصان کا ذمہ دار نہیں ہے۔",
      contactTitle: "رابطہ",
      contact: "کسی بھی سوال کے لیے، ہمارے ٹیلیگرام چینل @cryptomoulay کے ذریعے رابطہ کریں۔",
    },
    export: "PDF ایکسپورٹ کریں",
    saved: "محفوظ ہو گیا ✓",
    currencyLabel: "کرنسی", assetLabel: "کرپٹو اثاثہ",
    single: {
      title: "ٹریڈ کیلکولیشن", capital: "کیپیٹل", buy: "خریداری قیمت", sell: "فروخت قیمت",
      fee: "فیس (%)", result: "خالص منافع", margin: "مارجن", spreadLabel: "سپریڈ",
      typical: "معمول کا P2P سپریڈ: 0.3% – 1.2%", low: "کم", normal: "عام", high: "زیادہ",
    },
    compound: {
      title: "کمپاؤنڈ گروتھ سیمولیٹر", start: "ابتدائی کیپیٹل", weekly: "ہفتہ وار اضافہ",
      trades: "فی ہفتہ ٹریڈز", spread: "فی ٹریڈ اوسط سپریڈ (%)", weeks: "ہفتوں کی تعداد",
      finalCapital: "حتمی کیپیٹل", totalProfit: "کل منافع", totalInjected: "کل شامل شدہ",
      chartTitle: "کیپیٹل کی نمو",
    },
    compare: {
      title: "موازنہ: زیادہ سپریڈ بمقابلہ زیادہ فریکوئنسی", stratA: "حکمت عملی A — زیادہ سپریڈ",
      stratB: "حکمت عملی B — زیادہ فریکوئنسی", capital: "کیپیٹل", spread: "فی ٹریڈ سپریڈ (%)",
      trades: "فی ہفتہ ٹریڈز", weeks: "ہفتوں کی تعداد", winner: "فاتح",
      profitA: "منافع A", profitB: "منافع B", chartTitle: "مجموعی ہفتہ وار منافع",
    },
    footer: "یہ ایک وضاحتی کیلکولیٹر ہے، مالی مشورہ نہیں۔ نتائج تخمینی ہیں اور مستقل قیمتوں اور لیکویڈیٹی کو فرض کرتے ہیں۔",
  },
  vi: {
    dir: "ltr", langName: "Tiếng Việt",
    brand: "Moulay Trading",
    tagline: "Máy tính lợi nhuận P2P",
    tabs: { single: "Giao dịch đơn", compound: "Tăng trưởng vốn", compare: "So sánh chiến lược", legal: "Pháp lý" },
    legal: {
      title: "Công bố pháp lý & Điều khoản",
      disclaimerTitle: "Tuyên bố miễn trừ tài chính",
      disclaimer: "Trang này chỉ cung cấp một máy tính minh họa, mang tính giáo dục. Kết quả hiển thị là ước tính và giả định các điều kiện thị trường không đổi (giá, thanh khoản, phí) mà không phải lúc nào cũng đúng trên thị trường tiền điện tử. Chúng tôi không cung cấp lời khuyên tài chính hoặc đầu tư. Giao dịch tiền điện tử có rủi ro cao và bạn có thể mất một phần hoặc toàn bộ vốn của mình. Hãy tham khảo ý kiến của một cố vấn tài chính được cấp phép trước khi đưa ra bất kỳ quyết định tài chính nào.",
      privacyTitle: "Chính sách bảo mật",
      privacy: "Ứng dụng này chỉ lưu trữ dữ liệu đầu vào của bạn (vốn, giá, cài đặt) cục bộ trên trình duyệt của bạn, để bạn có thể tiếp tục từ nơi đã dừng lại. Chúng tôi không thu thập, bán hoặc chia sẻ thông tin cá nhân với bên thứ ba. Trang web có thể sử dụng các dịch vụ quảng cáo (như Google AdSense), có chính sách riêng về cookie và quảng cáo được cá nhân hóa.",
      termsTitle: "Điều khoản sử dụng",
      terms: "Khi sử dụng công cụ này, bạn xác nhận rằng kết quả là ước tính và không đảm bảo lợi nhuận thực tế. Chủ sở hữu trang web này không chịu trách nhiệm về bất kỳ tổn thất tài chính nào phát sinh từ việc sử dụng công cụ này cho các quyết định giao dịch thực tế.",
      contactTitle: "Liên hệ",
      contact: "Mọi thắc mắc vui lòng liên hệ qua kênh Telegram @cryptomoulay của chúng tôi.",
    },
    export: "Xuất PDF",
    saved: "Đã lưu ✓",
    currencyLabel: "Tiền tệ", assetLabel: "Tài sản crypto",
    single: {
      title: "Tính toán giao dịch", capital: "Vốn", buy: "Giá mua", sell: "Giá bán",
      fee: "Phí (%)", result: "Lợi nhuận thuần", margin: "Tỷ suất lợi nhuận", spreadLabel: "Chênh lệch giá",
      typical: "Chênh lệch P2P thông thường: 0.3% – 1.2%", low: "Thấp", normal: "Bình thường", high: "Cao",
    },
    compound: {
      title: "Mô phỏng tăng trưởng lãi kép", start: "Vốn ban đầu", weekly: "Bổ sung hàng tuần",
      trades: "Giao dịch mỗi tuần", spread: "Chênh lệch trung bình mỗi giao dịch (%)", weeks: "Số tuần",
      finalCapital: "Vốn cuối cùng", totalProfit: "Tổng lợi nhuận", totalInjected: "Tổng đã bổ sung",
      chartTitle: "Tăng trưởng vốn theo thời gian",
    },
    compare: {
      title: "So sánh: Chênh lệch cao vs Tần suất cao", stratA: "Chiến lược A — Chênh lệch cao",
      stratB: "Chiến lược B — Tần suất cao", capital: "Vốn", spread: "Chênh lệch mỗi giao dịch (%)",
      trades: "Giao dịch mỗi tuần", weeks: "Số tuần", winner: "Chiến thắng",
      profitA: "Lợi nhuận A", profitB: "Lợi nhuận B", chartTitle: "Lợi nhuận hàng tuần tích lũy",
    },
    footer: "Đây là máy tính minh họa, không phải lời khuyên tài chính. Kết quả là ước tính và giả định giá cả và thanh khoản không đổi.",
  },
};

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    Number.isFinite(n) ? n : 0
  );

// ---- Signature element: mechanical ledger counter ----
// Renders a number as individual character tiles. Each time a character
// changes, it remounts (via `key`) and plays a short roll-in animation,
// evoking an old currency-exchange counter rather than a static number.
function OdometerNumber({ value, className = "" }) {
  const str = fmt(value);
  const chars = str.split("");
  return (
    <span className={`inline-flex ${className}`} aria-label={str}>
      {chars.map((ch, i) => (
        <span
          key={`${i}-${ch}-${str.length}`}
          className="odometer-digit inline-block overflow-hidden"
          style={{ minWidth: /[0-9]/.test(ch) ? "0.62em" : undefined }}
        >
          <span className="inline-block">{ch}</span>
        </span>
      ))}
    </span>
  );
}

// Persists a small state object under a given key using localStorage.
// Works standalone in the browser and inside a Capacitor WebView.
function usePersistentState(key, initial) {
  const storageKey = `moulay-p2p:${key}`;
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch (e) {
      return initial;
    }
  });
  const [justSaved, setJustSaved] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1500);
      } catch (e) {}
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state, storageKey]);

  return [state, setState, justSaved];
}

function SpreadMeter({ value, t }) {
  const pct = Math.max(0, Math.min(2.5, value));
  const posPercent = (pct / 2.5) * 100;
  let zoneLabel = t.normal;
  if (pct < 0.3) zoneLabel = t.low;
  else if (pct > 1.2) zoneLabel = t.high;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-[11px] tracking-wide font-mono text-stone-400 mb-1">
        <span>0%</span><span>1.25%</span><span>2.5%+</span>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-[#3FBF7F] via-[#E8A33D] to-[#E5484D]">
        <div className="absolute -top-1.5 w-4 h-4 rounded-full bg-[#EDEFF2] border-2 border-[#0f2a3d] shadow"
          style={{ left: `calc(${posPercent}% - 8px)` }} />
      </div>
      <p className="text-xs font-mono mt-2 text-stone-400">
        {t.spreadLabel}: <span className="text-[#EDEFF2]">{fmt(value)}%</span> · {zoneLabel}
      </p>
    </div>
  );
}

function NumberField({ label, value, onChange, step = "any", suffix }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5 font-sans">{label}</span>
      <div className="flex items-center gap-2 bg-[#0B0E11] border border-[#34394A] rounded-lg px-3 py-2.5 focus-within:border-[#E8A33D] transition-colors">
        <input type="number" step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full bg-transparent outline-none font-mono text-[#EDEFF2] text-lg" />
        {suffix && <span className="text-stone-500 text-sm font-mono whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-[#161920] border border-[#262B35] rounded-2xl p-5 ${className}`}>{children}</div>;
}

// ---- Break-even calculator ----
// Given a buy price and round-trip fee %, what sell price is needed to
// break even? This does not depend on capital, only on price and fee.
function BreakEven({ currency, asset }) {
  const [buy, setBuy] = useState(11.2);
  const [fee, setFee] = useState(0.1);
  const breakEvenPrice = buy * (1 + (2 * fee) / 100);

  return (
    <Card className="mt-5">
      <p className="text-xs uppercase tracking-wider text-stone-400 mb-3 font-mono">Break-even price</p>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Buy price" value={buy} onChange={setBuy} step="0.001" suffix={`${asset}/${currency}`} />
        <NumberField label="Fees (%)" value={fee} onChange={setFee} step="0.01" suffix="%" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-sm text-stone-400">Sell at or above</span>
        <span className="font-mono text-2xl font-bold text-[#E8A33D]">{fmt(breakEvenPrice)}</span>
        <span className="text-sm text-stone-500">{asset}/{currency}</span>
      </div>
      <p className="text-[11px] text-stone-500 mt-1">to avoid a loss on this trade.</p>
    </Card>
  );
}

// ---- Compare exchanges: manual price entry, ranked by profit ----
// Live P2P prices can't be fetched reliably from the browser (most
// exchanges' P2P endpoints block cross-origin requests), so this stays
// manual: type each exchange's current buy price and it ranks them and
// links straight to the best one via your existing referral link.
const COMPARE_EXCHANGES = [
  { name: "Binance", accent: "#F0B90B", href: "https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_OZIWV&utm_source=referral_entrance" },
  { name: "Bybit", accent: "#F7A600", href: "https://partner.bybit.com/b/157970" },
  { name: "OKX", accent: "#B0B0B0", href: "https://okx.com/join/31050757" },
  { name: "BingX", accent: "#3B82F6", href: "https://bingxdao.com/invite/N0ZCF7/" },
  { name: "KuCoin", accent: "#22C08F", href: "https://link.kucoin.com/iqEP/alk9lpk6?utm_source=refer_earn&utm_campaign=referAndEarn&rcode=QBSAKVY7&utm_medium=share" },
];

function ExchangeCompare({ currency, asset }) {
  const [rows, setRows] = usePersistentState("exchange-compare-prices", {
    Binance: 11.2, Bybit: 11.22, OKX: 11.18, BingX: 11.25, KuCoin: 11.19,
  });
  const [sellPrice, setSellPrice] = useState(11.35);

  const ranked = useMemo(() => {
    return COMPARE_EXCHANGES.map((ex) => {
      const buy = rows[ex.name] ?? 0;
      const spread = buy ? ((sellPrice - buy) / buy) * 100 : 0;
      return { ...ex, buy, spread };
    }).sort((a, b) => b.spread - a.spread);
  }, [rows, sellPrice]);

  const best = ranked[0];

  return (
    <Card className="mt-5">
      <div className="flex items-center justify-between mb-3 gap-3">
        <p className="text-xs uppercase tracking-wider text-stone-400 font-mono">Compare exchanges (buy price)</p>
        <label className="flex items-center gap-1.5 text-[11px] text-stone-500">
          vs. sell
          <input
            type="number"
            step="0.001"
            value={sellPrice}
            onChange={(e) => setSellPrice(parseFloat(e.target.value))}
            className="w-20 bg-[#0D0F14] border border-[#34394A] rounded px-1.5 py-0.5 font-mono text-xs text-[#EDEFF2] outline-none focus-visible:border-[#E8A33D]"
          />
        </label>
      </div>

      <div className="space-y-2">
        {ranked.map((ex, i) => (
          <div
            key={ex.name}
            className="flex items-center gap-3 rounded-lg border px-3 py-2"
            style={{ borderColor: i === 0 ? ex.accent : "#262B35" }}
          >
            <span className="w-16 text-sm font-semibold text-[#EDEFF2]">{ex.name}</span>
            <input
              type="number"
              step="0.001"
              value={rows[ex.name]}
              onChange={(e) => setRows((s) => ({ ...s, [ex.name]: parseFloat(e.target.value) }))}
              className="w-24 bg-[#0D0F14] border border-[#34394A] rounded px-2 py-1 font-mono text-sm text-[#EDEFF2] outline-none focus-visible:border-[#E8A33D]"
            />
            <span className="flex-1 text-right font-mono text-sm" style={{ color: ex.spread >= 0 ? "#3FBF7F" : "#E5484D" }}>
              {ex.spread >= 0 ? "+" : ""}{fmt(ex.spread)}%
            </span>
            {i === 0 && (
              <a
                href={ex.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => trackAffiliateClick(ex.name)}
                className="text-[11px] font-mono px-2 py-1 rounded-full border"
                style={{ borderColor: ex.accent, color: ex.accent }}
              >
                Trade here →
              </a>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-stone-500 mt-3">
        Type each exchange's current buy price manually — live cross-exchange
        rates aren't available directly in the browser. {best?.name} currently
        gives the best spread based on what you entered.
      </p>
    </Card>
  );
}

// ---- Calculation history (localStorage, last 10 entries) ----
function useCalcHistory(key) {
  const storageKey = `moulay-p2p:history:${key}`;
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const addEntry = (entry) => {
    setHistory((prev) => {
      const next = [{ ...entry, ts: Date.now() }, ...prev].slice(0, 10);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(storageKey); } catch (e) {}
  };

  return [history, addEntry, clearHistory];
}

function HistoryList({ history, onClear, currency }) {
  if (!history.length) return null;
  return (
    <div className="mt-5 pt-4 border-t border-[#262B35]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-stone-400">Recent calculations</span>
        <button onClick={onClear} className="text-[11px] text-stone-500 hover:text-[#E5484D] transition-colors">
          Clear
        </button>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {history.map((h, i) => (
          <div key={h.ts + "-" + i} className="flex justify-between text-xs font-mono text-stone-400">
            <span>{new Date(h.ts).toLocaleTimeString()}</span>
            <span>{fmt(h.capital)} {currency} · {fmt(h.buy)}→{fmt(h.sell)}</span>
            <span className={h.profit >= 0 ? "text-[#3FBF7F]" : "text-[#E5484D]"}>
              {h.profit >= 0 ? "+" : ""}{fmt(h.profit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Share result via WhatsApp / Telegram ----
function ShareButtons({ text }) {
  const encoded = encodeURIComponent(text);
  return (
    <div className="flex gap-2 mt-4">
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center text-xs font-mono border border-[#262B35] rounded-full px-3 py-2 text-stone-300 hover:border-[#3FBF7F] hover:text-[#3FBF7F] transition-colors"
      >
        Share on WhatsApp
      </a>
      <a
        href={`https://t.me/share/url?url=&text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center text-xs font-mono border border-[#262B35] rounded-full px-3 py-2 text-stone-300 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
      >
        Share on Telegram
      </a>
    </div>
  );
}

function SingleTrade({ t, currency, asset }) {
  const [vals, setVals, justSaved] = usePersistentState("single-trade-inputs", {
    capital: 5000, buy: 11.2, sell: 11.35, fee: 0.1,
  });
  const { capital, buy, sell, fee } = vals;
  const setCapital = (v) => setVals((s) => ({ ...s, capital: v }));
  const setBuy = (v) => setVals((s) => ({ ...s, buy: v }));
  const setSell = (v) => setVals((s) => ({ ...s, sell: v }));
  const setFee = (v) => setVals((s) => ({ ...s, fee: v }));

  const { profit, margin, spread } = useMemo(() => {
    const units = capital / (buy || 1);
    const gross = units * (sell - buy);
    const feeCost = capital * (fee / 100) * 2;
    const profit = gross - feeCost;
    const margin = capital ? (profit / capital) * 100 : 0;
    const spread = buy ? ((sell - buy) / buy) * 100 : 0;
    return { profit, margin, spread };
  }, [capital, buy, sell, fee]);

  const [history, addEntry, clearHistory] = useCalcHistory("single-trade");

  const shareText =
    `P2P trade result (${asset}/${currency}):\n` +
    `Capital: ${fmt(capital)} ${currency}\n` +
    `Buy: ${fmt(buy)} · Sell: ${fmt(sell)}\n` +
    `Net profit: ${profit >= 0 ? "+" : ""}${fmt(profit)} ${currency} (${fmt(margin)}%)\n` +
    `via calc.moulaytrading.fit`;

  const pairSuffix = `${asset}/${currency}`;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card>
        <NumberField label={t.single.capital} value={capital} onChange={setCapital} suffix={currency} />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={t.single.buy} value={buy} onChange={setBuy} step="0.001" suffix={pairSuffix} />
          <NumberField label={t.single.sell} value={sell} onChange={setSell} step="0.001" suffix={pairSuffix} />
        </div>
        <NumberField label={t.single.fee} value={fee} onChange={setFee} step="0.01" suffix="%" />
        <SpreadMeter value={spread} t={t.single} />
        <p className={`text-[11px] font-mono mt-3 transition-opacity ${justSaved ? "opacity-100 text-[#3FBF7F]" : "opacity-0"}`}>{t.saved}</p>
      </Card>

      <Card className="flex flex-col justify-center items-center text-center">
        <span className="text-xs uppercase tracking-wider text-stone-400 mb-2 font-mono">{t.single.result}</span>
        <span className={`text-5xl font-mono font-bold ${profit >= 0 ? "text-[#3FBF7F]" : "text-[#E5484D]"}`}>
          {profit >= 0 ? "+" : ""}<OdometerNumber value={profit} /> <span className="text-2xl text-stone-500">{currency}</span>
        </span>
        <div className="mt-6 w-full h-px bg-[#262B35]" />
        <div className="mt-4 flex justify-between w-full text-sm">
          <span className="text-stone-400">{t.single.margin}</span>
          <span className="font-mono text-[#EDEFF2]">{fmt(margin)}%</span>
        </div>

        <button
          onClick={() => addEntry({ capital, buy, sell, fee, profit })}
          className="mt-4 w-full text-xs font-mono border border-[#34394A] rounded-full px-3 py-2 text-stone-300 hover:border-[#E8A33D] hover:text-[#E8A33D] transition-colors"
        >
          Save this calculation
        </button>

        <ShareButtons text={shareText} />

        <HistoryList history={history} onClear={clearHistory} currency={currency} />
      </Card>
    </div>
  );
}

function Compounding({ t, currency }) {
  const [vals, setVals, justSaved] = usePersistentState("compounding-inputs", {
    start: 3000, weekly: 500, trades: 10, spread: 0.6, weeks: 26,
  });
  const { start, weekly, trades, spread, weeks } = vals;
  const setStart = (v) => setVals((s) => ({ ...s, start: v }));
  const setWeekly = (v) => setVals((s) => ({ ...s, weekly: v }));
  const setTrades = (v) => setVals((s) => ({ ...s, trades: v }));
  const setSpread = (v) => setVals((s) => ({ ...s, spread: v }));
  const setWeeks = (v) => setVals((s) => ({ ...s, weeks: v }));

  const data = useMemo(() => {
    let capital = start;
    let injected = start;
    const rows = [];
    for (let w = 1; w <= weeks; w++) {
      capital += weekly; injected += weekly;
      const weeklyProfit = capital * (spread / 100) * trades;
      capital += weeklyProfit;
      rows.push({ week: w, capital: Math.round(capital), injected: Math.round(injected) });
    }
    return rows;
  }, [start, weekly, trades, spread, weeks]);

  const final = data[data.length - 1] || { capital: start, injected: start };
  const totalProfit = final.capital - final.injected;

  return (
    <div className="grid md:grid-cols-[340px_1fr] gap-5">
      <Card>
        <NumberField label={t.compound.start} value={start} onChange={setStart} suffix={currency} />
        <NumberField label={t.compound.weekly} value={weekly} onChange={setWeekly} suffix={currency} />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={t.compound.trades} value={trades} onChange={setTrades} />
          <NumberField label={t.compound.spread} value={spread} onChange={setSpread} step="0.01" suffix="%" />
        </div>
        <NumberField label={t.compound.weeks} value={weeks} onChange={setWeeks} />
        <p className={`text-[11px] font-mono transition-opacity ${justSaved ? "opacity-100 text-[#3FBF7F]" : "opacity-0"}`}>{t.saved}</p>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-400">{t.compound.finalCapital}</div>
            <div className="font-mono text-xl font-bold text-[#EDEFF2] mt-1">{fmt(final.capital)}</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-400">{t.compound.totalProfit}</div>
            <div className="font-mono text-xl font-bold text-[#3FBF7F] mt-1">+{fmt(totalProfit)}</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-400">{t.compound.totalInjected}</div>
            <div className="font-mono text-xl font-bold text-[#E8A33D] mt-1">{fmt(final.injected)}</div>
          </Card>
        </div>

        <Card className="flex-1">
          <p className="text-xs uppercase tracking-wider text-stone-400 mb-3">{t.compound.chartTitle}</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid stroke="#262B35" strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke="#687EE3" fontSize={11} />
              <YAxis stroke="#687EE3" fontSize={11} width={60} />
              <Tooltip contentStyle={{ background: "#0B0E11", border: "1px solid #34394A", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="capital" stroke="#E8A33D" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="injected" stroke="#687EE3" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Compare({ t, currency }) {
  const [vals, setVals, justSaved] = usePersistentState("compare-inputs", {
    capA: 5000, spreadA: 1.1, tradesA: 4, capB: 5000, spreadB: 0.35, tradesB: 18, weeks: 12,
  });
  const { capA, spreadA, tradesA, capB, spreadB, tradesB, weeks } = vals;
  const setCapA = (v) => setVals((s) => ({ ...s, capA: v }));
  const setSpreadA = (v) => setVals((s) => ({ ...s, spreadA: v }));
  const setTradesA = (v) => setVals((s) => ({ ...s, tradesA: v }));
  const setCapB = (v) => setVals((s) => ({ ...s, capB: v }));
  const setSpreadB = (v) => setVals((s) => ({ ...s, spreadB: v }));
  const setTradesB = (v) => setVals((s) => ({ ...s, tradesB: v }));
  const setWeeks = (v) => setVals((s) => ({ ...s, weeks: v }));

  const data = useMemo(() => {
    let a = 0, b = 0;
    const rows = [];
    for (let w = 1; w <= weeks; w++) {
      a += capA * (spreadA / 100) * tradesA;
      b += capB * (spreadB / 100) * tradesB;
      rows.push({ week: w, profitA: Math.round(a), profitB: Math.round(b) });
    }
    return rows;
  }, [capA, spreadA, tradesA, capB, spreadB, tradesB, weeks]);

  const last = data[data.length - 1] || { profitA: 0, profitB: 0 };
  const winner = last.profitA === last.profitB ? "—" : last.profitA > last.profitB ? t.compare.stratA : t.compare.stratB;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <p className="text-sm font-semibold text-[#E8A33D] mb-3">{t.compare.stratA}</p>
          <NumberField label={t.compare.capital} value={capA} onChange={setCapA} suffix={currency} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label={t.compare.spread} value={spreadA} onChange={setSpreadA} step="0.01" suffix="%" />
            <NumberField label={t.compare.trades} value={tradesA} onChange={setTradesA} />
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-[#3FBF7F] mb-3">{t.compare.stratB}</p>
          <NumberField label={t.compare.capital} value={capB} onChange={setCapB} suffix={currency} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label={t.compare.spread} value={spreadB} onChange={setSpreadB} step="0.01" suffix="%" />
            <NumberField label={t.compare.trades} value={tradesB} onChange={setTradesB} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div className="w-40"><NumberField label={t.compare.weeks} value={weeks} onChange={setWeeks} /></div>
          <div className="flex gap-6 text-sm">
            <span className="text-stone-400">{t.compare.profitA}: <span className="font-mono text-[#E8A33D]">{fmt(last.profitA)}</span></span>
            <span className="text-stone-400">{t.compare.profitB}: <span className="font-mono text-[#3FBF7F]">{fmt(last.profitB)}</span></span>
            <span className="text-stone-400">{t.compare.winner}: <span className="font-semibold text-[#EDEFF2]">{winner}</span></span>
          </div>
        </div>
        <p className={`text-[11px] font-mono mb-2 transition-opacity ${justSaved ? "opacity-100 text-[#3FBF7F]" : "opacity-0"}`}>{t.saved}</p>
        <p className="text-xs uppercase tracking-wider text-stone-400 mb-3">{t.compare.chartTitle}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid stroke="#262B35" strokeDasharray="3 3" />
            <XAxis dataKey="week" stroke="#687EE3" fontSize={11} />
            <YAxis stroke="#687EE3" fontSize={11} width={60} />
            <Tooltip contentStyle={{ background: "#0B0E11", border: "1px solid #34394A", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="profitA" name={t.compare.stratA} fill="#E8A33D" radius={[3, 3, 0, 0]} />
            <Bar dataKey="profitB" name={t.compare.stratB} fill="#3FBF7F" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function LegalSection({ title, body }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-[#E8A33D] mb-2">{title}</h3>
      <p className="text-sm text-stone-300 leading-relaxed">{body}</p>
    </Card>
  );
}

function Legal({ t }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.legal.title}</h2>
      <LegalSection title={t.legal.disclaimerTitle} body={t.legal.disclaimer} />
      <LegalSection title={t.legal.privacyTitle} body={t.legal.privacy} />
      <LegalSection title={t.legal.termsTitle} body={t.legal.terms} />
      <LegalSection title={t.legal.contactTitle} body={t.legal.contact} />
    </div>
  );
}

// AdSense-ready ad slot. On a real deployed domain with the AdSense script loaded
// in index.html (see README), this renders a real <ins class="adsbygoogle"> unit.
// In preview/local dev (no adsbygoogle script present) it shows a subtle placeholder
// so layout/spacing can be reviewed before ads are live.
// Detects whether we're running inside the packaged Capacitor app (Android/iOS)
// vs. the plain website. AdSense is web-only and must never run inside the
// packaged app — Google Play policy requires AdMob (or another mobile SDK)
// for ads shown inside a native app shell.
function isNativeApp() {
  return typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform();
}

function AdSlot({ slotId = "0000000000", format = "auto", label = "Ad" }) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // Never load AdSense inside the native app shell.
    if (isNativeApp()) return;
    if (typeof window !== "undefined" && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setLive(true);
      } catch (e) {
        // AdSense script not loaded (e.g. preview environment) — placeholder stays visible
      }
    }
  }, []);

  // Inside the native app, this inline slot renders nothing — the AdMob
  // banner (see NativeBannerAd below) is shown as a separate native overlay
  // anchored to the bottom of the screen instead.
  if (isNativeApp()) return null;

  return (
    <div className="no-print my-4 flex justify-center">
      {!live && (
        <div className="w-full max-w-2xl border border-dashed border-[#34394A] rounded-lg py-6 text-center text-[11px] uppercase tracking-wider text-stone-600">
          {label} Space — AdSense unit renders here on the live site
        </div>
      )}
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: live ? "block" : "none", width: "100%", maxWidth: "728px" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ---- AdMob banner for the packaged Android/iOS app ----
// Requires: npm install @capacitor-community/admob
// then: npx cap sync
// Mount this ONCE near the root of <App /> (not per-tab). AdMob banners are
// native views drawn on top of the WebView, anchored to the bottom of the
// screen — they are not part of the React tree's layout.
//
// IMPORTANT: use Google's official TEST ad unit IDs during development.
// Serving real ads to yourself, or shipping before your AdMob account is
// approved, can get your AdMob account suspended. Swap in your real ad unit
// ID only in a signed release build you're about to publish.
function NativeBannerAd({ testMode = true }) {
  useEffect(() => {
    if (!isNativeApp()) return;
    let mounted = true;

    import(/* @vite-ignore */ "@capacitor-community/admob")
      .then(async ({ AdMob, BannerAdPosition, BannerAdSize }) => {
        if (!mounted) return;
        await AdMob.initialize({
          initializeForTesting: testMode,
        });
        await AdMob.showBanner({
          adId: testMode
            ? "ca-app-pub-3940256099942544/6300978111" // Google's shared Android test banner ID
            : "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY", // <- your real AdMob banner unit ID
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: testMode,
        });
      })
      .catch(() => {
        // Plugin not installed yet / running in a preview — fail silently.
      });

    return () => {
      mounted = false;
      import(/* @vite-ignore */ "@capacitor-community/admob")
        .then(({ AdMob }) => AdMob.hideBanner())
        .catch(() => {});
    };
  }, [testMode]);

  return null; // purely a side-effecting component; no inline UI
}

function SettingSelect({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-mono">
      <span className="text-stone-500 hidden sm:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#0B0E11] border border-[#34394A] rounded-full px-2.5 py-1.5 text-stone-200 outline-none hover:border-[#E8A33D] transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function App() {
  const [settings, setSettings] = usePersistentState("global-settings", {
    lang: "ar", currency: "MAD", asset: "USDT",
  });
  const { lang, currency, asset } = settings;
  const [tab, setTab] = useState("single");
  const t = STR[lang];

  const setLang = (v) => setSettings((s) => ({ ...s, lang: v }));
  const setCurrency = (v) => setSettings((s) => ({ ...s, currency: v }));
  const setAsset = (v) => setSettings((s) => ({ ...s, asset: v }));

  const langOptions = Object.entries(STR).map(([code, v]) => ({ value: code, label: v.langName }));
  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));
  const assetOptions = ASSETS.map((a) => ({ value: a, label: a }));

  return (
    <div
      dir={t.dir}
      className="min-h-screen bg-[#0D0F14] text-[#EDEFF2]"
      style={{ fontFamily: lang === "ar" ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0; }

        @keyframes digit-roll {
          from { transform: translateY(55%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .odometer-digit > span {
          animation: digit-roll 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .odometer-digit > span { animation: none; }
        }

        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ticker-track {
          width: max-content;
          animation: ticker-scroll 28s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
        a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible {
          outline: 2px solid #E8A33D;
          outline-offset: 2px;
        }
        @media print {
          header, nav, footer, .no-print { display: none !important; }
          body, .min-h-screen { background: #ffffff !important; color: #111111 !important; }
          #printable-area { color: #111111 !important; }
          #printable-area * { color: #111111 !important; border-color: #cccccc !important; background: #ffffff !important; }
        }
      `}</style>

      <div className="no-print">
        <LivePriceTicker />
      </div>

      <header className="border-b border-[#262B35] px-5 py-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.brand}</h1>
            <p className="text-xs text-stone-400 mt-0.5">{t.tagline}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SettingSelect value={currency} onChange={setCurrency} options={currencyOptions} label={t.currencyLabel} />
            <SettingSelect value={asset} onChange={setAsset} options={assetOptions} label={t.assetLabel} />
            <SettingSelect value={lang} onChange={setLang} options={langOptions} label="" />
            <button onClick={() => window.print()}
              className="text-xs font-mono border border-[#34394A] rounded-full px-3 py-1.5 text-stone-300 hover:border-[#E8A33D] hover:text-[#E8A33D] transition-colors">
              {t.export}
            </button>
          </div>
        </div>
      </header>

      <NativeBannerAd testMode={true} />

      <nav className="max-w-5xl mx-auto px-5 pt-5 flex gap-2 flex-wrap">
        {Object.entries(t.tabs).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === key ? "bg-[#E8A33D] text-[#0D0F14]" : "bg-[#161920] text-stone-300 border border-[#262B35] hover:border-[#E8A33D]"
            }`}>
            {label}
          </button>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto px-5">
        <AdSlot slotId="1111111111" label="Top banner" />
      </div>

      <main id="printable-area" className="max-w-5xl mx-auto px-5 py-6">
        {tab === "single" && (
          <>
            <SingleTrade t={t} currency={currency} asset={asset} />
            <div className="grid md:grid-cols-2 gap-5">
              <BreakEven currency={currency} asset={asset} />
              <ExchangeCompare currency={currency} asset={asset} />
            </div>
          </>
        )}
        {tab === "compound" && <Compounding t={t} currency={currency} />}
        {tab === "compare" && <Compare t={t} currency={currency} />}
        {tab === "legal" && <Legal t={t} />}
      </main>

      <AffiliateBanner />

      <div className="max-w-5xl mx-auto px-5">
        <AdSlot slotId="2222222222" label="In-content" />
      </div>

      <footer className="max-w-5xl mx-auto px-5 py-6 mt-4 border-t border-[#262B35] text-xs text-stone-500 leading-relaxed">
        {t.footer}
      </footer>
    </div>
  );
}
