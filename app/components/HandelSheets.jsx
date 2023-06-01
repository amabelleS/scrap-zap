import { useState } from 'react';
import { read, write } from 'xlsx';
import { useRouter } from 'next/navigation';
// import { revalidatePath } from 'next/cache';
import pairElements from '@/lib/pairElements';
import scrapeZapWebsite from '@/lib/scrapeZapWebsite';

function HandelSheets() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProduct] = useState([])

  const router = useRouter();

  const handleUrlChange = (e) => {
    setSpreadsheetUrl(e.target.value);
  };

  const handleFetchData = async () => {
    setIsLoading(true);

    if (spreadsheetUrl === '') {
      alert('Please enter a valid URL');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(spreadsheetUrl);
      const fileBuffer = await response.arrayBuffer();

      // Convert the XLSX file to JavaScript
      const workbook = read(fileBuffer, { type: 'buffer' });

      // Perform your manipulations on the workbook
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      console.log("🚀 ~ file: HandelSheets.jsx:36 ~ handleFetchData ~ worksheet:", worksheet)

      // Get the names of the products to search in zap:
      const productsNamesAndMyShopName = Object.entries(worksheet).filter(
        (cell) =>
          (cell[0].includes('B') && cell[0] !== 'B1' && cell[0] !== 'B2') ||
          (cell[0].includes('D') && cell[0] !== 'D1' && cell[0] !== 'D2')
      );

      // paired is an array of pairs containing the product names and shop names
      const paired = pairElements(productsNamesAndMyShopName);
      console.log('🚀 ~ handleFetchData ~ pairedObject:', paired);

      // Example for product name: 'טלפון סלולרי Apple iPhone 14 Pro Max 256GB אפל'
      // Go to zap, search for the store, and return:
      // 1. The price of my store.
      // 2. Name & prices for top 5 by lowest price
      // 3. The placement of my store in the current check
      // 4. The place of my store from the previous check
      const promises = paired.map(async (pair) => {
        const storesPromises = await scrapeZapWebsite(pair);
        return storesPromises;
      });

      const allProducts = await Promise.all(promises);
      console.log("🚀 ~ file: HandelSheets.jsx:61 ~ handleFetchData ~ allProducts:", allProducts)
      setProduct(allProducts);

        // Manipulate:
    //   const cell = {
    //     t: '2',
    //     v: 22,
    //     s: {
    //       fill: {
    //         type: 'pattern',
    //         patternType: 'solid',
    //         bgColor: { rgb: 'FFCCCB' }
    //       }
    //     }
    //   };

    //   const cellToUpdate = 'P3';
    //   worksheet[cellToUpdate] = cell;

      // Convert the workbook back to XLSX
    //   const updatedArrayBuffer = write(workbook, { type: 'array', bookType: 'xlsx' });

    //   // Save the updated XLSX file
    //   const blob = new Blob([updatedArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //   const url = URL.createObjectURL(blob);

      // Manipulate:
      const sheetToUpdate = workbook.Sheets[workbook.SheetNames[0]];

      // Update targetStore.siteId, totalPrice, and store names for each product
      allProducts.forEach((product, index) => {
        const { targetStore, firstStores } = product;
        const cellRow = 3 + index;

        // In the first loop/product we are updating the second row in the xslx file, cells C3, E3 ... P3, O3
        // In the second loop we are updating the third row in the xslx file, cells C3, E4 ... P4, O4

        // Update link to product:
        const linkCell = `C${cellRow}`;
        const linkCellObj = {
            t: 's',
            v: `https://www.zap.co.il/model.aspx?modelid=${targetStore.modelid}`
        }
        worksheet[linkCell] = linkCellObj;
    
        // Update targetStore.totalPrice
        const myPriceCell = `E${cellRow}`;
        const myPriceCellObj = {
            t: 's',
            v: targetStore.totalPrice
        }
        worksheet[myPriceCell] = myPriceCellObj;
    
        // Update firstStores 
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
            const storePriceCell = `${storePriceColumn}${cellRow}`;
            const storePriceObj = {
                t: 's',
                v: store.totalPrice
            }
            worksheet[storePriceCell] = storePriceObj;
        });
    
        // Update targetStore.storeIndex (origin array sorted by price accending ) - In the current run of the program
        const myStoreIndexCell = `P${cellRow}`;
        const myStoreIndexCellObj = {
            t: 's',
            v: targetStore.storeIndex
        }
        worksheet[myStoreIndexCell] = myStoreIndexCellObj;

        // Update targetStore.storeIndex (origin array sorted by price accending ) - In the current run of the program
        // TODO!
    });

      // Convert the workbook back to XLSX
      const updatedArrayBuffer = write(workbook, { type: 'array', bookType: 'xlsx' });

      // Save the updated XLSX file
      const blob = new Blob(
        [updatedArrayBuffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      const url = URL.createObjectURL(blob);

      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'updated_data.xlsx';
        link.click();
      }

      setIsLoading(false);
    //   setSpreadsheetUrl('');
    } catch (error) {
      console.error('Error fetching or manipulating the file:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-50 flex justify-center md:justify-between">
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
    </div>
  );
}

export default HandelSheets;


// import { useState } from 'react';
// import { read, write } from 'xlsx';
// import { useRouter } from 'next/navigation';
// import { revalidatePath } from 'next/cache';
// import pairElements from '@/lib/pairElements';
// import scrapeZapWebsite from '@/lib/scrapeZapWebsite';

// function HandelSheets() {
//   const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
//   const [toggleDialog, setToggleDialog] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const router = useRouter();
//   // const navigate = useNavigate();

// //   const openDialog = () => {
    
// //   }
// //   const closeDialog = () => {
// //     setToggleDialog(false)
// //   }
//   const handleUrlChange = (e) => {
//     setSpreadsheetUrl(e.target.value);
//   };

//   const handleFetchData = async () => {
//     setIsLoading(true)
//     // setToggleDialog(false)

//     // error handeling for valid url - todo!!
//     if (spreadsheetUrl === '') {
//         alert('boo')
//         // setToggleDialog(true)
//         return
//     }

//     try {
//       const response = await fetch(spreadsheetUrl);
//       const fileBuffer = await response.arrayBuffer();

//       // Convert the XLSX file to JavaScript
//       const workbook = read(fileBuffer, { type: 'buffer' });

//       // Perform your manipulations on the workbook
//       // For example, modify a specific cell:
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];

//       // Get the names of the products to search in zap:
//       const productsNamesAndMyShopName = Object.entries(worksheet)
//         .filter((cell) => 
//             (cell[0].includes("B") && cell[0] !== 'B1' && cell[0] !== 'B2') ||
//             cell[0].includes("D") && cell[0] !== 'D1' && cell[0] !== 'D2')

//     // paired is an array of pairs containing the product names and shop names
//       const paired = pairElements(productsNamesAndMyShopName);
//       console.log("🚀 ~ file: HandelSheets.jsx:51 ~ handleFetchData ~ pairedObject:", paired)
    
//     //  Example for product neme: 'טלפון סלולרי Apple iPhone 14 Pro Max 256GB אפל'
//     // Go to zap, search for the store, and return:
//     // 1. The price of my store.
//     // 2. Name & prices for top 5 by lowest price
//     // 3. The placement of my store in the current check
//     // 4. the place of my store from the previous check

//     const promises = paired.map(async (pair) => {
//         const storesPromises = await scrapeZapWebsite(pair);
//         return storesPromises;
//     });

//     const allStores = await Promise.all(promises);
//     console.log('🚀 ~ handleFetchData ~ allStores:', allStores);

    
//       // Manipulate:
//       const cell = {t:'2', v: 22, s: {
//         fill: {
//           type: 'pattern',
//           pattern:'solid',
//           // patternType: "solid", // none / solid
//           // fgColor:{argb:'FFCCCB'},
//           // bgColor:{argb:'FFCCCB'},
//           // fgColor: {rgb: "FF000000"},
//         bgColor: {rgb: "FFCCCB"}
//       }}};

//       const cellToUpdate = 'P3';
//       // worksheet[cellToUpdate].t = 'n';
//       // worksheet[cellToUpdate].v = 22;

//       // Color row:
//       // worksheet[cellToUpdate].s = {
//       //   fill: {
//       //     // type: 'pattern',
//       //     // pattern:'solid',
//       //     patternType: "none", // none / solid
//       //     // fgColor:{argb:'FFCCCB'},
//       //     // bgColor:{argb:'FFCCCB'},
//       //     // fgColor: {rgb: "FF000000"},
//       //   bgColor: {rgb: "FFCCCB"}
//       // },
//       // //   font: {
//       //   // name: 'Times New Roman',
//       //   // sz: 16,
//       //   // color: {rgb: "#FF000000"},
//       //   // bold: true,
//       //   // italic: false,
//       //   // underline: false
//       //   //   },
//       //   //   border: {
//       //     // top: {style: "thin", color: {auto: 1}},
//       //     // right: {style: "thin", color: {auto: 1}},
//       //     // bottom: {style: "thin", color: {auto: 1}},
//       //     // left: {style: "thin", color: {auto: 1}}
//       //     //   }
//       //   };
        
//         worksheet[cellToUpdate] = cell;

//       // Convert the workbook back to XLSX
//       const updatedArrayBuffer = write(workbook, { type: 'array', bookType: 'xlsx' });

//       // Save the updated XLSX file
//       const blob = new Blob([updatedArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//       const url = URL.createObjectURL(blob);

//       if (url) {
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = 'updated_data.xlsx';
//         link.click();
//       }
//       // Use the App Router to navigate to the download page
//       // router.push(`/download?url=${url}`);
//       // revalidatePath("/")
//     } catch (error) {
//       console.error('Error fetching or manipulating the file:', error);
//     }
//   };

//   // useEffect(() => {
//   //   // const { url } = location.query;
//   //   // const { url } = location.query;

//   //   if (searchParams) {
//   //     const link = document.createElement('a');
//   //     link.href = searchParams.url;
//   //     link.download = 'updated_data.xlsx';
//   //     link.click();
//   //   }
//   // }, [searchParams]);

//   return (
//     <div className="w-50 flex justify-center md:justify-between">
//         <input 
//           className="bg-white p-2 w-80 text-xl rounded-xl" 
//           type="text" 
//           value={spreadsheetUrl} 
//           onChange={handleUrlChange}
//           placeholder='Enter link to googlesheet'
//         />
//         {/* <dialog open={toggleDialog}>Pls enter valid url</dialog> */}
//         <button
//          className="p-2 text-xl rounded-xl bg-slate-300 ml-2 font-bold"
//          onClick={handleFetchData}
//          >Upload & Compare in zap
//         </button>
//     </div>
//   )
// }

// export default HandelSheets