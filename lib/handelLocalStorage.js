
// Function to retrieve the previous song ratings from local storage
export const getPrevProductsIndexesFromLocalStorage = () => {
    const prevProductsIndexes = localStorage.getItem('productIndexes');
    return prevProductsIndexes ? JSON.parse(prevProductsIndexes) : {};
  };
  
  // Function to store the current song ratings in local storage
export const storeCurrentProductIndexesToLocalStorage = (productIndexes) => {
    localStorage.setItem('productIndexes', JSON.stringify(productIndexes));
  };