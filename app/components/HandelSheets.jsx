import { useState } from 'react';
import { read, write } from 'xlsx';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import pairElements from '@/lib/pairElements';
import scrapeZapWebsite from '@/lib/scrapeZapWebsite';

function HandelSheets() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const router = useRouter();
  // const navigate = useNavigate();

  const handleUrlChange = (e) => {
    setSpreadsheetUrl(e.target.value);
  };

  const handleFetchData = async () => {

    // error handeling for valid url - todo!!

    try {
      const response = await fetch(spreadsheetUrl);
      const fileBuffer = await response.arrayBuffer();

      // Convert the XLSX file to JavaScript
      const workbook = read(fileBuffer, { type: 'buffer' });

      // Perform your manipulations on the workbook
      // For example, modify a specific cell:
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Get the names of the products to search in zap:
      const productsNamesAndMyShopName = Object.entries(worksheet)
        .filter((cell) => 
            (cell[0].includes("B") && cell[0] !== 'B1' && cell[0] !== 'B2') ||
            cell[0].includes("D") && cell[0] !== 'D1' && cell[0] !== 'D2')

      const paired = pairElements(productsNamesAndMyShopName);
      console.log("🚀 ~ file: HandelSheets.jsx:51 ~ handleFetchData ~ pairedObject:", paired)
    
    //  Example for product neme: 'טלפון סלולרי Apple iPhone 14 Pro Max 256GB אפל'
    // Go to zap, search for the store, and return:
    // 1. The price of my store.
    // 2. Name & prices for top 5 by lowest price
    // 3. The placement of my store in the current check
    // 4. the place of my store from the previous check

    //Promise.all...:TODO
    const stores = await scrapeZapWebsite(paired[2])
    console.log("🚀 ~ file: HandelSheets.jsx:63 ~ handleFetchData ~ stores:", stores)
    
      // Manipulate:
      const cell = {t:'2', v: 22, s: {
        fill: {
          type: 'pattern',
          pattern:'solid',
          // patternType: "solid", // none / solid
          // fgColor:{argb:'FFCCCB'},
          // bgColor:{argb:'FFCCCB'},
          // fgColor: {rgb: "FF000000"},
        bgColor: {rgb: "FFCCCB"}
      }}};

      const cellToUpdate = 'P3';
      // worksheet[cellToUpdate].t = 'n';
      // worksheet[cellToUpdate].v = 22;

      // Color row:
      // worksheet[cellToUpdate].s = {
      //   fill: {
      //     // type: 'pattern',
      //     // pattern:'solid',
      //     patternType: "none", // none / solid
      //     // fgColor:{argb:'FFCCCB'},
      //     // bgColor:{argb:'FFCCCB'},
      //     // fgColor: {rgb: "FF000000"},
      //   bgColor: {rgb: "FFCCCB"}
      // },
      // //   font: {
      //   // name: 'Times New Roman',
      //   // sz: 16,
      //   // color: {rgb: "#FF000000"},
      //   // bold: true,
      //   // italic: false,
      //   // underline: false
      //   //   },
      //   //   border: {
      //     // top: {style: "thin", color: {auto: 1}},
      //     // right: {style: "thin", color: {auto: 1}},
      //     // bottom: {style: "thin", color: {auto: 1}},
      //     // left: {style: "thin", color: {auto: 1}}
      //     //   }
      //   };
        
        worksheet[cellToUpdate] = cell;

      // Convert the workbook back to XLSX
      const updatedArrayBuffer = write(workbook, { type: 'array', bookType: 'xlsx' });

      // Save the updated XLSX file
      const blob = new Blob([updatedArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);

      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'updated_data.xlsx';
        link.click();
      }
      // Use the App Router to navigate to the download page
      // router.push(`/download?url=${url}`);
      // revalidatePath("/")
    } catch (error) {
      console.error('Error fetching or manipulating the file:', error);
    }
  };

  // useEffect(() => {
  //   // const { url } = location.query;
  //   // const { url } = location.query;

  //   if (searchParams) {
  //     const link = document.createElement('a');
  //     link.href = searchParams.url;
  //     link.download = 'updated_data.xlsx';
  //     link.click();
  //   }
  // }, [searchParams]);

  return (
    <div className="w-50 flex justify-center md:justify-between">
        <input 
          className="bg-white p-2 w-80 text-xl rounded-xl" 
          type="text" 
          value={spreadsheetUrl} 
          onChange={handleUrlChange}
          placeholder='Enter link to googlesheet'
        />
        {/* <dialog open>Pls enter valid url</dialog> */}
        <button
         className="p-2 text-xl rounded-xl bg-slate-300 ml-2 font-bold"
         onClick={handleFetchData}
         >Upload & Compare in zap
        </button>
    </div>
  )
}

export default HandelSheets