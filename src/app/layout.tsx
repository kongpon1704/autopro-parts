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
      <body className="bg-surface text-gray-900 antialiased">{children}</body>
    </html>
  )
}
