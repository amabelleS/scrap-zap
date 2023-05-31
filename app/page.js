"use client"
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

import HandelSheets from './components/HandelSheets'

export default function Home() {
  
  return (
    <main className={`px-6 mx-auto`}>
    {/* <main className={`${inter.className} flex min-h-screen flex-col items-center justify-around p-24`}> */}
      <h1 className="mt-12 mb-12 text-3xl text-center text-white font-bold">Zap-Compare 🛒🪄</h1>
      {/* <p className="mt-12 mb-12 text-3xl text-center dark:text-white">Zap-Compare</p> */}
      {/* <h1 className="text-2xl font-bold text-blue-200">Zap-Compare</h1> */}
      <HandelSheets/>
    </main>
  )
}
