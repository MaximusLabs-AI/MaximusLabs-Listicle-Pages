import './site-chrome.css'

const SITE = 'https://www.maximuslabs.ai'

export function BookCallCta() {
  return (
    <section className="ml-wrap">
      <div className="ml-ctabanner">
        <h2>Ready to turn AI search into a revenue engine?</h2>
        <p>
          See how MaximusLabs gets your brand cited and chosen across ChatGPT, Perplexity, Gemini, and Google AI. Book a call for a tailored plan.
        </p>
        <a className="ml-btn" href={`${SITE}/contact-us`}>Book a call →</a>
      </div>
    </section>
  )
}
