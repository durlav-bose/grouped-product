import {
  Button,
  Card,
  Divider,
  Form,
  FormLayout,
  Grid,
  Icon,
  Layout,
  Stack,
  TextField,
  Thumbnail,
  Frame,
  LegacyCard,
  AlphaStack
} from "@shopify/polaris";
import { MobilePlusMajor, DeleteMinor } from "@shopify/polaris-icons";
import {
  ResourcePicker,
  useAuthenticatedFetch,
  useContextualSaveBar,
} from "@shopify/app-bridge-react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import ImageUpload from "./ImageUpload";
import { GroupProductContext } from "../App";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";

function CreateOrUpdateGroupProductForm({
  isUpdateForm = false,
  groupProductId = "",
  groupProductDateItem,
}) {
  const [defaultContextValues, setDefaultContextValues] = useContext(GroupProductContext);
  const navigate = useNavigate();
  const [isOpenResourcePicker, setIsOpenResourcePicker] = useState({
    isOpen: false,
    isOpenNumber: "",
  });
  const [isValidate, setIsValidate] = useState({
    groupName: false,
    groupNameError: "",
    groupProducts: [
      {
        productType: false,
        productTypeError: "",
        productImage: false,
        productImageError: "",
        productId: false,
        productIdError: "",
        productHandle: false,
        productHandleError: "",
      },
    ],
  });
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
        selectedProductTitle: "",
        selectedProductImage: "",
        productHandle: "",
      },
    ],
  });

  const handleSave = () => {
    console.log("save");
    handleSubmit();
    hide();
  };

  const handleDiscard = () => {
    hide();
  };

  const { hide, show, discardAction, saveAction } = useContextualSaveBar();

  useEffect(() => {
    console.log("GroupProductContext.....", GroupProductContext);
    if (groupProductDateItem !== undefined && isUpdateForm) {
      setFromDate(groupProductDateItem);
    }
  }, [isUpdateForm, groupProductDateItem]);

  //discardAction and saveAction are functions that will be called when the user clicks the discard or save actions respectively.
  useEffect(() => {
    saveAction.setOptions({
      onAction: handleSave,
    });
    discardAction.setOptions({
      onAction: handleDiscard,
    });
  }, [saveAction, discardAction]);

  const handleSubmit = async () => {
    setIsLoading(true);
    let formValidation = true;

    if (fromDate.groupName === "") {
      // console.log()
      formValidation = false;
      setIsLoading(false);
      setDefaultContextValues((prevState) => {
        return {
          ...prevState,
          isShowToast: true,
          toastStatus: "error",
          toastMessage: "Please enter group name",
        };
      });
      setIsValidate((prevState) => ({
        ...prevState,
        groupName: true,
        groupNameError: "Please enter group name",
      }));
    } else {
      fromDate.groupProducts.map((item, index) => {
        if (
          item.productType === "" ||
          item.productImage === "" ||
          item.productId === "" ||
          item.productHandle === ""
        ) {
          formValidation = false;
          setIsLoading(false);
          setDefaultContextValues((prevState) => {
            return {
              ...prevState,
              isShowToast: true,
              toastStatus: "error",
              toastMessage: `Please enter all fields in row ${index + 1}`,
            };
          });
        } else {
          formValidation = true;
        }
      });
    }
    setIsValidate(formValidation);
    if (formValidation) {
      let url = "/api/create-group-product";
      let method = "POST";
      if (isUpdateForm) {
        url = "/api/update-group-product";
        method = "PUT";
      }
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fromDate),
      });

      const data = await response.json();
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
      console.log("isValidate", isValidate);

      if (data.success) {
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    }
  };

  const handleChange = useCallback((value, key, index) => {
    if (key === "groupName") {
      setFromDate((prevState) => {
        return {
          ...prevState,
          groupName: value,
        };
      });
    } else {
      setFromDate((prevState) => {
        return {
          ...prevState,
          groupProducts: [
            ...prevState.groupProducts.slice(0, index),
            {
              ...prevState.groupProducts[index],
              [key]: value,
            },
            ...prevState.groupProducts.slice(index + 1),
          ],
        };
      });
    }

    if (value !== "") {
      show();
    } else {
      hide();
    }
  }, []);

  const handleProductSelection = useCallback(({ selection }, index) => {
    let productId = selection.map((product) => {
      return product.id.slice(product.id.length - 13, product.id.length);
    });
    productId = productId[0];
    console.log("productId---------->", productId);
    let productHandle = selection[0].handle;
    setSelectedProductList((prevState) => [...prevState, selection[0]]);
    //update by index in groupProducts
    setFromDate((prevState) => {
      return {
        ...prevState,
        groupProducts: [
          ...prevState.groupProducts.slice(0, index),
          {
            ...prevState.groupProducts[index],
            selectedProductImage: selection[0].images[0].originalSrc,
            selectedProductTitle: selection[0].title,
            productId: productId,
            productHandle: productHandle,
          },
          ...prevState.groupProducts.slice(index + 1),
        ],
      };
    });
    setIsOpenResourcePicker({
      isOpen: false,
      index: "",
    });

    getGroupProduct(productId);
  }, []);

  const getGroupProduct = useCallback(async (productId) => {
    const response = await fetch("/api/check-group-product/" + productId);
    const data = await response.json();
    //show toast
    console.log("data", data);
    if (data.success) {
      setDefaultContextValues((prevState) => {
        return {
          ...prevState,
          isShowToast: true,
          toastStatus: "error",
          toastMessage: data.message,
        };
      });
    }
  }, []);

  const handleEmptyProduct = () => {
    //not more than 5 products
    if (fromDate.groupProducts.length < 5) {
      setFromDate((prevState) => {
        return {
          ...prevState,
          groupProducts: [
            ...prevState.groupProducts,
            {
              productType: "",
              productImage: "",
              productId: "",
              productHandle: "",
              selectedProductImage: "",
              selectedProductTitle: "",
            },
          ],
        };
      });
    }
  };

  const handleDropZoneDrop = (files, acceptedFiles, rejectedFiles, index) => {
    handleImageUpload(acceptedFiles[0], index);
  };

  const handleImageUpload = async (image, index) => {
    setImageUploadSpinner({
      isShowSpinner: true,
      spinnerNumber: index,
    });
    console.log("handleImageUpload", index);
    const formData = new FormData();
    formData.append("image", image);
    try {
      const res = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });
      const { url } = await res.json();
      //setFromDate(data);
      setFromDate((prevState) => {
        return {
          ...prevState,
          groupProducts: [
            ...prevState.groupProducts.slice(0, index),
            {
              ...prevState.groupProducts[index],
              productImage: url,
            },
            ...prevState.groupProducts.slice(index + 1),
          ],
        };
      });
      setImageUploadSpinner({
        isShowSpinner: false,
        spinnerNumber: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
   
      <Grid>
      <Grid.Cell
        columnSpan={{
          xs: 6,
          sm: isUpdateForm ? 3 : 6,
          md: isUpdateForm ? 3 : 6,
          lg: isUpdateForm ? 6 : 12,
          xl: isUpdateForm ? 8 : 12,
        }}
      >
        <Layout>
          <Layout.Section>
            <Form onSubmit={handleSubmit} noValidate>
              <FormLayout>
                <LegacyCard sectioned>
                  <TextField
                    value={fromDate?.groupName}
                    onChange={(value) => handleChange(value, "groupName", 0)}
                    label="Group Name"
                    type="text"
                    id="groupName"
                  />
                </LegacyCard>
                {fromDate?.groupProducts?.map((groupProduct, index) => (
                  <LegacyCard
                    key={index}
                    actions={[
                      {
                        content: 'Remove',
                        destructive: true,
                        onAction: () => {
                          setFromDate((prevState) => {
                            return {
                              ...prevState,
                              groupProducts: [
                                ...prevState.groupProducts.slice(0, index),
                                ...prevState.groupProducts.slice(index + 1),
                              ],
                            };
                          });
                        },
                      },
                    ]}
                    title={`Product ${index + 1}`}
                    sectioned
                  >
                    <FormLayout>
                      <TextField
                        value={fromDate.groupProducts[index].productType}
                        onChange={(value) =>
                          handleChange(value, "productType", index)
                        }
                        label="Product type"
                        type="text"
                        id={`groupProducts[${index}].productType`}
                      />
                      <ImageUpload
                        handleDropZoneDrop={handleDropZoneDrop}
                        index={index}
                        image={fromDate.groupProducts[index].productImage}
                        imageUploadSpinner={imageUploadSpinner}
                      />
                      {!fromDate.groupProducts[index].productId && (
                        <Button
                          onClick={() =>
                            setIsOpenResourcePicker({
                              isOpen: true,
                              isOpenNumber: index,
                            })
                          }
                          size="large"
                          fullWidth
                        >
                          Select Products
                        </Button>
                      )}
                      {fromDate.groupProducts[index].productId && (
                        <>
                          <p style={{ marginBottom: "10px" }}>
                            Selected Product
                          </p>
                          <LegacyCard sectioned>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gridGap: "20px",
                                }}
                              >
                                <Thumbnail
                                  source={
                                    groupProduct.selectedProductImage
                                      ? groupProduct.selectedProductImage
                                      : "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg?12678548500147524304"
                                  }
                                />
                                <p>{groupProduct?.selectedProductTitle}</p>
                              </div>
                              <Button
                                onClick={() => {
                                  setFromDate((prevState) => {
                                    return {
                                      ...prevState,
                                      groupProducts: [
                                        ...prevState.groupProducts.slice(
                                          0,
                                          index
                                        ),
                                        {
                                          ...prevState.groupProducts[index],
                                          productId: "",
                                          productHandle: "",
                                          selectedProductImage: "",
                                          selectedProductTitle: "",
                                        },
                                        ...prevState.groupProducts.slice(
                                          index + 1
                                        ),
                                      ],
                                    };
                                  });
                                }}
                                plain
                                destructive
                              >
                                <Icon source={DeleteMinor} color="base" />
                              </Button>
                            </div>
                          </LegacyCard>
                        </>
                      )}
                    </FormLayout>
                    <ResourcePicker
                      selectMultiple={false}
                      showVariants={false}
                      resourceType="Product"
                      open={isOpenResourcePicker.isOpen}
                      onCancel={() => setIsOpenResourcePicker(false)}
                      onSelection={(resources) =>
                        handleProductSelection(
                          resources,
                          isOpenResourcePicker.isOpenNumber
                        )
                      }
                    />
                  </LegacyCard>
                ))}
                {fromDate?.groupProducts?.length < 5 && (
                  <Button
                    onClick={() => {
                      handleEmptyProduct();
                    }}
                    fullWidth
                  >
                    <Icon source={MobilePlusMajor} color="base" />
                  </Button>
                )}
                <Divider borderStyle="base" />
                <div style={{ marginBottom: "50px" }}>
                  <AlphaStack distribution="trailing">
                    <Button primary submit loading={isLoading}>
                      {isUpdateForm ? "Update" : "Save"}
                    </Button>
                  </AlphaStack>
                </div>
              </FormLayout>
            </Form>
          </Layout.Section>
        </Layout>
      </Grid.Cell>
      {isUpdateForm && (
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 4 }}>
          <Layout>
            <Layout.Section>
              <LegacyCard title="Group Product List">
                <LegacyCard.Section>
                  <div
                    style={{
                      display: "flex",
                      gridGap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {fromDate?.groupProducts?.map((item, index) => {
                      return (
                        <div key={index}>
                          <Thumbnail
                            size="large"
                            source={fromDate.groupProducts[index].productImage}
                          />
                          <p style={{ textAlign: "center" }}>
                            {fromDate?.groupProducts[index]?.productType}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </LegacyCard.Section>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        </Grid.Cell>
      )}
    </Grid>
  
  );
}

export default CreateOrUpdateGroupProductForm;
