import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutoPro Parts - อะไหล่รถยนต์คุณภาพสูง',
  description: 'อะไหล่แท้กว่า 10,000 รายการ รับประกันของแท้ ส่งทั่วไทย',
  keywords: 'อะไหล่รถ, ผ้าเบรก, กรองน้ำมัน, หัวเทียน, โช้คอัพ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-gray-900 antialiased">{children}</body>
    </html>
  )
}
