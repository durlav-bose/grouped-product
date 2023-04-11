import { DropZone, Spinner, Thumbnail } from "@shopify/polaris";
import React from "react";

function ImageUpload({
  handleDropZoneDrop,
  index,
  image,
  imageUploadSpinner: { isShowSpinner, spinnerNumber },
}) {

  return (
    <>
      <DropZone
        label="Upload Image"
        allowMultiple={false}
        onDrop={(files, acceptedFiles, rejectedFiles) => {
          handleDropZoneDrop(files, acceptedFiles, rejectedFiles, index);
        }}
      >
        {isShowSpinner && spinnerNumber === index ? (
          <div
            style={{
              display: "flex",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spinner accessibilityLabel="Spinner example" size="large" />
          </div>
        ) : image && image !== "" ? (
          <img
            style={{
              width: "100%",
              height: "118px",
              objectFit: "contain",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "5px",
              padding: "1px",
            }}
            src={image}
            alt=""
          />
        ) : (
          <DropZone.FileUpload />
        )}
      </DropZone>
    </>
  );
}

export default ImageUpload;
