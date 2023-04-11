import { EmptyState, LegacyCard, Page } from "@shopify/polaris";

export default function NotFound() {
  return (
    <Page>
      <LegacyCard>
        <LegacyCard.Section>
          <EmptyState
            heading="There is no page at this address"
            image=""
          >
            <p>Check the URL and try again, or use the search bar to find what you need.</p>
          </EmptyState>
        </LegacyCard.Section>
      </LegacyCard>
    </Page>
  );
}