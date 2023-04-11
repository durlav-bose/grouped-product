import { Page, Layout, LegacyCard, Grid } from "@shopify/polaris";
import { useCallback, useState, useEffect } from "react";
import FilterTable from "../components/FilterTable";
import TutorialCard from "../components/TutorialCard";
import TutorialModal from "../components/TutorialModal";
import { useLocation, useNavigate } from "react-router-dom";
import { Analytics } from "../components/Analytics";
import useFetch from "../hooks/useFetch.js";

export default function HomePage() {

  const fetch = useFetch();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [haveGroupProduct, setHaveGroupProduct] = useState(false);
  const [skeleton, setSkeleton] = useState(false);
  const [totalClickedRateViewed, setTotalClickedRateViewed] = useState(0);
  const [totalPruchasedRateViewed, setTotalPruchasedRateViewed] = useState(0);
  const [totalPriceRevenue, setTotalPriceRevenue] = useState(0);

  const handleChange = useCallback(() => setActive(!active), [active]);

  const openVideoModal = (videoId) => {
    setActive(true);
  };

  useEffect(() => {
    getTotalAnalyTicsData();
    createWebPixel();
    getWebhooks();
  }, []);

  const createWebPixel = async () => {
    try {
      let formData = {
        form_type: "product",
        items: [
          {
            id: "variantId12345",
            quantity: 1,
          },
        ],
        utf8: "✓",
      };
      const response = await fetch(`/api/webpixelsCreate?id=notanid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let result = await response.json();
      console.log('result ......................... ', result.errors);
      
    } catch (error) {
      console.log("error inside web pixel create frontend......................",error.errors);
    }
  };

  const getWebhooks = async () => {
    try {
      const response = await fetch(`/api/webhooksCreate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      let result = await response.json();
      console.log('result ......................... webhook', result);
    } catch (error) {
      console.log("error inside web hook call......................",error)
    }
  };

  const getTotalAnalyTicsData = async () => {
    try {
      setSkeleton(true);
      const response = await fetch(`/api/getTotalAnalyticsData`,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      console.log('data ......................... ', data)
      let totalProductViewed=0;
      let totalProductClicked=0;
      let totalProductCheckout=0;
      let totalProductAddedToCart=0;
      let totalRevenue=0;
      let totalViewCounts = data?.data;
      totalViewCounts.forEach((item) => {
        totalProductViewed += item.productViewCount;
        totalProductClicked += item.productClickedCount;
        totalProductCheckout += item.productCheckedOutCount;
        totalProductAddedToCart += item.productAddedToCartCount;
        totalRevenue += item.totalRevenue;
      });
      let totalClickedRate = Math.round((totalProductClicked / totalProductViewed) * 100);
      let totalPurchaseRate = Math.round((totalProductCheckout / totalProductClicked) * 100);
      setTotalClickedRateViewed(totalClickedRate);
      setTotalPruchasedRateViewed(totalPurchaseRate);
      setTotalPriceRevenue(totalRevenue);
    } catch (error) {
      console.log("error", error);
    } finally {
      setSkeleton(false);
    }
  };

  return (
    <Page
      title="Group Product"
      fullWidth
      primaryAction={{
        content: "Create a group",
        onAction: () => {
          navigate("/createProductGroup");
        },
      }}
    >
      <Analytics clickedRateViewed={totalClickedRateViewed} pruchasedRateViewed={totalPruchasedRateViewed} skeleton={skeleton} revenue={totalPriceRevenue}/>
      <Layout>
        {haveGroupProduct && (
          <Layout.Section>
            <LegacyCard title="Updates & Tutorials" sectioned>
              <Grid>
                {[1, 2].map((_item, index) => (
                  <TutorialCard key={index} openVideoModal={openVideoModal} />
                ))}
              </Grid>
            </LegacyCard>
            {active && (
              <TutorialModal active={active} handleChange={handleChange} />
            )}
          </Layout.Section>
        )}
        <Layout.Section>
          <FilterTable setHaveGroupProduct={setHaveGroupProduct} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
