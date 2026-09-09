import { Container, Section, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <Section>
      <Container className="max-w-2xl text-center">
        <p className="eyebrow text-gold-ink">404</p>
        <h1 className="mt-3 text-4xl font-extrabold">That page has moved on.</h1>
        <p className="mt-4 text-text-2">Try the services, products or pricing pages, or tell us what you were looking for.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/">Home</Button>
          <Button href="/contact" variant="outline-dark">
            Contact
          </Button>
        </div>
      </Container>
    </Section>
  );
}
