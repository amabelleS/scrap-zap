"use client"

import { useEffect } from 'react';

export default function Download({ searchParams }) {

  useEffect(() => {

    if (searchParams) {
      const link = document.createElement('a');
      link.href = searchParams.url;
      link.download = 'updated_data.xlsx';
      link.click();
    }
  }, [searchParams]);

  return <div>Downloading...</div>;
}
