'use server'
import * as cheerio from 'cheerio';

export default async function scrapeZapWebsite({ productName, shopName, cellRow }) {
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
    let $ = cheerio.load(searchHtml);
    // If there is a modelId found, it means we get to an edge case where the search results are not the product page, and we need to navigate to the product page to get the required information, and we can do that with the modelId:
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

      // For the bonus part, we need to get the store email address, but only for the shopName that was passed as a parameter:
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