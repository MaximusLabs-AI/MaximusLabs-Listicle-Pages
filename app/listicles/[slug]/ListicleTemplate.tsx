'use client'

import {useMemo, useState} from 'react'

type RecordValue = Record<string, any>

const marks: Record<string, string> = {F: '●', P: '◐', N: '○'}
const engineMarks: Record<string, string> = {tick: '✓', part: '~', none: '–'}

function safeArray<T = any>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function longDate(value?: string) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en', {month: 'long', year: 'numeric'}).format(new Date(`${value}T00:00:00`))
}

function getVertical(agency: RecordValue, key: string) {
  return safeArray(agency.verticalProfiles).find((profile) => profile.verticalKey === key)
}

function Ratings({ratings}: {ratings: RecordValue[]}) {
  if (!ratings.length) return <div className="empty">No published ratings found at review.</div>
  return (
    <div className="ratestrip" style={{gridTemplateColumns: `repeat(${ratings.length}, minmax(0, 1fr))`}}>
      {ratings.map((rating) => (
        <div key={rating._key || rating.platform}>
          <span className="rating-source">{rating.platform}</span>
          <strong>{rating.value}</strong>
          <small>{[rating.count, rating.note].filter(Boolean).join(' · ')}</small>
        </div>
      ))}
    </div>
  )
}

function ServiceLines({lines, limit}: {lines: RecordValue[]; limit?: number}) {
  const visible = limit ? lines.slice(0, limit) : lines
  if (!visible.length) return <div className="empty">No service-line records were imported.</div>
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>What they do</th><th>How this firm does it</th></tr></thead>
        <tbody>
          {visible.map((line) => (
            <tr key={line._key || `${line.order}-${line.name}`}>
              <td><b>{line.name}</b><small>{line.whyItExists}</small></td>
              <td>{line.howTheyDoIt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Engines({items}: {items: RecordValue[]}) {
  if (!items.length) return null
  return (
    <div className="table-wrap">
      <table className="engine-table">
        <thead><tr>{items.map((item) => <th key={item.engine}>{item.engine}</th>)}</tr></thead>
        <tbody><tr>{items.map((item) => <td key={item.engine}>{engineMarks[item.coverage] || '–'}</td>)}</tr></tbody>
      </table>
    </div>
  )
}

function Reviews({agency}: {agency: RecordValue}) {
  const reviews = safeArray(agency.reviews)
  return (
    <>
      {reviews.length ? reviews.map((review) => (
        <article className="review" key={review._key || review.quote}>
          <blockquote>“{review.quote}”</blockquote>
          <p><b>{review.reviewerName}</b> · {review.reviewerRole} · {review.source} <span>{review.verification === 'third-party' ? 'Third-party' : 'Vendor-published'}</span></p>
        </article>
      )) : <div className="empty">No published customer reviews found on any platform at review.</div>}
      {agency.reviewNote ? <p className="legend">{agency.reviewNote}{agency.reviewNoteSourceUrl ? <> <a href={agency.reviewNoteSourceUrl} target="_blank" rel="nofollow noopener">Review source →</a></> : null}</p> : null}
    </>
  )
}

function Cases({items}: {items: RecordValue[]}) {
  if (!items.length) return <div className="empty">No published case studies were imported.</div>
  return <>{items.map((item) => (
    <article className="case" key={item._key || item.client}>
      <header><b>{item.client}</b><span>{item.clientIndustry} · Source: {item.source}</span></header>
      <div><section><small>Problem</small><p>{item.problem}</p></section><section><small>Work done</small><p>{item.workDone}</p></section><section><small>Reported result</small><p>{item.reportedResult}</p></section></div>
    </article>
  ))}</>
}

function VerticalPanel({agency, verticalKey, compact = false}: {agency: RecordValue; verticalKey: string; compact?: boolean}) {
  const profile = getVertical(agency, verticalKey)
  if (!profile) return <div className="empty">No vertical profile was imported for {verticalKey}.</div>
  const lines = safeArray(profile.serviceLines)
  return (
    <div>
      <p className="panel-lead">{profile.pitch}</p>
      <ServiceLines lines={lines} limit={compact ? 5 : undefined} />
      <p className="legend">{compact ? `${Math.min(5, lines.length)} of ${lines.length} shown.` : `${lines.length} service lines, as published by the firm.`}</p>
      {!compact && safeArray(profile.notOffered).length ? <><h4>Not offered</h4><ul className="tick-list">{profile.notOffered.map((item: string) => <li key={item}>{item}</li>)}</ul></> : null}
      <dl className="definition-list">
        <dt>Built for</dt><dd>{safeArray(profile.builtFor).join(', ') || 'Not published'}</dd>
        <dt>Who they write against</dt><dd>{profile.whoTheyWriteAgainst}</dd>
        <dt>Proof they have done it</dt><dd>{profile.evidence}</dd>
        <dt>Where it breaks</dt><dd>{profile.whereItBreaks}</dd>
      </dl>
    </div>
  )
}

function AgencyCard({entry, verticalKey, onProfile}: {entry: RecordValue; verticalKey: string; onProfile: () => void}) {
  const agency = entry.agency || {}
  const [tab, setTab] = useState('trust')
  const tabs = [
    ['trust', 'Buyer trust'],
    ['capability', 'AEO capability'],
    ['vertical', `${verticalKey} services`],
    ['reviews', 'Reviews and ratings'],
    ['cases', 'Case studies'],
  ]
  const trust = agency.buyerTrust || {}
  return (
    <article className="agency-card" id={`card-${agency.playerId}`}>
      <div className="card-head">
        <div className="rank">{entry.rank}</div>
        <div className="card-identity">
          <h2>{agency.name}<small>{agency.home}</small></h2>
          <p>{agency.positioningLine}</p>
          <dl className="meta-grid">
            <div><dt>Location</dt><dd>{agency.headquarters}</dd></div>
            <div><dt>Founded</dt><dd>{agency.founded}</dd></div>
            <div><dt>Projects completed</dt><dd>{agency.projectsCompleted}</dd></div>
            <div><dt>Annual cost</dt><dd>{agency.pricing?.annualShort || agency.pricing?.annual}</dd></div>
          </dl>
          <p className="clients"><b>Notable clients.</b> {agency.notableClients}</p>
        </div>
        <div className="scorebox">
          <p><span>AEO capability</span><b>{entry.capabilityScore}/70</b></p>
          <p><span>{verticalKey} fit</span><b>{entry.industryScore}/30</b></p>
          <p><span>Signal rank</span><b>#{entry.signalRank}</b></p>
          <p><span>Evidence quality</span><b>{entry.evidenceQuality}/10</b></p>
        </div>
      </div>
      <Ratings ratings={safeArray(agency.ratings)} />
      <div className="vertical-tabs">
        <div className="tab-rail" role="tablist">
          {tabs.map(([key, label]) => <button key={key} type="button" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>)}
        </div>
        <div className="tab-panel">
          {tab === 'trust' ? <dl className="definition-list"><dt>Who they are</dt><dd>{trust.identity}</dd><dt>Offices</dt><dd>{safeArray(agency.offices).join(' · ')}</dd><dt>Team size</dt><dd>{agency.teamSize}</dd><dt>Strongest proof</dt><dd>{safeArray(trust.trackRecord)[0]}</dd><dt>Monthly pricing</dt><dd>{agency.pricing?.monthly}</dd><dt>Terms</dt><dd>{agency.pricing?.minimumEngagement} · {agency.pricing?.contractTerms}</dd></dl> : null}
          {tab === 'capability' ? <><ServiceLines lines={safeArray(agency.universalServiceLines)} limit={6} /><h4>Engine coverage</h4><Engines items={safeArray(agency.engineCoverage)} /><dl className="definition-list"><dt>What they measure</dt><dd>{agency.measurement}</dd><dt>Tooling</dt><dd>{agency.tooling}</dd><dt>Time to first result</dt><dd>{agency.timeToResult}</dd></dl></> : null}
          {tab === 'vertical' ? <VerticalPanel agency={agency} verticalKey={verticalKey} compact /> : null}
          {tab === 'reviews' ? <Reviews agency={agency} /> : null}
          {tab === 'cases' ? <Cases items={safeArray(agency.caseStudies)} /> : null}
        </div>
      </div>
      <footer className="card-foot">
        <p><b>Best for.</b> {entry.bestFor}</p>
        <div><a className="button" href={agency.url} target="_blank" rel="nofollow noopener">Visit website</a><button className="button solid" type="button" onClick={onProfile}>View full profile</button></div>
      </footer>
    </article>
  )
}

function FullProfile({entry, verticalKey, onBack}: {entry: RecordValue; verticalKey: string; onBack: () => void}) {
  const agency = entry.agency || {}
  const trust = agency.buyerTrust || {}
  return (
    <main className="wrap profile-page">
      <div className="backbar"><button className="button" onClick={onBack}>Back to the directory</button><span>Entry {entry.rank} · Reviewed {longDate(agency.lastVerified)}</span></div>
      <header className="profile-head"><h1>{agency.name}</h1><p>{agency.positioningLine}</p><a className="button solid" href={agency.url} target="_blank" rel="nofollow noopener">Visit {agency.home}</a></header>
      <div className="verdict-grid"><section><h3>Where it wins</h3><p>{agency.wins}</p></section><section><h3>Where it loses</h3><p>{agency.loses}</p></section></div>
      <ProfileSection title="Company facts"><dl className="definition-list"><dt>Offices and coverage</dt><dd>{safeArray(agency.offices).join(' · ')}</dd><dt>Founded</dt><dd>{agency.founded}</dd><dt>Size</dt><dd>{agency.teamSize}</dd><dt>Projects completed</dt><dd>{agency.projectsCompleted}</dd><dt>Notable clients</dt><dd>{agency.notableClients}</dd><dt>Areas of expertise</dt><dd>{agency.expertise}</dd></dl></ProfileSection>
      <ProfileSection title="Pricing and terms"><dl className="definition-list"><dt>Monthly</dt><dd>{agency.pricing?.monthly}</dd><dt>Annual</dt><dd>{agency.pricing?.annual}</dd><dt>Minimum engagement</dt><dd>{agency.pricing?.minimumEngagement}</dd><dt>Contract and exit</dt><dd>{agency.pricing?.contractTerms}</dd><dt>Time to first result</dt><dd>{agency.timeToResult}</dd></dl></ProfileSection>
      <ProfileSection title="Ratings and customer reviews"><Ratings ratings={safeArray(agency.ratings)} /><Reviews agency={agency} /></ProfileSection>
      <ProfileSection title="Case studies"><Cases items={safeArray(agency.caseStudies)} /></ProfileSection>
      <ProfileSection title="Portfolio"><div className="portfolio-grid">{safeArray(agency.portfolio).map((item) => <article key={item._key || item.title}><h3>{item.title}</h3><small>{item.assetType} · {item.vertical}</small><p>{item.note}</p><a href={item.url} target="_blank" rel="nofollow noopener">Open the work →</a></article>)}</div></ProfileSection>
      <ProfileSection title="Buyer trust"><dl className="definition-list"><dt>Identity and standing</dt><dd>{trust.identity}</dd></dl>{[['Track record', trust.trackRecord], ['Third-party proof', trust.thirdPartyProof], ['How the work gets done', trust.delivery], ['Commercial terms', trust.commercials], ['Risk and recourse', trust.risk]].map(([title, values]) => <div key={String(title)}><h4>{String(title)}</h4><ul className="tick-list">{safeArray(values as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>)}</ProfileSection>
      <ProfileSection title="Answer engine optimization capability"><ServiceLines lines={safeArray(agency.universalServiceLines)} /><h4>Engine coverage</h4><Engines items={safeArray(agency.engineCoverage)} /><dl className="definition-list"><dt>What gets measured</dt><dd>{agency.measurement}</dd><dt>Tooling and IP</dt><dd>{agency.tooling}</dd><dt>Relationship to SEO</dt><dd>{agency.seoRelationship}</dd></dl></ProfileSection>
      <ProfileSection title={`${verticalKey} practice`}><VerticalPanel agency={agency} verticalKey={verticalKey} /></ProfileSection>
      <ProfileSection title="Sources"><ol>{safeArray(agency.sources).map((source) => <li key={source._key || source.url}><a href={source.url} target="_blank" rel="nofollow noopener">{source.label}</a></li>)}</ol></ProfileSection>
    </main>
  )
}

function ProfileSection({title, children}: {title: string; children: React.ReactNode}) {
  return <section className="profile-section"><h2>{title}</h2>{children}</section>
}

function ServiceMatrix({page}: {page: RecordValue}) {
  const entries = safeArray(page.entries)
  const axis = safeArray(page.serviceAxis)
  if (!axis.length) return <div className="empty">No service-axis records were imported.</div>
  return (
    <div className="table-wrap matrix-wrap"><table className="matrix"><thead><tr><th>Service</th>{entries.map((entry) => <th key={entry._key}>{entry.agency?.name}</th>)}<th>Offer it</th></tr></thead><tbody>
      {axis.map((item) => {
        const rowMarks = entries.map((entry) => safeArray(entry.coverage).find((coverage) => coverage.serviceKey === item.key)?.mark || 'N')
        return <tr key={item.key}><td><b>{item.label}</b><small>{item.whyItExists}</small></td>{rowMarks.map((mark, index) => <td className={`coverage coverage-${mark}`} key={`${item.key}-${entries[index]._key}`}>{marks[mark]}</td>)}<td><b>{rowMarks.filter((mark) => mark === 'F').length}</b>/{entries.length}</td></tr>
      })}
    </tbody></table></div>
  )
}

function ComparisonQuestions({page}: {page: RecordValue}) {
  return <>{safeArray(page.questions).map((question, index) => <section className="content-section" id={question.anchor} key={question._key || question.anchor}><span className="section-label">Question {index + 1} of {page.questions.length}</span><h2>{question.title}</h2><p>{question.description}</p>{question.kind === 'serviceMatrix' ? <ServiceMatrix page={page} /> : <QuestionTable page={page} kind={question.kind} />}</section>)}</>
}

function QuestionTable({page, kind}: {page: RecordValue; kind: string}) {
  const rows = safeArray(page.entries)
  const config: Record<string, {headings: string[]; values: (entry: RecordValue) => React.ReactNode[]}> = {
    commercials: {headings: ['Monthly', 'Annual', 'Minimum engagement', 'Contract and exit', 'First result'], values: (entry) => [entry.agency?.pricing?.monthly, entry.agency?.pricing?.annual, entry.agency?.pricing?.minimumEngagement, entry.agency?.pricing?.contractTerms, entry.agency?.timeToResult]},
    tooling: {headings: ['Tooling and IP', 'Relationship to SEO'], values: (entry) => [entry.agency?.tooling, entry.agency?.seoRelationship]},
    industry: {headings: ['Declared surface', 'Cited on prompts', 'Service lines', 'Stated gaps', 'Built for', 'Competitive sets'], values: (entry) => {const vertical = getVertical(entry.agency || {}, page.verticalKey) || {}; return [vertical.declaredSurface || 'Not published', vertical.citedOnPrompts || 'Untracked', safeArray(vertical.serviceLines).length, safeArray(vertical.notOffered).length, safeArray(vertical.builtFor).join(', '), vertical.whoTheyWriteAgainst]}},
  }
  const selected = config[kind] || config.tooling
  return <div className="table-wrap"><table><thead><tr><th>Agency</th>{selected.headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((entry) => <tr key={entry._key}><td><b>{entry.agency?.name}</b></td>{selected.values(entry).map((value, index) => <td key={selected.headings[index]}>{value}</td>)}</tr>)}</tbody></table></div>
}

function Methodology({page}: {page: RecordValue}) {
  const steps = safeArray(page.methodologySteps)
  return <section className="content-section" id="how-we-chose"><span className="section-label">Methodology</span><h2>How did we choose these agencies?</h2>{page.methodologyIntro ? <p>{page.methodologyIntro}</p> : <div className="empty">The workbook defines this section’s position, but does not contain its page-specific copy.</div>}{steps.map((step) => <div key={step._key || step.title}><h3>{step.title}</h3>{safeArray(step.body).map((block) => <p key={block._key}>{safeArray(block.children).map((child) => child.text).join('')}</p>)}</div>)}{page.methodologyCommunityFinding ? <div className="callout"><h3>What the community check found</h3><p>{page.methodologyCommunityFinding}</p></div> : null}{page.methodologyCorrection ? <div className="callout"><h3>The correction worth naming</h3><p>{page.methodologyCorrection}</p></div> : null}</section>
}

export function ListicleTemplate({page}: {page: RecordValue}) {
  const [profileId, setProfileId] = useState<string | null>(null)
  const entries = useMemo(() => safeArray(page.entries).slice().sort((a, b) => a.rank - b.rank), [page.entries])
  const template = page.template || {}
  const selected = entries.find((entry) => entry.agency?._id === profileId)
  if (selected) return <FullProfile entry={selected} verticalKey={page.verticalKey} onBack={() => setProfileId(null)} />
  return (
    <div>
      <nav className="view-nav" aria-label="On-page navigation"><div className="wrap"><a href="#directory">Directory</a><a href="#how-we-chose">Methodology</a><a href="#compare">Compare all</a></div></nav>
      <main className="wrap" id="directory">
        <header className="masthead">
          <div className="crumbs"><nav className="page-breadcrumbs" aria-label="Breadcrumb"><a href="/">{template.publisherName || page.publisherName || 'MaximusLabs.ai'}</a><span aria-hidden="true">/</span><a href="/">Resources</a><span aria-hidden="true">/</span><span>{page.verticalLabel}</span></nav><span>Last reviewed {longDate(page.reviewedAt)} · {entries.length} firms evaluated</span></div>
          <div className="masthead-grid"><div><h1>{page.title}</h1><p className="dek">{page.dek}</p><p className="publisher-disclosure"><b>Publisher disclosure.</b> {page.publisherDisclosure}</p><div className="score-key">{safeArray(page.assessmentKeys).map((item) => <div key={item._key || item.label}><small>{item.label}</small><p>{item.description}</p></div>)}</div></div><aside className="quick-answer"><header>Quick answer <span>Top 5 of {entries.length}</span></header><ol>{safeArray(page.quickAnswers).filter((item) => item.shown).slice(0, 5).map((item) => <li key={item._key || item.position}><a href={`#card-${item.agency?.playerId}`}>{item.displayName}</a><span>{item.reason}</span></li>)}</ol><a href="#the-list">See all {entries.length} agencies ↓</a></aside></div>
        </header>
        <div className="page-shell"><aside className="toc"><b>Contents</b><a href="#compare">The comparison</a>{entries.map((entry) => <a key={entry._key} href={`#card-${entry.agency?.playerId}`}>{entry.agency?.name}</a>)}<a href="#how-we-chose">How we chose</a>{safeArray(page.questions).map((question) => <a key={question._key || question.anchor} href={`#${question.anchor}`}>{question.title}</a>)}<a href="#also-considered">Also considered</a></aside><div className="page-body">
          <section className="content-section" id="compare"><span className="section-label">The comparison</span><h2>All {entries.length}, side by side</h2><p>The levers each firm pulls, its proof, where it breaks, and what it costs.</p><div className="table-wrap"><table><thead><tr><th>Agency</th><th>What they actually do</th><th>Named clients</th><th>Proof on record</th><th>Where it breaks</th><th>Monthly price</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry._key}><td><b>{entry.agency?.name}</b><small>#{entry.rank} · {entry.agency?.home}</small></td><td><ul>{safeArray(entry.directions).map((item) => <li key={item}>{item}</li>)}</ul></td><td>{entry.agency?.notableClients}</td><td>{safeArray(entry.agency?.ratings).map((rating) => `${rating.platform}: ${rating.value}`).join(' · ')}</td><td>{getVertical(entry.agency || {}, page.verticalKey)?.whereItBreaks}</td><td><b>{entry.agency?.pricing?.monthlyShort || entry.agency?.pricing?.monthly}</b></td></tr>)}</tbody></table></div></section>
          <div className="list-head" id="the-list"><span>{entries.length} firms · listed in publisher order</span><span>Signal rank printed on every card</span></div>
          {entries.map((entry) => <AgencyCard key={entry._key} entry={entry} verticalKey={page.verticalKey} onProfile={() => setProfileId(entry.agency?._id)} />)}
          <Methodology page={page} />
          <ComparisonQuestions page={page} />
          <section className="content-section" id="also-considered"><span className="section-label">Also considered</span><h2>Which firms were researched but not ranked?</h2><p>Researched in full, below the line on this weighting.</p><div className="table-wrap"><table><thead><tr><th>Firm</th><th>Capability /70</th><th>Industry /30</th><th>Why it falls short here</th></tr></thead><tbody>{safeArray(page.alsoConsidered).map((item) => <tr key={item._key || item.playerId}><td>{item.url ? <a href={item.url} target="_blank" rel="nofollow noopener"><b>{item.name}</b></a> : <b>{item.name}</b>}<small>{item.home || item.whatTheyAre}</small></td><td>{item.capabilityScore}</td><td>{item.industryScore}</td><td>{item.reasonExcluded}</td></tr>)}</tbody></table></div></section>
        </div></div>
      </main>
      <footer className="site-footer"><div className="wrap"><p><b>Publisher disclosure.</b> {page.publisherDisclosure}</p><p><b>On review data.</b> {template.defaultFooterReviewNote || page.footerReviewNote || 'Ratings appear only for platforms each firm is actually on.'}</p><p><b>On links.</b> {template.defaultFooterLinkNote || page.footerLinkNote || 'Every outbound link carries rel="nofollow".'}</p><p>Last reviewed {longDate(page.reviewedAt)}.</p></div></footer>
    </div>
  )
}
