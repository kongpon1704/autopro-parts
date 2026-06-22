import AIChat from '@/components/AIChat'

export default function AIAssistantPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">🤖 AI ผู้ช่วยซื้ออะไหล่</h1>
        <p className="text-gray-500">บอกรุ่นรถและอาการที่พบ AI จะแนะนำอะไหล่ที่ใช่สำหรับคุณ</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '🚗', title: 'บอกรุ่นรถ', desc: 'เช่น Toyota Camry 2020 หรือ Honda City 2018' },
          { icon: '🔍', title: 'อธิบายอาการ', desc: 'เช่น เบรกมีเสียงดัง หรือน้ำมันรั่ว' },
          { icon: '✅', title: 'รับคำแนะนำ', desc: 'AI แนะนำอะไหล่พร้อมราคาจากร้านเรา' },
        ].map(s => (
          <div key={s.title} className="card p-4 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-sm font-semibold text-primary mb-1">{s.title}</div>
            <div className="text-xs text-gray-500">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden" style={{ height: 520 }}>
        <AIChat
          mode="customer"
          initialMessage="สวัสดีครับ! 🚗 ผมคือ AutoPro AI ผู้ช่วยซื้ออะไหล่ บอกรุ่นรถและอาการที่พบ แล้วผมจะแนะนำอะไหล่ที่เหมาะสมพร้อมราคาให้เลยครับ!"
          quickPrompts={[
            'Toyota Camry 2020 เบรกมีเสียงดัง',
            'Honda City เปลี่ยนน้ำมันเครื่องควรใช้อะไร',
            'หัวเทียน Iridium คุ้มค่าไหม',
            'กรองอากาศควรเปลี่ยนทุกกี่กิโล',
            'แนะนำน้ำมันเครื่องสังเคราะห์ราคาดี',
          ]}
          placeholder="เช่น Toyota Fortuner 2019 โช้คอัพด้านหน้ารั่ว..."
        />
      </div>
    </div>
  )
}
