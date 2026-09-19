import styles from './AboutAuthor.module.css'

// Single house author across the whole library. There is no author entity in
// Sanity yet (posts only store authorName/authorImageUrl strings), so the bio
// lives here — company-sourced copy, easy to edit in one place.
const AUTHOR = {
  name: 'Krishna Kaanth',
  title: 'Founder & CEO, MaximusLabs',
  imageUrl:
    'https://cdn.prod.website-files.com/688e61db3da1f79ad7b45858/69086a39359a85bbb951e01d_Minimalist%20Square%20Photo%20Instagram%20Post%20(1).png',
  slogan: 'Rank everywhere people search.',
  bio: [
    'Krishna Kaanth is the founder & CEO of MaximusLabs, an AI-search growth agency helping brands get found across Google, ChatGPT, Perplexity, and the other engines people now ask instead of searching.',
    'He and his team turn AEO, GEO, and technical SEO into one measurable growth engine — and publish the research, comparisons, and field-tested playbooks you find across this library.',
  ],
}

export function AboutAuthor() {
  return (
    <section className={styles.section} aria-label="About the author">
      <div className={styles.inner}>
        <div className={styles.identity}>
          <img className={styles.avatar} src={AUTHOR.imageUrl} alt={`Portrait of ${AUTHOR.name}`} />
          <div className={styles.namePlate}>
            <strong>{AUTHOR.name}</strong>
            <span>{AUTHOR.title}</span>
          </div>
        </div>
        <div className={styles.body}>
          <p className={styles.eyebrow}>About the Author</p>
          {AUTHOR.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          <p className={styles.slogan}>“{AUTHOR.slogan}”</p>
        </div>
      </div>
    </section>
  )
}
