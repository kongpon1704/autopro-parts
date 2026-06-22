'use client'
import { useState, useEffect, useCallback } from 'react'

// Generic fetch hook
export function useFetch<T>(url: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error')
      setData(json.data || json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => { fetchData() }, [fetchData, ...deps])
  return { data, loading, error, refetch: fetchData }
}

// Products
export function useProducts(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString()
  return useFetch(`/api/products?${query}`, [query])
}

export function useProduct(id: string) {
  return useFetch(`/api/products/${id}`, [id])
}

// Cart
export function useCart() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    const res = await fetch('/api/cart')
    const json = await res.json()
    setItems(json.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCart() }, [])

  const addItem = async (product_id: string, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id, quantity }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    await fetchCart()
    return json.data
  }

  const updateQty = async (cart_item_id: string, quantity: number) => {
    await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_item_id, quantity }),
    })
    await fetchCart()
  }

  const removeItem = async (item_id: string) => {
    await fetch(`/api/cart?item_id=${item_id}`, { method: 'DELETE' })
    await fetchCart()
  }

  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
  const shipping = subtotal >= 1000 ? 0 : 50
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return { items, loading, addItem, updateQty, removeItem, refetch: fetchCart, subtotal, shipping, totalItems }
}

// Orders
export function useOrders(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString()
  return useFetch(`/api/orders?${query}`, [query])
}

// Auth
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(json => {
      setUser(json.user)
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setUser(json.data.user)
    return json.data
  }

  const register = async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    const res = await fetch('/api/auth?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    return json.data
  }

  const logout = async () => {
    await fetch('/api/auth?action=logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return { user, loading, login, register, logout, isAdmin: user?.role === 'admin' }
}

// AI Chat
export function useAIChat(mode: 'admin' | 'customer' = 'customer') {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [loading, setLoading] = useState(false)

  const send = async (content: string) => {
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMessages([...newMessages, { role: 'assistant', content: json.data.reply }])
    } catch (e: any) {
      setMessages([...newMessages, { role: 'assistant', content: 'ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่' }])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, send, setMessages }
}
