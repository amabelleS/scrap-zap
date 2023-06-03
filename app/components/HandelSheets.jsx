import { useState } from 'react';
import { read, write } from 'xlsx';
// import { useRouter } from 'next/navigation';
// import { revalidatePath } from 'next/cache';
import pairElements from '@/lib/pairElements';
import scrapeZapWebsite from '@/lib/scrapeZapWebsite';
import { getPrevProductsIndexesFromLocalStorage } from '@/lib/handelLocalStorage';

let ShekelFormater = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ILS',
});

function HandelSheets({ updateProducts }) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlChange = (e) => {
    setSpreadsheetUrl(e.target.value);
  };
  
  const handleFetchData = async () => {
    setIsLoading(true);
    
    if (spreadsheetUrl === '') {
      alert('Please enter a valid URL');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(spreadsheetUrl, { 
        next: {
          revalidate: 420
        }
        // cache: 'no-store'
      });
      const fileBuffer = await response.arrayBuffer();

      // Convert the XLSX file to JavaScript
      const workbook = read(fileBuffer, { type: 'buffer' });

      // Perform your manipulations on the workbook
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // console.log("🚀 ~ file: HandelSheets.jsx:36 ~ handleFetchData ~ worksheet:", worksheet)

      // Get the names of the products to search in zap:
      const productsNamesAndMyShopName = Object.entries(worksheet).filter(
        (cell) =>
          (cell[0].includes('B') && cell[0] !== 'B1' && cell[0] !== 'B2') ||
          (cell[0].includes('D') && cell[0] !== 'D1' && cell[0] !== 'D2')
      );

      // paired is an array of pairs containing the product names and shop names
      const paired = pairElements(productsNamesAndMyShopName);
      // console.log('🚀 ~ handleFetchData ~ pairedObject:', paired);

      // Example for product name: 'טלפון סלולרי Apple iPhone 14 Pro Max 256GB אפל'
      // Go to zap, search for the store, and return:
      // 1. The price of my store.
      // 2. Name & prices for top 5 by lowest price
      // 3. The placement of my store in the current check
      // 4. The place of my store from the previous check - checked from localStorage
      const promises = paired.map(async (pair) => {
        const storesPromises = await scrapeZapWebsite(pair);
        return storesPromises;
      });

      const allProducts = await Promise.all(promises);
      const prevProductsIndexes = getPrevProductsIndexesFromLocalStorage();
   
      allProducts.forEach((product, index) => {
        // console.log("🚀 ~ file: HandelSheets.jsx:68 ~ allProducts.forEach ~ product:", product)
        const { targetStore, firstStores } = product;
        const {siteName} = targetStore;
        // console.log("🚀 ~ file: HandelSheets.jsx:103 ~ allProducts.forEach ~ siteName:", siteName)
        const prevIndex = prevProductsIndexes[siteName] || 0
        const cellRow = 3 + index;

        // Check if my store current position/index changed in zap:
        const isChangedIndex = targetStore.storeIndex !== prevIndex
        // console.log("🚀 ~ file: HandelSheets.jsx:109 ~ allProducts.forEach ~ isChangedIndex:", isChangedIndex)

        // In the first loop/product we are updating the second row in the xslx file, cells C3, E3 ... P3, O3
        // In the second loop we are updating the third row in the xslx file, cells C3, E4 ... P4, O4

        // Update link to product:
        const linkCell = `C${cellRow}`;
        const linkCellObj = {
            t: 's',
            v: `https://www.zap.co.il/model.aspx?modelid=${targetStore.modelid}`
        }
        worksheet[linkCell] = linkCellObj;
    
        // Update targetStore.totalPrice
        const myPriceCell = `E${cellRow}`;
        const myPriceCellObj = {
            t: 's',
            v: ShekelFormater.format(targetStore.totalPrice)
        }
        worksheet[myPriceCell] = myPriceCellObj;
    
        // Update firstStores 
        firstStores.forEach((store, storeIndex) => {
            // Calculate the ASCII code for the store name column
            const storeNameColumn = String.fromCharCode(70 + storeIndex * 2); // ASCII code for 'F' is 70
            const storePriceColumn = String.fromCharCode(71 + storeIndex * 2); 

            // Update store name at cellRow
            // First lopp: F3
            // 2. H-cellRow
            // 3. J-cellRow
            // 4. L-cellRow
            // 5. N-cellRow
            const storeNameCell = `${storeNameColumn}${cellRow}`;
            const storeNameCellObj = {
                t: 's',
                v: store.siteName
            }
            worksheet[storeNameCell] = storeNameCellObj;

            // Update store price at cellRow
            // First lopp: G3
            // 2. I-cellRow
            // 3. K-cellRow
            // 4. M-cellRow
            // 5. O-cellRow
            const storePriceCell = `${storePriceColumn}${cellRow}`;
            const storePriceObj = {
                t: 's',
                v: ShekelFormater.format(store.totalPrice),
            }
            worksheet[storePriceCell] = storePriceObj;
        });
    
        // Update targetStore.storeIndex (origin array sorted by price accending ) - In the current run of the program
        const myStoreIndexCell = `P${cellRow}`;
        const myStoreIndexCellObj = {
            t: 's',
            v: targetStore.storeIndex
        }
        worksheet[myStoreIndexCell] = myStoreIndexCellObj;

        // Update targetStore.previous index (origin array sorted by price accending ) - In the current run of the program
        // +Update row color
        const rowColor = isChangedIndex ? 'FFCCCB' : ''; // Set the desired row color
        const myStorePrevIndexCell = `Q${cellRow}`;

        const myStorePrevIndexCellObj = {
            t: 's',
            v: `${prevIndex}${isChangedIndex ? ' Change!' : ''}`,
            s: {
              fill: {
                type: 'pattern',
                patternType: 'solid',
                // fgColor: { rgb: rowColor },
                bgColor: {rgb: rowColor}
              }
            }
        }

        worksheet[myStorePrevIndexCell] = myStorePrevIndexCellObj;
        // const cellToUpdate = worksheet[myStorePrevIndexCell]; // Get the cell object

        // Update the cell style with the desired row color
        worksheet[myStorePrevIndexCell].s = {
          fill: {
            type: 'pattern',
            patternType: 'solid',
            // fgColor: { rgb: rowColor },
            bgColor: {rgb: rowColor}
          }
        };
               
        // Color diff - TODO!

    });

      // Convert the workbook back to XLSX
      const updatedArrayBuffer = write(workbook, { type: 'array', bookType: 'xlsx' });

      // Save the updated XLSX file
      const blob = new Blob(
        [updatedArrayBuffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      // Map to finalProducts
      const finalProducts = allProducts.map((product, i) => {
        const firstStores = product.firstStores;
        const storeProperties = {};
      
        firstStores.forEach((store, index) => {
          const storeIndex = index + 1;
          storeProperties[`storeNameAtIndex${storeIndex}`] = store.siteName;
          storeProperties[`storePriceAtIndex${storeIndex}`] = ShekelFormater.format(store.totalPrice);
        });
      
        return {
          title: product.targetStore.productName,
          link: `https://www.zap.co.il/model.aspx?modelid=${product.targetStore.modelid}`,
          myStoreName: product.targetStore.siteName,
          myStorePrice: ShekelFormater.format(product.targetStore.totalPrice),
          currentIndex: product.targetStore.storeIndex,
          prevIndex: prevProductsIndexes[product.targetStore.siteName],
          storeEmail: product.targetStore.storeEmail,
          ...storeProperties,
        };
      });

      // Save to
      updateProducts(finalProducts);

      const url = URL.createObjectURL(blob);

      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'updated_data.xlsx';
        link.click();
      }

      setIsLoading(false);
    //   setSpreadsheetUrl('');
    } catch (error) {
      console.error('Error fetching or manipulating the file:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-50 flex justify-center md:justify-around">
      <input
        className="bg-white p-2 w-80 text-xl rounded-xl"
        type="text"
        value={spreadsheetUrl}
        onChange={handleUrlChange}
        placeholder="Enter link to Google Sheet"
      />
      <button
        className="p-2 text-xl rounded-xl bg-slate-300 ml-2 font-bold"
        onClick={handleFetchData}
        disabled={isLoading}
      >
        {isLoading ? 'Uploading & Comparing...' : 'Upload & Compare in Zap'}
      </button>
    </div>
  );
}

export default HandelSheets;