import styles from './AuthorCta.module.css'

// Right-hand sticky author / booking card, mirroring the one on the AI Search
// 101 article pages. Rendered as the third column inside both the listicle and
// informational article shells.
const PHOTO =
  'https://cdn.prod.website-files.com/688e61db3da1f79ad7b45858/69086a39359a85bbb951e01d_Minimalist%20Square%20Photo%20Instagram%20Post%20(1).png'
const BOOK_URL = 'https://www.maximuslabs.ai/contact-us'

export function AuthorCta() {
  return (
    <aside className={styles.wrapper} aria-label="About the author">
      <div className={styles.card}>
        <img className={styles.photo} src={PHOTO} alt="Krishna Kaanth M" />
        <p className={styles.name}>Krishna Kaanth M</p>
        <p className={styles.role}>CEO</p>
        <p className={styles.bio}>
          I&apos;m KK. Over the years, I&apos;ve experimented and built systems that drive growth through AEO and
          GEO. Today, I help brands turn AI search into revenue engines, not vanity metrics, delivering AI
          visibility and getting brands cited and chosen across ChatGPT, Perplexity, and Google, where real buying
          decisions happen. Let&apos;s talk.
        </p>
        <a className={styles.button} href={BOOK_URL} target="_blank" rel="noopener noreferrer">
          Book a 15 min Chat →
        </a>
      </div>
    </aside>
  )
}
