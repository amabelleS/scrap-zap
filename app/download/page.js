"use client"

import { useEffect } from 'react';
import { usePathname } from "next/navigation";
// import { useLocation } from 'react-router-dom';

export default function Download({ searchParams }) {
    // const pathname = usePathname();
    // console.log("🚀 ~ file: page.js:9 ~ Download ~ pathname:", pathname)
    console.log("🚀 ~ file: page.js:10 ~ Download ~ searchParams:", searchParams)
//   const location = useLocation();

  useEffect(() => {
    // const { url } = location.query;
    // const { url } = location.query;

    if (searchParams) {
      const link = document.createElement('a');
      link.href = searchParams.url;
      link.download = 'updated_data.xlsx';
      link.click();
    }
  }, [searchParams]);

  return <div>Downloading...</div>;
}
