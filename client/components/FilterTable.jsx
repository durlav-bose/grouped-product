import { useNavigate } from "@shopify/app-bridge-react";
import {
  Card,
  DataTable,
  Link,
  Spinner,
  EmptyState,
  Button,
  Icon,
  Pagination,
  Autocomplete,
} from "@shopify/polaris";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DeleteMinor, EditMinor,SearchMinor } from "@shopify/polaris-icons";
import RemoveProductGroup from "./RemoveProductGroup";
import { GroupProductContext } from "../App";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";

function FilterTable({setHaveGroupProduct}) {
  const [defaultContextValues, setDefaultContextValues] =
    useContext(GroupProductContext);
    
  const [isLoading, setIsLoading] = useState(false);
  const [haveSearch, setHaveSearch] = useState(true);
  const [isPrevious, setIsPrevious] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [isNext, setIsNext] = useState(null);
  const [totalPage, setTotalPage] = useState(null);
  const [removeProductId, setRemoveProductId] = useState("");
  const [groupProductList, setGroupProductList] = useState([]);
  const [showButtonSpinner, setShowButtonSpinner] = useState(false);
  const fetch = useFetch();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const deselectedOptions = useMemo(
    () => [
    ],
    [],
  );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(deselectedOptions);

  const updateText = useCallback(
    (value) => {
      console.log("value", value);
      setCurrentPage(1);
      setTotalPage(1);
      setInputValue(value);

      if (value === '') {
        fetchGroupProductList();
      }
      //add search by after
      searchGroupProduct(value);
    },
    [deselectedOptions],
  );

  let timer;  
  const searchGroupProduct = (value) => {
    setIsLoading(true);
    console.log("value", value);
    navigate({
      pathname: "/",
      search: `?search=${value}`,
    })
    if(value === ""){
      fetchGroupProductList();
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(async () => {
      let data = await fetch(`/api/search-group-product?search=${value}`);
      data = await data.json();
      console.log("data :>> ", data)
      if (data.success === true) {
        console.log("data.groupProduct :>> ", data.groupProduct)
        setGroupProductList(data.groupProduct);
      }else{
        setGroupProductList([]);
        setHaveSearch(false);
      }
      setIsLoading(false);
    }, 400);
  }


  const updateSelection = useCallback(
    (selected) => {
      const selectedValue = selected.map((selectedItem) => {
        const matchedOption = options.find((option) => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });

      setSelectedOptions(selected);
      setInputValue(selectedValue[0]);
    },
    [options],
  );

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      // label="Tags"
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="Search"
    />
  );

  const handleChange = useCallback(() => setActive(!active), [active]);

  //fetch group product list
  const fetchGroupProductList = async ( pageNumber ) => {
    setIsLoading(true);
    pageNumber = pageNumber || 1;
    try {
      // const response = await fetch("/api/get-group-product");
      // app.get("/api/get-group-product", async (req, res) => {
        // const { page, limit } = req.query;
      const response = await fetch(`/api/get-group-product?page=${pageNumber}&limit=10`);
      const { groupProduct, totalPage } = await response.json();
      console.log("groupProduct :>> ", groupProduct);
      setGroupProductList(groupProduct);
      if (pageNumber > 1) {
        setIsPrevious(true);
      } else {
        setIsPrevious(false);
      }
      if (pageNumber < totalPage) {
        setIsNext(true);
      } else {
        setIsNext(false);
      }
      if (!groupProduct?.length > 0 || groupProduct === undefined) {
        // console.log("groupProduct.length :>> ", groupProduct?.length)
        setHaveGroupProduct(true);
      }

      setTotalPage(totalPage);
      setCurrentPage(pageNumber);
    } catch (error) {
      console.log(error.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let pageQuery =new URLSearchParams(location.search);
    let pageNumber = pageQuery.get('page');
    let searchQuery = pageQuery.get('search');
    if(searchQuery && !pageNumber){
      searchGroupProduct(searchQuery);
      setInputValue(searchQuery);
      setCurrentPage(1);
      setTotalPage(1);
      return;
    }
    else if(!pageNumber){
      pageNumber = 1;
    }
    console.log("pageNumber :>> ", pageNumber)
    setCurrentPage(pageNumber);
    fetchGroupProductList(pageNumber);

  }, []);

  const handlePaginationChange = (value) => {
    navigate({
      pathname: "/",
      search: `?page=${value}`,
    })
    fetchGroupProductList(value);
  }

  const removeProductGroup = async () => {
    console.log("removeProductId :>> ", removeProductId);
    setShowButtonSpinner(true);
    let status = "";
    let msg = "";
    // /api/delete-group-product/:id
    try {
      const response = await fetch(
        `/api/delete-group-product/${removeProductId}`,
        {
          method: "DELETE",
        }
      );
      const { success, message } = await response.json();
      if (success) {
        setShowButtonSpinner(false);
        setActive(false);
        fetchGroupProductList();
        status = "success";
        msg = message;
      }
    } catch (error) {
      status = "error";
      msg = error.message;
      console.log(error);
    }

    setDefaultContextValues({
      isShowToast: true,
      toastStatus: status,
      toastMessage: msg,
    });
  };

  const showModal = (id) => {
    setActive(true);
    setRemoveProductId(id);
  };


  return (
    <div style={{ height: "568px" }}>
      <Card title="Product Group List">
        <div style={{ padding: "16px" }}>
        <Autocomplete
        options={options}
        selected={selectedOptions}
        onSelect={updateSelection}
        textField={textField}
      />
        </div>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Spinner accessibilityLabel="Spinner example" size="large" />
          </div>
        ) : !groupProductList?.length > 0 ? (
          haveSearch !== false ? (
            <EmptyState
            heading="Create Product Group to get started"
            action={{
              content: "Create Product Group",
              onAction: () => navigate("/CreateProductGroup"),
            }}
            image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
          >
            <p>
              You can use the Files section to upload images, videos, and other
              documents
            </p>
          </EmptyState>):(
            <EmptyState
            heading="No Product Group Found"
            image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
          >
          </EmptyState>)
        ) : (
          <DataTable
            columnContentTypes={["text", "text", "text", "Action"]}
            headings={["Group Name", "Total Product", "Created At", "Action"]}
            rows={groupProductList.map((groupProduct) => [
              
              <Link
                key={groupProduct._id}
                onClick={() => navigate(`/group-product/${groupProduct._id}`)}
              >
                {groupProduct.groupName}
              </Link>,
              groupProduct.groupProducts.length,
              groupProduct.createdAt.slice(0, 10),
              <div
                style={{ display: "flex", gridGap: "10px" }}
                key={groupProduct._id}
              >
                <Button
                  onClick={() => navigate(`/group-product/${groupProduct._id}`)}
                  plain
                >
                  <Icon source={EditMinor} color="base" />
                </Button>
                <Button
                  onClick={() => showModal(groupProduct._id)}
                  plain
                  destructive
                >
                  <Icon source={DeleteMinor} color="base" />
                </Button>
              </div>,
            ])}
          />
        )}
      </Card>
      {
        groupProductList?.length > 0 && (
          <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <Pagination
          label={`${currentPage} of ${totalPage !== null? totalPage :""}`}
          hasPrevious={isPrevious !== null && isPrevious }
          onPrevious={() => {
            console.log("Previous", currentPage);
            if (currentPage  > 1) {
              let value = +currentPage - 1;
              handlePaginationChange(value);
            }

          }}
          hasNext={isNext !== null && isNext}
          onNext={() => {
            console.log("Next");
            if (currentPage !== totalPage) {
              let value = +currentPage + 1;
              handlePaginationChange(value);
            }
          }}
        />
      </div>
        )
      }
      {active && (
        <RemoveProductGroup
          active={active}
          showButtonSpinner={showButtonSpinner}
          handleChange={handleChange}
          removeProductGroup={removeProductGroup}
        />
      )}
    </div>
  );

}

export default FilterTable;
