'use server'

import * as cheerio from 'cheerio';

export default async function scrapeZapWebsite({ productName, shopName }) {
  console.log('🎏🦄 I in scrapeZapWebsite 🔮 productName:', productName);
  try {
    const searchUrl = `https://www.zap.co.il/search.aspx?keyword=${encodeURIComponent(
      productName
    )}`;
    const searchResponse = await fetch(searchUrl);
    const searchHtml = await searchResponse.text();

    // Using Cheerio to parse the search HTML and check for the edge case
    const searchPage = cheerio.load(searchHtml);
    const modelId = searchPage('div#divSearchResults > div[data-index="1"]').data('model-id');

    if (modelId) {
      const modelUrl = `https://www.zap.co.il/model.aspx?modelid=${encodeURIComponent(modelId)}`;
      const modelResponse = await fetch(modelUrl);
      const modelHtml = await modelResponse.text();

      // Using Cheerio to parse the model HTML and extract the required information
      const $ = cheerio.load(modelHtml);

      const stores = [];

      $('div[data-group-sale-type="1"] > div[data-group="0"]')
        .toArray()
        .sort((a, b) => $(a).data('total-price') - $(b).data('total-price'))
        .slice(0, 6)
        .forEach((div) => {
          const siteId = $(div).data('site-id');
          const totalPrice = $(div).data('total-price');
          const siteName = $(div).data('site-name');
          const storeIndex = $(div).data('index');
          stores.push({ siteId, totalPrice, siteName, storeIndex });
        });

      const targetStore = stores.find((store) => store.siteName === shopName);

      const firstStores = stores.slice(0, 6);

      return {
        firstStores,
        targetStore,
      };
    } else {
      console.error('No matching model found for the given product name.');
      return [];
    }
  } catch (error) {
    console.error('Error occurred while scraping Zap website:', error);
    return [];
  }
}

// export default async function scrapeZapWebsite({ productName, shopName }) {
//   console.log('🎏🦄 I in scrapeZapWebsite 🔮 productName: ', productName)
//   try {
//     const searchUrl = `https://www.zap.co.il/search.aspx?keyword=${encodeURIComponent(
//       productName
//     )}`;
//     const response = await fetch(searchUrl);
//     console.log("🚀 ~ file: scrapeZapWebsite.js:12 ~ scrapeZapWebsite ~ response:", response)
//     const html = await response.text();
//     // Using Cheerio to parse the HTML and extract the required information
//     const $ = cheerio.load(html);

//     // Check case "sofa" TODO
    
//     const stores = [];

//     // Extract the top 6 stores from the list of price comparisons + My store:
//     // selects all the div elements with data-group-sale-type="1" and their children div elements with data-group="0". The selected div elements are sorted based on their data-total-price attribute in ascending order and limited to the first 6 elements. The required data (data-site-id, data-total-price, and data-site-name) is extracted from each div and added to the stores array.
//     $('div[data-group-sale-type="1"] > div[data-group="0"]')
//       .toArray()
//       .sort((a, b) => $(a).data('total-price') - $(b).data('total-price'))
//       // .slice(0, 6)
//       .forEach((div) => {
//         const siteId = $(div).data('site-id');
//         const totalPrice = $(div).data('total-price');
//         const siteName = $(div).data('site-name');
//         const storeIndex = $(div).data('index');
//         // Construct the result object and push it to the stores array.
//         stores.push({ siteId, totalPrice, siteName, storeIndex });
//       });

//     // Additionally, the code searches for a store that matches the specified shopName and assigns it to the targetStore variable.
//     const targetStore = stores.find((store) => store.siteName === shopName);

//     const firstStores = stores.slice(0, 6)

//     return {
//       firstStores,
//       targetStore
//     };
    
//     //   // Navigate to the store's page and scrape more data
//     //   // https://www.zap.co.il/clientcard.aspx?siteid=66
//     //   const searchUrlForShop = `https://www.zap.co.il/clientcard.aspx?siteid=${encodeURIComponent(
//     //     storeSiteid
//     // )}`;
//     //   const storeResponse = await fetch(`${searchUrlForShop}`);
//     //   const storeHtml = await storeResponse.text();
//     //   const store$ = cheerio.load(storeHtml);

//     //We then navigate to the store's page by making another HTTP request to the store URL and scrape additional data using a separate Cheerio instance (store$). You can customize the additional data you want to extract from the store's page by modifying the additionalData object.
//       // Scraping additional data from the store's page
//     //   const additionalData = {
//     //     // Example: Extract store address
//     //     address: store$('.shop-address').text().trim(),
//     //     // ... Extract more store data as needed
//     //   };

//   } catch (error) {
//     console.error('Error occurred while scraping Zap website:', error);
//     return [];
//   }
// }