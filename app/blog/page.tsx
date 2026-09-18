import {redirect} from 'next/navigation'

// The collection now lives at the root; keep /blog working by redirecting.
export default function BlogIndexRedirect() {
  redirect('/')
}
