'use server'
import * as cheerio from 'cheerio';

export default async function scrapeZapWebsite({ productName, shopName, cellRow }) {
  console.log('🎏🦄 I in scrapeZapWebsite 🔮 productName:', productName);
  try {
    const searchUrl = `https://www.zap.co.il/search.aspx?keyword=${encodeURIComponent(
      productName
    )}`;
    const searchResponse = await fetch(searchUrl, {
      next: {
        revalidate: 420
      },
    });
    const searchHtml = await searchResponse.text();

    // Using Cheerio to parse the search HTML and check for the edge case
    const searchPage = cheerio.load(searchHtml);
    let $ = cheerio.load(searchHtml);
    const modelId = $('div#divSearchResults > div[data-index="1"]').data('model-id');

    if (modelId) {
      const modelUrl = `https://www.zap.co.il/model.aspx?modelid=${encodeURIComponent(modelId)}`;
      const modelResponse = await fetch(modelUrl);
      const modelHtml = await modelResponse.text();

      // Using Cheerio to parse the model HTML and extract the required information
      $ = cheerio.load(modelHtml);
    }

    const stores = [];

    // Getting modelid => link to store:
    const modelid = $('div.MainContent div.FullSceenContent').data('model-id');

    const storeElements = $('div.compare-items-wrapper div.compare-items-group[data-group-sale-type="1"] div.compare-item-row[data-index]');

    const storePromises = storeElements.toArray().map(async (div) => {
      const siteId = $(div).data('site-id');
      const totalPrice = $(div).data('total-price');
      const siteName = $(div).data('site-name');
      const storeIndex = $(div).data('index');

      let storeEmail = ''
      if (shopName === siteName) {
        const searchUrlForShop = `https://www.zap.co.il/clientcard.aspx?siteid=${siteId}`;
        const storeResponse = await fetch(searchUrlForShop);
        if (!storeResponse.ok) {
          throw new Error(`Failed to fetch store data. Status: ${storeResponse.status}`);
        }
        const storeHtml = await storeResponse.text();
        const store$ = cheerio.load(storeHtml);
        storeEmail = store$('#divmail > a').attr('href');
      }
      stores.push({ siteId, totalPrice, siteName, storeIndex, cellRow, productName, modelid, storeEmail });
    });

    await Promise.all(storePromises);

    const targetStore = stores.find((store) => store.siteName === shopName);
    const firstStores = stores.slice(0, 5);

    return {
      firstStores,
      targetStore,
    };
  } catch (error) {
    console.error('Error occurred while scraping Zap website:', error);
    return [];
  }
}

// import * as cheerio from 'cheerio';

// export default async function scrapeZapWebsite({ productName, shopName, cellRow }) {
//   console.log('🎏🦄 I in scrapeZapWebsite 🔮 productName:', productName);
//   try {
//     const searchUrl = `https://www.zap.co.il/search.aspx?keyword=${encodeURIComponent(
//       productName
//     )}`;
//     const searchResponse = await fetch(searchUrl);
//     const searchHtml = await searchResponse.text();

//     // Using Cheerio to parse the search HTML and check for the edge case
//     const searchPage = cheerio.load(searchHtml);
//     let $ = cheerio.load(searchHtml);
//     const modelId = $('div#divSearchResults > div[data-index="1"]').data('model-id');

//     if (modelId) {
//       const modelUrl = `https://www.zap.co.il/model.aspx?modelid=${encodeURIComponent(modelId)}`;
//       const modelResponse = await fetch(modelUrl);
//       const modelHtml = await modelResponse.text();

//       // Using Cheerio to parse the model HTML and extract the required information
//       $ = cheerio.load(modelHtml);
//     }
    
//   const stores = [];

//   // Getting modelid => link to store:
//   const modelid = $('div.MainContent div.FullSceenContent').data('model-id');
//   // class="MainContent"

//   $('div.compare-items-wrapper div.compare-items-group[data-group-sale-type="1"] div.compare-item-row[data-index]')
//     // $('div[data-group-sale-type="1"] > div[data-group="0"]')
//       .toArray()
//       .sort((a, b) => $(a).data('total-price') - $(b).data('total-price'))
//       // .slice(0, 6)
//       .forEach(async (div) => {
//         const siteId = $(div).data('site-id');
//         // console.log("🚀 ~ file: scrapeZapWebsite.js:40 ~ .forEach ~ siteId:", siteId)
//         const totalPrice = $(div).data('total-price');
//         const siteName = $(div).data('site-name');
//         const storeIndex = $(div).data('index');

//         // Navigate to the store's page and scrape more data // https://www.zap.co.il/clientcard.aspx?siteid=95
//         let storeEmail = ''
//         if (shopName === siteName) {
//           const searchUrlForShop = `https://www.zap.co.il/clientcard.aspx?siteid=${siteId}`;
//           console.log("🚀 ~ file: scrapeZapWebsite.js:50 ~ .forEach ~ searchUrlForShop:", searchUrlForShop)
//           // const storeResponse = await fetch(searchUrlForShop);
//           // if (!storeResponse.ok) {
//           //   throw new Error(`Failed to fetch store data. Status: ${storeResponse.status}`);
//           // }
//           // const storeHtml = await storeResponse.text();
//           // const store$ = cheerio.load(storeHtml);

//           // storeEmail = store$('#divmail').attr('href');
//         }
//         stores.push({ siteId, totalPrice, siteName, storeIndex, cellRow, productName, modelid });
//       });

//     const targetStore = stores.find((store) => store.siteName === shopName);

//     const firstStores = stores.slice(0, 5);

// // // We then navigate to the store's page by making another HTTP request to the store URL and scrape additional data using a separate Cheerio instance (store$). You can customize the additional data you want to extract from the store's page by modifying the additionalData object.
// // //   Scraping additional data from the store's page
// //   const additionalData = {
// //     // Example: Extract store address
// //     address: store$('.shop-address').text().trim(),
// //     storeUrl: `https://www.zap.co.il/clientcard.aspx?siteid=${siteId}`,
// //     // Find the div with id="divmail" and get the href attribute
// //     storeEmail: store$('#divmail').attr('href')
// //     // ... Extract more store data as needed
// //   };

//     return {
//       firstStores,
//       targetStore,
//     };
    

//   } catch (error) {
//     console.error('Error occurred while scraping Zap website:', error);
//     return [];
//   }
// }
