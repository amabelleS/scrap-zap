
// Function to retrieve the previous products indexes from local storage
export const getPrevProductsIndexesFromLocalStorage = () => {
    const prevProductsIndexes = localStorage.getItem('productIndexes');
    return prevProductsIndexes ? JSON.parse(prevProductsIndexes) : {};
  };
  
  // Function to store the current product indexes in local storage
export const storeCurrentProductIndexesToLocalStorage = (productIndexes) => {
    localStorage.setItem('productIndexes', JSON.stringify(productIndexes));
  };