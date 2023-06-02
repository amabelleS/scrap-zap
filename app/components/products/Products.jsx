// 'use client'
import { useEffect } from 'react'

// import styles from './product.module.css'

// let ShekelFormater = new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'ILS',
// });

const demoProducts = [
    {
        title: 'MSH-11-15 Rosso Italy',
        link: 'https://www.zap.co.il/model.aspx?modelid=1177716', 
        myStoreName: 'אולסייל',
        myStorePrice: 500,
        storeNameAtIndex1: 'אולסייל',
        storePriceAtIndex1: 54,
        storeNameAtIndex2: 'אולסייל',
        storePriceAtIndex2: 54,
        storeNameAtIndex3: 'אולסייל',
        storePriceAtIndex3: 33,
        storeNameAtIndex4: 'אולסייל',
        storePriceAtIndex4: 22,
        storeNameAtIndex5: 'אולסייל',
        storePriceAtIndex5: 77,
        currentIndex: 1,
        prevIndex: 3,
    },
    {
        title: 'מקרר',
        link: 'https://www.zap.co.il/model.aspx?modelid=1177716', 
        myStoreName: 'dsds',
        myStorePrice: 500,
        storeNameAtIndex1: 'אולסייל',
        storePriceAtIndex1: 54,
        storeNameAtIndex2: 'אולסייל',
        storePriceAtIndex2: 54,
        storeNameAtIndex3: 'אולסייל',
        storePriceAtIndex3: 33,
        storeNameAtIndex4: 'אולסייל',
        storePriceAtIndex4: 22,
        storeNameAtIndex5: 'אולסייל',
        storePriceAtIndex5: 77,
        currentIndex: 1,
        prevIndex: 3,
    },
]

// Table headers:
const TableHeader = () => {
    const headers = [
      'Product Name',
      'Link',
      'My Store Name',
      'My Store Price',
      '1th Store Name',
      '1th Store Price',
      '2th Store Name',
      '2th Store Price',
      '3th Store Name',
      '3th Store Price',
      '4th Store Name',
      '4th Store Price',
      '5th Store Name',
      '5th Store Price',
      'Current Placement',
      'Previous Placement'
    ];
    return headers.map((product, i) => {
      return (
        <th key={i} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{product.toUpperCase()}
        </th>
        )
    });
  }; 

  const TableRows = ({products}) => {
    return products.map((product, i) => {
      return (
        <tr key={i} >
          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-b border-gray-200 bg-white text-sm">
            {product.title}
          </th>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
          {/* <td class="px-6 py-4"> */}
          <a 
              href={product.link}
              target="_blank"
              rel="noreferrer"
              aria-label={product.title}
              title={`Open ${product.title} in a new tab`}
              >
              {product.link}
          </a>
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.myStoreName}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.myStorePrice}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storeNameAtIndex1}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storePriceAtIndex1}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storeNameAtIndex2}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storePriceAtIndex2}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storeNameAtIndex3}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storePriceAtIndex3}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storeNameAtIndex4}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storePriceAtIndex4}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storeNameAtIndex5}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.storePriceAtIndex5}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.currentIndex}
          </td>
          <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
            {product.prevIndex}
          </td>
        </tr>
      );
    });
  };

const Products = ({ products }) => {
    
    useEffect(() => {
        console.log("🚀 ~ file: Products.jsx:4 ~ Products ~ products:", products)
    }, [products])

  return (
    <div>
        <h3 className="mt-12 mb-12 text-3xl text-center text-white font-bold">Prodacts🛒</h3>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        {/* <div className="relative overflow-x-auto"> */}
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
            <tbody>
              <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50     dark:hover:bg-gray-600'>
                <TableHeader/>
              </tr>
              {products && <TableRows products={products}/>}
            </tbody>
        </table>
        </div>
    </div>
  )
}

export default Products