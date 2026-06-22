import AIChat from '@/components/AIChat'

export default function AdminAIPage() {
  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-primary">🤖 AI Admin Agent</h1>
        <p className="text-sm text-gray-500 mt-1">วิเคราะห์ข้อมูลร้านค้า ตรวจสต็อก และให้คำแนะนำเชิงธุรกิจด้วย AI</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'ถามได้ทันที', desc: 'ยอดขาย สต็อก คำสั่งซื้อ', icon: '📊' },
          { label: 'วิเคราะห์เชิงลึก', desc: 'เทรนด์และคาดการณ์', icon: '🔍' },
          { label: 'แนะนำกลยุทธ์', desc: 'เพิ่มยอดขายและลดต้นทุน', icon: '🚀' },
          { label: 'ข้อมูล Real-time', desc: 'จาก Supabase โดยตรง', icon: '⚡' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-xl mb-1">{c.icon}</div>
            <div className="text-xs font-semibold text-primary">{c.label}</div>
            <div className="text-xs text-gray-500">{c.desc}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <AIChat
          mode="admin"
          initialMessage="สวัสดีครับ! ผมคือ AutoPro AI Agent 🤖 พร้อมช่วยวิเคราะห์ธุรกิจของคุณจากข้อมูล Real-time ครับ ถามได้เลย!"
          quickPrompts={[
            'วิเคราะห์ยอดขายวันนี้',
            'สินค้าไหนต้องเติมสต็อกด่วน',
            'สรุปภาพรวมธุรกิจเดือนนี้',
            'แนะนำกลยุทธ์เพิ่มยอดขาย',
            'คำสั่งซื้อรอยืนยันมีกี่รายการ',
          ]}
          placeholder="ถามเกี่ยวกับธุรกิจ เช่น ยอดขาย สต็อก คำสั่งซื้อ..."
        />
      </div>
    </div>
  )
}
