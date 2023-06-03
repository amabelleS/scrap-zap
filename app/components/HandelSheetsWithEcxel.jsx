'use client'

import { useState, useRef } from 'react';
import * as ExcelJS from "exceljs";
// import ExcelJS from 'exceljs';
import pairElements from '@/lib/pairElements';
import scrapeZapWebsite from '@/lib/scrapeZapWebsite';
import { getPrevProductsIndexesFromLocalStorage } from '@/lib/handelLocalStorage';

let ShekelFormater = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'ILS',
});

function HandelSheetsWithEcxel({ updateProducts }) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef();

  const handleUrlChange = (e) => {
    setSpreadsheetUrl(e.target.value);
  };

  const onCloseModal = () => {
    modalRef.current?.close();
  };

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
          revalidate: 420,
        },
      });

      const fileBuffer = await response.arrayBuffer();
      console.log("🚀 ~ file: HandelSheetsWithEcxel.jsx:43 ~ handleFetchData ~ fileBuffer:", fileBuffer)

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);

      const worksheet = workbook.getWorksheet(1);
      console.log("🚀 ~ file: HandelSheetsWithEcxel.jsx:49 ~ handleFetchData ~ worksheet:", worksheet)

      const productsNamesAndMyShopName = worksheet.getSheetValues().filter(
        (cell) =>
          (cell.columnLetter === 'B' && cell.rowNumber > 2) ||
          (cell.columnLetter === 'D' && cell.rowNumber > 2)
      );

      const paired = pairElements(productsNamesAndMyShopName);

      const promises = paired.map(async (pair) => {
        const storesPromises = await scrapeZapWebsite(pair);
        return storesPromises;
      });

      const allProducts = await Promise.all(promises);
      const prevProductsIndexes = getPrevProductsIndexesFromLocalStorage();

      allProducts.forEach((product, index) => {
        const { targetStore, firstStores } = product;
        const { siteName } = targetStore;
        const prevIndex = prevProductsIndexes[siteName] || 0;
        const cellRow = 3 + index;

        const linkCell = worksheet.getCell(`C${cellRow}`);
        linkCell.value = `https://www.zap.co.il/model.aspx?modelid=${targetStore.modelid}`;

        const myPriceCell = worksheet.getCell(`E${cellRow}`);
        myPriceCell.value = ShekelFormater.format(targetStore.totalPrice);

        firstStores.forEach((store, storeIndex) => {
          const storeNameColumn = String.fromCharCode(70 + storeIndex * 2);
          const storePriceColumn = String.fromCharCode(71 + storeIndex * 2);

          const storeNameCell = worksheet.getCell(`${storeNameColumn}${cellRow}`);
          storeNameCell.value = store.siteName;

          const storePriceCell = worksheet.getCell(`${storePriceColumn}${cellRow}`);
          storePriceCell.value = ShekelFormater.format(store.totalPrice);
        });

        const myStoreIndexCell = worksheet.getCell(`P${cellRow}`);
        myStoreIndexCell.value = targetStore.storeIndex;

        const rowColor = targetStore.storeIndex !== prevIndex ? 'FFCCCB' : '';
        const row = worksheet.getRow(cellRow);
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        };

        const myStorePrevIndexCell = worksheet.getCell(`Q${cellRow}`);
        myStorePrevIndexCell.value = prevIndex;

        // Save the updated product indexes to local storage
        prevProductsIndexes[siteName] = targetStore.storeIndex;
      });

      // Update the products in the state
      updateProducts(allProducts);

      // Save the updated product indexes to local storage
      localStorage.setItem('prevProductsIndexes', JSON.stringify(prevProductsIndexes));

      // Generate the updated spreadsheet file
      const updatedFileBuffer = await workbook.xlsx.writeBuffer();

      // Create a Blob object with the file data
      const fileBlob = new Blob([updatedFileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a temporary URL for the Blob object
      const fileUrl = URL.createObjectURL(fileBlob);

      if (fileBlob) {
        // Trigger the file download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'updated_spreadsheet.xlsx';
        link.click();
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Modal */}
      <dialog ref={modalRef}>
        <p>Please enter a valid spreadsheet URL.</p>
        <button onClick={onCloseModal}>Close</button>
      </dialog>

      {/* Spreadsheet URL input */}
      <input type="text" value={spreadsheetUrl} onChange={handleUrlChange} />

      {/* Fetch Data button */}
      <button onClick={handleFetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
    </div>
  );
}

export default HandelSheetsWithEcxel;

