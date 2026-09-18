import './site-chrome.css'

type NavNode =
  | {kind: 'head'; text: string; sub?: boolean}
  | {kind: 'link'; text: string; href: string}

type NavItem = {label: string; cols: NavNode[][]}

const SITE = 'https://www.maximuslabs.ai'

const NAV: NavItem[] = [
  {
    label: 'Services',
    cols: [
      [
        {kind: 'head', text: 'Expertise'},
        {kind: 'link', text: 'Generative Engine Optimisation', href: `${SITE}/services/geo`},
        {kind: 'link', text: 'Answer Engine Optimisation', href: `${SITE}/services/aeo`},
        {kind: 'link', text: 'Agentic Commerce', href: `${SITE}/services/agentic-commerce`},
        {kind: 'link', text: 'B2B SEO', href: `${SITE}/services/b2b-seo`},
      ],
      [
        {kind: 'head', text: 'Platforms'},
        {kind: 'link', text: 'ChatGPT', href: `${SITE}/services/platforms/chatgpt`},
        {kind: 'link', text: 'Gemini', href: `${SITE}/services/platforms/google-ai-gemini`},
        {kind: 'link', text: 'Perplexity', href: `${SITE}/services/platforms/perplexity`},
        {kind: 'link', text: 'Google AI Mode', href: `${SITE}/services/platforms/best-google-ai-optimization-agency---built-for-revenue-not-vanity-metrics-2026`},
        {kind: 'link', text: 'Claude', href: `${SITE}/services/platforms/anthropic-claude`},
      ],
    ],
  },
  {
    label: 'Resources',
    cols: [
      [
        {kind: 'head', text: 'Learn'},
        {kind: 'link', text: 'AI Search 101', href: `${SITE}/ai-search-101`},
        {kind: 'link', text: 'Blogs', href: `${SITE}/blog`},
        {kind: 'link', text: 'Industry Reports', href: `${SITE}/resources/reports`},
      ],
      [
        {kind: 'head', text: 'Tools'},
        {kind: 'link', text: 'AI Tool Directory', href: `${SITE}/resources/ai-tool-directory`},
        {kind: 'head', text: 'Free AI Tools', sub: true},
        {kind: 'link', text: 'AI Content Humanizer', href: `${SITE}/resources/free-tools/ai-content-humanizer`},
        {kind: 'link', text: 'AI Content Optimizer', href: `${SITE}/resources/free-tools/ai-content-optimizer`},
        {kind: 'link', text: 'AI Crawlability Checker', href: `${SITE}/resources/free-tools/ai-crawlability-checker`},
        {kind: 'link', text: 'LLM Text Generator', href: `${SITE}/resources/free-tools/llms-txt-generator`},
      ],
    ],
  },
  {
    label: 'Industries',
    cols: [
      [
        {kind: 'link', text: 'AI | SaaS', href: `${SITE}/services/industries/ai-saas`},
        {kind: 'link', text: 'Fintech', href: `${SITE}/services/industries/financial`},
        {kind: 'link', text: 'Ecommerce', href: `${SITE}/services/industries/ecommerce`},
      ],
    ],
  },
  {
    label: 'Company',
    cols: [
      [
        {kind: 'link', text: 'About Us', href: `${SITE}/company/about-us`},
        {kind: 'link', text: 'Case Studies', href: `${SITE}/company/case-studies/case-studies-collection`},
        {kind: 'link', text: 'Career', href: `${SITE}/company/careers`},
      ],
    ],
  },
]

function MaximusMark() {
  return (
    <svg className="ml-brand-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M37 23.9998H30.064C26.715 23.9998 24 26.7148 24 30.0638V47.4268C24 47.6458 24.26 47.7598 24.421 47.6108L37 35.9998V23.9998Z" fill="#449AFB" />
      <path d="M36.9995 24H30.0635C28.6275 24 27.3085 24.499 26.2695 25.333L36.9995 36V24Z" fill="#003087" />
      <path d="M11 24H17.936C21.285 24 24 21.285 24 17.936V0.574006C24 0.355006 23.74 0.241003 23.579 0.390004L11 12V24Z" fill="#449AFB" />
      <path d="M11 24H17.936C19.372 24 20.691 23.501 21.73 22.667L11 12V24Z" fill="#003087" />
      <path d="M23.9997 37V30.064C23.9997 26.715 21.2847 24 17.9357 24H0.572748C0.353748 24 0.239748 24.26 0.388748 24.421L11.9997 37H23.9997Z" fill="#449AFB" />
      <path d="M24 37V30.064C24 28.628 23.501 27.309 22.667 26.27L12 37H24Z" fill="#003087" />
      <path d="M24 11V17.936C24 21.285 26.715 24 30.064 24H47.426C47.645 24 47.759 23.74 47.61 23.579L36 11H24Z" fill="#449AFB" />
      <path d="M24 11V17.936C24 19.372 24.499 20.691 25.333 21.73L36 11H24Z" fill="#003087" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header className="ml-nav">
      <div className="ml-nav-inner">
        <div className="ml-nav-left">
          <a className="ml-brand" href={`${SITE}/`} aria-label="Maximus Labs">
            <MaximusMark />
          </a>
          <nav className="ml-nav-links" aria-label="Primary">
            {NAV.map((item) => (
              <div className="ml-nav-item" key={item.label}>
                <span className="ml-nav-trig">
                  {item.label}
                  <Chevron />
                </span>
                <div className="ml-nav-pop">
                  <div className="ml-np-inner">
                    {item.cols.map((col, ci) => (
                      <div className="ml-np-col" key={ci}>
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
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="ml-nav-right">
          <a className="ml-nav-plain" href={`${SITE}/pricing`}>Pricing</a>
          <a className="ml-nav-cta" href={`${SITE}/contact-us`}>Contact us</a>
        </div>
      </div>
    </header>
  )
}
