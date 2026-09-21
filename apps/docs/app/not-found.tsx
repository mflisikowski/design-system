import Link from "next/link";

export default function NotFound() {
  return (
    <main data-docs="not-found">
      <p data-docs="not-found-eyebrow">404</p>
      <h1>Documentation page not found</h1>
      <p>The requested page is not part of the current MFD documentation manifest.</p>
      <Link data-docs="standalone-link" href="/">
        Return to documentation
      </Link>
    </main>
  );
}
