import { useState, useRef, useEffect } from 'react';
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
  // spreadSheetUrl is the url of the spreadsheet that the user enters.
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // A simple modal with the dialog element to alert the user to enter a valid URL.
  const modalRef = useRef()

  const handleUrlChange = (e) => {
    setSpreadsheetUrl(e.target.value);
  };

  const onCloseModal = () => {
    modalRef.current?.close()
  }

  useEffect(() => {
    const listener = event => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        console.log("Enter key was pressed. Run your function.");
        event.preventDefault();
        // callMyFunction();
        handleFetchData();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);
  
  const handleFetchData = async () => {
    setIsLoading(true);
  
    if (spreadsheetUrl === '') {
      modalRef.current?.showModal();
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
      // fileBuffer is the XLSX file in binary format
      const fileBuffer = await response.arrayBuffer();

      // Convert the XLSX file to JavaScript. 
      const workbook = read(fileBuffer, { type: 'buffer' });

      // Perform your manipulations on the workbook:
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Get the names of the products to search in zap:
      // productsNamesAndMyShopName is an array of arrays, each array contains the cell name and the cell value.
      const productsNamesAndMyShopName = Object.entries(worksheet).filter(
        (cell) =>
          (cell[0].includes('B') && cell[0] !== 'B1' && cell[0] !== 'B2') ||
          (cell[0].includes('D') && cell[0] !== 'D1' && cell[0] !== 'D2')
      );

      // paired is an array of objects, each object contains the product name and the shop name.
      const paired = pairElements(productsNamesAndMyShopName);

      // Example for product name: 'טלפון סלולרי Apple iPhone 14 Pro Max 256GB אפל'
      // Go to zap, search by product name, and return:
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

      // allProducts manipluation that will be written to the xlsx file:
      allProducts.forEach((product, index) => {
        const { targetStore, firstStores } = product;
        const {siteName} = targetStore;
        const prevIndex = prevProductsIndexes[siteName] || 0
        // cellRow is the row number in the xlsx file that we are updating.
        const cellRow = 3 + index;

        // isChangedIndex is a boolean that indicates if the store index (in zap) changed from the previous check.
        const isChangedIndex = targetStore.storeIndex !== prevIndex
        
        // In the first loop/product we are updating the second row in the xslx file, cells C3, E3 ... P3, O3
        // In the second loop we are updating the third row in the xslx file, cells C3, E4 ... P4, O4

        // Update link to product:
        const linkCell = `C${cellRow}`;
        const linkCellObj = {
            t: 's',
            v: `https://www.zap.co.il/model.aspx?modelid=${targetStore.modelid}`
        }
        worksheet[linkCell] = linkCellObj;
    
        // myPriceCell is the cell that contains the price of my store.
        const myPriceCell = `E${cellRow}`;
        const myPriceCellObj = {
            t: 's',
            v: ShekelFormater.format(targetStore.totalPrice)
        }
        worksheet[myPriceCell] = myPriceCellObj;
    
        // Update firstStores (top 5 by lowest price) at cellRow: 
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
            // storeNameCell is the cell that contains the name of the store.
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
            // storePriceCell is the cell that contains the price of the store.
            const storePriceCell = `${storePriceColumn}${cellRow}`;
            const storePriceObj = {
                t: 's',
                v: ShekelFormater.format(store.totalPrice),
            }
            worksheet[storePriceCell] = storePriceObj;
        });
    
        // origin array sorted by price accending
        // myStoreIndexCell is the cell that contains the current index of my store.
        const myStoreIndexCell = `P${cellRow}`;
        const myStoreIndexCellObj = {
            t: 's',
            v: targetStore.storeIndex
        }
        worksheet[myStoreIndexCell] = myStoreIndexCellObj;

        // Update targetStore.previous index (origin array sorted by price accending)
        // +Update row color - the color of the row in the xlsx file.
        const rowColor = isChangedIndex ? 'FFCCCB' : ''; // Set the desired row color
        // Create a custom style with the background color
        const rowStyle = {
          fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: { rgb: rowColor }
          }
        };
        
        // Iterate over the cells in the row
        for (const cell in worksheet) {
          if ( worksheet[cell].v === cellRow) {
            // Apply the custom style to the cell
            worksheet[cell].s = rowStyle;
          }
        }

        // myStorePrevIndexCell is the cell that contains the previous index of my store.
        const myStorePrevIndexCell = `Q${cellRow}`;
        const myStorePrevIndexCellObj = {
            t: 's',
            v: `${prevIndex}${isChangedIndex ? ' Change!!' : ''}`,
            s: {
              fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: { rgb: rowColor },
                bgColor: {rgb: rowColor}
              }
            }
        }

        worksheet[myStorePrevIndexCell] = myStorePrevIndexCellObj;
        // const cellToUpdate = worksheet[myStorePrevIndexCell]; // Get the cell object

        // Update the cell style with the desired row color - code doesnt work.. mybe we need premium version.
        worksheet[myStorePrevIndexCell].s = {
          fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: { rgb: rowColor },
            bgColor: {rgb: rowColor}
          }
        };
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

      // setIsLoading(false);
    //   setSpreadsheetUrl('');
    } catch (error) {
      console.error('Error fetching or manipulating the file:', error);
    }
    setIsLoading(false);
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
      <dialog ref={modalRef} className='bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4' role="alert">
        <p className='font-bold'>Please Enter a Valid URL</p>
        <button onClick={onCloseModal} className='btn font-bold border border-orange-700 my-2 py-1 px-4 rounded'>
          <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
        </button>
      </dialog>
    </div>
  );
}

export default HandelSheets;