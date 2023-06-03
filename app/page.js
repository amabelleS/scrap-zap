"use client"
import { useEffect, useMemo, useState } from 'react';
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

import HandelSheets from './components/HandelSheets'
import HandelSheetsWithEcxel from './components/HandelSheetsWithEcxel';
import Products from './components/products/Products';
import { storeCurrentProductIndexesToLocalStorage, getPrevProductsIndexesFromLocalStorage } from '@/lib/handelLocalStorage';

export default function Home() {
  const [products, setProducts] = useState([])
  // console.log("🚀 ~ file: page.js:11 ~ Home ~ products:", products)
  const [filteredProducts, setFilteredProducts] = useState([])

  useEffect(() => {
    localStorage.setItem('productIndexes', JSON.stringify({}));
  }, [])

  const updateProducts = (products) => {
    console.log("🚀 ~ file: page.js:24 ~ updateProducts ~ products:", products)
    // Retrieve the previous products indexes from local storage
    const prevProductsIndexes = getPrevProductsIndexesFromLocalStorage();

    // Compare the current product index with the previous
    const changedProductsIndexes = products.filter(
      (p) => p.currentIndex !== prevProductsIndexes[p.myStoreName]
    );
    setFilteredProducts(changedProductsIndexes)

    // Create an object of current song ratings for easy access
    const currentProductsIndexes = products.reduce((acc, p) => {
      acc[p.myStoreName] = p.currentIndex;
      return acc;
    }, {});
    console.log("🚀 ~ file: page.js:35 ~ currentProductsIndexes ~ currentProductsIndexes:", currentProductsIndexes)

    // Store the current song ratings in local storage
    storeCurrentProductIndexesToLocalStorage(currentProductsIndexes);

    // Perform additional logic with the changed songs if needed
    setProducts(products);
  };

  useEffect(() => {   
    console.log("🚀 ~ file: page.js:51 ~ Home ~ products:", products)
  }, [products])
  
  return (
    <main className={`px-6 mx-auto`}>
    {/* <main className={`${inter.className} flex min-h-screen flex-col items-center justify-around p-24`}> */}
      <h1 className="mt-12 mb-12 text-3xl text-center text-white font-bold">Zap-Compare🪄</h1>
      {/* <HandelSheetsWithEcxel updateProducts={updateProducts}/> */}
      <HandelSheets updateProducts={updateProducts}/>
      {/* Display products - filtered by ones who changed their position in the zap list */}
      <Products products={filteredProducts}/>
    </main>
  )
}
