import { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
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
      // console.log("🚀 ~ file: HandelSheetsWithEcxel.jsx:44 ~ handleFetchData ~ response:", response)
      const blob = await response.blob();
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(blob);
      console.log("🚀 ~ file: HandelSheetsWithEcxel.jsx:48 ~ handleFetchData ~ workbook:", workbook)

      // const worksheet = workbook.worksheets[0];
      // const rows = worksheet.getRows(2, worksheet.rowCount);

      // const products = rows.map((row) => {
      //   return {
      //     myStoreName: row.getCell(1).value,
      //     myStorePrice: row.getCell(2).value,
      //     storeNameAtIndex1: row.getCell(3).value,
      //     storePriceAtIndex1: row.getCell(4).value,
      //     storeNameAtIndex2: row.getCell(5).value,
      //     storePriceAtIndex2: row.getCell(6).value,
      //     storeNameAtIndex3: row.getCell(7).value,
      //     storePriceAtIndex3: row.getCell(8).value,
      //     storeNameAtIndex4: row.getCell(9).value,
      //     storePriceAtIndex4: row.getCell(10).value,
      //     storeNameAtIndex5: row.getCell(11).value,
      //     storePriceAtIndex5: row.getCell(12).value,
      //     storeEmail: row.getCell(13).value,
      //   };
      // });
      // console.log("🚀 ~ file: HandelSheetsWithEcxel.jsx:70 ~ products ~ products:", products)

     
      // if (url) {
      //   const link = document.createElement('a');
      //   link.href = url;
      //   link.download = 'updated_data.xlsx';
      //   link.click();
      // }

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