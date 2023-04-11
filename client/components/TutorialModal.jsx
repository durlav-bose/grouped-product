import { Modal } from "@shopify/polaris";
import React from "react";
import ReactPlayer from "react-player";

const TutorialModal = ({ active, handleChange }) => {
  return (
    <>
      <Modal
        title="Reach more shoppers with Instagram product tags"
        titleHidden
        open={active}
        onClose={handleChange}
      >
        <div
          style={{
            position: "relative",
            paddingTop: "50%",
            marginTop: "60px",
            overflow: "hidden",
            borderRadius: "0 0 5px 5px",
          }}
        >
          <ReactPlayer
            style={{ position: "absolute", top: 0, left: 0 }}
            url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
            width="100%"
            height="100%"
          />
        </div>
      </Modal>
    </>
  );
};
export default TutorialModal;
