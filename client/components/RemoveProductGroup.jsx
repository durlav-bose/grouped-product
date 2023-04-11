// import { Modal } from '@shopify/app-bridge-react'
import { Button, Frame, TextContainer, Modal } from "@shopify/polaris";
import React from "react";

function RemoveProductGroup({
  active,
  handleChange,
  removeProductGroup,
  showButtonSpinner,
}) {
  return (
    <Frame>
      <div style={{ height: "500px" }}>
        <Modal
          title="Reach more shoppers with Instagram product tags"
          titleHidden
          open={active}
          onClose={handleChange}
        >
          <Modal.Section>
            <TextContainer>
              <p style={{fontWeight:"bold"}}>Are you sure do you want remove this product.</p>
            </TextContainer>
          </Modal.Section>
          <Modal.Section>
            <div
              style={{
                display: "flex",
                gridGap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={handleChange} >
                Cancel
              </Button>

              <Button
                onClick={removeProductGroup}
                loading={showButtonSpinner}
                destructive
              >
                {showButtonSpinner ? "" : "Remove"}
              </Button>
            </div>
          </Modal.Section>
        </Modal>
      </div>
    </Frame>
  );
}

export default RemoveProductGroup;
