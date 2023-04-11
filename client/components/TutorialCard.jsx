import { VideoThumbnail,Grid, MediaCard, } from "@shopify/polaris";
import React from "react";

function TutorialCard({index,openVideoModal}) {
  return (
    <>
      <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
        <MediaCard
          title="Turn your side-project into a business"
          primaryAction={{
            content: "Learn more",
            onAction: () => {},
          }}
          description={`In this course, you’ll learn how the Kular family turned their mom’s recipe book into a global business.`}
        >
          <VideoThumbnail
            onClick={() => openVideoModal(1)}
            videoLength={80}
            thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
          />
        </MediaCard>
      </Grid.Cell>
    </>
  );
}

export default TutorialCard;
