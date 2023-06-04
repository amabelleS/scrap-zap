import React, { useState, useRef } from 'react';
import {OutTable, ExcelRenderer} from 'react-excel-renderer';
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
      const response = await fetch(spreadsheetUrl);
      const blob = await response.blob();
        ExcelRenderer(blob, (err, resp) => {

            if(err){
                console.log(err);            
            }
            else{
                console.log(resp);
                const products = pairElements(resp.rows)
                // console.log("🚀 ~ file: HandelSheets.js:87 ~ handleFetchData ~ products", products)
                // Retrieve the previous products indexes from local storage
                // const prevProductsIndexes = getPrevProductsIndexesFromLocalStorage();
            
                // Compare the current product index with the previous
                // const changedProductsIndexes = products.filter(
                // (p) => p.currentIndex !== prevProductsIndexes[p.myStoreName]
                // );
            
                // Create an object of current song ratings for easy access
                // const currentProductsIndexes = products.reduce((acc, p) => {
                // acc[p.myStoreName] = p.currentIndex;
                // return acc;
                // }, {});
            
                // Store the current song ratings in local storage
                // storeCurrentProductIndexesToLocalStorage(currentProductsIndexes);
            
                // Perform additional logic with the changed songs if needed
                // updateProducts(products);
            }
        });
    
    } catch (error) {
      console.error('Error fetching or manipulating the file:', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="text" value={spreadsheetUrl} onChange={handleUrlChange} />
      <button onClick={handleFetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
      <dialog ref={modalRef}>
        <p>Please enter a valid spreadsheet URL.</p>
        <button onClick={onCloseModal}>OK</button>
      </dialog>
    </div>
  );
}

export default HandelSheets;
