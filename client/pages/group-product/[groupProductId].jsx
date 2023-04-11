// import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import useFetch from "../../hooks/useFetch";
import { Page } from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateOrUpdateGroupProductForm from "../../components/CreateOrUpdateGroupProductForm";
import SkeletonExample from "../../components/Skeleton";
import { Analytics } from "../../components/Analytics";

function groupProduct() {
  const [groupProductDateItem, setGroupProductDataItem] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [clickedRateViewed, setClickedRateViewed] = useState(0);
  const [pruchasedRateViewed, setPruchasedRateViewed] = useState(0);
  const navigate = useNavigate();
  const fetch = useFetch();
  const { groupProductId } = useParams();
  const [skeleton, setSkeleton] = useState(false);
  const [revenue, setRevenue] = useState(0);

  const getGroupProductById = async () => {
    try {
      setSkeleton(true);
      const response = await fetch(`/api/get-group-product/${groupProductId}`);
      const { groupProduct } = await response.json();
      console.log("groupProduct :>> ", groupProduct);
      setGroupProductDataItem(groupProduct);
      console.log("groupProduct?.groupName", groupProduct?.groupName);
      setGroupName(groupProduct?.groupName);
      console.log("groupProduct :>> ", groupProduct);
    } catch (error) {
      console.log(error);
    }
  };

  const getAnalyTicsData = async () => {
    try {
      console.log("groupName :>> ", groupName);
      const response = await fetch(
        `/api/getAnalyticsData?groupName=${groupName}`
      );
      const data = await response.json();
      console.log("data :>> ", data);
      let productViewed;
      let productClicked;
      let productCheckout;
      let perLineItemRevenue = 0;
      if (data && data.data && data.data.length > 0) {
        productViewed = data.data[0].productViewCount;
        productClicked = data.data[0].productClickedCount;
        productCheckout = data.data[0].productCheckedOutCount;
        perLineItemRevenue = data.data[0].totalRevenue;
      }

      let clickedRate = Math.round((productClicked / productViewed) * 100);
      let purchaseRate = Math.round((productCheckout / productClicked) * 100);
      setClickedRateViewed(clickedRate);
      setPruchasedRateViewed(purchaseRate);
      setRevenue(perLineItemRevenue);
      console.log("clickedRate :>> ", clickedRate);
      console.log("purchaseRate :>> ", purchaseRate);
    } catch (error) {
      console.log(error);
    } finally {
      setSkeleton(false);
    }
  };

  useEffect(() => {
    getGroupProductById();
    getAnalyTicsData();
  }, [groupName]);

  return (
    <Page
      backAction={{ content: "Orders", url: "/" }}
      title="Update Group Product"
    >
      <div>
        <Analytics clickedRateViewed={clickedRateViewed} pruchasedRateViewed={pruchasedRateViewed} skeleton={skeleton} revenue={revenue}/>
        {groupProductDateItem
         && groupName || groupProductDateItem?.groupProducts.length > 0 ? (
          <CreateOrUpdateGroupProductForm
            isUpdateForm={true}
            groupProductId={groupProductId}
            groupProductDateItem={groupProductDateItem}
          />
        ) : (
          <SkeletonExample />
        )}
      </div>
    </Page>
  );
}

export default groupProduct;
