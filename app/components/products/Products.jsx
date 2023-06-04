import { useEffect, useState } from "react";

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
      'Previous Placement',
      'Email Store'
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
      <tr key={i} className='border-b transition duration-300 ease-in-out hover:bg-gray-800 dark:border-neutral-500 dark:hover:bg-neutral-600'>
        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-b border-gray-200 bg-white text-sm">
          {product.title}
        </th>
        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 bg-white text-sm">
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
        <td className="px-6 py-4 border-b border-gray-200 bg-white text-sm">
        {/* Send email to the store owner:*/}
        <a 
            href={`mailto:${product.storeEmail}?subject=Zap Rating Update!! The Position of ${product.myStoreName} Has Changed!&body=Your pervious position in zap website was ${product.prevIndex} and now it has changed to ${product.currentIndex}`}
            target="_blank"
            rel="noreferrer"
            aria-label={product.storeEmail}
            title='Open email in a new tab'
            >
            {product.storeEmail}
        </a>
        </td>
      </tr>
    );
  });
};

const Products = ({ products }) => {
const [isChangedProducts, setIsChangedProducts] = useState(false);

useEffect(() => {
  products?.length > 0 ? setIsChangedProducts(true) : setIsChangedProducts(false);
}, [products]);

if (!isChangedProducts) {
  return (
    <h3 className="mt-12 mb-12 text-2xl text-center text-white font-bold">No alterations observed in the products👌</h3>
  ) 
}

return (
    <div>
        <h3 className="mt-12 mb-12 text-2xl text-center text-white font-bold">Prodacts🛒</h3>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
            <tbody>
              <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
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