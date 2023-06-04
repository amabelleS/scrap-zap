"use client"
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

import HandelSheets from './components/HandelSheets'
// TODO: Fix bugs with other two components to manipulate free syles?
// import HandelSheetsWithEcxel from './components/HandelSheetsWithEcxel';
// import HandelSheetsWithRenderer from './components/HandelSheetsWithRenderer';
import Products from './components/products/Products';
import { storeCurrentProductIndexesToLocalStorage, getPrevProductsIndexesFromLocalStorage } from '@/lib/handelLocalStorage';

export default function Home() {
  const [filteredProducts, setFilteredProducts] = useState([])

  useEffect(() => {
    localStorage.setItem('productIndexes', JSON.stringify({}));
  }, [])

  const updateProducts = (products) => {
    // Retrieve the previous products indexes from local storage
    const prevProductsIndexes = getPrevProductsIndexesFromLocalStorage();

    // Compare the current product index with the previous
    const changedProductsIndexes = products.filter(
      (p) => p.currentIndex !== prevProductsIndexes[p.myStoreName]
    );
    setFilteredProducts(changedProductsIndexes)

    // Create an object of current product ratings for easy access
    const currentProductsIndexes = products.reduce((acc, p) => {
      acc[p.myStoreName] = p.currentIndex;
      return acc;
    }, {});

    // Store the current product ratings in local storage
    storeCurrentProductIndexesToLocalStorage(currentProductsIndexes);
  };
  
  return (
    <main className={`px-6 mx-auto`}>
      <h1 className="mt-12 mb-12 text-3xl text-center text-white font-bold">Zap-Compare🪄</h1>
      {/* <HandelSheetsWithRenderer updateProducts={updateProducts}/> */}
      {/* <HandelSheetsWithEcxel updateProducts={updateProducts}/> */}
      <HandelSheets updateProducts={updateProducts}/>
      {/* Display products - filtered by ones who changed their position in the zap list */}
      <Products products={filteredProducts}/>
    </main>
  )
}
