import { Layout, LegacyCard, SkeletonBodyText } from "@shopify/polaris";
import React from "react";

export function Analytics({
  skeleton,
  clickedRateViewed,
  pruchasedRateViewed,
  revenue,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        columnGap: "20px",
        flexWrap: "wrap",
      }}
    >
      {skeleton && !clickedRateViewed ? (
        <div style={{ marginBottom: "20px", width: "150px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard sectioned>
                <SkeletonBodyText />
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      ) : !skeleton && !clickedRateViewed ? (
        <div style={{ marginBottom: "20px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard title="Product clicked rate:" sectioned>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    No data available!
                  </span>
                </div>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard title="Product clicked rate:" sectioned>
                <div>
                  <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {clickedRateViewed}%
                  </span>
                </div>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      )}

      {skeleton && !pruchasedRateViewed ? (
        <div style={{ marginBottom: "20px", width: "150px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard sectioned>
                <SkeletonBodyText />
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      ) : !skeleton && !pruchasedRateViewed ? (
        <div style={{ marginBottom: "20px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard title="Product purchased rate:" sectioned>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    No data available!
                  </span>
                </div>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard title="Product purchased rate:" sectioned>
                <div>
                  <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {pruchasedRateViewed}%
                  </span>
                </div>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      )}

{skeleton && !revenue ? (
        <div style={{ marginBottom: "20px", width: "150px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard sectioned>
                <SkeletonBodyText />
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      ) : !skeleton && !revenue ? (
        <div style={{ marginBottom: "20px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard title="Product purchased rate:" sectioned>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    No data available!
                  </span>
                </div>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <Layout>
            <Layout.Section>
              <LegacyCard title="Product purchased revenue:" sectioned>
                <div>
                  <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {revenue}$
                  </span>
                </div>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </div>
      )}
    </div>
  );
}
