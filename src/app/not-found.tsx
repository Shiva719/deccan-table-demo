import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state">
      <h1>A little off the menu.</h1>
      <p>We couldn’t find that page.</p>
      <Link className="button" href="/">
        Back to the demo
      </Link>
    </main>
  );
}
