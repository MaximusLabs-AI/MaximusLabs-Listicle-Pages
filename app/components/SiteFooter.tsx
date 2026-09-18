import './site-chrome.css'

import {MaximusMark} from './SiteHeader'

type FNode =
  | {kind: 'head'; text: string; sub?: boolean}
  | {kind: 'link'; text: string; href: string}

const SITE = 'https://www.maximuslabs.ai'

const COLS: FNode[][] = [
  [
    {kind: 'head', text: 'Services'},
    {kind: 'link', text: 'Generative Engine Optimization', href: `${SITE}/services/geo`},
    {kind: 'link', text: 'Answer Engine Optimization', href: `${SITE}/services/aeo`},
    {kind: 'link', text: 'Agentic Commerce', href: `${SITE}/services/agentic-commerce`},
    {kind: 'link', text: 'B2B SEO', href: `${SITE}/services/b2b-seo`},
    {kind: 'head', text: 'Industries', sub: true},
    {kind: 'link', text: 'SaaS | AI', href: `${SITE}/services/industries/ai-saas`},
    {kind: 'link', text: 'Ecommerce', href: `${SITE}/services/industries/ecommerce`},
    {kind: 'link', text: 'Fintech', href: `${SITE}/services/industries/financial`},
  ],
  [
    {kind: 'head', text: 'Answer Engine Optimization'},
    {kind: 'link', text: 'What is AEO?', href: `${SITE}/answer-engine-optimizations/aeo`},
    {kind: 'link', text: 'AEO vs SEO', href: `${SITE}/answer-engine-optimizations/aeo-vs-seo`},
    {kind: 'link', text: 'Best AEO Agencies', href: `${SITE}/answer-engine-optimizations/best-aeo-agencies`},
    {kind: 'link', text: 'Enterprise AEO Agencies', href: `${SITE}/answer-engine-optimizations/enterprise-aeo-agencies`},
    {kind: 'link', text: 'Ecommerce AEO Agencies', href: `${SITE}/answer-engine-optimizations/ecommerce-aeo-geo-agencies`},
    {kind: 'link', text: 'Best AEO Tools', href: `${SITE}/answer-engine-optimizations/aeo-tools-comparison`},
    {kind: 'link', text: 'AEO Implementation Checklist', href: `${SITE}/answer-engine-optimizations/aeo-implementation-checklist-50-best-practices-ai-search`},
    {kind: 'link', text: 'AI Search Tracking Tools', href: `${SITE}/answer-engine-optimizations/ai-search-visibility-brand-mentions-tracking-tools`},
  ],
  [
    {kind: 'head', text: 'Generative Engine Optimization'},
    {kind: 'link', text: 'What is GEO?', href: `${SITE}/blog/what-is-generative-engine-optimization-geo`},
    {kind: 'link', text: 'GEO vs Traditional SEO', href: `${SITE}/generative-engine-optimization/geo-vs-traditional-seo-comparison`},
    {kind: 'link', text: 'Best GEO Agencies', href: `${SITE}/generative-engine-optimization/best-geo-agency-services`},
    {kind: 'link', text: 'GEO Strategy Framework', href: `${SITE}/generative-engine-optimization/geo-strategy-framework`},
    {kind: 'link', text: 'GEO Case Studies', href: `${SITE}/generative-engine-optimization/geo-case-studies-success-stories`},
    {kind: 'link', text: 'GEO Market Analysis 2026', href: `${SITE}/generative-engine-optimization/geo-market-analysis`},
    {kind: 'link', text: 'Top GEO Tools', href: `${SITE}/generative-engine-optimization/top-geo-tools-platforms`},
    {kind: 'link', text: 'Technical GEO Implementation', href: `${SITE}/generative-engine-optimization/technical-geo-implementation`},
    {kind: 'link', text: 'Peec AI Alternatives', href: `${SITE}/answer-engine-optimizations/top-peec-ai-alternatives-competitors`},
  ],
  [
    {kind: 'head', text: 'Tools'},
    {kind: 'link', text: 'AI Tool Directory', href: `${SITE}/resources/ai-tool-directory`},
    {kind: 'link', text: 'AI Content Humanizer', href: `${SITE}/resources/free-tools/ai-content-humanizer`},
    {kind: 'link', text: 'AI Content Optimizer', href: `${SITE}/resources/free-tools/ai-content-optimizer`},
    {kind: 'link', text: 'AI Crawlability Checker', href: `${SITE}/resources/free-tools/ai-crawlability-checker`},
    {kind: 'link', text: 'LLM Text Generator', href: `${SITE}/resources/free-tools/llms-txt-generator`},
  ],
  [
    {kind: 'head', text: 'Resources'},
    {kind: 'link', text: 'Blogs', href: `${SITE}/blog`},
    {kind: 'link', text: 'AI Search 101', href: `${SITE}/ai-search-101`},
    {kind: 'link', text: 'Industry Reports', href: `${SITE}/resources/reports`},
    {kind: 'link', text: 'ChatGPT SEO Guide', href: `${SITE}/services/platforms/chatgpt`},
    {kind: 'link', text: 'Perplexity SEO Guide', href: `${SITE}/services/platforms/perplexity`},
    {kind: 'link', text: 'Gemini Guide', href: `${SITE}/services/platforms/google-ai-gemini`},
    {kind: 'link', text: 'Claude Guide', href: `${SITE}/services/platforms/anthropic-claude`},
  ],
  [
    {kind: 'head', text: 'Company'},
    {kind: 'link', text: 'About Us', href: `${SITE}/company/about-us`},
    {kind: 'link', text: 'Case Studies', href: `${SITE}/company/case-studies/case-studies-collection`},
    {kind: 'link', text: 'Career', href: `${SITE}/company/careers`},
  ],
]

const LEGAL = [
  {text: 'Refund Policy', href: `${SITE}/others/refund-policy`},
  {text: 'Privacy Policy', href: `${SITE}/others/privacy-policy`},
  {text: 'Terms of Service', href: `${SITE}/others/terms-of-service`},
]

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V24h-4V8z" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="ml-mfooter">
      <div className="ml-wrap">
        <div className="ml-mf-top">
          <div className="ml-mf-brand">
            <a className="ml-brand" href={`${SITE}/`} aria-label="Maximus Labs">
              <MaximusMark />
              <span className="ml-mf-wordmark">Maximus Labs</span>
            </a>
            <p className="ml-mf-intro">
              Maximus Labs helps you rank on Google, ChatGPT, and beyond. Reach out today to build your AI-first, SEO-strong growth engine.
            </p>
          </div>
          <div className="ml-mf-actions">
            <a className="ml-nav-cta" href={`${SITE}/contact-us`}>Contact Us</a>
            <a className="ml-mf-li" href="https://www.linkedin.com/company/maximus-labs-ai/" aria-label="LinkedIn" target="_blank" rel="noopener">
              <LinkedInIcon />
            </a>
          </div>
        </div>

        <div className="ml-mf-cols">
          {COLS.map((col, ci) => (
            <div className="ml-mf-col" key={ci}>
              {col.map((node, ni) =>
                node.kind === 'head' ? (
                  <h4 className={node.sub ? 'ml-sub-h' : undefined} key={ni}>{node.text}</h4>
                ) : (
                  <a href={node.href} key={ni}>{node.text}</a>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="ml-mf-bar">
          <span>Copyright © 2025 Maximus Labs | All rights reserved.</span>
          <span style={{display: 'flex', gap: 18, flexWrap: 'wrap'}}>
            {LEGAL.map((l) => (
              <a href={l.href} key={l.text}>{l.text}</a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
