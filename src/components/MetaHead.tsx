import { Helmet, HelmetProvider } from 'react-helmet-async'
type Props = { title?: string; description?: string; image?: string; url?: string }
export function MetaProvider({ children }: { children: React.ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>
}
export default function MetaHead({ title, description, image = '/assets/logo-salis.png', url }: Props) {
  return (
    <Helmet>
      {title && <title>{title} · Salis</title>}
      {description && <meta name="description" content={description} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
    </Helmet>
  )
}
