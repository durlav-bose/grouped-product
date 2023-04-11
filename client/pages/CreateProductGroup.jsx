import { Layout, Page } from "@shopify/polaris";
import { MobilePlusMajor, DeleteMinor } from "@shopify/polaris-icons";
import { ResourcePicker, useContextualSaveBar } from "@shopify/app-bridge-react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import ImageUpload from "../components/ImageUpload";
import { GroupProductContext } from "../App";
import CreateOrUpdateGroupProductForm from "../components/CreateOrUpdateGroupProductForm";
import useFetch from "../hooks/useFetch.js";
import { useNavigate } from "react-router-dom";

function CreateProductGroup() {
  console.log("GroupProductContext....................", GroupProductContext);
  const [defaultContextValues, setDefaultContextValues] = useContext(GroupProductContext);
  const navigate = useNavigate();
  // console.log("defaultContextValues", defaultContextValues)
  const [isOpenResourcePicker, setIsOpenResourcePicker] = useState(false);
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploadSpinner, setImageUploadSpinner] = useState({
    isShowSpinner: false,
    spinnerNumber: "",
  });
  const fetch = useFetch();
  const [fromDate, setFromDate] = useState({
    groupName: "",
    groupProducts: [
      {
        productType: "",
        productImage: "",
        productId: "",
        productHandle: "",
      },
    ],
  });
  const { hide, show, discardAction, saveAction } = useContextualSaveBar();
  const handleSave = async() => {
    //api/create-group-product fetch
    console.log("save");
    await handleSubmit();
    hide();
  };

  const handleDiscard = () => {
    hide();
  };

  //discardAction and saveAction are functions that will be called when the user clicks the discard or save actions respectively.
  useEffect(() => {
    saveAction.setOptions({
      onAction: handleSave,
    });
    discardAction.setOptions({
      onAction: handleDiscard,
    });
    getFromDate();
  }, [saveAction, discardAction, fromDate.groupName]);

  const getFromDate = async () => {
    if (fromDate.groupName !== "") {
      show();
    } else {
      hide();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("fromDate", fromDate);
    const response = await fetch("/api/create-group-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fromDate),
    });
    const data = await response.json();
    console.log("data create-group-product................", data);
    hide();
    setIsLoading(false);
    let status = data.success ? "success" : "error";
    setDefaultContextValues((prevState) => {
      return {
        ...prevState,
        isShowToast: true,
        toastStatus: status,
        toastMessage: data.message,
      };
    });

    if (data.success) {
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  return (
    <Page
      narrowWidth
      backAction={{ content: "Orders", url: "/" }}
      title="Create Group Name"
    >
      <Layout>
        <Layout.Section>
          <CreateOrUpdateGroupProductForm />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default CreateProductGroup;
